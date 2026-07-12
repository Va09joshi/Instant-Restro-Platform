"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { RestaurantSettings, Table, Booking } from "@/types/firestore";
import { Loader2, ArrowLeft, Users, Clock, Calendar, MapPin, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookTablePage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preOrders, setPreOrders] = useState<Record<string, number>>({});

  // Booking Form State
  const [guestName, setGuestName] = useState(user?.displayName || "");
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("19:00");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("Main Hall");
  const date = new Date().toISOString().split('T')[0]; // Today

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/r/${restaurantId}/book`);
    }
    if (user?.displayName && !guestName) {
      setGuestName(user.displayName);
    }
  }, [user, authLoading, router, restaurantId, guestName]);

  useEffect(() => {
    if (!restaurantId) return;

    async function fetchData() {
      try {
        const settingsRef = doc(db, "restaurantSettings", restaurantId);
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as RestaurantSettings);
        }

        // Fetch Tables
        const tablesQ = query(collection(db, "tables"), where("restaurantId", "==", restaurantId));
        const tablesSnap = await getDocs(tablesQ);
        const tablesData = tablesSnap.docs.map(doc => doc.data() as Table);
        setTables(tablesData);
        
        const allAreas = Array.from(new Set(tablesData.map(t => t.area || "Main Hall")));
        if (allAreas.length > 0) {
            setSelectedArea(allAreas[0]);
        }

        // Fetch today's bookings for this restaurant to check availability
        const bookingsQ = query(
          collection(db, "bookings"),
          where("restaurantId", "==", restaurantId),
          where("date", "==", date)
        );
        const bookingsSnap = await getDocs(bookingsQ);
        const bookingsData = bookingsSnap.docs.map(doc => doc.data() as Booking);
        setExistingBookings(bookingsData);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Check if there's a pre-order cart passed from the menu page
    try {
      const savedCart = localStorage.getItem(`restro_cart_${restaurantId}`);
      if (savedCart) {
        setPreOrders(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart", e);
    }
  }, [restaurantId, date]);

  const handleBook = async () => {
    if (!guestName || !selectedTableId) return;
    setSubmitting(true);

    try {
      const selectedTable = tables.find(t => t.id === selectedTableId);
      const bookingId = `BKG-${Date.now()}`;
      
      const newBooking = {
        id: bookingId,
        restaurantId,
        customerId: user ? user.uid : null, // Add customerId to link to their dashboard
        guestName,
        time,
        date,
        guests: partySize,
        tableId: selectedTableId,
        tableNumber: selectedTable?.tableNumber || "T?",
        status: "Upcoming",
        tags: ["Web Booking"],
        preOrders: Object.keys(preOrders).length > 0 ? preOrders : null,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "bookings", bookingId), newBooking);
      
      // Clear cart
      localStorage.removeItem(`restro_cart_${restaurantId}`);
      setSuccess(true);
      
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading || (!authLoading && !user)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Left Form Skeleton */}
        <div className="w-full md:w-[450px] lg:w-[500px] bg-white h-screen overflow-y-auto border-r border-slate-100 flex flex-col">
          <div className="p-8 space-y-8">
            <Skeleton className="h-6 w-32 mb-12" />
            
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48 mb-6" />
            </div>

            <div className="space-y-6">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
            
            <div className="pt-6">
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        
        {/* Right Floor Plan Skeleton */}
        <div className="flex-1 bg-slate-100/50 p-8 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200 flex-1 p-8 shadow-sm flex items-center justify-center">
            <Skeleton className="w-full max-w-2xl h-[500px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1A3636] flex flex-col items-center justify-center text-white p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-500 rounded-full p-4 mb-6">
          <CheckCircle2 className="w-16 h-16 text-white" />
        </motion.div>
        <h1 className="text-4xl font-black mb-4">Table Confirmed!</h1>
        <p className="text-emerald-100 mb-8 max-w-sm">
          Your reservation at {settings?.name} has been successfully booked for {time} tonight.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push(`/r/${restaurantId}`)}
            className="bg-white text-[#1A3636] px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            View Menu
          </button>
          {user && (
            <button 
              onClick={() => router.push(`/customer/dashboard`)}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors"
            >
              My Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const bookedTableIds = new Set(
    existingBookings
      .filter(b => b.status === "Upcoming" || b.status === "Seated")
      .map(b => b.tableId)
  );

  const allAreasSet = Array.from(new Set(tables.map(t => t.area || "Main Hall")));
  const tablesInArea = tables.filter(t => (t.area || "Main Hall") === selectedArea);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Book a Table</h1>
          <p className="text-xs text-slate-500">{settings?.name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Booking Details Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="font-bold text-xl mb-4">Reservation Details</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guest Name</label>
            <input 
              type="text" 
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Party Size</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium appearance-none"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} People</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time (Tonight)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium appearance-none"
                >
                  {["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Floor Plan */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-8">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-xl">Select a Table</h2>
            <p className="text-sm text-slate-500">Choose your preferred area and select an available table.</p>
          </div>

          {/* Area Tabs */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100 bg-white p-2 gap-2">
              {allAreasSet.map((area) => (
                  <button
                      key={area}
                      onClick={() => {
                          setSelectedArea(area);
                          setSelectedTableId(null);
                      }}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                          selectedArea === area 
                              ? "bg-slate-100 text-emerald-700 shadow-sm border border-slate-200/60" 
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                      }`}
                  >
                      {area}
                  </button>
              ))}
          </div>

          <div className="w-full overflow-x-auto overflow-y-hidden border-b border-slate-100">
            <div className="w-[800px] md:w-full h-[450px] relative bg-[#f1f5f9] overflow-hidden shrink-0"
                 style={{
                     backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 0)",
                     backgroundSize: "32px 32px"
                 }}
            >
              {tablesInArea.map(table => {
              const isBooked = bookedTableIds.has(table.id);
              const isSelected = selectedTableId === table.id;
              
              const fitsParty = table.capacity >= partySize;
              const isAvailable = !isBooked && fitsParty;
              const isCircle = table.shape === 'circle';

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (isAvailable) setSelectedTableId(table.id);
                  }}
                  className={`absolute flex flex-col items-center justify-center transition-all duration-200 z-10 select-none
                    ${isCircle ? "w-[80px] h-[80px] rounded-full" : "w-[100px] h-[80px] rounded-2xl"}
                    ${isSelected 
                      ? "bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 z-20 scale-105" 
                      : isBooked 
                        ? "bg-slate-200 border border-slate-300 text-slate-400 opacity-60 cursor-not-allowed"
                        : fitsParty
                          ? "bg-white border border-slate-300 text-slate-700 hover:border-emerald-400 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-1"
                          : "bg-white/50 border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                    }
                  `}
                  style={{
                    left: `calc(${table.positionX}% - ${isCircle ? 40 : 50}px)`,
                    top: `calc(${table.positionY}% - 40px)`,
                  }}
                >
                  <span className="font-bold tracking-tight text-lg leading-none">{table.tableNumber}</span>
                  <div className="flex items-center gap-1 mt-1 text-xs font-semibold opacity-80">
                      <Users className="w-3 h-3" /> {table.capacity}
                  </div>
                  
                  {/* VIP Star */}
                  {table.isVip && (
                      <div className="absolute -top-3 -right-3 z-30 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md border-2 border-white">
                          <Star className="w-3 h-3 fill-current" />
                      </div>
                  )}

                  {/* Chairs indicators */}
                  {!isCircle && (
                      <>
                          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-t-lg -z-10 ${isBooked ? 'bg-slate-200' : 'bg-slate-300'}`} />
                          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-b-lg -z-10 ${isBooked ? 'bg-slate-200' : 'bg-slate-300'}`} />
                      </>
                  )}
                </div>
              );
            })}

            {tablesInArea.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                    <p className="text-lg font-medium text-slate-500">No tables in this area</p>
                </div>
            )}
          </div>
          </div>

          <div className="flex gap-4 text-xs font-bold text-slate-500 justify-center p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-slate-300 rounded-md shadow-sm"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded-md shadow-sm"></div> Booked / Too Small</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-50 border-2 border-emerald-500 rounded-md shadow-sm"></div> Selected</div>
          </div>
        </div>

      </div>

      {/* Floating Confirm Button */}
      {selectedTableId && guestName && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          <button 
            onClick={handleBook}
            disabled={submitting}
            className="w-full bg-[#1A3636] hover:bg-emerald-900 text-white shadow-2xl rounded-2xl p-4 font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Reservation"}
          </button>
        </motion.div>
      )}

    </div>
  );
}
