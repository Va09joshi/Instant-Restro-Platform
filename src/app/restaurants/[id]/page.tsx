"use client";

import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { RestaurantSettings } from "@/types/firestore";

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurant() {
      if (!params.id) return;
      try {
        const docRef = doc(db, "restaurantSettings", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRestaurant(docSnap.data() as RestaurantSettings);
        }
      } catch (err) {
        console.error("Failed to load restaurant", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Restaurant not found</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  // Use the logoUrl for the hero image if available, else fallback to dark slate
  const heroStyle = restaurant.logoUrl 
    ? { backgroundImage: `url(${restaurant.logoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Image */}
      <div className="w-full h-[400px] bg-slate-800 relative" style={heroStyle}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end">
            <div className="text-white z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{restaurant.name || "Unnamed Restaurant"}</h1>
              <p className="text-xl text-white/90 mb-4">{restaurant.description ? restaurant.description.substring(0, 50) + "..." : "Local Favorite"}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <span className="bg-emerald-500 px-2 py-1 rounded flex items-center gap-1"><Star className="w-4 h-4"/> 4.8</span>
                {restaurant.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {restaurant.address}</span>}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Opens at {restaurant.openTime || "11:00 AM"}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => router.push(`/r/${params.id}/book`)}
              className="hidden md:flex text-lg px-8 py-6 rounded-full shadow-lg"
            >
              Book a Table
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-4">About this place</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {restaurant.description || "A wonderful dining experience awaits. Enjoy delicious food and a great atmosphere with friends and family."}
            </p>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-4">Menu Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
                <span className="text-lg font-medium">Food Menu</span>
                <span className="text-sm text-slate-500">24 pages</span>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
                <span className="text-lg font-medium">Bar Menu</span>
                <span className="text-sm text-slate-500">12 pages</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Need to know</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2"><Info className="w-5 h-5 text-primary shrink-0"/> Smart casual dress code enforced.</li>
              <li className="flex items-start gap-2"><Info className="w-5 h-5 text-primary shrink-0"/> Valet parking available.</li>
              <li className="flex items-start gap-2"><Info className="w-5 h-5 text-primary shrink-0"/> Table held for 15 minutes past reservation time.</li>
            </ul>
            <Button 
              onClick={() => router.push(`/r/${params.id}/book`)}
              className="w-full mt-6 py-6 text-lg rounded-xl md:hidden"
            >
              Book a Table
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
