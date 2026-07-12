"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Booking, RestaurantSettings } from "@/types/firestore";
import { CheckCircle2, XCircle, Clock, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyBookingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const bookingSnap = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingSnap.exists()) {
          setError("Booking not found or invalid.");
          setLoading(false);
          return;
        }
        
        const bookingData = bookingSnap.data() as Booking;
        setBooking(bookingData);

        const restSnap = await getDoc(doc(db, "restaurantSettings", bookingData.restaurantId));
        if (restSnap.exists()) {
          setRestaurant(restSnap.data() as RestaurantSettings);
        }
      } catch (err) {
        console.error("Failed to verify booking", err);
        setError("Error verifying booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h1>
        <p className="text-slate-500">{error || "Invalid booking."}</p>
      </div>
    );
  }

  const isValid = booking.status === "Upcoming" || booking.status === "Seated";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4 font-sans">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className={`p-8 text-white text-center relative overflow-hidden ${isValid ? 'bg-emerald-600' : 'bg-rose-500'}`}>
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150"></div>
          <div className="relative z-10 flex flex-col items-center">
            {isValid ? (
              <CheckCircle2 className="w-16 h-16 mb-4 text-white" />
            ) : (
              <XCircle className="w-16 h-16 mb-4 text-white" />
            )}
            <h1 className="text-3xl font-black tracking-tight">{isValid ? "Valid Pass" : "Invalid Pass"}</h1>
            <p className="font-medium text-white/80 mt-1">{booking.status} Booking</p>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-slate-900">{restaurant?.name || "Restaurant"}</h2>
            <p className="text-slate-500 font-mono text-xs mt-2 tracking-wider">{booking.id}</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guest Name</p>
              <p className="text-lg font-bold text-slate-900">{booking.guestName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </p>
                <p className="font-bold text-slate-900">{booking.date} at {booking.time}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Party Size
                </p>
                <p className="font-bold text-slate-900">{booking.guests} People</p>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Assigned Table</p>
              <p className="text-2xl font-black text-emerald-600">{booking.tableNumber}</p>
            </div>

            {booking.preOrders && Object.keys(booking.preOrders).length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Pre-ordered Items</p>
                <ul className="space-y-3">
                  {(Array.isArray(booking.preOrders) ? booking.preOrders : Object.entries(booking.preOrders).map(([id, qty]) => ({ name: 'Item '+id, quantity: qty, price: 0 }))).map((item: any, i: number) => (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700">{item.quantity}x {item.name}</span>
                      <span className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
