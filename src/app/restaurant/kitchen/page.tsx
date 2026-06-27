"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Booking } from "@/types/firestore";
import { ChefHat, CheckCircle2, Clock, Utensils, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KitchenDisplaySystem() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Keep a ticking clock to update elapsed time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time incoming orders where guest is Seated and Kitchen hasn't marked it Ready yet
    const q = query(
      collection(db, "bookings"),
      where("restaurantId", "==", user.uid),
      where("status", "==", "Seated")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveTickets: Booking[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Booking;
        // Only include if they have pre-orders and kitchen status isn't ready
        if (data.preOrders && data.preOrders.length > 0 && data.kitchenStatus !== "Ready") {
          liveTickets.push({ ...data, id: doc.id });
        }
      });
      
      // Sort oldest first (so kitchen cooks oldest tickets first)
      liveTickets.sort((a, b) => a.createdAt - b.createdAt);
      setTickets(liveTickets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markReady = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, "bookings", ticketId);
      await updateDoc(ticketRef, {
        kitchenStatus: "Ready"
      });
    } catch (error) {
      console.error("Error marking ready:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-500" />
        <p className="font-bold uppercase tracking-widest text-sm">Loading KDS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-8 font-sans">
      
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Kitchen Display</h1>
            <p className="text-slate-400 font-medium">Live pre-orders & tickets</p>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Tickets</p>
            <p className="text-2xl font-black text-white leading-none mt-1">{tickets.length}</p>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time</p>
            <p className="text-xl font-bold text-slate-300 leading-none mt-1">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </header>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6">
            <Utensils className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-300 mb-2">No Active Tickets</h2>
          <p className="text-slate-500 max-w-sm">When guests scan in, their pre-orders will appear here immediately.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
          <AnimatePresence>
            {tickets.map((ticket) => {
              
              // Calculate elapsed time based on when the booking was created, or ideally when they checked in.
              // We'll use createdAt for now
              const elapsedMins = Math.floor((now - ticket.createdAt) / 60000);
              const isUrgent = elapsedMins >= 15;
              const isWarning = elapsedMins >= 10 && elapsedMins < 15;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={`bg-slate-900 border-2 rounded-2xl overflow-hidden flex flex-col shadow-xl
                    ${isUrgent ? 'border-red-500/50 shadow-red-900/20' : isWarning ? 'border-amber-500/50 shadow-amber-900/20' : 'border-slate-800'}
                  `}
                >
                  {/* Ticket Header */}
                  <div className={`px-5 py-4 border-b flex justify-between items-center
                    ${isUrgent ? 'bg-red-950/40 border-red-900/50' : isWarning ? 'bg-amber-950/30 border-amber-900/50' : 'bg-slate-950/50 border-slate-800'}
                  `}>
                    <div>
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {ticket.tableNumber || "T-?"}
                      </span>
                      <p className="text-sm font-bold text-slate-400 mt-1">{ticket.guestName}</p>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm
                      ${isUrgent ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}
                    `}>
                      {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {elapsedMins}m
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div className="p-5 flex-1 min-h-[200px]">
                    <ul className="space-y-4">
                      {ticket.preOrders?.map((item, idx) => (
                        <li key={idx} className="flex gap-4 items-start group">
                          <span className={`text-xl font-black px-2 py-0.5 rounded
                            ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-emerald-400'}
                          `}>
                            {item.quantity}
                          </span>
                          <span className="text-lg font-bold text-slate-200 pt-0.5 leading-tight group-hover:line-through group-hover:text-slate-500 transition-all cursor-pointer">
                            {item.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                    <button
                      onClick={() => markReady(ticket.id)}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      Mark Ready
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
