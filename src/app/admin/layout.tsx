"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Loader2, LogOut, LayoutDashboard, Store, Users, Bell, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, role, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full bg-[#0A1616] animate-ping"></div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/dashboard/restaurants", label: "Restaurants", icon: Store },
    { href: "/admin/dashboard/users", label: "Users", icon: Users },
    { href: "/admin/dashboard/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 relative text-slate-900">
      {/* Sidebar for Admin */}
      <aside className="hidden md:flex w-64 bg-[#0A1616] text-white p-6 border-r border-neutral-800 flex-col fixed inset-y-0 left-0 z-50">
        <div className="mb-10 px-2">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-4xl border-b-[1px] border-white/20 pb-1 w-fit">
            <span className="text-emerald-500">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">nstant</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-2">Platform Admin</p>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors text-slate-400">
              <LogOut className="w-4 h-4" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 md:ml-64 flex flex-col min-w-0 bg-slate-50/50">
        {/* Mobile Header */}
        <header className="md:hidden mb-6 bg-[#0A1616] border-b border-white/10 flex items-center justify-between p-4 rounded-2xl shadow-xl shadow-black/20">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-2xl border-b-[1px] border-white/20 pb-0.5">
            <span className="text-emerald-500">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">nstant</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Admin</span>
        </header>

        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? 'text-[#009b65]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#e6f7ef]' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#009b65]' : 'text-slate-500'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
