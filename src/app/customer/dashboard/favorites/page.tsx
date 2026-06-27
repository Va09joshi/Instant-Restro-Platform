"use client";

import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Favorites</h1>
        <p className="text-slate-500">Your saved premium dining experiences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center shadow-2xl shadow-black/30 shadow-black/20">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center shadow-inner mb-6 border border-rose-100">
          <Heart className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No favorites yet</h3>
        <p className="text-slate-500 max-w-md">You haven't saved any restaurants to your favorites. Explore our curated experiences to find your next destination.</p>
      </div>
    </div>
  );
}
