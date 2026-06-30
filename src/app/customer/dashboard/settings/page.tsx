"use client";

import { Bell, Shield, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans py-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your application preferences.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50">
        
        <div className="space-y-10">
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            </div>
            <div className="space-y-4 ml-16">
              <label className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-bold text-[15px] text-slate-900">Email Notifications</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Receive booking confirmations via email.</p>
                </div>
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#20c997] cursor-pointer" />
                </div>
              </label>
              <label className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-bold text-[15px] text-slate-900">SMS Alerts</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Get text messages when your table is ready.</p>
                </div>
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#20c997] cursor-pointer" />
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#20c997]">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Privacy</h2>
            </div>
            <div className="space-y-4 ml-16">
              <label className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-bold text-[15px] text-slate-900">Share profile with restaurants</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Allows restaurants to see your dining preferences.</p>
                </div>
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#20c997] cursor-pointer" />
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">App Preferences</h2>
            </div>
            <div className="space-y-4 ml-16">
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="font-bold text-[15px] text-slate-900 mb-3">Theme</p>
                <select className="w-full md:w-64 p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#20c997]/20 focus:border-[#20c997] transition-all cursor-pointer">
                  <option>Light (Default)</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
