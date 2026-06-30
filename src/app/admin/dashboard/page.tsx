"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Users, Store, Calendar, TrendingUp, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const restaurantsSnap = await getDocs(collection(db, "restaurantSettings"));
        const bookingsSnap = await getDocs(collection(db, "bookings"));

        setStats({
          users: usersSnap.size,
          restaurants: restaurantsSnap.size,
          bookings: bookingsSnap.size
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-[#1A3636] animate-ping"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Restaurants", value: stats.restaurants, icon: Store, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Bookings", value: stats.bookings, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Overview</span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time metrics and system activity.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner`}>
              <stat.icon className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">{stat.label}</h3>
            <p className="text-5xl font-black text-slate-900 relative z-10 flex items-center gap-2">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Section: Regional Data & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Regional Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Globe className="text-[#20c997] w-6 h-6" /> Regional Distribution
              </h2>
              <p className="text-sm text-slate-500 mt-1">Active users and restaurants by region</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500">
              Last 30 Days
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {[
              { region: "North America", count: "14,230", percentage: 75, color: "bg-[#20c997]" },
              { region: "Europe", count: "4,591", percentage: 45, color: "bg-blue-500" },
              { region: "Asia Pacific", count: "2,840", percentage: 30, color: "bg-amber-500" },
              { region: "Middle East", count: "852", percentage: 15, color: "bg-indigo-500" }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">{item.region}</span>
                  <span className="text-slate-900">{item.count} users</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
                  <div 
                    className={`${item.color} h-full rounded-full relative overflow-hidden`} 
                    style={{ width: `${item.percentage}%` }}
                  >
                    {/* Shimmer effect inside progress bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-slate-200/50"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#20c997]/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 mb-8">
            <h2 className="text-xl font-black mb-2 flex items-center gap-3">
              <TrendingUp className="text-[#20c997] w-6 h-6" /> System Health
            </h2>
            <p className="text-sm text-slate-400">All primary services are operational.</p>
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1">Uptime</p>
              <p className="text-2xl font-black text-[#20c997]">99.99%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1">API Latency</p>
              <p className="text-2xl font-black text-white">42ms</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
