"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, Lock, Camera, Edit2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserDocument } from "@/types/firestore";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserDocument;
          setPhone(data.phone || "");
          if (data.name) setName(data.name);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      if (newPassword) {
        await updatePassword(user, newPassword);
      }
      
      await updateDoc(doc(db, "users", user.uid), {
        name,
        phone
      });
      
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to update profile. (Note: Password update requires recent login)", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-24 md:pb-8 relative min-h-screen p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-500">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm w-full overflow-hidden border border-slate-200">
        <div className="h-32 bg-slate-100 relative border-b border-slate-200">
          <button className="absolute top-4 right-4 p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors shadow-sm">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white p-1.5 rounded-full border border-slate-200">
                <div className="w-full h-full bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-3xl uppercase">
                  {user?.displayName ? user.displayName[0] : user?.email ? user.email[0] : "U"}
                </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors shadow-sm mb-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{user?.displayName || "Guest User"}</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium text-sm">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {message.text && (
              <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 pt-5 pb-2 text-sm text-slate-900 bg-white rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 peer transition-colors font-medium shadow-sm"
                  placeholder=" "
                />
                <label htmlFor="fullName" className="absolute text-[11px] font-semibold text-slate-500 duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-emerald-600">Full Name</label>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                  type="tel" 
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                  className="block w-full pl-10 pr-4 pt-5 pb-2 text-sm text-slate-900 bg-white rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 peer transition-colors font-medium shadow-sm"
                />
                <label htmlFor="phone" className="absolute text-[11px] font-semibold text-slate-500 duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-emerald-600">Phone Number</label>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <h3 className="font-semibold text-lg mb-6 text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-400" /> Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input 
                    type="password" 
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 pt-5 pb-2 text-sm text-slate-900 bg-white rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 peer transition-colors font-medium shadow-sm"
                  />
                  <label htmlFor="newPassword" className="absolute text-[11px] font-semibold text-slate-500 duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-emerald-600">New Password</label>
                </div>
                <div className="relative group">
                  <input 
                    type="password" 
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 pt-5 pb-2 text-sm text-slate-900 bg-white rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 peer transition-colors font-medium shadow-sm"
                  />
                  <label htmlFor="confirmPassword" className="absolute text-[11px] font-semibold text-slate-500 duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-emerald-600">Confirm Password</label>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
