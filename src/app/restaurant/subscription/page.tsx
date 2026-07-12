"use client";

import { useState } from "react";
import { CheckCircle2, Zap, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 pt-8">
      
      {/* Header & Plan Toggle */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Subscription & Billing</h1>
        <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">Manage your Restro partner plan, billing details, and view invoices.</p>
        
        <div className="flex justify-center mt-8">
          <div className="bg-slate-100 p-1.5 rounded-full inline-flex relative">
            <button 
              onClick={() => setBillingCycle("monthly")} 
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              Monthly Billing
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")} 
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors ${billingCycle === "yearly" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              Yearly Billing <span className="text-emerald-500 ml-1">(-20%)</span>
            </button>
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${billingCycle === "yearly" ? "translate-x-full left-[2px]" : "translate-x-0 left-[6px]"}`}></div>
          </div>
        </div>
      </div>

      {/* Current Plan Banner - Centered & Clean */}
      <div className="bg-[#1A3636] rounded-[2.5rem] p-10 text-center text-white shadow-xl flex flex-col items-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
          <Zap className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-2">Your Current Plan</p>
        <h2 className="text-4xl font-black mb-4">Pro Tier (Trial)</h2>
        <p className="text-slate-400 font-medium max-w-md mx-auto mb-8">You have 14 days remaining on your free trial. Upgrade now to avoid any interruption in service.</p>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 py-6 rounded-xl text-lg shadow-lg shadow-emerald-500/20">
          Upgrade Now
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Basic Plan */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center hover:border-emerald-200 transition-colors">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Basic</h3>
          <p className="text-slate-500 text-sm mb-6">Perfect for small cafes and diners.</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-slate-800">
              ${billingCycle === "monthly" ? "29" : "23"}
            </span>
            <span className="text-slate-500 font-medium">/mo</span>
          </div>
          
          <div className="space-y-4 flex-1 w-full">
            {[
              "Digital Menu QR Generator",
              "Up to 50 Menu Items",
              "Basic Table Layout Builder",
              "Email Support"
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-slate-600 font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-8 border-slate-200 hover:bg-slate-50 rounded-xl">Downgrade</Button>
        </div>

        {/* Pro Plan */}
        <motion.div 
          initial={{ y: 20 }} animate={{ y: 0 }}
          className="bg-white rounded-2xl p-8 border-2 border-emerald-500 shadow-xl flex flex-col items-center text-center relative"
        >
          <div className="absolute -top-4 bg-emerald-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-2 mt-4">Pro</h3>
          <p className="text-slate-500 text-sm mb-6">For busy restaurants that need powerful tools.</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-slate-800">
              ${billingCycle === "monthly" ? "79" : "63"}
            </span>
            <span className="text-slate-500 font-medium">/mo</span>
          </div>
          
          <div className="space-y-4 flex-1 w-full">
            {[
              "Everything in Basic",
              "Unlimited Menu Items",
              "Live Table State Management",
              "Real-time QR Ordering",
              "Priority 24/7 Support",
              "Custom Branding"
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-slate-700 font-bold text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <Button className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl">Current Plan</Button>
        </motion.div>

        {/* Payment Methods */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-6 text-lg">Payment Method</h3>
            
            <div className="flex flex-col items-center p-4 rounded-xl border border-slate-100 bg-slate-50 w-full mb-6">
              <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center text-[11px] font-black italic text-blue-800 mb-2">VISA</div>
              <div className="font-bold text-slate-700 text-sm">•••• 4242</div>
              <div className="text-xs text-slate-400 mb-3">Expires 12/25</div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full">Edit Card</Button>
            </div>
            
            <Button variant="outline" className="w-full border-dashed border-2 text-slate-500 rounded-xl py-6">
              + Add New Method
            </Button>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col items-center text-center text-sm text-emerald-800 gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
            <p className="font-medium">Securely encrypted and processed by Stripe. We never store your full card details.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
