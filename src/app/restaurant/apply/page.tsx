"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, ChevronLeft } from "lucide-react";

export default function PartnerApplyPage() {
  return (
    <div className="min-h-screen bg-[#0A1616] text-white font-sans selection:bg-emerald-500/20 selection:text-emerald-400 overflow-hidden relative">

      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1A3636]/40 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

      {/* Back Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center text-sm font-medium text-neutral-400 hover:text-white transition-colors z-50 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md border border-white/5"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Link>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32 relative z-10">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold tracking-wide text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Early Access Program
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Supercharge your<br />restaurant operations.
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed">
            Join the Instant Early Access program. Lock in lifetime pricing and get first access to our revolutionary front-of-house platform.
          </p>
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-32">
          {/* Tier 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col hover:border-white/20 transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2">Early Bird Starter</h3>
            <p className="text-neutral-400 mb-6">Perfect for small to medium independent restaurants.</p>
            <div className="mb-8">
              <span className="text-5xl font-black">$49</span>
              <span className="text-neutral-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Interactive Floor Plans</li>
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Basic Waitlist Management</li>
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> QR Code Check-in</li>
              <li className="flex gap-3 text-neutral-500"><Check className="w-5 h-5 text-neutral-700 shrink-0" /> Pre-order Dining</li>
            </ul>
            <a href="#apply" className="w-full">
              <button className="w-full py-4 rounded-xl font-bold border border-white/20 hover:bg-white/10 transition-colors">
                Select Starter
              </button>
            </a>
          </motion.div>

          {/* Tier 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-[#1A3636] to-[#0A1616] backdrop-blur-md border border-emerald-500/30 rounded-3xl p-8 flex flex-col relative shadow-[0_0_50px_rgba(16,185,129,0.1)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2 text-emerald-400">Pro Early Access</h3>
            <p className="text-neutral-400 mb-6">Everything you need for a premium dining experience.</p>
            <div className="mb-8">
              <span className="text-5xl font-black">$99</span>
              <span className="text-neutral-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Everything in Starter</li>
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Meal Pre-ordering System</li>
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> VIP Guest Preferences CRM</li>
              <li className="flex gap-3 text-neutral-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Predictive Turnaround AI</li>
            </ul>
            <a href="#apply" className="w-full">
              <button className="w-full py-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1">
                Select Pro
              </button>
            </a>
          </motion.div>
        </div>

        {/* Application Form */}
        <div id="apply" className="max-w-2xl mx-auto scroll-mt-32">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Create Partner Account</h2>
              <p className="text-neutral-400">Register your restaurant to lock in Early Bird pricing and get immediate access to the platform.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Account created successfully!"); }}>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Restaurant Name</label>
                <input required type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="e.g. The Artisan Kitchen" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">First Name</label>
                  <input required type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Last Name</label>
                  <input required type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Work Email</label>
                <input required type="email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="john@restaurant.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Phone Number</label>
                <div className="flex gap-3">
                  <select className="w-28 bg-black/20 border border-white/10 rounded-xl pl-3 pr-2 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer text-center">
                    <option value="+1" className="bg-[#0A1616] text-white">US (+1)</option>
                    <option value="+44" className="bg-[#0A1616] text-white">UK (+44)</option>
                    <option value="+91" className="bg-[#0A1616] text-white">IN (+91)</option>
                    <option value="+61" className="bg-[#0A1616] text-white">AU (+61)</option>
                  </select>
                  <input required type="tel" className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                  <input required type="password" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Confirm Password</label>
                  <input required type="password" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Selected Tier</label>
                <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer">
                  <option value="pro" className="bg-[#0A1616] text-white">Pro Early Access ($99/mo)</option>
                  <option value="starter" className="bg-[#0A1616] text-white">Early Bird Starter ($49/mo)</option>
                </select>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
                  Create Account <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-xs text-neutral-500 mt-4">
                By submitting this form, you agree to our Terms of Service and Privacy Policy. No credit card required.
              </p>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
