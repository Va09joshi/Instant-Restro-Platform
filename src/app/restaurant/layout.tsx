"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Loader2, LogOut } from "lucide-react";

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Sidebar for B2B */}
      <aside className="hidden md:flex w-64 bg-[#0A1616] text-white p-6 border-r border-neutral-800 flex-col fixed inset-y-0 left-0 z-50">
        <h2 className="text-xl font-bold mb-8 px-2">Partner Portal</h2>
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
                className={`block px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
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
      <main className="flex-1 p-8 md:ml-64">
        {children}
      </main>
    </div>
  );
}
