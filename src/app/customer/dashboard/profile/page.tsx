"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-500">Manage your personal information.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm max-w-3xl">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 bg-[#009b65] rounded-full flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-[#009b65]/30 uppercase">
            {user?.displayName ? user.displayName[0] : user?.email ? user.email[0] : "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user?.displayName || "Guest User"}</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>
        </div>

        <form className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  defaultValue={user?.displayName || ""}
                  className="w-full pl-11 pr-4 py-3 bg-[#f0f4f8] border border-transparent rounded-xl text-sm text-slate-800 focus:bg-white focus:border-[#009b65] focus:ring-1 focus:ring-[#009b65] transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-3 bg-[#f0f4f8] border border-transparent rounded-xl text-sm text-slate-800 focus:bg-white focus:border-[#009b65] focus:ring-1 focus:ring-[#009b65] transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Security</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-[13px] font-bold text-slate-700 mb-2 block">Change Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="New Password"
                    className="w-full pl-11 pr-4 py-3 bg-[#f0f4f8] border border-transparent rounded-xl text-sm text-slate-800 focus:bg-white focus:border-[#009b65] focus:ring-1 focus:ring-[#009b65] transition-all outline-none"
                  />
                </div>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="Confirm New Password"
                  className="w-full pl-11 pr-4 py-3 bg-[#fafafa] border border-slate-100 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-[#009b65] focus:ring-1 focus:ring-[#009b65] transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button type="button" className="bg-[#009b65] hover:bg-[#007a4f] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#009b65]/20 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
