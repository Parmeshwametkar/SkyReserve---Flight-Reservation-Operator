import { useState, useEffect } from "react";
import { Plane, AlertTriangle, RefreshCw, XCircle, FileText, BadgePercent } from "lucide-react";
import { Booking } from "../types";

interface BookingHistoryProps {
  onRebook: () => void;
}

export default function BookingHistory({ onRebook }: BookingHistoryProps) {
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this flight booking? A refund will be initiated to your original payment method.")) return;

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        alert("Booking cancelled successfully. Refunding total amount to your account.");
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadInvoice = (pnr: string) => {
    alert(`Generating invoice for Reference PNR ${pnr}. skyreserve_invoice_${pnr}.pdf has been saved.`);
  };

  return (
    <div id="booking-history-container" className="space-y-6">
      
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aviation Reservation Logs</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            Historical flight records and security custom logs.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-all"
          title="Refresh History Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/85 rounded-3xl p-12 text-center border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <Plane className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">No Reservations found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              You haven't booked any flights with SkyReserve yet. Go to Flight Search to reserve your seat!
            </p>
          </div>
          <button
            onClick={onRebook}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(booking => {
            const isCancelled = booking.status === "Cancelled";
            const pass = booking.passengers[0] || { name: "Guest" };

            return (
              <div
                key={booking.id}
                className={`bg-white/95 dark:bg-slate-900/95 border rounded-3xl p-6 shadow-md transition-all relative ${
                  isCancelled
                    ? "border-slate-200 opacity-60 dark:border-slate-800"
                    : "border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/30"
                }`}
              >
                
                {/* Status Badge */}
                <span className={`absolute top-6 right-6 px-3 py-1 text-[10px] font-mono font-black uppercase rounded-lg border ${
                  isCancelled
                    ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                }`}>
                  {booking.status}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  
                  {/* Route information */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">Carrier Service</span>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center space-x-1">
                      <Plane className="w-4 h-4 text-indigo-600 rotate-45" />
                      <span>{booking.flightNumber} ({booking.airline})</span>
                    </p>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {booking.sourceCode} → {booking.destinationCode}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Date: {booking.bookingDate}</p>
                  </div>

                  {/* Seat and Class */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">Cabin Allotments</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{booking.class} Class</p>
                    <p className="text-[10px] font-mono text-slate-500">Seat: {pass.seat}</p>
                    <p className="text-[10px] font-mono text-slate-500">Name: {pass.name}</p>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">Payment Total</span>
                    <p className="text-sm font-black text-slate-800 dark:text-white font-sans">${booking.totalFare}</p>
                    <p className="text-[10px] font-mono text-slate-500">Via {booking.paymentMethod}</p>
                  </div>

                  {/* Control Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 justify-end self-stretch md:self-center">
                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all border border-red-200/50 dark:bg-red-950/20 dark:border-red-900 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Flight</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadInvoice(booking.pnr)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Invoice</span>
                    </button>
                  </div>

                </div>

                {isCancelled && (
                  <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/40 rounded-xl text-[11px] text-red-600 dark:text-red-400 flex items-center space-x-1.5 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Refund of ${booking.totalFare} initiated to {booking.paymentMethod}. Estimated clearance: 3-5 banking days.</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
