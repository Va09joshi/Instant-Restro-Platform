"use client";

import { Users, TrendingUp, Clock, QrCode, ArrowRight, Download, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function RestaurantDashboard() {
  const [showQR, setShowQR] = useState(false);
  const [selectedTable, setSelectedTable] = useState("Table 12");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Restaurant Overview</h1>
          <p className="text-neutral-500 mt-1">Manage your tables, reservations, and live check-ins.</p>
        </div>
        <button 
          onClick={() => setShowQR(true)}
          className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          Generate Table QR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-500">Today's Covers</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-bold text-neutral-900">142</h3>
            <span className="text-sm font-medium text-emerald-500 flex items-center mb-1">
              <TrendingUp className="w-3 h-3 mr-1" /> 12%
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-500">Active Tables</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-bold text-[#1A3636]">18</h3>
            <span className="text-sm font-medium text-neutral-400 mb-1">/ 24 Total</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-500">Waitlist</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-bold text-amber-600">4</h3>
            <span className="text-sm font-medium text-neutral-400 mb-1">Parties</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-500">Avg Turnaround</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-bold text-neutral-900">45</h3>
            <span className="text-sm font-medium text-neutral-400 mb-1">Mins</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative min-h-[400px]">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white z-10 relative">
            <h2 className="text-lg font-bold text-neutral-900">Live Floor Plan</h2>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Available</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Occupied</span>
            </div>
          </div>
          
          <div className="absolute inset-0 pt-[73px] bg-neutral-50/50 p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                <Users className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="font-medium text-neutral-700">Floor Plan View</p>
              <p className="text-sm mt-1 text-neutral-500 text-center max-w-sm">
                Interactive floor plan will appear here. Switch to the Customer role to see the seat selection demo!
              </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Live Requests</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">2 New</span>
          </div>
          
          <div className="divide-y divide-neutral-100 flex-1 overflow-y-auto max-h-[400px]">
            {/* Booking 1 */}
            <div className="p-5 hover:bg-neutral-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-neutral-900">Sarah Jenkins</h4>
                  <p className="text-sm text-neutral-500">Party of 4 • 7:30 PM</p>
                </div>
                <span className="text-xs font-bold text-[#1A3636] bg-[#1A3636]/10 px-2 py-1 rounded-md">VIP</span>
              </div>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-1">"Celebrating an anniversary, window seat preferred."</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-[#1A3636] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1A3636]/90 transition-colors">Accept</button>
                <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Decline</button>
              </div>
            </div>

            {/* Booking 2 */}
            <div className="p-5 hover:bg-neutral-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-neutral-900">Michael Chen</h4>
                  <p className="text-sm text-neutral-500">Party of 2 • 8:00 PM</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-[#1A3636] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1A3636]/90 transition-colors">Accept</button>
                <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Decline</button>
              </div>
            </div>
            
             {/* Booking 3 */}
             <div className="p-5 hover:bg-neutral-50 transition-colors opacity-60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-neutral-900 line-through">David Miller</h4>
                  <p className="text-sm text-neutral-500">Party of 6 • 6:45 PM</p>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-md flex items-center gap-1"><XCircle className="w-3 h-3"/> Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal overlay */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-neutral-100 relative">
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Table QR Code</h2>
              <p className="text-sm text-neutral-500">Scan to view menu & order</p>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <div className="mb-6 w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-left">Select Table</label>
                <select 
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20 focus:border-[#1A3636] transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 2">Table 2</option>
                  <option value="Table 12">Table 12 (VIP)</option>
                  <option value="Bar A">Bar Seat A</option>
                </select>
              </div>

              <div className="p-4 bg-white border-2 border-neutral-100 rounded-2xl shadow-sm mb-6 relative group cursor-pointer hover:border-emerald-500/30 transition-colors">
                {/* Generate real QR Code based on selected table */}
                <QRCodeSVG 
                  value={`https://instant.app/menu?restaurant=lumina&table=${encodeURIComponent(selectedTable)}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#1A3636"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                   <Download className="w-8 h-8 text-[#1A3636]" />
                </div>
              </div>

              <button className="w-full bg-[#1A3636] hover:bg-[#1A3636]/90 text-white py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
