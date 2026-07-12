"use client";

import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight, Clock, Shield, Users, Heart, QrCode, CalendarCheck, Utensils, Star, X, Quote } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { RestaurantSettings } from "@/types/firestore";

export default function Home() {
  const [location, setLocation] = useState("");
  const [featuredRestaurants, setFeaturedRestaurants] = useState<RestaurantSettings[]>([]);
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const q = query(collection(db, "restaurantSettings"), limit(3));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => doc.data() as RestaurantSettings);
        setFeaturedRestaurants(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadFeatured();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location) {
      router.push(`/search?location=${encodeURIComponent(location)}`);
    }
  };
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#1A3636]/10 selection:text-[#1A3636] overflow-hidden relative">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A1616]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-4xl border-b-[1px] border-white/40 pb-1">
            <span className="text-emerald-700">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">nstant</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-neutral-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-neutral-300 hover:text-white transition-colors">How it Works</a>
            <a href="#for-restaurants" className="text-neutral-300 hover:text-white transition-colors">For Restaurants</a>
          </div>
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <div className="relative group cursor-pointer">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md uppercase">
                  {user.displayName ? user.displayName[0] : user.email ? user.email[0] : "U"}
                </div>
                
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0A1616] border border-white/10 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm font-bold text-white truncate">{user.displayName || "User"}</p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                  <Link 
                    href={role === "ADMIN" ? "/admin/dashboard" : role === "RESTAURANT" ? "/restaurant/dashboard" : "/customer/dashboard"} 
                    className="block px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                  Log In
                </Link>
                <Link href="/signup">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-5 h-9 text-sm font-medium shadow-md transition-all border-none">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 overflow-hidden z-10 bg-[#0A1616]">
        {/* Subtle background flourishes */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
          <div className="w-[800px] h-[800px] rounded-full bg-emerald-900/20 blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
          <div className="w-[600px] h-[600px] rounded-full bg-[#1A3636]/40 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.15] mb-6 max-w-4xl">
              Reserve the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">best</span> tables, instantly.
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl leading-relaxed font-medium">
              Stay ahead of the curve with real-time table management, instant reservations, and seamless operations designed for modern dining.
            </p>

            <Link href="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-6 rounded-full font-bold text-lg shadow-lg shadow-emerald-500/20 transition-transform transform hover:-translate-y-1">
                Start Free Trial
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative -mt-40 z-20 px-6 mb-20">
        {/* Custom Dashboard Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9] max-w-6xl mx-auto z-20"
        >
          {/* The Dashboard Card */}
          <div className="absolute inset-0 bg-white rounded-t-3xl rounded-b-xl shadow-2xl overflow-hidden border border-neutral-200/50 flex flex-col">
            {/* Header */}
            <div className="h-12 bg-neutral-50 border-b border-neutral-100 flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-6 w-48 bg-white border border-neutral-200 rounded-md flex items-center px-2">
                  <span className="w-3 h-3 text-neutral-300">🔍</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#1A3636] flex items-center justify-center text-[10px] text-white font-bold">
                  A
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1">
              {/* Sidebar */}
              <div className="w-16 md:w-48 bg-neutral-50/50 border-r border-neutral-100 p-4 flex flex-col gap-3">
                <div className="h-8 rounded bg-emerald-100 w-full mb-2 flex items-center px-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                </div>
                <div className="h-8 rounded hover:bg-neutral-100 w-full flex items-center px-2">
                  <div className="w-4 h-4 bg-neutral-300 rounded-sm"></div>
                </div>
                <div className="h-8 rounded hover:bg-neutral-100 w-full flex items-center px-2">
                  <div className="w-4 h-4 bg-neutral-300 rounded-sm"></div>
                </div>
                <div className="h-8 rounded hover:bg-neutral-100 w-full flex items-center px-2">
                  <div className="w-4 h-4 bg-neutral-300 rounded-sm"></div>
                </div>
              </div>

              {/* Main Content - Table Grid */}
              <div className="flex-1 p-6 bg-slate-50 relative overflow-hidden">

                {/* Filter bar */}
                <div className="flex gap-3 mb-6">
                  <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">All Tables</div>
                  <div className="px-4 py-1.5 bg-white text-neutral-500 text-xs font-bold rounded-full border border-neutral-200 shadow-sm">Indoor</div>
                  <div className="px-4 py-1.5 bg-white text-neutral-500 text-xs font-bold rounded-full border border-neutral-200 shadow-sm">Patio</div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {/* Available Tables */}
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`avail-${i}`} className="aspect-square bg-white border-2 border-emerald-400 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-pointer relative">
                      <span className="text-lg font-black text-emerald-700">{i}</span>
                      <div className="w-8 h-1 bg-emerald-100 rounded-full"></div>
                      <div className="w-8 h-1 bg-emerald-100 rounded-full absolute -top-3 left-1/2 -translate-x-1/2"></div>
                      <div className="w-8 h-1 bg-emerald-100 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2"></div>
                    </div>
                  ))}
                  {/* Occupied Tables */}
                  {[6, 7, 8].map(i => (
                    <div key={`occ-${i}`} className="aspect-square bg-white border-2 border-amber-400 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-pointer relative">
                      <span className="text-lg font-black text-amber-700">{i}</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">45 min</span>
                      <div className="w-8 h-1 bg-amber-200 rounded-full absolute -top-3 left-1/2 -translate-x-1/2"></div>
                      <div className="w-8 h-1 bg-amber-200 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2"></div>
                    </div>
                  ))}
                  {/* Reserved Tables */}
                  {[9, 10].map(i => (
                    <div key={`res-${i}`} className="aspect-square bg-slate-800 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-pointer relative">
                      <span className="text-lg font-black text-white">{i}</span>
                      <span className="text-[9px] font-bold text-slate-300">Reserved</span>
                    </div>
                  ))}
                </div>

                {/* Floating Action Menu Graphic */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="absolute bottom-6 right-6 bg-white shadow-2xl rounded-2xl p-4 border border-neutral-100 w-48"
                >
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">VIP Arrival</div>
                      <div className="text-[10px] text-neutral-500">Table 7 ready</div>
                    </div>
                  </div>
                  <div className="h-8 bg-[#1A3636] rounded-lg w-full flex items-center justify-center text-xs text-white font-bold cursor-pointer hover:bg-[#1A3636]/90 transition-colors">
                    Seat Guest
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Soft Glow behind dashboard */}
          <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 rounded-full transform translate-y-12 scale-90"></div>
        </motion.div>
      </section>

      {/* DARK THEMED EXPANDED SECTIONS */}
      <div className="mt-[300px] w-full z-10 relative bg-[#0A1616] pb-32 pt-0 border-t border-b border-white/5 overflow-visible">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1A3636]/40 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        {/* STATS SECTION OVERLAYING THE BORDER */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 mb-32 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Monthly Diners", value: "50K+" },
              { label: "Partner Restaurants", value: "1,200+" },
              { label: "Average Rating", value: "4.9" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-[#0A1616] border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:border-amber-400 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:-translate-y-2 transition-all duration-300">
                <span className="text-4xl md:text-5xl font-black text-white flex items-center gap-1">{stat.value}{stat.label === 'Average Rating' && <Star className="w-8 h-8 fill-emerald-400 text-emerald-400" />}</span>
                <span className="text-neutral-300 font-medium text-center text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 space-y-40 relative z-10">

          {/* EXPANDED FEATURES */}
          <div id="features" className="relative w-full pt-16">
            <div className="text-center mb-16 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Why Instant
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Everything you need to dine effortlessly.</h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10"
            >
              {/* Left Column */}
              <div className="flex flex-col justify-between h-full py-8 lg:py-12">
                {[
                  {
                    title: "Smart Seat Selection", desc: "Hand-pick your perfect table using our stunning, fully interactive 3D floor maps.", icon: MapPin,
                    colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20", hoverBorderClass: "group-hover:border-blue-500/40", hoverBgClass: "group-hover:bg-blue-500/20", glowClass: "bg-blue-500"
                  },
                  {
                    title: "VIP QR Check-In", desc: "Skip the host stand entirely. Flash your secure QR pass to get seated instantly.", icon: QrCode,
                    colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20", hoverBorderClass: "group-hover:border-emerald-500/40", hoverBgClass: "group-hover:bg-emerald-500/20", glowClass: "bg-emerald-500"
                  },
                  {
                    title: "Real-Time Tracking", desc: "Follow your dining status live, from initial confirmation to the moment your table is ready.", icon: Clock,
                    colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20", hoverBorderClass: "group-hover:border-amber-500/40", hoverBgClass: "group-hover:bg-amber-500/20", glowClass: "bg-amber-500"
                  },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -40 },
                      visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                    }}
                    className="py-6 transition-all group relative text-right"
                  >
                    <div className="flex justify-end mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-[#0A1616] border-2 border-amber-400/50 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400 ${f.hoverBgClass} transition-all duration-500 relative z-20`}>
                        <f.icon className={`w-7 h-7 ${f.colorClass} opacity-80 group-hover:opacity-100`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-20 group-hover:text-emerald-400 transition-colors duration-300">{f.title}</h3>
                    <p className="text-neutral-400 leading-relaxed text-sm relative z-20">{f.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Center Space Graphic */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
                }}
                className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center overflow-visible mt-10 lg:mt-0"
              >
                {/* Decorative static rings behind the image */}
                <div className="absolute -z-10 w-[80%] aspect-square border border-white/10 rounded-full border-dashed hidden lg:block"></div>
                <div className="absolute -z-10 w-[110%] aspect-square border border-emerald-500/10 rounded-full border-dashed hidden lg:block"></div>

                <img
                  src="/ChatGPT%20Image%20Jun%2027,%202026,%2001_46_49%20PM.png"
                  alt="Features preview"
                  className="w-[120%] lg:w-[140%] max-w-none h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20"
                />
              </motion.div>

              {/* Right Column */}
              <div className="flex flex-col justify-between h-full py-8 lg:py-12">
                {[
                  {
                    title: "Effortless Group Dining", desc: "Coordinate large parties flawlessly with automated, split-seating arrangements.", icon: Users,
                    colorClass: "text-purple-400", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/20", hoverBorderClass: "group-hover:border-purple-500/40", hoverBgClass: "group-hover:bg-purple-500/20", glowClass: "bg-purple-500"
                  },
                  {
                    title: "Ironclad Reservations", desc: "Book with absolute confidence. Instant confirmations with zero risk of overbooking.", icon: Shield,
                    colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20", hoverBorderClass: "group-hover:border-rose-500/40", hoverBgClass: "group-hover:bg-rose-500/20", glowClass: "bg-rose-500"
                  },
                  {
                    title: "Tailored Experiences", desc: "Your preferences, remembered. We auto-apply your dietary needs and favorite spots.", icon: Heart,
                    colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20", hoverBorderClass: "group-hover:border-pink-400/40", hoverBgClass: "group-hover:bg-pink-500/20", glowClass: "bg-pink-500"
                  },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: 40 },
                      visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                    }}
                    className="py-6 transition-all group relative text-left"
                  >
                    <div className="flex justify-start mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-[#0A1616] border-2 border-amber-400/50 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400 ${f.hoverBgClass} transition-all duration-500 relative z-20`}>
                        <f.icon className={`w-7 h-7 ${f.colorClass} opacity-80 group-hover:opacity-100`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-20 group-hover:text-emerald-400 transition-colors duration-300">{f.title}</h3>
                    <p className="text-neutral-400 leading-relaxed text-sm relative z-20">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* HOW IT WORKS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.15 }
                }
              }}
            >
              <div id="how-it-works" className="pt-24 mt-[-6rem]"></div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">Reserve in 4 simple steps.</h2>
              <div className="relative space-y-10 pl-4 border-l border-emerald-900/30 ml-4">
                {[
                  { step: "1", title: "Find Your Restaurant", desc: "Search by location, cuisine, or vibe. Filter by availability and party size." },
                  { step: "2", title: "Pick Date & Time", desc: "Choose your preferred date, time slot, and select the perfect table." },
                  { step: "3", title: "Pre-Order Your Meal", desc: "Browse the menu and pre-order dishes so your food is ready on arrival." },
                  { step: "4", title: "Arrive & Enjoy", desc: "Show your QR pass, get seated instantly, and enjoy a seamless dining experience." },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -40 },
                      visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                    }}
                    className="relative flex gap-8 group cursor-default"
                  >
                    {/* Glowing dot on the timeline line */}
                    <div className="absolute -left-[3.75rem] top-4 w-6 h-6 rounded-full bg-[#0A1616] border-[4px] border-amber-900/50 group-hover:border-amber-400 transition-colors duration-300 z-10 shadow-none group-hover:shadow-[0_0_15px_rgba(0,0,0,0.8)]"></div>

                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-amber-400 font-black text-xl group-hover:bg-amber-500/20 group-hover:border-amber-400/80 group-hover:-translate-y-1 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-all duration-300">
                      {s.step}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">{s.title}</h3>
                      <p className="text-neutral-400 text-base leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.25 }
                }
              }}
              className="relative aspect-[4/5] lg:aspect-square bg-gradient-to-br from-[#1A3636]/40 to-transparent backdrop-blur-xl rounded-[3rem] overflow-hidden border border-emerald-900/40 shadow-2xl flex items-center justify-center p-8"
            >
              <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>
              {/* Decorative mock UI cards */}
              <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 50, rotate: -10 },
                    visible: { opacity: 1, y: 0, rotate: -3, transition: { type: "spring", stiffness: 80, damping: 15 } }
                  }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                  className="bg-[#0A1616] backdrop-blur-2xl border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer transition-transform group relative z-30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
                  <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
                      <CalendarCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">Table Confirmed</p>
                      <p className="text-sm text-neutral-400">Tomorrow at 7:30 PM</p>
                    </div>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full w-full mb-3"></div>
                  <div className="h-2.5 bg-white/10 rounded-full w-2/3"></div>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 50, rotate: 10 },
                    visible: { opacity: 1, y: 0, rotate: 4, transition: { type: "spring", stiffness: 80, damping: 15 } }
                  }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                  className="bg-[#0A1616] backdrop-blur-2xl border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ml-8 cursor-pointer transition-transform group relative z-20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
                  <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                    <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">Meal Pre-Ordered</p>
                      <p className="text-sm text-neutral-400">Truffle Pasta, Wine</p>
                    </div>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full w-full mb-3"></div>
                  <div className="h-2.5 bg-white/10 rounded-full w-1/2"></div>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 50, rotate: -5 },
                    visible: { opacity: 1, y: 0, rotate: -2, transition: { type: "spring", stiffness: 80, damping: 15 } }
                  }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                  className="bg-[#0A1616] backdrop-blur-2xl border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center cursor-pointer transition-transform hover:shadow-[0_20px_60px_rgba(0,0,0,1)] relative overflow-hidden z-10"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[40px] -z-10"></div>
                  <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-4">Your VIP Pass</p>
                  <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    <QrCode className="w-16 h-16 text-neutral-900" />
                  </div>
                  <p className="text-white font-bold text-base">Scan to Check-in</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* PRE-BOOK ORDER CTA */}
          <div className="bg-[#0A261C] rounded-[3rem] p-10 md:p-16 lg:p-20 relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 overflow-hidden border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-amber-400 transition-all duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,210,130,0.1)_0%,transparent_70%)] pointer-events-none"></div>

            {/* Left Text */}
            <div className="relative z-10 w-full lg:w-1/3 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">Skip the wait.<br />Pre-order<br className="hidden lg:block" /> your meal.</h2>
            </div>

            {/* Center Image */}
            <div className="relative z-10 w-full sm:w-2/3 lg:w-1/3 flex justify-center py-8 lg:py-0">
              <img
                src="/3d-burger-white-background_1004243-1007-removebg-preview.png"
                alt="3D Burger"
                className="w-full max-w-[300px] lg:max-w-md h-auto object-contain transform hover:scale-110 transition-transform duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Right Text & CTA */}
            <div className="relative z-10 w-full lg:w-1/3 flex flex-col items-center lg:items-end text-center lg:text-right">
              <p className="text-lg text-emerald-100/70 mb-8 leading-relaxed max-w-sm">Select your dishes when you book your table and have your meal ready the moment you sit down. The ultimate VIP dining experience.</p>
              <Link href="/restaurants">
                <button className="bg-[#05D282] hover:bg-[#04E08B] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 hover:-translate-y-1">
                  Explore Menus <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 10 COMPREHENSIVE FEATURES */}
      <section className="bg-white py-24 w-full">
        <div className="max-w-6xl mx-auto space-y-8 px-6">
          <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold tracking-wide text-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Complete Suite
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">Everything you can do with Instant.</h2>
          </div>

          {[
            {
              title: "Instant Reservations",
              desc: "Book tables with zero wait time. Our real-time syncing ensures your table is always ready when you are, with absolute zero risk of overbooking.",
              image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
            },
            {
              title: "Pre-Order Meals",
              desc: "Skip the wait by ordering food before you arrive. Browse the digital menu, customize your dishes, and have your meal prepared the moment you sit down.",
              image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop"
            },
            {
              title: "Party & Event Booking",
              desc: "Effortlessly reserve large tables for events and gatherings. Coordinate split seating and manage large groups flawlessly without calling ahead.",
              image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop"
            },
            {
              title: "Interactive 3D Floor Maps",
              desc: "Choose your exact seat before you arrive. Our stunning 3D maps let you pick the perfect spot, whether it's by the window or near the bar.",
              image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
            },
            {
              title: "VIP QR Check-In",
              desc: "Skip the host stand entirely. Flash your secure QR pass at the door to get seated instantly. It's the ultimate VIP dining experience.",
              image: "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?q=80&w=2070&auto=format&fit=crop"
            },
            {
              title: "Dietary Customization",
              desc: "Set your preferences once, applied automatically everywhere. We remember your allergies and favorite spots to tailor your dining experience.",
              image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"
            },
            {
              title: "Real-Time Waitlist Tracking",
              desc: "Follow your dining status live, from initial confirmation to the moment your table is ready. Never wonder how long the wait is again.",
              image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1974&auto=format&fit=crop"
            },
            {
              title: "Automated Group Dining",
              desc: "Coordinate large parties seamlessly. Split the bill easily, invite friends, and manage everything from a single intuitive dashboard.",
              image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
            },
            {
              title: "Exclusive Loyalty Rewards",
              desc: "Earn points for every visit and redeem them for perks, free drinks, or priority seating. Our loyalty program is built right into your profile.",
              image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974&auto=format&fit=crop"
            },
            {
              title: "Direct Digital Ordering",
              desc: "Order directly from your phone with no middleman fees. Whether dining in or taking out, our digital ordering system is fast, simple, and works on any device.",
              image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 hover:border-amber-400 hover:bg-neutral-50 transition-all group shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            >
              {/* Number Circle */}
              <div className="shrink-0 flex items-center justify-center w-full md:w-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-neutral-300 flex items-center justify-center text-2xl md:text-3xl font-black text-neutral-800 group-hover:border-amber-500 group-hover:text-amber-500 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300">
                  {i + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm md:text-base">{feature.desc}</p>
              </div>

              {/* Image */}
              <div className="shrink-0 w-full md:w-64 lg:w-72 relative mt-4 md:mt-0">
                <div className="aspect-[16/10] rounded-xl overflow-hidden border-2 border-neutral-100 group-hover:border-amber-400 shadow-sm transition-all duration-300">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex shrink-0 ml-2">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all cursor-pointer">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Experiences Section */}
      <section className="mt-40 px-6 max-w-7xl mx-auto w-full z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">Curated experiences.</h2>
            <p className="text-lg text-neutral-500">Discover hand-picked restaurants that offer unforgettable dining atmospheres and world-class cuisine.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-[#1A3636] font-semibold hover:gap-3 transition-all">
            View all restaurants <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {(featuredRestaurants.length > 0 ? featuredRestaurants.map(r => ({
            id: r.id,
            name: r.name || "Unnamed Restaurant",
            rating: 4.8,
            price: "$$",
            cuisine: (r.description && r.description.length > 40) ? r.description.substring(0, 40) + "..." : (r.description || "Local Cuisine"),
            tags: ["Dine-in", "Great Atmosphere"],
            image: r.logoUrl || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop"
          })) : [
            {
              id: "1",
              name: "The Artisan Kitchen",
              rating: 4.9,
              price: "$$$",
              cuisine: "Contemporary European • Downtown",
              tags: ["Great for dates", "Wine pairing"],
              image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop"
            },
            {
              id: "2",
              name: "Sakura Sushi Bar",
              rating: 4.8,
              price: "$$",
              cuisine: "Japanese • Uptown",
              tags: ["Authentic", "Fresh Seafood"],
              image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=2070&auto=format&fit=crop"
            },
            {
              id: "3",
              name: "Bella Napoli",
              rating: 4.7,
              price: "$$",
              cuisine: "Italian • Westside",
              tags: ["Wood-fired Pizza", "Family friendly"],
              image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
            }
          ]).slice(0, 3).map((restaurant) => (
            <Link href={`/r/${restaurant.id}`} key={restaurant.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-500 block">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-neutral-900 shadow-sm flex items-center gap-1 z-10">
                  <span className="text-amber-500">★</span> {restaurant.rating}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-neutral-900 line-clamp-1">{restaurant.name}</h3>
                  <span className="text-sm font-medium text-neutral-500 whitespace-nowrap ml-2">{restaurant.price}</span>
                </div>
                <p className="text-neutral-500 text-sm mb-4 line-clamp-1">{restaurant.cuisine}</p>
                <div className="flex gap-2 overflow-hidden">
                  {restaurant.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium px-2.5 py-1 bg-neutral-100 rounded-md text-neutral-600 whitespace-nowrap">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* B2B / For Restaurants Section */}
      <section id="for-restaurants" className="mt-[480px] w-full z-10 relative bg-[#1A3636] pb-24 md:pb-32 pt-px">

        <div className="px-6 max-w-7xl mx-auto w-full relative -mt-[160px] md:-mt-[240px]">
          <div className="bg-neutral-900 rounded-[3rem] p-10 md:p-16 lg:p-20 overflow-hidden relative border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1A3636]/30 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-left z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-white backdrop-blur-md shadow-inner shadow-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  For Business Owners
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                  Run your front-of-house like clockwork.
                </h2>
                <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-md leading-relaxed">
                  Instant provides a powerful, intuitive iPad dashboard to manage your floor plan, waitlist, and VIP guests in real-time.
                </p>
                <ul className="space-y-5 mb-12">
                  {['Live Table Status', 'Predictive Turnaround Times', 'Guest CRM & Preferences'].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-neutral-300 font-medium">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner shadow-emerald-400/20">✓</div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/restaurant/apply">
                  <button className="bg-white hover:bg-neutral-100 text-neutral-900 px-8 py-4 rounded-xl font-bold shadow-xl shadow-white/10 transition-all w-full sm:w-auto transform hover:-translate-y-1">
                    Partner with Instant
                  </button>
                </Link>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform lg:rotate-2 lg:hover:rotate-0 transition-transform duration-700 z-10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none"></div>
                <img
                  src="/dashboard-mockup.png"
                  alt="Restaurant Dashboard iPad Mockup"
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 bg-slate-50 relative z-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05),transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-emerald-100 border border-emerald-200 text-xs font-semibold tracking-wide text-emerald-800">
              <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">thousands</span> of diners.
            </h2>
            <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what some of our most frequent users and restaurant partners have to say.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              { text: "Instant completely changed how we dine out. Pre-ordering our meals means we never have to wait anymore! It's like having a VIP pass everywhere.", author: "Sarah Jenkins", role: "Food Blogger", avatar: "https://i.pravatar.cc/150?u=sarah" },
              { text: "The 3D interactive maps are incredible. We always know exactly where we're sitting before we even arrive. A completely flawless experience.", author: "Michael Chen", role: "VIP Diner", avatar: "https://i.pravatar.cc/150?u=michael" },
              { text: "As a restaurant manager, this platform is a lifesaver. Our turnaround times have improved by 30% and our guests are consistently happier.", author: "Elena Rodriguez", role: "Restaurant Manager", avatar: "https://i.pravatar.cc/150?u=elena" }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                }}
                className="bg-white p-10 rounded-2xl border border-neutral-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-12 h-12 text-emerald-100 absolute top-8 right-8 transform group-hover:scale-110 group-hover:text-emerald-200 transition-all duration-500" />
                  <div className="flex gap-1 mb-8">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-neutral-700 text-lg mb-10 leading-relaxed relative z-10">"{testimonial.text}"</p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-neutral-100 relative z-10">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-emerald-50 shadow-md">
                    <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-base">{testimonial.author}</h4>
                    <span className="text-sm font-medium text-emerald-600">{testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-[#0A1616] pt-24 pb-12 border-t border-emerald-900/30 relative z-10 overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
            {/* Brand & Newsletter */}
            <div className="lg:col-span-5 pr-0 lg:pr-12">
              <div className="flex items-center mb-6 font-[family-name:var(--font-yesteryear)] text-5xl border-b-[1px] border-white/40 inline-flex pb-1">
                <span className="text-emerald-700">I</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">nstant</span>
              </div>
              <p className="text-neutral-400 text-base mb-8 leading-relaxed max-w-sm">
                The future of dining is here. Reserve VIP tables, pre-order meals, and experience seamless hospitality like never before.
              </p>

              <div className="space-y-4">
                <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Subscribe to updates</h4>
                <div className="flex items-center gap-2 max-w-sm">
                  <input type="email" placeholder="Enter your email" className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all flex-1" />
                  <button className="h-12 bg-emerald-500 hover:bg-emerald-400 text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-white mb-6 tracking-wide">Product</h4>
                <ul className="space-y-4 text-sm text-neutral-400">
                  <li><a href="#features" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">How it Works</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Pricing</a></li>
                  <li><a href="/restaurants" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Browse Restaurants</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 tracking-wide">Company</h4>
                <ul className="space-y-4 text-sm text-neutral-400">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">About Us</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Careers</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Blog</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 tracking-wide">Partners</h4>
                <ul className="space-y-4 text-sm text-neutral-400">
                  <li><a href="/restaurant/apply" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Join as Restaurant</a></li>
                  <li><a href="/login" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Partner Login</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Case Studies</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform duration-200">Help Center</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} Instant Inc. All rights reserved.</p>

            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 hover:border-transparent hover:-translate-y-1 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
            </div>

            <div className="flex gap-6 text-sm">
              <a href="#" className="text-neutral-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-neutral-500 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
