import { useState } from "react";
import { Armchair, Info, HelpCircle, Shield, CheckCircle, Flame } from "lucide-react";
import { Flight } from "../types";

interface SeatMapProps {
  flight: Flight;
  onProceed: (selectedSeats: string[], extraFare: number) => void;
  onBack: () => void;
}

interface Seat {
  id: string; // e.g. "1A"
  row: number;
  col: string; // A, B, C, D, E, F
  type: "economy" | "premium-economy" | "business" | "first-class";
  status: "available" | "booked" | "reserved";
  isExtraLegroom: boolean;
  isEmergencyExit: boolean;
  isDisabledAccessible: boolean;
  priceModifier: number;
}

export default function SeatMap({ flight, onProceed, onBack }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [extraFare, setExtraFare] = useState(0);

  // Constants
  const COLS = ["A", "B", "C", "", "D", "E", "F"]; // empty string denotes the aisle

  // Generate deterministic seat map for the flight
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const totalRows = 15;

    for (let r = 1; r <= totalRows; r++) {
      let type: "economy" | "premium-economy" | "business" | "first-class" = "economy";
      let priceModifier = 0;

      if (r <= 2) {
        type = "first-class";
        priceModifier = 120;
      } else if (r <= 5) {
        type = "business";
        priceModifier = 60;
      } else if (r <= 8) {
        type = "premium-economy";
        priceModifier = 25;
      }

      ["A", "B", "C", "D", "E", "F"].forEach(col => {
        const id = `${r}${col}`;
        
        // Seed status deterministically
        const hash = (r * 7) + col.charCodeAt(0);
        let status: "available" | "booked" | "reserved" = "available";
        if (hash % 3 === 0) status = "booked";
        else if (hash % 8 === 0) status = "reserved";

        // Modifiers
        const isEmergencyExit = r === 9; // Row 9 is exit row
        const isExtraLegroom = isEmergencyExit || r === 3 || r === 6;
        const isDisabledAccessible = r === 1; // row 1 accessible

        // Adjust modifier for emergency / legroom
        let modifier = priceModifier;
        if (isExtraLegroom) modifier += 15;

        seats.push({
          id,
          row: r,
          col,
          type,
          status,
          isExtraLegroom,
          isEmergencyExit,
          isDisabledAccessible,
          priceModifier: modifier,
        });
      });
    }

    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "available") return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(prev => prev.filter(id => id !== seat.id));
      setExtraFare(prev => prev - seat.priceModifier);
    } else {
      // Allow up to 4 seat selections
      if (selectedSeats.length >= 4) {
        alert("You can select up to 4 seats per booking.");
        return;
      }
      setSelectedSeats(prev => [...prev, seat.id]);
      setExtraFare(prev => prev + seat.priceModifier);
    }
  };

  const baseFare = flight.fare;
  const taxes = Math.floor(baseFare * 0.1);
  const totalDue = (baseFare * Math.max(1, selectedSeats.length)) + extraFare + (taxes * Math.max(1, selectedSeats.length));

  return (
    <div id="seat-map-container" className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl relative">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-3xl" />
      
      {/* Header and Route summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <button onClick={onBack} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-mono flex items-center space-x-1 mb-2">
            <span>← Back to search results</span>
          </button>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <Armchair className="w-5 h-5 text-indigo-600" />
            <span>Interactive Flight Seat Selection</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            Flight {flight.flightNumber} | {flight.sourceCode} → {flight.destinationCode}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Base Seat Fare</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">${flight.fare}</p>
        </div>
      </div>

      {/* Grid: Legends & Layout Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Seat selection Legend guide (Left Side) */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-700/40 space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>Seat Legends</span>
          </h4>

          {/* Seat Status list */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900 border border-indigo-300 dark:border-indigo-700" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-amber-200 dark:bg-amber-900 border border-amber-300 dark:border-amber-700" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Legroom (+$15)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-amber-500/10 border-2 border-amber-500" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Exit Row (+$15)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-indigo-200 dark:bg-indigo-900 border border-indigo-400" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Accessible</span>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Class Zones</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rows 1 - 2</span>
                <span className="font-bold text-indigo-500">First Class (+$120)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rows 3 - 5</span>
                <span className="font-bold text-indigo-500">Business (+$60)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rows 6 - 8</span>
                <span className="font-bold text-emerald-500">Premium Econ (+$25)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rows 9 - 15</span>
                <span className="text-slate-500">Economy (+$0)</span>
              </div>
            </div>
          </div>

          {/* Safety notice exit row */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/50 space-y-1.5">
            <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Exit Row Guidelines</span>
            </h5>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Passengers in Row 9 must be willing and able to assist in the unlikely event of an emergency. Special assistance limits apply.
            </p>
          </div>

        </div>

        {/* Aircraft Cabin Layout Map (Middle) */}
        <div className="lg:col-span-5 bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 flex flex-col items-center">
          
          {/* Nose of the Plane */}
          <div className="w-48 h-12 bg-white dark:bg-slate-900 border-t-2 border-x-2 border-slate-300 dark:border-slate-800 rounded-t-full flex items-center justify-center mb-6 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-widest font-bold">Flight Deck</span>
          </div>

          {/* Column identifiers */}
          <div className="flex space-x-2 mb-3 pr-1 justify-center max-w-sm w-full">
            {COLS.map((col, idx) => (
              col === "" ? (
                <div key={idx} className="w-6" />
              ) : (
                <span key={idx} className="w-7 text-center text-[10px] font-bold text-slate-400 font-mono">{col}</span>
              )
            ))}
          </div>

          {/* Seat Grid Rows */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto w-full pr-1">
            {Array.from({ length: 15 }, (_, rIdx) => {
              const row = rIdx + 1;
              return (
                <div key={row} className="flex items-center justify-center space-x-2 relative">
                  
                  {/* Row indicator labels left */}
                  <span className="text-[10px] font-bold text-slate-400 font-mono w-4 text-right">{row}</span>

                  <div className="flex space-x-2">
                    {COLS.map((col, cIdx) => {
                      if (col === "") {
                        // Return Aisle layout line
                        return <div key={cIdx} className="w-6 text-center text-[9px] font-bold text-slate-400 font-mono leading-7">Aisle</div>;
                      }

                      const seatId = `${row}${col}`;
                      const seat = seats.find(s => s.id === seatId);

                      if (!seat) return null;

                      const isSelected = selectedSeats.includes(seatId);

                      // Status styles
                      let seatColor = "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 hover:bg-indigo-200 border-indigo-300 dark:border-indigo-800";
                      
                      if (seat.status === "booked") {
                        seatColor = "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-slate-300 dark:border-slate-700";
                      } else if (seat.status === "reserved") {
                        seatColor = "bg-amber-200 dark:bg-amber-950 text-amber-600 cursor-not-allowed border-amber-300 dark:border-amber-900";
                      } else if (isSelected) {
                        seatColor = "bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-500 scale-105 shadow-md shadow-indigo-500/25";
                      } else if (seat.isExtraLegroom) {
                        seatColor = "bg-purple-100 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-200 border-purple-300 dark:border-purple-800";
                      } else if (seat.isDisabledAccessible) {
                        seatColor = "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 hover:bg-indigo-200 border-indigo-300 dark:border-indigo-800";
                      }

                      return (
                        <button
                          key={col}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status !== "available"}
                          title={`Seat ${seatId} (${seat.type}) - ${seat.status === "available" ? `Available (+$${seat.priceModifier})` : "Unavailable"}`}
                          className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center text-[10px] font-mono font-extrabold transition-all ${seatColor}`}
                        >
                          {isSelected ? "✓" : col}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row indicator labels right */}
                  <span className="text-[10px] font-bold text-slate-400 font-mono w-4 text-left">{row}</span>

                </div>
              );
            })}
          </div>

          {/* Rear of the Plane */}
          <div className="w-48 h-8 bg-white dark:bg-slate-900 border-b-2 border-x-2 border-slate-300 dark:border-slate-800 rounded-b-xl mt-6" />

        </div>

        {/* Pricing Summary & Checkout Box (Right Side) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5 shadow-md">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
            Selection Summary
          </h4>

          {selectedSeats.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-mono">
              Please click available seats in the layout to begin booking.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reserved Seats</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(seatId => {
                    const seat = seats.find(s => s.id === seatId);
                    return (
                      <span key={seatId} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-mono font-bold">
                        Seat {seatId} (+${seat?.priceModifier})
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Fare ({selectedSeats.length}x)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">${baseFare * selectedSeats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Premium Modifiers</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">+${extraFare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aviation Security Taxes</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">${taxes * selectedSeats.length}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Booking Due</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-lg">${totalDue}</span>
                </div>
              </div>

              <button
                onClick={() => onProceed(selectedSeats, extraFare)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Passenger Credentials</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
