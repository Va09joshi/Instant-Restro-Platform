"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { Booking } from "@/types/firestore";
import { Search, Calendar, Filter, Users, MapPin, Clock, MoreHorizontal, UserCheck, XCircle, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
      date: selectedDate,
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
    b.date === selectedDate &&
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
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm font-medium bg-white focus:outline-none focus:border-emerald-500 transition-colors h-10"
            />
          </div>
          <Button onClick={handleAddWalkIn} className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white gap-2 h-10">
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
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end shrink-0">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p>No {activeTab.toLowerCase()} bookings found.</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {filteredBookings.map(b => {
                const isCompleted = b.status === "Completed";
                const isCancelled = b.status === "Cancelled";
                const isSeated = b.status === "Seated";
                const isUpcoming = b.status === "Upcoming";

                return (
                  <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 
                        ${isCompleted ? 'bg-[#e6f7ef] text-[#009b65]' : 
                          isCancelled ? 'bg-red-50 text-red-500' : 
                          isSeated ? 'bg-blue-50 text-blue-500' : 
                          'bg-amber-50 text-amber-500'}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} /> : 
                         isCancelled ? <XCircle className="w-6 h-6" strokeWidth={2.5} /> :
                         isSeated ? <UserCheck className="w-6 h-6" strokeWidth={2.5} /> :
                         <Clock className="w-6 h-6" strokeWidth={2.5} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-slate-800 text-[17px]">{b.guestName}</h4>
                          {b.tags?.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-[13px] text-slate-400 font-medium flex items-center flex-wrap gap-2">
                          <span>{b.time}</span> • 
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.guests}</span> • 
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {b.tableNumber || "Unassigned"}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border
                        ${isUpcoming ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                        ${isSeated ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                        ${isCompleted ? 'bg-[#e6f7ef] text-[#009b65] border-[#009b65]/30' : ''}
                        ${isCancelled ? 'bg-red-50 text-red-600 border-red-200' : ''}
                      `}>
                        {b.status}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <>
                            <Button 
                              onClick={() => updateBookingStatus(b.id, "Cancelled")}
                              size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 rounded-lg px-3"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => updateBookingStatus(b.id, "Seated")}
                              size="sm" className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white h-8 rounded-lg px-3"
                            >
                              Seat
                            </Button>
                          </>
                        )}
                        {isSeated && (
                          <Button 
                            onClick={() => updateBookingStatus(b.id, "Completed")}
                            size="sm" className="bg-[#009b65] hover:bg-[#008255] text-white h-8 rounded-lg px-3"
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
