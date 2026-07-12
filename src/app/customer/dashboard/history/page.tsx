"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Booking, RestaurantSettings } from "@/types/firestore";
import { Loader2, History, CheckCircle2, XCircle, MapPin, Calendar, Users, Star, MoreVertical } from "lucide-react";
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
    <div className="w-full max-w-7xl mx-auto space-y-8 font-sans py-8 p-4 md:p-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Dining History</h1>
          <p className="text-slate-500">Your past culinary experiences and reservations.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center flex flex-col items-center shadow-sm w-full">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-200">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No past bookings</h3>
          <p className="text-slate-500 max-w-md text-sm font-medium">You haven't completed any reservations yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Restaurant</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Date & Time</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Guests</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Status</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {bookings.map(booking => {
                  const restaurant = restaurants.find(r => r.id === booking.restaurantId);
                  const isCompleted = booking.status === "Completed";
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors group divide-x divide-slate-100">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[15px]">{restaurant?.name || "Restaurant"}</p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {restaurant?.address || "Location unavailable"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {booking.date}</p>
                          <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">{booking.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                          <Users className="w-4 h-4 text-slate-400" /> {booking.guests}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {isCompleted ? (
                          <button className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-md shadow-slate-900/10">
                            <Star className="w-4 h-4" /> Review
                          </button>
                        ) : (
                          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
