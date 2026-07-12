"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Heart, Compass, ChefHat, Sparkles, MapPin, Loader2, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { RestaurantSettings, UserDocument } from "@/types/firestore";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<RestaurantSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserDocument;
          const favoriteIds = userData.favorites || [];
          
          if (favoriteIds.length > 0) {
            // Fetch restaurants
            const q = query(collection(db, "restaurantSettings"), where("id", "in", favoriteIds));
            const querySnapshot = await getDocs(q);
            const restaurants = querySnapshot.docs.map(doc => doc.data() as RestaurantSettings);
            setFavorites(restaurants);
          } else {
            setFavorites([]);
          }
        }
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [user]);

  const removeFavorite = async (restaurantId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        favorites: arrayRemove(restaurantId)
      });
      setFavorites(prev => prev.filter(r => r.id !== restaurantId));
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans py-8 p-4 md:p-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Favorites</h1>
        <p className="text-slate-500">Your saved premium dining experiences.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 md:p-24 text-center flex flex-col items-center shadow-sm w-full relative overflow-hidden">
          <div className="relative">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8 mx-auto border border-rose-100">
                  <Heart className="w-10 h-10 text-rose-500 fill-rose-500/20" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Your collection is empty</h3>
              <p className="text-slate-500 max-w-lg mx-auto mb-10 text-sm leading-relaxed font-medium">
                  You haven't saved any restaurants to your favorites yet. Discover extraordinary culinary experiences and save them here for later.
              </p>
              
              <button 
                  onClick={() => router.push('/restaurants')}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
              >
                  Discover Restaurants <ArrowRight className="w-4 h-4" />
              </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((restaurant) => (
            <div key={restaurant.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 bg-slate-100 relative">
                {restaurant.coverImage ? (
                  <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                    No image
                  </div>
                )}
                <button 
                  onClick={() => removeFavorite(restaurant.id)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-sm text-rose-500 transition-all hover:scale-110"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {restaurant.cuisineType || "Restaurant"}
                    </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.9
                  </div>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-4 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" /> 
                  {restaurant.address}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => router.push(`/booking/${restaurant.id}`)}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg transition-colors text-sm"
                  >
                    Book a Table
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
