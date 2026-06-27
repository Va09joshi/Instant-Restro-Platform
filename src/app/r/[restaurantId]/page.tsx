"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { RestaurantSettings, MenuCategory, MenuItem, TableLayout, Booking } from "@/types/firestore";
import { Loader2, MapPin, Phone, ArrowLeft, CalendarCheck, Clock, Users, Plus, Minus, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function CustomerLandingPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  // Data States
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableLayout[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [preOrders, setPreOrders] = useState<Record<string, number>>({});
  const [logoError, setLogoError] = useState(false);

  // Booking Form States
  const [guestName, setGuestName] = useState(user?.displayName || "");
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("19:00");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const renderChairs = (table: Table, isBooked: boolean, isSelected: boolean) => {
    const chairs = [];
    const chairClass = `absolute w-5 h-5 rounded-full border-2 transition-all duration-300 z-0 shadow-sm bg-gradient-to-b from-white to-stone-100 ${!isBooked && !isSelected ? 'border-stone-300 group-hover:border-blue-400 group-hover:shadow-blue-200/50' : ''} ${isBooked ? 'border-red-300 from-red-50 to-red-100' : ''} ${isSelected ? 'border-blue-400 from-blue-50 to-blue-100 shadow-blue-400/50' : ''}`;

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
      
      if (sideChairs >= 1) chairs.push(<div key="cl" className={`${chairClass} -left-2.5 top-1/2 -translate-y-1/2`} />);
      if (sideChairs === 2) chairs.push(<div key="cr" className={`${chairClass} -right-2.5 top-1/2 -translate-y-1/2`} />);
      
      for (let i = 0; i < topChairs; i++) {
        const leftPx = 40 + i * 48;
        chairs.push(<div key={`ct${i}`} className={`${chairClass} -top-2.5`} style={{ left: `${leftPx}px`, transform: 'translateX(-50%)' }} />);
      }
      for (let i = 0; i < bottomChairs; i++) {
        const leftPx = 40 + i * 48;
        chairs.push(<div key={`cb${i}`} className={`${chairClass} -bottom-2.5`} style={{ left: `${leftPx}px`, transform: 'translateX(-50%)' }} />);
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
        const tablesData = tablesSnap.docs.map(doc => doc.data() as TableLayout);
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading Experience...</p>
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
          <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar snap-x mb-4 sticky top-[73px] z-30 bg-slate-50/90 backdrop-blur-xl py-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            {categories.filter(cat => items.some(i => i.categoryId === cat.id)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  document.getElementById(`category-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm
                  ${activeCategoryId === cat.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-10 mt-2">
            {categories.filter(cat => items.some(i => i.categoryId === cat.id)).map(cat => {
              const catItems = items.filter(i => i.categoryId === cat.id);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-32">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 rounded-full bg-emerald-500"></span>
                    {cat.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catItems.map(item => {
                      const qty = preOrders[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex gap-5 hover:shadow-md transition-shadow ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`}
                        >
                          {item.image && (
                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.display = 'none'; }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2 gap-3">
                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{item.name}</h3>
                                <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm border border-emerald-100">${item.price}</span>
                              </div>
                              {item.description && <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              {!item.isAvailable ? (
                                <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded uppercase tracking-wider">Sold Out</span>
                              ) : (
                                <div className="ml-auto flex items-center bg-slate-50 border border-slate-200 rounded-full shadow-sm">
                                  {qty > 0 ? (
                                    <>
                                      <button onClick={() => updatePreOrder(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-l-full transition-colors"><Minus className="w-4 h-4" /></button>
                                      <span className="w-8 text-center text-sm font-bold text-slate-900">{qty}</span>
                                      <button onClick={() => updatePreOrder(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-r-full transition-colors"><Plus className="w-4 h-4" /></button>
                                    </>
                                  ) : (
                                    <button onClick={() => updatePreOrder(item.id, 1)} className="px-5 py-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all">
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
            
            {/* Table Booking Card */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col shrink-0">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-500" />
                Table Booking
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guest Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-400 shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Party Size */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Party Size</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={partySize}
                          onChange={(e) => setPartySize(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} People</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Time */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Table Selection */}
              {/* Table Selection */}
              <div className="pt-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select a Table</label>
                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2 no-scrollbar">
                  {tables.length === 0 ? (
                    <div className="py-10 text-center text-sm font-medium text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                      No tables found for this restaurant.
                    </div>
                  ) : (
                    // Group tables by area and render
                    Array.from(new Set(tables.map(t => t.area || "Main Hall"))).map(area => {
                      const areaTables = tables.filter(t => (t.area || "Main Hall") === area);
                      if (areaTables.length === 0) return null;
                      
                      return (
                        <div key={area} className="space-y-3">
                          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                            {area}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 place-items-center p-2">
                            {areaTables.map((table) => {
                              const activeBooking = existingBookings.find(b => b.tableId === table.id && b.status !== "Completed" && b.status !== "Cancelled");
                              const isBooked = !!activeBooking;
                              const isSelected = selectedTableId === table.id;
                              
                              let estimatedFree = "";
                              if (activeBooking && activeBooking.time) {
                                const [h, m] = activeBooking.time.split(':').map(Number);
                                const d = new Date();
                                d.setHours(h + 2, m);
                                estimatedFree = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                              }

                              return (
                                <button
                                  key={table.id}
                                  disabled={isBooked}
                                  onClick={() => setSelectedTableId(table.id)}
                                  className="relative flex justify-center items-center group w-full outline-none"
                                  style={{
                                    height: table.shape === 'circle' 
                                      ? `${80 + Math.max(0, table.capacity - 4) * 16}px` 
                                      : '80px'
                                  }}
                                >
                                  {isSelected && (
                                    <div className="absolute -inset-4 border-2 border-blue-400 rounded-3xl bg-blue-400/10 pointer-events-none z-[-1] animate-pulse" />
                                  )}
                                  
                                  <div
                                    className={`relative flex flex-col items-center justify-center transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.7)] group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.7)] border z-10 w-full h-full
                                        ${table.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}
                                        ${isBooked ? 'bg-gradient-to-b from-red-50 to-red-100 border-red-200 text-red-800 cursor-not-allowed opacity-95' :
                                        isSelected ? 'bg-gradient-to-b from-blue-600 to-blue-900 border-blue-950 text-white shadow-blue-900/50 scale-[1.02]' :
                                          'bg-gradient-to-b from-stone-50 to-stone-200 border-stone-300 text-stone-700 hover:border-blue-400 hover:scale-[1.02]'
                                      }
                                      `}
                                  >
                                    {renderChairs(table, isBooked, isSelected)}
                                    
                                    {/* Wood/Material Texture Overlay */}
                                    <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.04] pointer-events-none mix-blend-multiply
                                      ${table.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}
                                    `}></div>
                                    
                                    {/* Inner Bevel */}
                                    <div className={`absolute inset-1 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none
                                      ${table.shape === 'circle' ? 'rounded-full' : 'rounded-[14px]'}
                                    `}></div>
                                    
                                    <span className={`relative z-20 font-black text-xl tracking-tight ${isSelected ? 'text-white drop-shadow-md' : isBooked ? 'text-red-900' : 'text-stone-700 drop-shadow-sm'}`}>
                                      {table.tableNumber}
                                    </span>
                                    <div className={`relative z-20 flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-100' : isBooked ? 'text-red-700/70' : 'text-slate-500'}`}>
                                      <Users className="w-3 h-3" /> {table.capacity}
                                    </div>

                                    {table.isVip && (
                                      <div className="absolute -top-3 -right-3 z-30 bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-amber-200">
                                        <Star className="w-2 h-2 fill-current" /> VIP
                                      </div>
                                    )}
                                    
                                    {isBooked && (
                                      <div className="absolute inset-0 bg-red-950/5 flex flex-col items-center justify-center rounded-2xl backdrop-blur-[0.5px] z-30">
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm mb-1">Reserved</span>
                                        {estimatedFree && (
                                          <span className="text-[9px] font-bold text-red-800 bg-white/80 px-1.5 py-0.5 rounded shadow-sm">Free ~{estimatedFree}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

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
                disabled={!guestName || !selectedTableId || submitting}
                onClick={handleBook}
                className="w-full bg-emerald-600 disabled:bg-emerald-600/50 hover:bg-emerald-700 text-white rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm Reservation
                    <CalendarCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
