"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Calendar, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function CustomerMobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // If not logged in, don't show the nav (or adjust as needed)
  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {[
        { href: "/restaurants", icon: Search, label: "Explore" },
        { href: "/customer/dashboard", icon: Calendar, label: "Bookings", exact: true },
        { href: "/customer/dashboard/profile", icon: User, label: "Profile" },
      ].map((link) => {
        let isActive = false;
        if (link.exact) {
            isActive = pathname === link.href;
        } else {
            isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        }

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
  );
}
