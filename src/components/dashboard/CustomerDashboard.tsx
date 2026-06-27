"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { RestaurantSettings, Booking } from "@/types/firestore";
import { Search, MapPin, Star, Calendar, Clock, QrCode, ChevronRight, X, Loader2, CheckCircle2, XCircle, History, Crosshair } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/hooks/useLocation";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<RestaurantSettings[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  const [location, setLocation] = useState("");
  const { requestLocation, loading: locationLoading } = useLocation();
  
  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const bookingsQ = query(collection(db, "bookings"), where("customerId", "==", user.uid));
        const bookingsSnap = await getDocs(bookingsQ);
        const bookingsData = bookingsSnap.docs.map(doc => doc.data() as Booking);
        setBookings(bookingsData.sort((a, b) => b.createdAt - a.createdAt));

        const restaurantsSnap = await getDocs(collection(db, "restaurantSettings"));
        const restaurantsData = restaurantsSnap.docs.map(doc => doc.data() as RestaurantSettings);
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSubmitReview = async () => {
    if (!user || !reviewBooking) return;
    setReviewSubmitting(true);
    try {
      const reviewRef = doc(collection(db, "reviews"));
      await setDoc(reviewRef, {
        id: reviewRef.id,
        restaurantId: reviewBooking.restaurantId,
        customerId: user.uid,
        customerName: user.displayName || "Guest",
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewText,
        createdAt: Date.now()
      });

      // Update booking to mark it as reviewed
      await updateDoc(doc(db, "bookings", reviewBooking.id), {
        hasReviewed: true
      });

      setBookings(prev => prev.map(b => b.id === reviewBooking.id ? { ...b, hasReviewed: true } : b));
      setReviewBooking(null);
      setReviewText("");
      setReviewRating(5);
    } catch (e) {
      console.error("Failed to submit review", e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 max-w-6xl mx-auto font-sans w-full p-4 md:p-0">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="relative w-full md:w-[400px] flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-2xl" />
            <Skeleton className="h-12 w-24 rounded-2xl" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-4 border-b border-slate-200 pb-px">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-[2rem] w-full" />
          <Skeleton className="h-64 rounded-[2rem] w-full" />
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === "Upcoming" || b.status === "Seated");
  const pastBookings = bookings.filter(b => b.status === "Completed" || b.status === "Cancelled");

  const filteredRestaurants = restaurants.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r as any).cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      router.push(`/search?location=${encodeURIComponent(location.trim())}`);
    }
  };

  return (
    <>
      <div className="space-y-10 max-w-6xl mx-auto font-sans w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">{user?.displayName || "Guest"}</span>
            </h1>
            <p className="text-slate-500">Manage your premium dining reservations.</p>
          </div>
          
          <div className="relative w-full md:w-[400px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Optional: if they start typing, scroll down to the list
                  if (e.target.value.length === 1) {
                    document.getElementById('curated-experiences')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                placeholder="Search restaurants or cuisines..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-colors flex items-center justify-center">
              Search
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          <button 
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === "upcoming" ? "text-emerald-600 border-emerald-600" : "text-slate-500 border-transparent hover:text-slate-700"}`}
          >
            Upcoming Passes ({upcomingBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === "history" ? "text-emerald-600 border-emerald-600" : "text-slate-500 border-transparent hover:text-slate-700"}`}
          >
            History ({pastBookings.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "upcoming" && (
              <motion.div
                key="upcoming"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {upcomingBookings.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-[2rem] py-24 px-8 text-center flex flex-col items-center justify-center shadow-none w-full max-w-4xl mx-auto my-8">
                    <div className="w-20 h-20 bg-[#e6f7ef] rounded-full flex items-center justify-center mb-6">
                      <Calendar className="w-8 h-8 text-[#009b65]" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No upcoming reservations</h3>
                    <p className="text-slate-400 max-w-md font-medium">You don't have any upcoming VIP passes.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {upcomingBookings.map(booking => {
                      const restaurant = restaurants.find(r => r.id === booking.restaurantId);
                      return (
                        <div key={booking.id} className="relative group">
                          {/* Ticket Background Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col shadow-2xl shadow-black/40">
                            {/* Ticket Top */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 relative overflow-hidden border-b border-dashed border-slate-700">
                              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                              <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2 block">VIP Access Pass</span>
                                  <h3 className="font-black text-2xl text-white mb-1">{restaurant?.name || "Restaurant"}</h3>
                                  <p className="text-emerald-200 text-sm flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-4 h-4" /> {restaurant?.address || "Location unavailable"}
                                  </p>
                                </div>
                                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 shadow-inner">
                                  <span className="font-[family-name:var(--font-yesteryear)] text-2xl text-white">I</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Ticket Cutouts */}
                            <div className="absolute left-0 top-[120px] -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 z-20"></div>
                            <div className="absolute right-0 top-[120px] translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 z-20"></div>

                            {/* Ticket Bottom */}
                            <div className="p-8 flex flex-col gap-6 bg-white">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date & Time</p>
                                  <p className="font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                    {booking.date} • {booking.time}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Party Size</p>
                                  <p className="font-bold text-slate-800">{booking.guests} Guests</p>
                                </div>
                              </div>
                              
                              <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100">
                                <div>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Reserved Table</p>
                                  <p className="font-black text-3xl text-slate-900 drop-shadow-2xl shadow-black/30 shadow-black/20">{booking.tableNumber || "VIP"}</p>
                                </div>
                                <button 
                                  onClick={() => setSelectedQR(booking)}
                                  className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-2xl shadow-black/30 shadow-emerald-900/30 flex items-center justify-center hover:scale-105 transition-all duration-300"
                                >
                                  <QrCode className="w-7 h-7" />
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => router.push(`/r/${booking.restaurantId}`)}
                                className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors text-sm border border-slate-200"
                              >
                                View Pre-order Menu
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {pastBookings.length === 0 ? (
                  <div className="text-center py-20">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No past bookings found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map(booking => {
                      const restaurant = restaurants.find(r => r.id === booking.restaurantId);
                      const isCompleted = booking.status === "Completed";
                      return (
                        <div key={booking.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[#e6f7ef] text-[#009b65]' : 'bg-red-50 text-red-500'}`}>
                              {isCompleted ? <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} /> : <XCircle className="w-6 h-6" strokeWidth={2.5} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-[17px] mb-0.5">{restaurant?.name || "Restaurant"}</h4>
                              <p className="text-[13px] text-slate-400 font-medium">
                                {booking.date} at {booking.time} • {booking.guests} Guests • Table {booking.tableNumber || "VIP"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5 w-full sm:w-auto pt-2 sm:pt-0">
                            <span className={`text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${isCompleted ? 'bg-transparent text-[#009b65] border border-[#009b65]/30' : 'bg-transparent text-red-600 border border-red-200'}`}>
                              {booking.status}
                            </span>
                            {isCompleted && !booking.hasReviewed && (
                              <button 
                                onClick={() => setReviewBooking(booking)}
                                className="text-[13.5px] font-bold text-[#009b65] hover:text-[#007a4f] transition-colors"
                              >
                                Leave Review
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DISCOVER RESTAURANTS */}
        <div id="curated-experiences" className="pt-10 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <Star className="w-6 h-6 text-amber-400" />
              Curated Experiences
            </h2>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No restaurants found</h3>
              <p className="text-slate-500">We couldn't find any curated experiences matching "{searchTerm}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map(restaurant => (
                <div 
                  key={restaurant.id}
                  onClick={() => router.push(`/r/${restaurant.id}`)}
                  className="group bg-white rounded-[2rem] shadow-2xl shadow-black/30 shadow-black/20 border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl shadow-black/40 hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 bg-slate-100 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-emerald-900/50 flex items-center justify-center text-white/10 font-black text-6xl z-0">
                      {restaurant.name.substring(0,2).toUpperCase()}
                    </div>
                    {restaurant.logoUrl && (
                      <img 
                        src={restaurant.logoUrl} 
                        alt={restaurant.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out z-10" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity z-20"></div>
                    <div className="absolute top-4 right-4 z-30">
                       <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                         {(restaurant as any).cuisineType || "Various"}
                       </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 z-30">
                      <h3 className="text-white font-black text-2xl leading-tight mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{restaurant.name}</h3>
                      <p className="text-sm text-slate-200 flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span className="line-clamp-1">{restaurant.address || "Location unavailable"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-end bg-white">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        Accepting Bookings
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        Reserve <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedQR && (() => {
          const restaurant = restaurants.find(r => r.id === selectedQR.restaurantId);
          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2rem] max-w-sm w-full relative shadow-2xl shadow-black/50 overflow-hidden border border-slate-200"
              >
                <div className="bg-slate-900 px-8 pt-8 pb-6 text-white relative overflow-hidden border-b border-dashed border-slate-700">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                  <button 
                    onClick={() => setSelectedQR(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">Instant VIP Pass</p>
                  <h3 className="text-3xl font-black relative z-10">{restaurant?.name || 'Restaurant'}</h3>
                </div>

                <div className="absolute left-0 top-[115px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900/40 rounded-full border-r border-slate-200 z-20 backdrop-blur-sm"></div>
                <div className="absolute right-0 top-[115px] translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900/40 rounded-full border-l border-slate-200 z-20 backdrop-blur-sm"></div>

                <div className="px-8 pt-8 pb-8 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guest</p>
                      <p className="font-bold text-slate-900 text-sm truncate">{selectedQR.guestName}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Table</p>
                      <p className="font-black text-emerald-600 text-lg">{selectedQR.tableNumber || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 border-t border-dashed border-slate-200"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan at Entry</span>
                    <div className="flex-1 border-t border-dashed border-slate-200"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="p-4 border border-slate-100 rounded-[2rem] bg-white shadow-xl shadow-black/20">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/booking/${selectedQR.id}`)}&color=0f172a`} 
                        alt="Booking QR Code"
                        className="w-48 h-48 rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setReviewBooking(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
            >
              <button 
                onClick={() => setReviewBooking(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Leave a Review</h3>
              <p className="text-slate-500 text-sm mb-6">How was your experience at {restaurants.find(r => r.id === reviewBooking.restaurantId)?.name || "this restaurant"}?</p>

              <div className="flex gap-2 justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-10 h-10 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-transparent'}`} />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about the food, service, and ambiance..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-[#009b65] focus:ring-1 focus:ring-[#009b65] mb-6 resize-none text-slate-700"
              />

              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting || !reviewText.trim()}
                className="w-full bg-[#009b65] hover:bg-[#007a4f] disabled:bg-slate-300 text-white font-bold rounded-xl py-4 transition-colors flex items-center justify-center gap-2"
              >
                {reviewSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
