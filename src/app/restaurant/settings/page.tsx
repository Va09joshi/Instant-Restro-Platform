"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { RestaurantSettings } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Store, Clock, Bell, Shield, Image as ImageIcon, Loader2 } from "lucide-react";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [settings, setSettings] = useState<Partial<RestaurantSettings>>({
    name: "",
    phone: "",
    address: "",
    description: "",
    logoUrl: "",
    operatingHours: DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { isOpen: true, open: "11:00", close: "22:00" }
    }), {})
  });

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      const docRef = doc(db, "restaurantSettings", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as RestaurantSettings);
      }
      setLoading(false);
    }
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "restaurantSettings", user.uid), {
        ...settings,
        id: user.uid
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const updateField = (field: keyof RestaurantSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateHour = (day: string, field: 'isOpen' | 'open' | 'close', value: any) => {
    setSettings(prev => ({
      ...prev,
      operatingHours: {
        ...(prev.operatingHours || {}),
        [day]: {
          isOpen: false,
          open: "09:00",
          close: "22:00",
          ...((prev.operatingHours && prev.operatingHours[day]) || {}),
          [field]: value
        }
      } as Record<string, { isOpen: boolean; open: string; close: string }>
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""; 
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file);
        updateField("logoUrl", fakeUrl);
        setUploadingLogo(false);
      }, 1500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        updateField("logoUrl", data.secure_url);
      }
    } catch (err) {
      console.error("Logo upload failed", err);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your restaurant profile, operating hours, and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Restaurant Profile</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <label className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden block">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                
                {uploadingLogo ? (
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                ) : settings.logoUrl ? (
                  <>
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Logo</span>
                  </>
                )}
              </label>
            </div>

            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Restaurant Name</Label>
                  <Input 
                    value={settings.name || ""} 
                    onChange={e => updateField("name", e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</Label>
                  <Input 
                    value={settings.phone || ""} 
                    onChange={e => updateField("phone", e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</Label>
                <Input 
                  value={settings.address || ""} 
                  onChange={e => updateField("address", e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Short Description</Label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow"
                  rows={3}
                  value={settings.description || ""}
                  onChange={e => updateField("description", e.target.value)}
                  placeholder="A modern dining experience featuring locally sourced ingredients and craft cocktails."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours Section */}
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Operating Hours</h2>
          </div>
          
          <div className="space-y-3 max-w-2xl">
            {DAYS.map(day => {
              const dayData = settings.operatingHours?.[day] || { isOpen: true, open: "11:00", close: "22:00" };
              return (
                <div key={day} className={`flex items-center justify-between bg-white p-3 rounded-xl border transition-colors ${dayData.isOpen ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60'}`}>
                  <div className="flex items-center gap-4 w-1/3">
                    <input 
                      type="checkbox" 
                      checked={dayData.isOpen} 
                      onChange={e => updateHour(day, 'isOpen', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" 
                    />
                    <span className="font-bold text-slate-700">{day}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <Input 
                      type="time" 
                      value={dayData.open} 
                      onChange={e => updateHour(day, 'open', e.target.value)}
                      disabled={!dayData.isOpen}
                      className="h-9 bg-slate-50 border-slate-200 w-32" 
                    />
                    <span className="text-slate-400 font-medium">to</span>
                    <Input 
                      type="time" 
                      value={dayData.close} 
                      onChange={e => updateHour(day, 'close', e.target.value)}
                      disabled={!dayData.isOpen}
                      className="h-9 bg-slate-50 border-slate-200 w-32" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <Button variant="outline" className="px-6">Discard Changes</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white gap-2 px-8"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
