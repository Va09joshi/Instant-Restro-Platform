"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, LayoutDashboard, Settings, CalendarCheck, History, Heart } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { CustomerMobileNav } from "@/components/ui/CustomerMobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "CUSTOMER") {
        router.push("/");
      }
    }
  }, [user, role, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 rounded-full bg-[#1A3636] animate-ping"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 relative text-slate-900 w-full overflow-x-hidden">
      {/* Sidebar for Customer */}
      <aside className="hidden md:flex w-64 bg-[#0A1616] text-white p-6 border-r border-neutral-800 flex-col fixed inset-y-0 left-0 z-50">
        <div className="mb-10 px-2">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-4xl border-b-[1px] border-white/20 pb-1 w-fit">
            <span className="text-emerald-500">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">nstant</span>
          </div>
        </div>
        
        <nav className="space-y-1">
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

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 p-4 md:p-8 md:ml-64 bg-slate-50/50 pb-24 md:pb-8 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden mb-6 bg-[#0A1616] border-b border-white/10 flex items-center justify-between p-4 rounded-2xl shadow-xl shadow-black/20">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-2xl border-b-[1px] border-white/20 pb-0.5">
            <span className="text-emerald-500">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">nstant</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-400 hover:text-red-400">
            Sign Out
          </button>
        </header>

        {children}
      </main>
      
      <CustomerMobileNav />
    </div>
  );
}
