"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { RestaurantSettings, Booking } from "@/types/firestore";
import { Search, MapPin, Star, Calendar, Clock, QrCode, ChevronRight, X, Loader2, CheckCircle2, XCircle, History, Ticket, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/hooks/useLocation";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<RestaurantSettings[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [location, setLocation] = useState("");
  const { requestLocation, loading: locationLoading } = useLocation();

  useEffect(() => {
    async function initLocation() {
      try {
        const city = await requestLocation();
        if (city) {
          setLocation(city);
        }
      } catch (e) {
        console.error("Location request failed", e);
      }
    }
    setTimeout(() => {
      initLocation();
    }, 1000);
  }, []);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Cancellation State
  const [cancelling, setCancelling] = useState<string | null>(null);

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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    setCancelling(bookingId);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "Cancelled"
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "Cancelled" } : b));
    } catch (e) {
      console.error("Failed to cancel booking", e);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto font-sans w-full p-4 md:p-0">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <Skeleton className="h-96 w-full lg:w-2/3 rounded-2xl" />
          <Skeleton className="h-96 w-full lg:w-1/3 rounded-2xl" />
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === "Upcoming" || b.status === "Seated");
  const pastBookings = bookings.filter(b => b.status === "Completed" || b.status === "Cancelled");
  
  const completedCount = pastBookings.filter(b => b.status === "Completed").length;

  const filteredRestaurants = restaurants.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = term ? (
      r.name?.toLowerCase().includes(term) ||
      (r as any).cuisineType?.toLowerCase().includes(term) ||
      r.address?.toLowerCase().includes(term)
    ) : true;
    
    const matchesLocation = location ? (
      r.address?.toLowerCase().includes(location.toLowerCase()) || 
      r.name?.toLowerCase().includes(location.toLowerCase())
    ) : true;
    
    return matchesSearch && matchesLocation;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}${location ? `&location=${encodeURIComponent(location)}` : ''}`);
    }
  };

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto font-sans w-full">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Welcome, <span className="text-emerald-600">{user?.displayName || "Guest"}</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage your premium dining reservations.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full lg:w-[450px] flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search location, restaurant or cuisine..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center">
              Search
            </button>
          </form>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors">
             <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
               <Calendar className="w-6 h-6" />
             </div>
             <div>
               <p className="text-slate-500 text-sm font-medium mb-1">Upcoming Passes</p>
               <h3 className="text-2xl font-bold text-slate-900">{upcomingBookings.length}</h3>
             </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
             <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
               <Award className="w-6 h-6" />
             </div>
             <div>
               <p className="text-slate-500 text-sm font-medium mb-1">Completed</p>
               <h3 className="text-2xl font-bold text-slate-900">{completedCount}</h3>
             </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors">
             <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
               <Ticket className="w-6 h-6" />
             </div>
             <div>
               <p className="text-slate-500 text-sm font-medium mb-1">Total Bookings</p>
               <h3 className="text-2xl font-bold text-slate-900">{bookings.length}</h3>
             </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column (Primary Content) */}
          <div className="lg:w-2/3 flex flex-col gap-10">
            
            {/* Upcoming Passes Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                  <Ticket className="w-6 h-6 text-emerald-500" />
                  Upcoming Passes
                </h2>
                <button onClick={() => router.push('/customer/dashboard/bookings')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg py-16 px-8 text-center flex flex-col items-center justify-center shadow-sm w-full">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No upcoming reservations</h3>
                  <p className="text-slate-500 font-medium text-sm">You don't have any upcoming VIP passes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {upcomingBookings.slice(0, 4).map(booking => {
                    const restaurant = restaurants.find(r => r.id === booking.restaurantId);
                    return (
                      <div key={booking.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                          <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-start">
                            <div>
                              <span className="text-xs font-semibold text-emerald-600 mb-1 block">VIP Pass</span>
                              <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{restaurant?.name || "Restaurant"}</h3>
                              <p className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> <span className="line-clamp-1">{restaurant?.address || "Location unavailable"}</span>
                              </p>
                            </div>
                            <button onClick={() => setSelectedQR(booking)} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 transition-colors">
                              <QrCode className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="p-5 flex flex-col gap-4 bg-white">
                            <div className="flex justify-between items-center bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Date & Time</p>
                                <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {booking.date} • {booking.time}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-slate-500 mb-1">Table</p>
                                <p className="font-bold text-slate-900 text-sm">{booking.tableNumber || "VIP"}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => router.push(`/r/${booking.restaurantId}?bookingId=${booking.id}`)}
                                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors text-sm border border-slate-200"
                              >
                                Pre-order Menu
                              </button>
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancelling === booking.id}
                                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 font-semibold rounded-lg transition-colors text-sm border border-slate-200 hover:border-rose-200 flex items-center justify-center"
                              >
                                {cancelling === booking.id ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : "Cancel"}
                              </button>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Curated Experiences */}
            <section id="curated-experiences" className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                    <Star className="w-6 h-6 text-amber-400" />
                    Curated Experiences
                  </h2>
                  {location && (
                    <p className="text-slate-500 mt-1 flex items-center gap-1 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-emerald-500" /> Showing restaurants near <strong className="text-slate-700">{location}</strong>
                    </p>
                  )}
                </div>
              </div>

              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No restaurants found</h3>
                  <p className="text-slate-500 text-sm">We couldn't find any curated experiences matching "{searchTerm}".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredRestaurants.slice(0, 6).map(restaurant => (
                    <div 
                      key={restaurant.id}
                      onClick={() => router.push(`/r/${restaurant.id}`)}
                      className="group bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-5xl z-0">
                          {restaurant.name.substring(0,2).toUpperCase()}
                        </div>
                        {restaurant.logoUrl && (
                          <img 
                            src={restaurant.logoUrl} 
                            alt={restaurant.name} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-10" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-3 right-3 z-30">
                           <span className="bg-emerald-600/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                             <Star className="w-3 h-3 fill-white text-white" />
                             {(restaurant as any).cuisineType || "Premium"}
                           </span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <h3 className="text-slate-900 font-black text-xl leading-tight mb-1 line-clamp-1">{restaurant.name}</h3>
                          <p className="text-[13px] text-slate-500 mb-2 flex items-center gap-1.5">
                            <span className="line-clamp-1">{(restaurant as any).cuisineType || "Dining"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>$$</span>
                          </p>
                          <p className="text-[13px] text-slate-400 flex items-start gap-1.5 font-medium">
                            <span className="line-clamp-1">{restaurant.address || "Location unavailable"}</span>
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                            Bookings Open
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
            </section>
          </div>

          {/* Right Column (Secondary Content) */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-500" />
                  Recent History
                </h3>
                <button onClick={() => router.push('/customer/dashboard/history')} className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                  See All
                </button>
              </div>
              
              <div className="p-2">
                {pastBookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <History className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No past bookings found.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {pastBookings.slice(0, 5).map((booking, index) => {
                      const restaurant = restaurants.find(r => r.id === booking.restaurantId);
                      const isCompleted = booking.status === "Completed";
                      
                      return (
                        <div key={booking.id} className={`p-4 flex flex-col gap-3 hover:bg-slate-50 rounded-lg transition-colors ${index !== pastBookings.slice(0,5).length - 1 ? 'border-b border-slate-100' : ''}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-0.5">{restaurant?.name || "Restaurant"}</h4>
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
                                  {booking.date}
                                </p>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            
                            {isCompleted && !booking.hasReviewed && (
                              <button 
                                onClick={() => setReviewBooking(booking)}
                                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

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
                className="bg-white rounded-lg max-w-sm w-full relative shadow-2xl shadow-black/50 overflow-hidden border border-slate-200"
              >
                <div className="bg-slate-50 px-8 pt-8 pb-6 text-slate-900 relative border-b border-slate-200">
                  <button 
                    onClick={() => setSelectedQR(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">Instant VIP Pass</p>
                  <h3 className="text-2xl font-bold">{restaurant?.name || 'Restaurant'}</h3>
                </div>
                <div className="px-8 pt-6 pb-8 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guest</p>
                      <p className="font-bold text-slate-900 text-sm truncate">{selectedQR.guestName}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Table</p>
                      <p className="font-black text-emerald-600 text-lg leading-none">{selectedQR.tableNumber || "VIP"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                    <QRCodeSVG 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${selectedQR.id}/verify`} 
                      size={200}
                      level="H"
                      includeMargin={false}
                      fgColor="#0f172a"
                    />
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors pointer-events-none"></div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pass ID</p>
                    <p className="font-mono font-bold text-slate-900 text-sm tracking-wider">{selectedQR.id}</p>
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
