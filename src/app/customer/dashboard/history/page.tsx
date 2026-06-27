"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Booking, RestaurantSettings } from "@/types/firestore";
import { Loader2, History, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
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
        bookingsData = bookingsData.filter(b => b.status === "Completed" || b.status === "Cancelled");
        setBookings(bookingsData.sort((a, b) => b.createdAt - a.createdAt));

        const restaurantsSnap = await getDocs(collection(db, "restaurantSettings"));
        const restaurantsData = restaurantsSnap.docs.map(doc => doc.data() as RestaurantSettings);
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error("Error loading history:", error);
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
        <h1 className="text-3xl font-black text-slate-900 mb-2">History</h1>
        <p className="text-slate-500">Your past dining experiences.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center shadow-2xl shadow-black/30 shadow-black/20">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center shadow-inner mb-6 border border-slate-100">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No past bookings</h3>
          <p className="text-slate-500 max-w-md">You haven't completed any VIP reservations yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const restaurant = restaurants.find(r => r.id === booking.restaurantId);
            const isCompleted = booking.status === "Completed";
            return (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-colors shadow-2xl shadow-black/30 shadow-black/20">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{restaurant?.name || "Restaurant"}</h4>
                    <p className="text-sm text-slate-500 mt-1">{booking.date} at {booking.time} • {booking.guests} Guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto border-t border-slate-100 sm:border-0 pt-4 sm:pt-0">
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {booking.status}
                  </span>
                  {isCompleted && (
                    <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 ml-auto sm:ml-0">
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
