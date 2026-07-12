"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Loader2, Bell, Calendar, Star, Store } from "lucide-react";
import { Booking } from "@/types/firestore";

interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'booking' | 'system' | 'restaurant';
  time: string;
  isNew: boolean;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        // Fetch recent bookings to use as notifications
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);
        const recentBookings = snap.docs.map(doc => {
          const data = doc.data() as Booking;
          const createdAt = data.createdAt || Date.now();
          
          return {
            id: doc.id,
            title: `New Booking`,
            description: `A new reservation for ${data.guests} guests on ${data.date} at ${data.time} by ${data.guestName || 'Guest'}.`,
            type: 'booking' as const,
            timestamp: createdAt,
            isNew: true
          };
        });
        
        // Fetch recent restaurant signups
        const usersQ = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10));
        const usersSnap = await getDocs(usersQ);
        const recentRestaurants = usersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(user => user.role === 'RESTAURANT')
          .map(user => {
             const createdDate = user.createdAt ? new Date(user.createdAt).getTime() : Date.now();
             return {
               id: `sys-${user.id}`,
               title: 'New Restaurant Onboarded',
               description: `${user.name || user.email} has completed their registration and is now active.`,
               type: 'restaurant' as const,
               timestamp: createdDate,
               isNew: true
             };
          });

        const allNotifications = [...recentBookings, ...recentRestaurants]
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(n => {
            // Simple relative time formatter
            const diffMs = Date.now() - n.timestamp;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            let timeStr = "Just now";
            if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
            
            return { ...n, time: timeStr };
          });

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'booking':
        return <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#20c997] flex items-center justify-center shrink-0"><Calendar className="w-6 h-6" /></div>;
      case 'system':
        return <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0"><Star className="w-6 h-6" /></div>;
      case 'restaurant':
        return <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><Store className="w-6 h-6" /></div>;
      default:
        return <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Bell className="w-6 h-6" /></div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#20c997]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans py-8 p-4 md:p-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">System Notifications</h1>
          <p className="text-slate-500">Stay updated with platform activity and alerts.</p>
        </div>
        <button className="hidden sm:block text-sm font-bold text-[#20c997] hover:text-[#147a5b] transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full p-2">
        {notifications.length === 0 ? (
           <div className="p-16 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
               <Bell className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
             <p className="text-slate-500 max-w-md">There are no new notifications to display right now.</p>
           </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 rounded-2xl flex gap-5 transition-colors cursor-pointer ${
                  notif.isNew ? "bg-slate-50 hover:bg-slate-100/80" : "bg-white hover:bg-slate-50/50"
                }`}
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className={`text-[15px] truncate ${notif.isNew ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
                {notif.isNew && (
                  <div className="w-2.5 h-2.5 bg-[#20c997] rounded-full self-center shrink-0 shadow-sm shadow-[#20c997]/50"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
