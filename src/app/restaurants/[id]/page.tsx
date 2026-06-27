"use client";

import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Image */}
      <div className="w-full h-[400px] bg-slate-800 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">The Grand Kitchen</h1>
              <p className="text-xl text-white/80 mb-4">North Indian, Mughlai • ₹1500 for two</p>
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="bg-green-600 px-2 py-1 rounded flex items-center gap-1"><Star className="w-4 h-4"/> 4.8</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Bandra West, Mumbai</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Opens at 12:00 PM</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => router.push(`/restaurant/${params.id}/book`)}
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
            <p className="text-slate-600 leading-relaxed">
              Experience the royal flavors of North India and Mughlai cuisine in a luxurious setting. 
              The Grand Kitchen offers an unforgettable dining experience with authentic recipes passed down through generations.
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
              onClick={() => router.push(`/restaurant/${params.id}/book`)}
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
