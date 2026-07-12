"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Star, MapPin, Loader2, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { RestaurantSettings } from "@/types/firestore";
import { Skeleton } from "@/components/ui/skeleton";

import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const router = useRouter();

  const [results, setResults] = useState<RestaurantSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "restaurantSettings"));
        let restaurants = snap.docs.map(doc => doc.data() as RestaurantSettings);
        
        if (location.trim()) {
          const lowerLoc = location.toLowerCase().trim();
          restaurants = restaurants.filter(r => 
            r.address?.toLowerCase().includes(lowerLoc) || 
            r.name.toLowerCase().includes(lowerLoc) ||
            r.description?.toLowerCase().includes(lowerLoc)
          );
        }
        
        setResults(restaurants);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-sans">
      <h1 className="text-4xl font-black text-slate-900 mb-2">
        {location ? `Restaurants in ${location}` : "All Restaurants"}
      </h1>
      <p className="text-slate-500 mb-10">{results.length} places found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white flex flex-col h-[340px]">
              <Skeleton className="h-56 w-full rounded-none" />
              <div className="p-6 flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-2">No restaurants found</h3>
          <p className="text-slate-500">We couldn't find any premium experiences matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((res) => (
            <Link 
              href={`/r/${res.id}`}
              key={res.id} 
              className="group cursor-pointer rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl shadow-black/40 hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col"
            >
              <div className="h-52 bg-slate-100 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-6xl z-0">
                  {res.name.substring(0,2).toUpperCase()}
                </div>
                {res.logoUrl && (
                  <img 
                    src={res.logoUrl} 
                    alt={res.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-10" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="absolute top-3 right-3 z-30">
                  <div className="bg-emerald-600 text-white text-[12px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                    4.8 <Star className="w-3 h-3 fill-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <div>
                   <h3 className="text-slate-900 font-black text-xl leading-tight line-clamp-1 mb-1">{res.name}</h3>
                   <p className="text-[13px] text-slate-500 mb-2 truncate">
                     {(res as any).cuisineType || "Premium Dining"} • $$
                   </p>
                   <p className="text-[13px] text-slate-400 flex items-start gap-1">
                     <span className="line-clamp-1">{res.address || "Location unavailable"}</span>
                   </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                    Accepting Bookings
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    Reserve <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
