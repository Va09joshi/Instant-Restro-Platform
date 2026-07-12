"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Loader2, Users, Mail, ShieldAlert, BadgeCheck, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "users"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as PlatformUser);
        
        // Sort admins first, then restro, then customers
        data.sort((a, b) => {
          if (a.role === 'ADMIN') return -1;
          if (b.role === 'ADMIN') return 1;
          return 0;
        });
        
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'RESTAURANT' | 'ADMIN'>('ALL');

  const filteredUsers = users.filter(user => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'CUSTOMER') return !user.role || user.role === 'CUSTOMER';
    return user.role === roleFilter;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase tracking-widest">
            <ShieldAlert className="w-3 h-3" /> System Admin
          </span>
        );
      case 'RESTAURANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold uppercase tracking-widest">
            <BadgeCheck className="w-3 h-3" /> Restaurant Partner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-widest">
            <Users className="w-3 h-3" /> Normal
          </span>
        );
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Unknown";
    try {
      if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
      return new Date(dateValue).toLocaleDateString();
    } catch(e) {
      return "Unknown";
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
    <div className="max-w-5xl mx-auto space-y-6 font-sans py-8 p-4 md:p-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Platform Users</h1>
          <p className="text-slate-500">Manage all registered accounts across the system.</p>
        </div>
        
        {/* Role Toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'CUSTOMER', 'RESTAURANT', 'ADMIN'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 whitespace-nowrap text-center",
                roleFilter === role 
                  ? "bg-[#20c997] text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              {role === 'CUSTOMER' ? 'Normal' : role === 'RESTAURANT' ? 'Partner' : role === 'ADMIN' ? 'Admin' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Container without heavy gradient shadow */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        {filteredUsers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-500 max-w-md">There are no users matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  <th className="px-4 md:px-6 py-5 font-bold whitespace-nowrap">User</th>
                  <th className="px-4 md:px-6 py-5 font-bold hidden md:table-cell whitespace-nowrap">Contact</th>
                  <th className="px-4 md:px-6 py-5 font-bold hidden lg:table-cell whitespace-nowrap">Joined</th>
                  <th className="px-4 md:px-6 py-5 font-bold whitespace-nowrap text-right md:text-left">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => {
                  let initial = "U";
                  if (user.name) initial = user.name[0];
                  else if (user.email) initial = user.email[0];
                  
                  return (
                    <tr key={user.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 md:px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm shadow-sm",
                            user.role === 'ADMIN' ? 'bg-rose-500 text-white' : 
                            user.role === 'RESTAURANT' ? 'bg-amber-500 text-white' : 
                            'bg-slate-800 text-white'
                          )}>
                            {initial.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[14px] md:text-[15px] text-slate-900 block truncate">{user.name || "Guest User"}</span>
                            <div className="text-[10px] md:text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide truncate">ID: {user.id.substring(0,8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-5 hidden md:table-cell whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {user.email || "No email"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-5 hidden lg:table-cell text-sm font-medium text-slate-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="px-4 md:px-6 py-5 whitespace-nowrap text-right md:text-left">
                        {getRoleBadge(user.role || 'CUSTOMER')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
