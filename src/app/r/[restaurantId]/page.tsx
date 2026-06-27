"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { RestaurantSettings, MenuCategory, MenuItem, Table, Booking } from "@/types/firestore";
import { Loader2, MapPin, Phone, ArrowLeft, CalendarCheck, Clock, Users, Plus, Minus, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerLandingPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  // Data States
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>("all");
  const [preOrders, setPreOrders] = useState<Record<string, number>>({});
  const [logoError, setLogoError] = useState(false);

  // Booking Form States
  const [guestName, setGuestName] = useState(user?.displayName || "");
  const [partySize, setPartySize] = useState(0); // 0 = Any
  const [time, setTime] = useState("19:00");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const renderChairs = (table: Table, isBooked: boolean, isSelected: boolean) => {
    const chairs = [];
    const chairClass = `absolute w-[22px] h-[22px] rounded-full transition-all duration-300 z-0 bg-white border-[2.5px] ${isBooked ? 'border-red-200' : isSelected ? 'border-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'border-[#e2e8f0] shadow-sm'}`;

    if (table.shape === 'circle') {
      if (table.capacity <= 2) {
        chairs.push(<div key="c1" className={`${chairClass} -top-2.5 left-1/2 -translate-x-1/2`} />);
        chairs.push(<div key="c2" className={`${chairClass} -bottom-2.5 left-1/2 -translate-x-1/2`} />);
      } else if (table.capacity >= 4) {
        chairs.push(<div key="c1" className={`${chairClass} -top-2.5 left-1/2 -translate-x-1/2`} />);
        chairs.push(<div key="c2" className={`${chairClass} -bottom-2.5 left-1/2 -translate-x-1/2`} />);
        chairs.push(<div key="c3" className={`${chairClass} top-1/2 -left-2.5 -translate-y-1/2`} />);
        chairs.push(<div key="c4" className={`${chairClass} top-1/2 -right-2.5 -translate-y-1/2`} />);
      }
    } else if (table.shape === 'rect') {
      const sideChairs = Math.min(2, table.capacity);
      const remaining = Math.max(0, table.capacity - 2);
      const topChairs = Math.ceil(remaining / 2);
      const bottomChairs = Math.floor(remaining / 2);
      
      if (sideChairs >= 1) chairs.push(<div key="cl" className={`${chairClass} -left-[11px] top-1/2 -translate-y-1/2`} />);
      if (sideChairs === 2) chairs.push(<div key="cr" className={`${chairClass} -right-[11px] top-1/2 -translate-y-1/2`} />);
      
      // Use flex containers for evenly spaced top and bottom chairs to prevent overflowing
      const relativeChairClass = `w-[22px] h-[22px] rounded-full transition-all duration-300 bg-white border-[2.5px] ${isBooked ? 'border-red-200' : isSelected ? 'border-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'border-[#e2e8f0] shadow-sm'}`;
      
      if (topChairs > 0) {
        chairs.push(
          <div key="top-chairs" className="absolute -top-[11px] left-0 w-full px-3 flex justify-evenly pointer-events-none">
             {Array.from({length: topChairs}).map((_, i) => <div key={`ct${i}`} className={relativeChairClass} />)}
          </div>
        );
      }
      if (bottomChairs > 0) {
        chairs.push(
          <div key="bot-chairs" className="absolute -bottom-[11px] left-0 w-full px-3 flex justify-evenly pointer-events-none">
             {Array.from({length: bottomChairs}).map((_, i) => <div key={`cb${i}`} className={relativeChairClass} />)}
          </div>
        );
      }
    }
    return chairs;
  };

  useEffect(() => {
    if (user?.displayName && !guestName) {
      setGuestName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;

    async function fetchData() {
      try {
        // Fetch Settings
        const settingsRef = doc(db, "restaurantSettings", restaurantId);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as RestaurantSettings);
        } else {
          setSettings({
            id: restaurantId,
            name: "Restaurant Menu",
            address: "",
            phone: "",
            description: "",
            operatingHours: {}
          });
        }

        // Fetch Menu
        const catQ = query(collection(db, "menuCategories"), where("restaurantId", "==", restaurantId));
        const itemQ = query(collection(db, "menuItems"), where("restaurantId", "==", restaurantId));

        // Fetch Tables & Bookings
        const tablesQ = query(collection(db, "tables"), where("restaurantId", "==", restaurantId));
        const bookingsQ = query(
          collection(db, "bookings"),
          where("restaurantId", "==", restaurantId),
          where("date", "==", date)
        );

        const [catSnap, itemSnap, tablesSnap, bookingsSnap] = await Promise.all([
          getDocs(catQ),
          getDocs(itemQ),
          getDocs(tablesQ),
          getDocs(bookingsQ)
        ]);

        const catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MenuCategory).sort((a, b) => a.order - b.order);
        const itemData = itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MenuItem);
        const tablesData = tablesSnap.docs.map(doc => doc.data() as Table);
        const bookingsData = bookingsSnap.docs.map(doc => doc.data() as Booking);

        setCategories(catData);
        setItems(itemData);
        setTables(tablesData);
        setExistingBookings(bookingsData);

        if (catData.length > 0) setActiveCategoryId(catData[0].id);

      } catch (error) {
        console.error("Error loading restaurant data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [restaurantId, date]);

  // Handle Pre-orders
  const updatePreOrder = (itemId: string, delta: number) => {
    setPreOrders(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      const newOrders = { ...prev };
      if (next === 0) {
        delete newOrders[itemId];
      } else {
        newOrders[itemId] = next;
      }
      return newOrders;
    });
  };

  const calculateSubtotal = () => {
    return Object.entries(preOrders).reduce((total, [itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const handleBook = async () => {
    if (!guestName || !selectedTableId) return;
    setSubmitting(true);

    try {
      const selectedTable = tables.find(t => t.id === selectedTableId);
      const bookingId = `BKG-${Date.now()}`;

      const preOrdersList = Object.entries(preOrders).map(([itemId, quantity]) => {
        const item = items.find(i => i.id === itemId)!;
        return {
          menuItemId: itemId,
          name: item.name,
          quantity,
          price: item.price
        };
      });

      const newBooking = {
        id: bookingId,
        restaurantId,
        customerId: user ? user.uid : null,
        guestName,
        time,
        date,
        guests: partySize,
        tableId: selectedTableId,
        tableNumber: selectedTable?.tableNumber || "T?",
        status: "Upcoming",
        tags: ["Web Booking"],
        preOrders: preOrdersList,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "bookings", bookingId), newBooking);
      setSuccess(true);

      setTimeout(() => {
        router.push("/customer/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Error saving booking:", error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* Header Skeleton */}
        <div className="h-64 md:h-80 w-full bg-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
            <div className="max-w-7xl mx-auto flex gap-6 items-end">
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-700 shrink-0" />
              <div className="flex-1 pb-2">
                <Skeleton className="h-10 w-64 bg-slate-700 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-32 bg-slate-700" />
                  <Skeleton className="h-6 w-32 bg-slate-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-12">
            <div>
              <div className="flex gap-4 overflow-x-auto pb-4 mb-4">
                <Skeleton className="h-12 w-24 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 w-28 rounded-full" />
                <Skeleton className="h-12 w-36 rounded-full" />
              </div>
              <div className="space-y-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-4 flex gap-4 border border-slate-100">
                    <Skeleton className="w-32 h-32 rounded-2xl shrink-0" />
                    <div className="flex-1 py-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-6" />
                      <div className="flex justify-between mt-auto">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-10 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-96 shrink-0 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100">
              <Skeleton className="h-8 w-40 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium text-lg">Restaurant not found.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6">
          <CalendarCheck className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">Booking Confirmed!</h1>
        <p className="text-emerald-700 max-w-md">Your table and pre-orders have been successfully reserved.</p>
        <p className="text-emerald-600/70 text-sm mt-4">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative flex flex-col">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (user) router.push('/customer/dashboard');
              else router.back();
            }}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-full hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <h1 className="font-bold text-lg text-slate-900 tracking-tight">{settings.name}</h1>
          <div className="w-10 h-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-start gap-8 p-6 lg:p-8 relative z-10">

        {/* LEFT COLUMN: THE DIGITAL MENU */}
        <div className="w-full lg:flex-1">
          {/* Header Banner */}
          <div className="relative pt-10 pb-8 bg-white flex flex-col items-center px-6 text-center border border-slate-200 rounded-[2rem] mb-10 shadow-sm">
            {settings.logoUrl && !logoError ? (
              <div className="w-20 h-20 bg-white p-1 rounded-full shadow-lg mb-4 flex items-center justify-center overflow-hidden ring-4 ring-slate-100">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-4 ring-4 ring-emerald-50">
                {settings.name.charAt(0)}
              </div>
            )}

            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{settings.name}</h2>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-3 mb-4 border border-emerald-100">
              <Star className="w-3.5 h-3.5 fill-emerald-500" /> Digital Menu
            </div>
            {settings.description && <p className="text-slate-500 text-sm max-w-md leading-relaxed">{settings.description}</p>}

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600 mt-6 pt-6 border-t border-slate-100 w-full">
              {settings.address && <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200"><MapPin className="w-4 h-4 text-emerald-600" /><span>{settings.address}</span></div>}
              {settings.phone && <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200"><Phone className="w-4 h-4 text-emerald-600" /><span>{settings.phone}</span></div>}
            </div>
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar snap-x mb-8 sticky top-[73px] z-30 bg-slate-50/90 backdrop-blur-xl py-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            <button
              onClick={() => setActiveCategoryId("all")}
              className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm
                ${activeCategoryId === "all"
                  ? 'bg-[#009b65] text-white border-transparent'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              All
            </button>
            {categories.filter(cat => items.some(i => i.categoryId === cat.id)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm
                  ${activeCategoryId === cat.id
                    ? 'bg-[#009b65] text-white border-transparent'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-12 mt-2">
            {categories
              .filter(cat => items.some(i => i.categoryId === cat.id))
              .filter(cat => activeCategoryId === "all" || activeCategoryId === cat.id)
              .map(cat => {
              const catItems = items.filter(i => i.categoryId === cat.id);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-32">
                  <h2 className="text-2xl font-black text-[#0a192f] mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 rounded-full bg-[#009b65]"></span>
                    {cat.name}
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {catItems.map(item => {
                      const qty = preOrders[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-[24px] p-4 shadow-sm border border-slate-200 flex gap-4 transition-all ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`}
                        >
                          {item.image ? (
                            <div className="w-[120px] h-[120px] shrink-0 rounded-[20px] overflow-hidden bg-slate-100 border border-slate-100">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.display = 'none'; }} />
                            </div>
                          ) : (
                             <div className="w-[120px] h-[120px] shrink-0 rounded-[20px] overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <span className="text-slate-300 text-xs font-bold">No Image</span>
                             </div>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1 pr-1">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h3 className="font-bold text-[17px] text-[#0a192f] leading-tight pr-2">{item.name}</h3>
                                <span className="font-bold text-[#009b65] bg-[#e6f7ef] px-3 py-1 rounded-[10px] text-[15px] shrink-0">${item.price}</span>
                              </div>
                              {item.description && <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>}
                            </div>

                            <div className="mt-3 flex items-center justify-end">
                              {!item.isAvailable ? (
                                <span className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full uppercase tracking-wider">Sold Out</span>
                              ) : (
                                <div className="flex items-center">
                                  {qty > 0 ? (
                                    <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm overflow-hidden h-9">
                                      <button onClick={() => updatePreOrder(item.id, -1)} className="w-9 h-full flex items-center justify-center text-[#009b65] hover:bg-[#e6f7ef] transition-colors"><Minus className="w-4 h-4" /></button>
                                      <span className="w-8 text-center text-sm font-bold text-[#0a192f]">{qty}</span>
                                      <button onClick={() => updatePreOrder(item.id, 1)} className="w-9 h-full flex items-center justify-center text-[#009b65] hover:bg-[#e6f7ef] transition-colors"><Plus className="w-4 h-4" /></button>
                                    </div>
                                  ) : (
                                    <button onClick={() => updatePreOrder(item.id, 1)} className="px-5 py-2.5 text-[13px] font-bold text-[#009b65] bg-white border border-slate-200 shadow-sm hover:border-[#009b65] hover:bg-[#e6f7ef] rounded-full transition-all">
                                      Add Pre-order
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING & PRE-ORDER PANEL */}
        <div className="w-full lg:w-[420px] shrink-0 sticky top-[100px]">
          <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto no-scrollbar space-y-6 pb-6">
            
            {/* Table booking has been moved to a separate page */}

            {/* Pre-order Cart Card */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col shrink-0">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-500" />
                  Pre-order Cart
                </div>
                {Object.keys(preOrders).length > 0 && (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 py-0.5 px-2 rounded-full text-[12px]">
                    {Object.values(preOrders).reduce((a, b) => a + b, 0)} Items
                  </span>
                )}
              </h2>

              {Object.keys(preOrders).length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-6 text-center bg-slate-50">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">No dishes pre-ordered.<br />Add items from the menu.</p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 shadow-inner">
                  {Object.entries(preOrders).map(([itemId, quantity]) => {
                    const item = items.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 rounded border border-emerald-200">{quantity}x</span>
                          <span className="text-slate-700 font-semibold">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">${item.price * quantity}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Total & Submit Footer */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 shrink-0">
              {Object.keys(preOrders).length > 0 && (
                <div className="flex justify-between items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-sm font-bold text-slate-500">Estimated Total</span>
                  <span className="text-2xl font-black text-emerald-600">${calculateSubtotal()}</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (Object.keys(preOrders).length > 0) {
                    localStorage.setItem(`restro_cart_${restaurantId}`, JSON.stringify(preOrders));
                  }
                  router.push(`/r/${restaurantId}/book`);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                Proceed to Book Table
                <CalendarCheck className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
