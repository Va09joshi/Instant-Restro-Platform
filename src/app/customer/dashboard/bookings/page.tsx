"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Booking, RestaurantSettings } from "@/types/firestore";
import { Loader2, Calendar, Clock, MapPin, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const bookingsQ = query(collection(db, "bookings"), where("customerId", "==", user.uid));
        const bookingsSnap = await getDocs(bookingsQ);
        let bookingsData = bookingsSnap.docs.map(doc => doc.data() as Booking);
        bookingsData = bookingsData.filter(b => b.status === "Upcoming" || b.status === "Seated");
        setBookings(bookingsData.sort((a, b) => b.createdAt - a.createdAt));

        const restaurantsSnap = await getDocs(collection(db, "restaurantSettings"));
        const restaurantsData = restaurantsSnap.docs.map(doc => doc.data() as RestaurantSettings);
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500">View and manage your upcoming VIP reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center shadow-2xl shadow-black/30 shadow-black/20">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner mb-6 border border-emerald-100">
            <Calendar className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming reservations</h3>
          <p className="text-slate-500 max-w-md">You don't have any upcoming VIP passes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => {
            const restaurant = restaurants.find(r => r.id === booking.restaurantId);
            return (
              <div key={booking.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-xl shadow-black/30">
                <div className="bg-slate-900 p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">VIP Pass</span>
                      <h3 className="font-bold text-xl text-white line-clamp-1">{restaurant?.name || "Restaurant"}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Date</p>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600"/> {booking.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1 text-right">Time</p>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600"/> {booking.time}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Table</p>
                      <p className="font-black text-2xl text-slate-900">{booking.tableNumber || "TBD"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase">Guests</p>
                      <p className="font-bold text-lg text-slate-900">{booking.guests}</p>
                    </div>
                  </div>
                  <button onClick={() => router.push('/customer/dashboard')} className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm border border-emerald-100 hover:bg-emerald-100 transition-colors">
                    View Full Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
