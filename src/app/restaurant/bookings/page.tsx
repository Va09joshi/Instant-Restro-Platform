"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { Booking } from "@/types/firestore";
import { Search, Calendar, Filter, Users, MapPin, Clock, MoreHorizontal, UserCheck, XCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BookingsManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings for the current restaurant
  useEffect(() => {
    async function loadBookings() {
      if (!user) return;
      const q = query(collection(db, "bookings"), where("restaurantId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
      setBookings(data.sort((a,b) => b.createdAt - a.createdAt));
      setLoading(false);
    }
    loadBookings();
  }, [user]);

  const updateBookingStatus = async (id: string, status: Booking["status"]) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const handleAddWalkIn = async () => {
    if (!user) return;
    const newBooking: Omit<Booking, "id"> = {
      restaurantId: user.uid,
      guestName: "Walk-in Guest",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      guests: 2,
      tableId: null,
      tableNumber: null,
      status: "Seated",
      tags: ["Walk-in"],
      createdAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, "bookings"), newBooking);
    setBookings([{ ...newBooking, id: docRef.id } as Booking, ...bookings]);
  };

  const filteredBookings = bookings.filter(b => 
    b.status === activeTab && 
    (b.guestName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bookings Manager</h1>
          <p className="text-slate-500 mt-1">Manage reservations, walk-ins, and floor statuses.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white"><Calendar className="w-4 h-4" /> Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Button>
          <Button onClick={handleAddWalkIn} className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Walk-In
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
            {["Upcoming", "Seated", "Completed", "Cancelled"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search name or ID..." 
                className="pl-9 w-64 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="bg-white"><Filter className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p>No {activeTab.toLowerCase()} bookings found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 z-10">
                <tr>
                  <th className="font-semibold text-xs text-slate-400 uppercase tracking-widest p-4 pl-6">Guest Info</th>
                  <th className="font-semibold text-xs text-slate-400 uppercase tracking-widest p-4">Time</th>
                  <th className="font-semibold text-xs text-slate-400 uppercase tracking-widest p-4">Details</th>
                  <th className="font-semibold text-xs text-slate-400 uppercase tracking-widest p-4">Status</th>
                  <th className="font-semibold text-xs text-slate-400 uppercase tracking-widest p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          {b.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            {b.guestName}
                            {b.tags?.map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{b.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {b.time}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> {b.guests} Guests</span>
                        {b.tableNumber ? (
                          <span className="flex items-center gap-1.5 text-emerald-600"><MapPin className="w-4 h-4 text-emerald-500" /> Table {b.tableNumber}</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-4 h-4 text-slate-300" /> Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold
                        ${b.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' : ''}
                        ${b.status === 'Seated' ? 'bg-emerald-50 text-emerald-600' : ''}
                        ${b.status === 'Completed' ? 'bg-slate-100 text-slate-600' : ''}
                      `}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {b.status === 'Upcoming' && (
                        <>
                          <Button 
                            onClick={() => updateBookingStatus(b.id, "Cancelled")}
                            size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            onClick={() => updateBookingStatus(b.id, "Seated")}
                            size="sm" className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white"
                          >
                            <UserCheck className="w-4 h-4 mr-1" /> Seat Guest
                          </Button>
                        </>
                      )}
                      {b.status === 'Seated' && (
                        <Button 
                          onClick={() => updateBookingStatus(b.id, "Completed")}
                          size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <UserCheck className="w-4 h-4 mr-1" /> Mark Completed
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-9 w-9"><MoreHorizontal className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
