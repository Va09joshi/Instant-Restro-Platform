"use client";

import { Activity, ShieldCheck, Building2, Users, Plus, Building, Mail, MapPin } from "lucide-react";
import { useState } from "react";

export default function SystemDashboard() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">System Administration</h1>
          <p className="text-neutral-500 mt-1">Manage global platform metrics and onboarding.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-5 h-5" /> Add New Restaurant</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Restaurants</p>
              <h3 className="text-2xl font-bold text-neutral-900">124</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Active Users</p>
              <h3 className="text-2xl font-bold text-neutral-900">8.2k</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Platform Health</p>
              <h3 className="text-2xl font-bold text-neutral-900">100%</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-neutral-900">3</h3>
            </div>
          </div>
        </div>
      </div>

      {isAdding ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-200 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-xl font-bold text-neutral-900">Onboard New Restaurant</h2>
            <p className="text-sm text-neutral-500 mt-1">Create a new tenant account and assign an admin.</p>
          </div>
          <div className="p-6 lg:p-8">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); alert('Demo: Restaurant Added Successfully!'); setIsAdding(false); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Restaurant Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input type="text" placeholder="e.g. The Artisan Kitchen" required className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20 focus:border-[#1A3636] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input type="text" placeholder="City, Neighborhood" required className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20 focus:border-[#1A3636] transition-all" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Admin Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input type="email" placeholder="admin@restaurant.com" required className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20 focus:border-[#1A3636] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Cuisine Type</label>
                  <select required className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20 focus:border-[#1A3636] transition-all appearance-none cursor-pointer">
                    <option value="" disabled selected>Select cuisine...</option>
                    <option value="italian">Italian</option>
                    <option value="japanese">Japanese</option>
                    <option value="french">French</option>
                    <option value="steakhouse">Steakhouse</option>
                    <option value="modern">Modern European</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-neutral-100 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-100 font-medium rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white px-8 py-2.5 font-medium rounded-xl shadow-md transition-all">
                  Create Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Recent Onboarding Requests</h2>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">3 Pending</span>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {/* Mock pending items */}
            <div className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-500">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Lumina Steakhouse</h4>
                  <p className="text-sm text-neutral-500">Requested 2 hours ago • Chicago, IL</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Review</button>
                <button className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">Approve</button>
              </div>
            </div>
            
            <div className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-500">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Sushi Nakazawa</h4>
                  <p className="text-sm text-neutral-500">Requested 5 hours ago • New York, NY</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Review</button>
                <button className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
