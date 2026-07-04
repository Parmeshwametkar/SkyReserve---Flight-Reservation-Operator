import { useRef } from "react";
import { Plane, Download, Printer, Share2, CheckCircle, Smartphone, Calendar, AlertCircle } from "lucide-react";
import { Booking } from "../types";

interface BoardingPassProps {
  booking: Booking;
  onDone: () => void;
}

export default function BoardingPass({ booking, onDone }: BoardingPassProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Simulated PDF Document downloaded. ticket_SQR458.pdf is now saved in your Local Downloads directory.");
  };

  const handleAddToWallet = () => {
    alert("Aviation Wallet Sync: Digital Boarding Pass synced with your Apple Wallet / Google Pay profile.");
  };

  const passenger = booking.passengers[0] || {
    name: "Parmeshwar Metkar",
    seat: "12A",
    passportNumber: "L8938202",
  };

  return (
    <div id="boarding-pass-container" className="max-w-3xl mx-auto space-y-6">
      
      {/* Visual Success Header banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-2">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Reservation Confirmed!</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Settlement succeeded and PNR ticket records are registered. Your digital boarding pass is ready for check-in.
        </p>
      </div>

      {/* Ticket Container */}
      <div
        ref={printRef}
        className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/40 relative text-white"
      >
        {/* Airplane Watermark Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full pointer-events-none" />

        {/* Top brand header bar */}
        <div className="px-6 py-4 bg-black/10 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 rotate-45" />
            <span className="font-sans font-extrabold text-sm tracking-wider uppercase">SkyReserve Airline Operator</span>
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
            {booking.class} CLASS
          </span>
        </div>

        {/* Middle main Boarding Pass body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
          
          {/* Main Flight details left */}
          <div className="md:col-span-8 space-y-6 border-r border-dashed border-white/20 pr-6">
            
            {/* Airports Route Row */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">From Hub</p>
                <p className="text-3xl font-black font-sans leading-none mt-1">{booking.sourceCode}</p>
                <p className="text-[10px] text-white/70 truncate mt-1 max-w-[150px]">{booking.source}</p>
              </div>

              {/* Icon divider */}
              <div className="text-center relative flex-1 px-4">
                <Plane className="w-5 h-5 mx-auto text-white/50 animate-pulse" />
                <div className="border-t border-dashed border-white/20 mt-2 w-full" />
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/50 mt-1">{booking.flightNumber}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">To Hub</p>
                <p className="text-3xl font-black font-sans leading-none mt-1">{booking.destinationCode}</p>
                <p className="text-[10px] text-white/70 truncate mt-1 max-w-[150px]">{booking.destination}</p>
              </div>
            </div>

            {/* Passenger, PNR, and Seat Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2.5">
              <div>
                <p className="text-[10px] text-white/60 uppercase font-mono font-bold">Passenger Identity</p>
                <p className="text-xs font-bold truncate mt-1">{passenger.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-mono font-bold">Booking Reference PNR</p>
                <p className="text-xs font-mono font-black tracking-wider mt-1 text-yellow-300">{booking.pnr}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-mono font-bold">Assigned Cabin Seat</p>
                <p className="text-xs font-mono font-black mt-1 text-emerald-300">{passenger.seat}</p>
              </div>

              <div>
                <p className="text-[10px] text-white/60 uppercase font-mono font-bold">Boarding Time</p>
                <p className="text-xs font-bold mt-1">07:50 AM</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-mono font-bold">Airport Terminal / Gate</p>
                <p className="text-xs font-bold mt-1">Terminal 2 / Gate B4</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-mono font-bold">Scheduled Departure</p>
                <p className="text-xs font-bold mt-1">{booking.departureTime}</p>
              </div>
            </div>

          </div>

          {/* Side stub for QR barcode scanning (Right, Col-4) */}
          <div className="md:col-span-4 flex flex-col items-center justify-between pl-0 md:pl-6 space-y-4 md:space-y-0 text-center">
            
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-white/60 font-mono block">Operator Security Code</span>
              <span className="text-[10px] font-mono tracking-widest block text-yellow-300 font-extrabold">{booking.pnr}-SEC-01</span>
            </div>

            {/* Custom vector mock QR Code */}
            <div className="p-2.5 bg-white rounded-2xl shadow-md">
              <div className="w-24 h-24 bg-slate-100 flex flex-col items-center justify-center p-1 border-2 border-slate-300 rounded-lg">
                <div className="grid grid-cols-4 gap-1 w-full h-full">
                  {Array.from({ length: 16 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`rounded-sm ${
                        (idx * 7) % 3 === 0 ? "bg-slate-900" : "bg-white"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-white/60">
              Check-in opens 3h prior to departure.
            </div>

          </div>

        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3 bg-black/20 text-[9px] font-mono uppercase text-white/60 flex flex-wrap items-center justify-between border-t border-white/5">
          <span>TSA PRECHECK REGISTERED CUSTOMS Clearance Code: 902A</span>
          <span>SkyReserve Premium Services System</span>
        </div>

      </div>

      {/* Action buttons strip */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

          <button
            onClick={handleAddToWallet}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow"
          >
            <Smartphone className="w-4 h-4" />
            <span>Add to Wallet</span>
          </button>
        </div>

        <button
          onClick={onDone}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          Finish & Return
        </button>

      </div>

    </div>
  );
}
