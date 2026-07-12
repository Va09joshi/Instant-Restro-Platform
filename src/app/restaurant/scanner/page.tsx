"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, Loader2, ScanLine, User, Users, CalendarDays, Clock, UtensilsCrossed, Armchair, RotateCcw } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Booking } from "@/types/firestore";

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [guestDetails, setGuestDetails] = useState<Booking | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [manualId, setManualId] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    try {
      setCameraError("");
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {}
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error(err);
      setCameraError("Could not access camera. Please allow camera permissions in your browser.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error("Failed to stop scanner", e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const handleScanSuccess = async (result: string) => {
    // Extract booking ID from URL or raw ID
    let bookingId = result;
    if (result.includes("/booking/")) {
      const parts = result.split("/booking/");
      bookingId = parts[parts.length - 1].replace(/\/$/, ""); // remove trailing slash
    }
    
    setScanResult(bookingId);
    setCheckedIn(false);
    setFetchError(null);
    setFetching(true);
    try {
      const docSnap = await getDoc(doc(db, "bookings", bookingId));
      if (docSnap.exists()) {
        setGuestDetails(docSnap.data() as Booking);
      } else {
        setFetchError("No booking found with this ID.");
        setGuestDetails(null);
      }
    } catch (error: any) {
      console.error(error);
      setFetchError(error?.message || "Failed to fetch booking. Check your internet connection.");
      setGuestDetails(null);
    } finally {
      setFetching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult) return;
    setCheckingIn(true);
    try {
      const ticketRef = doc(db, "bookings", scanResult);
      await updateDoc(ticketRef, {
        status: "Seated",
        kitchenStatus: "Pending",
        checkInTime: Date.now()
      });
      setCheckedIn(true);
    } catch (error) {
      console.error("Check in error", error);
      alert("Failed to check in guest");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setGuestDetails(null);
    setCheckedIn(false);
    startScanning();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Scan Guest QR Pass</h1>
        <p className="text-slate-500 text-sm mt-1">Scan or enter a booking ID to view guest details and check them in.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Scanner Column (2/5) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm">QR Scanner</span>
          </div>
          
          <div className="p-5 flex-1 flex flex-col">
            {!scanResult ? (
              <>
                <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 min-h-[300px] flex flex-col items-center justify-center">
                  <div id="reader" className="w-full"></div>
                  
                  {!isScanning && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 p-6 text-center">
                      <ScanLine className="w-12 h-12 text-emerald-400 mb-4" />
                      <h3 className="text-white font-bold mb-2">Camera Access Required</h3>
                      <p className="text-slate-400 text-xs mb-6 max-w-xs">Scan guest passes instantly using your device's back camera.</p>
                      
                      <button 
                        onClick={startScanning}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        Start Scanner
                      </button>
                      
                      {cameraError && (
                        <p className="text-red-400 text-xs mt-4 max-w-xs">{cameraError}</p>
                      )}
                    </div>
                  )}
                </div>
                {isScanning && (
                   <div className="mt-4 flex flex-col items-center gap-2">
                     <p className="text-center text-slate-500 font-medium text-xs">Scanning... Align the QR code within the frame.</p>
                     <button 
                       onClick={stopScanning}
                       className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider"
                     >
                       Stop Camera
                     </button>
                   </div>
                )}
                
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Manual Entry</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste Booking ID..." 
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                    />
                    <button 
                      onClick={() => { if(manualId) handleScanSuccess(manualId); }}
                      className="bg-[#1A3636] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1A3636]/90 transition-colors"
                    >
                      Fetch
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                {checkedIn ? (
                  <>
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800 mb-1">Checked In!</h3>
                    <p className="text-slate-500 text-sm mb-6">Guest has been seated. Pre-orders sent to kitchen.</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Scan Successful</h3>
                    <p className="text-slate-400 text-xs font-mono mb-6">{scanResult}</p>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm font-bold text-[#1A3636] hover:text-emerald-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Scan Another
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Column (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {guestDetails ? (
            <>
              {/* Guest Entry Pass Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header */}
                <div className="bg-[#1A3636] px-7 py-6 text-white relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="absolute -left-4 -bottom-10 w-28 h-28 bg-emerald-400/10 rounded-full blur-xl"></div>
                  <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 relative z-10">Guest Entry Pass</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{guestDetails.guestName || "Guest"}</h2>
                      <p className="text-emerald-200/70 text-xs font-medium">Booking #{guestDetails.id?.slice(-8)}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Info Grid */}
                <div className="p-7">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                        <Armchair className="w-4 h-4 text-[#1A3636]" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Table</p>
                      <p className="font-black text-[#1A3636] text-xl">{guestDetails.tableNumber || guestDetails.tableId || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                        <Users className="w-4 h-4 text-[#1A3636]" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Guests</p>
                      <p className="font-black text-slate-800 text-xl">{guestDetails.guests}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                        <CalendarDays className="w-4 h-4 text-[#1A3636]" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="font-bold text-slate-800 text-sm">{guestDetails.date}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                        <Clock className="w-4 h-4 text-[#1A3636]" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                      <p className="font-bold text-slate-800 text-sm">{guestDetails.time}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 border-t border-dashed border-slate-200"></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                      guestDetails.status === 'Seated' || checkedIn
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : guestDetails.status === 'Upcoming'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : guestDetails.status === 'Cancelled'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {checkedIn ? 'Seated' : guestDetails.status}
                    </span>
                    <div className="flex-1 border-t border-dashed border-slate-200"></div>
                  </div>

                  {/* Pre-Orders */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pre-ordered Items</p>
                    </div>
                    {(!guestDetails.preOrders || guestDetails.preOrders.length === 0) ? (
                      <div className="bg-slate-50 rounded-2xl p-5 text-center text-slate-400 text-sm border border-dashed border-slate-200">
                        No pre-orders for this booking
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                        {guestDetails.preOrders.map((item: any, i: number) => (
                          <div key={i} className="px-5 py-3.5 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-slate-700">{item.name}</p>
                              {item.price && <p className="text-xs text-slate-400">₹{item.price}</p>}
                            </div>
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm border border-emerald-100">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!checkedIn && (
                <div className="flex gap-4">
                  <button 
                    onClick={handleCheckIn}
                    disabled={checkingIn || guestDetails.status === 'Seated'}
                    className="flex-1 bg-[#1A3636] text-white font-bold py-4 rounded-2xl hover:bg-[#1A3636]/90 transition-all flex justify-center items-center gap-2 text-sm shadow-lg shadow-[#1A3636]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingIn ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : guestDetails.status === 'Seated' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Already Seated
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Check-in &amp; Seat Guest
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col items-center justify-center text-center p-12">
              {fetching ? (
                <>
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-5" />
                  <h3 className="font-bold text-slate-700 mb-1">Fetching Booking...</h3>
                  <p className="text-slate-400 text-sm">Looking up <span className="font-mono text-xs">{scanResult}</span></p>
                </>
              ) : fetchError ? (
                <>
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
                    <ScanLine className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="font-bold text-red-700 mb-1">Fetch Failed</h3>
                  <p className="text-slate-400 text-sm max-w-xs mb-2">{fetchError}</p>
                  {scanResult && <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">ID: {scanResult}</p>}
                  <button onClick={handleReset} className="mt-4 text-sm font-bold text-[#1A3636] hover:text-emerald-700 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                    <ScanLine className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-700 mb-1">Awaiting Scan</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Scan a guest&apos;s QR code or enter a booking ID manually to view their reservation details.</p>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
