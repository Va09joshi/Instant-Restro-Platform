"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Bell, Shield, Smartphone, ChevronRight, Moon, MessageSquare, Mail, Lock, Eye, LogOut, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { UserDocument } from "@/types/firestore";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: true,
    shareProfile: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserDocument;
          if (data.preferences) {
            setPreferences(prev => ({ ...prev, ...data.preferences }));
          }
        }
      } catch (err) {
        console.error("Failed to load preferences", err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, [user]);

  const handleToggle = async (key: keyof typeof preferences) => {
    if (!user) return;
    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        [`preferences.${key}`]: newValue
      });
    } catch (error) {
      console.error("Failed to update preference", error);
      // Revert on failure
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans py-8 p-4 md:p-8 bg-slate-50/50 min-h-screen pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Settings</h1>
      </div>

      <div className="space-y-6">
        
        {/* Notifications Group */}
        <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Notifications</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="font-medium text-slate-900">Email Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.emailNotifications} onChange={() => handleToggle('emailNotifications')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-medium text-slate-900">SMS Alerts</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.smsAlerts} onChange={() => handleToggle('smsAlerts')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
            </div>
        </div>

        {/* Privacy & Security */}
        <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Privacy & Security</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-medium text-slate-900">Share profile with restaurants</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.shareProfile} onChange={() => handleToggle('shareProfile')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push('/customer/dashboard/profile')}>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-rose-500" />
                        </div>
                        <span className="font-medium text-slate-900">Change Password</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
            </div>
        </div>

        {/* Preferences */}
        <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Preferences</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Moon className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="font-medium text-slate-900">Dark Mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.darkMode} onChange={() => handleToggle('darkMode')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
            </div>
        </div>

        {/* Account Actions */}
        <div className="pt-4">
            <button onClick={handleLogout} className="w-full bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 p-4 text-rose-600 font-bold hover:bg-rose-50 transition-colors shadow-sm">
                <LogOut className="w-5 h-5" /> Log Out
            </button>
        </div>

      </div>
    </div>
  );
}
