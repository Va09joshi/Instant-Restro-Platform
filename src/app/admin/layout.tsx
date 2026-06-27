"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, role, loading, router]);

  if (loading || role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <a href="/admin/dashboard" className="block text-slate-300 hover:text-white transition">Dashboard</a>
          <a href="/admin/dashboard/restaurants" className="block text-slate-300 hover:text-white transition">Manage Restaurants</a>
          <a href="/admin/dashboard/users" className="block text-slate-300 hover:text-white transition">Manage Users</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
