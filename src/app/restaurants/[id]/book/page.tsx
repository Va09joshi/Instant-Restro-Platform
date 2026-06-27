"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("Today, 26 Jun");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState("");

  const dates = ["Today, 26 Jun", "Tomorrow, 27 Jun", "Fri, 28 Jun", "Sat, 29 Jun"];
  const times = ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"];
  
  // Tables: VIP (premium), Normal
  const tables = [
    { id: "T1", type: "Premium", price: "₹500 cover", available: true },
    { id: "T2", type: "Premium", price: "₹500 cover", available: false },
    { id: "T3", type: "Standard", price: "Free", available: true },
    { id: "T4", type: "Standard", price: "Free", available: true },
    { id: "T5", type: "Standard", price: "Free", available: true },
    { id: "T6", type: "Premium", price: "₹500 cover", available: true },
  ];

  if (step === 3) {
    // Generate a pseudo-random booking ID for the QR code
    const mockBookingId = `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-6">Your table at The Grand Kitchen is secured.</p>
          
          <div className="flex justify-center mb-6 p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm inline-block">
            <QRCodeSVG value={mockBookingId} size={160} />
          </div>
          <p className="text-xs text-slate-400 font-mono mb-6 pb-6 border-b">ID: {mockBookingId}</p>

          <div className="bg-slate-50 p-4 rounded-xl text-left mb-8 space-y-2 text-sm font-medium">
            <div className="flex justify-between"><span className="text-slate-500">Date</span><span>{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Time</span><span>{selectedTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Guests</span><span>{guests} People</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Table</span><span>{selectedTable}</span></div>
          </div>
          
          <Button onClick={() => router.push("/")} className="w-full py-6 rounded-xl">Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">The Grand Kitchen</h1>
            <p className="text-slate-400 text-sm">{selectedDate} • {guests} Guests {selectedTime && `• ${selectedTime}`}</p>
          </div>
          <Button variant="outline" className="text-black bg-white hover:bg-slate-200" onClick={() => router.back()}>Cancel</Button>
        </div>

        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Guests */}
            <section>
              <h3 className="text-lg font-medium mb-4">How many guests?</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button 
                    key={num}
                    onClick={() => setGuests(num)}
                    className={`shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition ${
                      guests === num ? "border-primary bg-primary text-white" : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </section>

            {/* Date */}
            <section>
              <h3 className="text-lg font-medium mb-4">Select Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map(date => (
                  <button 
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`shrink-0 px-6 py-3 rounded-xl border-2 font-medium transition ${
                      selectedDate === date ? "border-primary bg-primary text-white" : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </section>

            {/* Time */}
            <section>
              <h3 className="text-lg font-medium mb-4">Select Time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {times.map(time => (
                  <button 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl border-2 font-medium transition ${
                      selectedTime === time ? "border-primary bg-primary text-white" : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>

            <Button 
              size="lg" 
              className="w-full py-8 text-xl rounded-2xl" 
              disabled={!selectedTime}
              onClick={() => setStep(2)}
            >
              Select Table
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-medium mb-8 text-center">Select your Table Layout</h3>
            
            {/* Stage/Restaurant Layout visual */}
            <div className="bg-slate-800 rounded-3xl p-8 mb-10 max-w-2xl mx-auto border border-slate-700">
              <div className="w-full h-12 bg-slate-700/50 rounded-t-[100px] mb-12 flex items-center justify-center border-t-4 border-primary">
                <span className="text-slate-400 font-medium tracking-widest text-sm">BAR / STAGE AREA</span>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {tables.map(table => (
                  <button 
                    key={table.id}
                    disabled={!table.available}
                    onClick={() => setSelectedTable(table.id)}
                    className={`
                      relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all
                      ${!table.available ? 'opacity-30 cursor-not-allowed border-slate-600 bg-slate-700' : ''}
                      ${selectedTable === table.id ? 'border-primary bg-primary/20 scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'border-slate-600 hover:border-slate-400'}
                    `}
                  >
                    <span className="font-bold text-lg">{table.id}</span>
                    <span className="text-[10px] text-slate-400 uppercase mt-1">{table.type}</span>
                    {selectedTable === table.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary absolute -top-2 -right-2 bg-slate-900 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full py-8 text-xl rounded-2xl" 
              disabled={!selectedTable}
              onClick={() => setStep(3)}
            >
              Confirm Booking • {guests} Guests
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
