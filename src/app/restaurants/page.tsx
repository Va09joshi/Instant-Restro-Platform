"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RestaurantSettings } from "@/types/firestore";
import { motion } from "framer-motion";
import { Loader2, Search, MapPin, Star, ArrowRight, Utensils } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<{id: string, data: RestaurantSettings}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const snap = await getDocs(collection(db, "restaurantSettings"));
        const data = snap.docs.map(doc => ({
          id: doc.id,
          data: doc.data() as RestaurantSettings
        }));
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(r => 
    r.data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.data.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <div className="bg-[#0A1616] text-white pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-neutral-400 hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Menus</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10">
            Discover top-rated restaurants, browse their menus, and pre-order your meal for a seamless VIP dining experience.
          </p>

          <div className="relative max-w-2xl">
            <Search className="w-6 h-6 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search for restaurants or cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 bg-white/10 border border-white/20 rounded-2xl pl-14 pr-6 text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-lg backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm flex flex-col">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <div className="mt-auto pt-6 border-t border-neutral-100">
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <Utensils className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No restaurants found</h3>
            <p className="text-neutral-500">We couldn't find any restaurants matching your search.</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredRestaurants.map((restaurant, idx) => (
              <motion.div
                key={restaurant.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
              >
                <Link href={`/r/${restaurant.id}`}>
                  <div className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 h-full flex flex-col">
                    <div className="h-48 relative overflow-hidden bg-neutral-100">
                      {restaurant.data.coverImage ? (
                        <img 
                          src={restaurant.data.coverImage} 
                          alt={restaurant.data.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
                          <Utensils className="w-12 h-12 text-emerald-200" />
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                        {restaurant.data.cuisineType || "Various"}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {restaurant.data.name || "Unnamed Restaurant"}
                        </h3>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-700">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-500 mb-6 line-clamp-2 flex-1">
                        {restaurant.data.description || "Experience amazing food and seamless VIP dining. Pre-order your meals to save time and enjoy your experience."}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="truncate max-w-[150px]">{restaurant.data.address || "Location not set"}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
