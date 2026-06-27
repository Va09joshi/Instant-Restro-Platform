"use client";

import { Bell, Shield, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your application preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-black/30 shadow-black/20">
        
        <div className="space-y-8">
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            </div>
            <div className="space-y-4 pl-13">
              <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 cursor-pointer">
                <div>
                  <p className="font-bold text-sm text-slate-900">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive booking confirmations via email.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 cursor-pointer">
                <div>
                  <p className="font-bold text-sm text-slate-900">SMS Alerts</p>
                  <p className="text-xs text-slate-500">Get text messages when your table is ready.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Privacy</h2>
            </div>
            <div className="space-y-4 pl-13">
              <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 cursor-pointer">
                <div>
                  <p className="font-bold text-sm text-slate-900">Share profile with restaurants</p>
                  <p className="text-xs text-slate-500">Allows restaurants to see your dining preferences.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">App Preferences</h2>
            </div>
            <div className="space-y-4 pl-13">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <p className="font-bold text-sm text-slate-900 mb-2">Theme</p>
                <select className="w-full md:w-auto p-2 rounded-lg border border-slate-200 bg-white text-sm outline-none">
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
