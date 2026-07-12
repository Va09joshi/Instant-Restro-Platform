"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Booking, RestaurantSettings } from "@/types/firestore";
import { Loader2, Calendar, Clock, MapPin, QrCode, Users, CheckCircle2, ChevronRight, CheckCircle } from "lucide-react";
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
    <div className="w-full max-w-7xl mx-auto space-y-8 font-sans py-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500">View and manage your upcoming VIP reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center flex flex-col items-center shadow-sm w-full">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming reservations</h3>
          <p className="text-slate-500 max-w-md">You don't have any upcoming VIP passes.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Restaurant</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Date & Time</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Table & Guests</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300">Status</th>
                  <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-slate-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {bookings.map(booking => {
                  const restaurant = restaurants.find(r => r.id === booking.restaurantId);
                  const isSeated = booking.status === "Seated";
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors group divide-x divide-slate-100">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSeated ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {isSeated ? <CheckCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">VIP Pass</span>
                            </div>
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
                          <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {booking.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase w-12">Table:</span> {booking.tableNumber || "TBD"}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase w-12">Guests:</span> {booking.guests}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isSeated ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSeated ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => router.push('/customer/dashboard')} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors border border-emerald-200">
                          Details <ChevronRight className="w-4 h-4" />
                        </button>
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
