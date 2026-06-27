"use client";

import { useAuth } from "@/context/AuthContext";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default function DashboardPage() {
  const { user, role } = useAuth();

  if (!role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full bg-[#1A3636] animate-ping"></div>
      </div>
    );
  }

  // Double check, but middleware/layout should protect this.
  if (role !== "CUSTOMER") {
    return <div className="p-10 text-center text-red-500">Access Denied. You are not a customer.</div>;
  }

  return (
    <div className="relative">
      <CustomerDashboard />
    </div>
  );
}
