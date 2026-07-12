"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { RestaurantSettings } from "@/types/firestore";
import { Loader2, Store, MapPin, CheckCircle2, Clock } from "lucide-react";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const q = query(collection(db, "restaurantSettings"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => doc.data() as RestaurantSettings);
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#20c997]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans py-8 p-4 md:p-8 w-full">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Registered Restaurants</h1>
        <p className="text-slate-500">Manage and view all platform partners.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        {restaurants.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Store className="w-8 h-8 text-[#20c997]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No restaurants found</h3>
            <p className="text-slate-500 max-w-md">There are no restaurants registered on the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  <th className="px-6 py-5 font-bold">Restaurant Details</th>
                  <th className="px-6 py-5 font-bold hidden md:table-cell">Location</th>
                  <th className="px-6 py-5 font-bold hidden lg:table-cell">Operating Hours</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restaurants.map((restaurant, idx) => (
                  <tr key={restaurant.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#20c997] flex items-center justify-center shrink-0">
                          <Store className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-bold text-[15px] text-slate-900">{restaurant.name || "Unnamed Restaurant"}</span>
                          <div className="text-xs font-medium text-slate-400 mt-0.5">{restaurant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="line-clamp-1">{restaurant.address || "No address provided"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{restaurant.openTime} - {restaurant.closeTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8fbf4] text-[#147a5b] border border-[#a7f3d0] text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
