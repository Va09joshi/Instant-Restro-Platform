"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Calendar, User as UserIcon, Heart, History, Menu, X, LayoutDashboard, Settings, CalendarCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function CustomerMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // If not logged in, don't show the nav
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`md:hidden w-64 bg-[#0A1616] text-white p-6 border-r border-neutral-800 flex flex-col fixed inset-y-0 left-0 z-[100] transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-4xl border-b-[1px] border-white/20 pb-1 w-fit">
            <span className="text-emerald-500">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">nstant</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="space-y-1 overflow-y-auto flex-1">
          <Link 
            href="/customer/dashboard" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${pathname === "/customer/dashboard" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <Link 
            href="/customer/dashboard/bookings" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${pathname === "/customer/dashboard/bookings" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <CalendarCheck className="w-4 h-4" />
            My Bookings
          </Link>
          <Link 
            href="/customer/dashboard/history" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${pathname === "/customer/dashboard/history" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <History className="w-4 h-4" />
            History
          </Link>
          <Link 
            href="/customer/dashboard/favorites" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${pathname === "/customer/dashboard/favorites" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <Heart className="w-4 h-4" />
            Favorites
          </Link>
          <div className="pt-4 pb-2">
            <div className="px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Account</div>
          </div>
          <Link 
            href="/customer/dashboard/profile" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${pathname === "/customer/dashboard/profile" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </Link>
          <Link 
            href="/customer/dashboard/settings" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${pathname === "/customer/dashboard/settings" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-2xl border border-white/50 flex justify-around items-center p-2.5 z-50 rounded-2xl shadow-2xl shadow-slate-200/50">
        {[
          { href: "/restaurants", icon: Search, label: "Explore" },
          { href: "/customer/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
          { href: "/customer/dashboard/bookings", icon: CalendarCheck, label: "Bookings" },
          { action: () => setIsMobileMenuOpen(true), icon: Menu, label: "More" },
        ].map((link, idx) => {
          let isActive = false;
          if (link.href) {
            if (link.exact) {
                isActive = pathname === link.href;
            } else {
                isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            }
          }

          const Icon = link.icon;
          
          if (link.action) {
            return (
              <button
                key="more-btn"
                onClick={link.action}
                className="flex flex-col items-center gap-1 min-w-[64px] text-slate-400 hover:text-slate-600"
              >
                <div className="p-1.5 rounded-xl transition-all bg-transparent">
                  <Icon className="w-5 h-5 stroke-2" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {link.label}
                </span>
              </button>
            );
          }

          return (
            <Link 
              key={link.href}
              href={link.href!}
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
    </>
  );
}
