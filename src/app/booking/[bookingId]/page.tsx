"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Booking, RestaurantSettings } from "@/types/firestore";
import { Loader2, User, Users, CalendarDays, Clock, Armchair, UtensilsCrossed, MapPin, QrCode } from "lucide-react";

export default function BookingPassPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const docSnap = await getDoc(doc(db, "bookings", bookingId));
        if (docSnap.exists()) {
          const data = docSnap.data() as Booking;
          setBooking(data);
          
          // Fetch restaurant details
          if (data.restaurantId) {
            const restSnap = await getDoc(doc(db, "restaurantSettings", data.restaurantId));
            if (restSnap.exists()) {
              setRestaurant(restSnap.data() as RestaurantSettings);
            }
          }
        } else {
          setError("Booking not found.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your booking pass...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Booking Not Found</h2>
          <p className="text-slate-500 text-sm mb-4">{error || "This booking pass does not exist or has been cancelled."}</p>
          <p className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">ID: {bookingId}</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Upcoming: "bg-blue-50 text-blue-600 border-blue-200",
    Seated: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Completed: "bg-slate-50 text-slate-500 border-slate-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A3636] via-[#1A3636] to-slate-100 flex items-start justify-center p-4 pt-12 sm:pt-20">
      <div className="max-w-md w-full">
        
        {/* Entry Pass Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#1A3636] px-8 pt-8 pb-7 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-6 -bottom-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl"></div>
            
            <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-3 relative z-10">🎫 Digital Entry Pass</p>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black leading-tight">{booking.guestName}</h1>
                <p className="text-emerald-200/70 text-sm font-medium mt-0.5">{restaurant?.name || "Restaurant"}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="px-8 pt-7 pb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                  <Armchair className="w-5 h-5 text-[#1A3636]" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Table</p>
                <p className="font-black text-[#1A3636] text-2xl">{booking.tableNumber || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                  <Users className="w-5 h-5 text-[#1A3636]" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Guests</p>
                <p className="font-black text-slate-800 text-2xl">{booking.guests}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                  <CalendarDays className="w-5 h-5 text-[#1A3636]" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                <p className="font-bold text-slate-800 text-sm">{booking.date}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                  <Clock className="w-5 h-5 text-[#1A3636]" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                <p className="font-bold text-slate-800 text-sm">{booking.time}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 border-t border-dashed border-slate-200"></div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${statusColors[booking.status] || statusColors.Upcoming}`}>
                {booking.status}
              </span>
              <div className="flex-1 border-t border-dashed border-slate-200"></div>
            </div>

            {/* Restaurant Info */}
            {restaurant && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Restaurant</p>
                <p className="font-bold text-slate-800">{restaurant.name}</p>
                {restaurant.address && (
                  <p className="text-sm text-slate-500 flex items-start gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {restaurant.address}
                  </p>
                )}
                {restaurant.phone && (
                  <p className="text-sm text-slate-500 mt-1">📞 {restaurant.phone}</p>
                )}
              </div>
            )}

            {/* Pre-Orders */}
            {booking.preOrders && booking.preOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pre-ordered Items</p>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                  {booking.preOrders.map((item: any, i: number) => (
                    <div key={i} className="px-5 py-3.5 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm text-slate-700">{item.name}</p>
                        {item.price && <p className="text-xs text-slate-400">₹{item.price}</p>}
                      </div>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm border border-emerald-100">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code for restaurant to scan */}
            <div className="mt-6 pt-6 border-t border-dashed border-slate-200 flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Show this to the host</p>
              <div className="p-3 border-4 border-slate-100 rounded-2xl bg-white">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.id}&color=1A3636`} 
                  alt="Entry QR" 
                  className="w-32 h-32 rounded-lg"
                />
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-3 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{booking.id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6 mb-4">Present this pass at the restaurant entrance.</p>
      </div>
    </div>
  );
}
