"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Users, Store, Calendar, TrendingUp, Activity, UserPlus, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    bookings: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
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

        // Process Bookings Chart Data (Last 7 Days)
        const daysMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          daysMap[d.toISOString().split('T')[0]] = 0;
        }

        bookingsSnap.forEach(doc => {
          const b = doc.data();
          const dateStr = b.date; // YYYY-MM-DD
          if (daysMap[dateStr] !== undefined) {
            daysMap[dateStr]++;
          }
        });

        const formattedChartData = Object.keys(daysMap).map(date => {
          const dateObj = new Date(date);
          const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return { name: shortDate, bookings: daysMap[date] };
        });
        setChartData(formattedChartData);

        // Process Recent Users
        const usersList: any[] = [];
        usersSnap.forEach(doc => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        // Sort by createdAt descending (assuming ISO strings or timestamps)
        usersList.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setRecentUsers(usersList.slice(0, 5));

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
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
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

      {/* Bottom Section: Charts & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="text-emerald-500 w-6 h-6" /> Bookings Over Time
              </h2>
              <p className="text-sm text-slate-500 mt-1">Platform-wide reservations for the last 7 days</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500">
              Last 7 Days
            </div>
          </div>

          <div className="flex-1 w-full h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="text-blue-500 w-6 h-6" /> Recent Users
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                  {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{u.name || "Unknown User"}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
                  {u.role}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 min-h-[150px]">
                <Users className="w-8 h-8 opacity-20" />
                <span className="text-sm">No recent users</span>
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors flex justify-center items-center gap-2">
            View All Users
          </button>
        </motion.div>
      </div>
    </div>
  );
}
