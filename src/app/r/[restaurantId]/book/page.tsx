"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { RestaurantSettings, TableLayout, Booking } from "@/types/firestore";
import { Loader2, ArrowLeft, Users, Clock, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function BookTablePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [tables, setTables] = useState<TableLayout[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Booking Form State
  const [guestName, setGuestName] = useState(user?.displayName || "");
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("19:00");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const date = new Date().toISOString().split('T')[0]; // Today

  useEffect(() => {
    if (user?.displayName && !guestName) {
      setGuestName(user.displayName);
    }
  }, [user]);

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
        const tablesData = tablesSnap.docs.map(doc => doc.data() as TableLayout);
        setTables(tablesData);

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
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "bookings", bookingId), newBooking);
      setSuccess(true);
      
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
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

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
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
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} People</option>)}
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
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-xl">Select a Table</h2>
            <p className="text-sm text-slate-500">Tap an available table on the floor plan.</p>
          </div>

          <div className="w-full h-[400px] bg-[#e6d5c3] rounded-3xl border-8 border-slate-800 relative overflow-hidden shadow-inner"
               style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(0,0,0,0.06) 80px, rgba(0,0,0,0.06) 82px)` }}
          >
            {tables.map(table => {
              const isBooked = bookedTableIds.has(table.id);
              const isSelected = selectedTableId === table.id;
              
              const fitsParty = table.capacity >= partySize;
              const isAvailable = !isBooked && fitsParty;

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (isAvailable) setSelectedTableId(table.id);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 border shadow-md
                    ${table.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}
                    ${isSelected 
                      ? 'bg-emerald-600 border-emerald-800 text-white shadow-emerald-500/50 scale-110 z-20' 
                      : isBooked 
                        ? 'bg-slate-300 border-slate-400 text-slate-500 opacity-60 cursor-not-allowed'
                        : fitsParty
                          ? 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400 cursor-pointer hover:scale-105'
                          : 'bg-white/50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                    }
                  `}
                  style={{
                    left: `${table.positionX}%`,
                    top: `${table.positionY}%`,
                    width: table.shape === 'circle' ? '60px' : '80px',
                    height: table.shape === 'circle' ? '60px' : '60px',
                  }}
                >
                  <span className="font-bold text-lg leading-none">{table.tableNumber}</span>
                  <span className="text-[10px] font-medium opacity-80 mt-1">{table.capacity}p</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 text-xs font-medium text-slate-500 justify-center">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border rounded-sm"></div> Available</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 border rounded-sm"></div> Booked</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-600 border rounded-sm"></div> Selected</div>
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
