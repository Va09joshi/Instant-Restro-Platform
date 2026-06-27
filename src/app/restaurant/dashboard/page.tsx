"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Booking, Table } from "@/types/firestore";
import { Users, CalendarCheck, Utensils, TrendingUp, ArrowRight, Clock, MapPin, ScanLine, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RestaurantDashboard() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalTables, setTotalTables] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      const bQuery = query(collection(db, "bookings"), where("restaurantId", "==", user.uid));
      const tQuery = query(collection(db, "tables"), where("restaurantId", "==", user.uid));
      
      const [bSnap, tSnap] = await Promise.all([getDocs(bQuery), getDocs(tQuery)]);
      
      const bData = bSnap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
      setBookings(bData.filter(b => b.date === today).sort((a,b) => a.time.localeCompare(b.time)));
      setTotalTables(tSnap.docs.length);
      
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const todaysBookings = bookings.length;
  const guestsSeated = bookings.filter(b => b.status === "Seated").reduce((sum, b) => sum + b.guests, 0);
  const activeTables = bookings.filter(b => b.status === "Seated").length;
  
  const upcomingBookings = bookings.filter(b => b.status === "Upcoming").slice(0, 3);

  const estRevenue = guestsSeated * 45; // Roughly $45 per seated guest

  const kpis = [
    { title: "Today's Bookings", value: todaysBookings.toString(), trend: "Today", icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Guests Seated", value: guestsSeated.toString(), trend: "Live", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Active Tables", value: `${activeTables}/${totalTables || '-'}`, trend: "Occupied", icon: Utensils, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Revenue (Est)", value: `$${estRevenue.toLocaleString()}`, trend: "Est. Total", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  if (loading) {
    return <div className="h-full flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening at your restaurant today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{kpi.trend}</span>
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1">{kpi.title}</h3>
            <p className="text-3xl font-black text-slate-800">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upcoming Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Upcoming Reservations</h2>
            <Link href="/restaurant/bookings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center p-8 text-slate-400">
                No upcoming bookings right now.
              </div>
            ) : (
              upcomingBookings.map((booking, i) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      {booking.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{booking.guestName}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {booking.guests} Guests</span>
                        {booking.tableNumber && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {booking.tableNumber}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                      ${booking.tags?.includes('VIP') ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}
                    `}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#0A1616] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
            <ScanLine className="w-10 h-10 text-emerald-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">QR Scanner</h2>
            <p className="text-slate-400 text-sm mb-6">Instantly seat walk-in guests or scan digital booking passes.</p>
            <Link href="/restaurant/scanner">
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                Launch Scanner
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <h3 className="font-bold text-slate-800 mb-1">Edit Floor Plan</h3>
            <p className="text-xs text-slate-500 mb-4">Rearrange tables for tonight's service.</p>
            <Link href="/restaurant/tables" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              Open Builder <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <h3 className="font-bold text-slate-800 mb-1">Menu Availability</h3>
            <p className="text-xs text-slate-500 mb-4">Quickly mark sold-out items to update live digital menus.</p>
            <Link href="/restaurant/menu" className="text-sm font-semibold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all">
              Manage Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
