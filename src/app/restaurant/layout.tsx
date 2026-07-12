"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Loader2, LogOut, Home, Calendar, ScanLine, Utensils, Settings, Menu, X } from "lucide-react";

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Wait until auth is resolved
    if (!loading) {
      const publicPaths = ["/restaurant/apply"];

      if (!user && !publicPaths.includes(pathname)) {
        router.push("/login");
      } else if (user && role !== "RESTAURANT" && !publicPaths.includes(pathname)) {
        // If not a restaurant owner and not on the apply page, redirect away
        router.push("/");
      }
    }
  }, [user, role, loading, router, pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  // If just applying, don't show the B2B sidebar
  if (pathname === "/restaurant/apply") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 relative w-full overflow-x-hidden">
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for B2B (Desktop & Mobile Drawer) */}
      <aside className={`w-64 bg-[#0A1616] text-white p-6 border-r border-neutral-800 flex flex-col fixed inset-y-0 left-0 z-[100] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-bold">Partner Portal</h2>
          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {[
            { href: "/restaurant/dashboard", label: "Dashboard" },
            { href: "/restaurant/bookings", label: "Bookings" },
            { href: "/restaurant/scanner", label: "Scan QR", isScan: true },
            { href: "/restaurant/tables", label: "Table Layout" },
            { href: "/restaurant/menu", label: "Menu Management" },
            { href: "/restaurant/subscription", label: "Subscription Plan" },
            { href: "/restaurant/settings", label: "Settings" },
          ].map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${isActive
                    ? (link.isScan ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white')
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.isScan ? (
                  <span className="flex items-center gap-2">
                    {isActive ? <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> : <span className="w-2 h-2 bg-slate-500 rounded-full"></span>}
                    {link.label}
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
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
      <main className="flex-1 w-full min-w-0 p-4 md:p-8 md:ml-64 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-[#0A1616]/90 backdrop-blur-2xl border border-white/10 flex justify-around items-center p-2.5 z-50 rounded-2xl shadow-2xl shadow-black/50">
        {[
          { href: "/restaurant/dashboard", icon: Home, label: "Home" },
          { href: "/restaurant/bookings", icon: Calendar, label: "Bookings" },
          { href: "/restaurant/scanner", icon: ScanLine, label: "Scan" },
          { action: () => setIsMobileMenuOpen(true), icon: Menu, label: "More" },
        ].map((link, idx) => {
          const isActive = link.href ? pathname === link.href : false;
          const Icon = link.icon;
          
          if (link.action) {
            return (
              <button
                key="more-btn"
                onClick={link.action}
                className="flex flex-col items-center gap-1 min-w-[64px] text-slate-400 hover:text-white"
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
              href={link.href}
              className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
