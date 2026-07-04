import { useState, FormEvent } from "react";
import { CreditCard, Wallet, Smartphone, Landmark, Ticket, HelpCircle, Loader2, ShieldAlert, BadgeCheck } from "lucide-react";
import { Flight } from "../types";
import { PassengerData } from "./PassengerForm";

interface PaymentGatewayProps {
  flight: Flight;
  selectedSeats: string[];
  passengers: PassengerData[];
  extraFare: number;
  onComplete: (booking: any) => void;
  onBack: () => void;
}

export default function PaymentGateway({
  flight,
  selectedSeats,
  passengers,
  extraFare,
  onComplete,
  onBack,
}: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "wallet">("card");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === "SKYFLY30" || code === "SKYRESERVE") {
      setCouponApplied(true);
      const discountAmount = Math.floor((flight.fare * passengers.length) * 0.3);
      setCouponDiscount(discountAmount);
    } else if (code === "WELCOME10") {
      setCouponApplied(true);
      const discountAmount = Math.floor((flight.fare * passengers.length) * 0.1);
      setCouponDiscount(discountAmount);
    } else {
      alert("Invalid promotional code. Try 'SKYFLY30' for 30% off or 'WELCOME10' for 10% off!");
    }
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const baseCost = flight.fare * passengers.length;
    const taxCost = Math.floor(baseCost * 0.1);
    const totalFare = baseCost + extraFare + taxCost - couponDiscount;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: flight.id,
          selectedClass: flight.class,
          passengers: passengers,
          baseFare: baseCost,
          discount: couponDiscount,
          totalFare,
          paymentMethod: paymentMethod.toUpperCase(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Artificial luxury timeout for gateway compliance
        setTimeout(() => {
          setSubmitting(false);
          onComplete(data.booking);
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const baseCost = flight.fare * passengers.length;
  const taxCost = Math.floor(baseCost * 0.1);
  const totalFare = baseCost + extraFare + taxCost - couponDiscount;

  return (
    <div id="payment-gateway-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Payment Method Selector (Left, Col-7) */}
      <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl space-y-6 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-3xl" />

        <div>
          <button onClick={onBack} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-mono flex items-center space-x-1 mb-1">
            <span>← Back to passenger forms</span>
          </button>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Secure Enterprise Checkout</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            PCI-DSS Level 1 Encrypted Airline Settlement Platform.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "card", label: "Card", icon: CreditCard },
            { id: "upi", label: "UPI", icon: Smartphone },
            { id: "netbanking", label: "Net Bank", icon: Landmark },
            { id: "wallet", label: "Wallet", icon: Wallet }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setPaymentMethod(opt.id as any)}
              className={`flex flex-col items-center p-3 border rounded-xl text-center space-y-1.5 transition-all cursor-pointer ${
                paymentMethod === opt.id
                  ? "border-indigo-500 bg-indigo-50/40 dark:border-indigo-600 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <opt.icon className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Form Blocks */}
        <form onSubmit={handlePaymentSubmit} className="space-y-5">
          
          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parmeshwar Metkar"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unified Payments VPA Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@okhdfcbank"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold"
                />
                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                  Please keep your BHIM UPI app open on your device to approve the merchant request.
                </p>
              </div>
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Bank Authority</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold">
                  <option>State Bank of India</option>
                  <option>HDFC Bank Corporate</option>
                  <option>ICICI Commercial Bank</option>
                  <option>Citibank Europe</option>
                </select>
              </div>
            </div>
          )}

          {paymentMethod === "wallet" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Electronic Wallet</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold">
                  <option>Paytm Wallet Balance</option>
                  <option>PhonePe Wallet</option>
                  <option>Apple Pay Hub</option>
                  <option>Google Wallet</option>
                </select>
              </div>
            </div>
          )}

          {/* Secure details card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300">Sandbox Merchant Simulator Active</h5>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Payments on SkyReserve are processed in testing sandbox channels. No actual currency charges or card credit checks will be executed.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Establishing Gateway handshake...</span>
              </>
            ) : (
              <>
                <BadgeCheck className="w-4 h-4" />
                <span>Complete Settlement (${totalFare})</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* Booking summary panel (Right, Col-5) */}
      <div className="lg:col-span-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl space-y-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
          Flight Settlement Summary
        </h4>

        {/* Route Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">Carrier Service</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{flight.flightNumber}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">Departure Airport</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{flight.sourceCode} ({flight.departureTime})</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">Arrival Airport</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{flight.destinationCode} ({flight.arrivalTime})</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">Cabin Class</span>
            <span className="font-bold text-indigo-500">{flight.class}</span>
          </div>
        </div>

        {/* Coupons block */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Apply Promo Coupon</span>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Try SKYFLY30 or WELCOME10"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponApplied}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs uppercase font-mono font-bold"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponApplied || !couponCode}
              className="px-4 py-1.5 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 text-white dark:disabled:bg-slate-800 text-xs font-bold rounded-xl uppercase font-mono transition-all cursor-pointer"
            >
              {couponApplied ? "Applied" : "Apply"}
            </button>
          </div>
          {couponApplied && (
            <span className="text-[10px] font-mono font-bold text-emerald-600 block bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-100">
              ✓ Promo Coupon accepted! Saved ${couponDiscount} on this reservation.
            </span>
          )}
        </div>

        {/* Calculations */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500">Base Fare ({passengers.length}x)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">${baseCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cabin Seat Premium</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">+${extraFare}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Regulatory Airport Taxes</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">${taxCost}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between text-red-500">
              <span>Coupon Discount</span>
              <span className="font-bold font-mono">-${couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">Total Settlement Due</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-xl">${totalFare}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
