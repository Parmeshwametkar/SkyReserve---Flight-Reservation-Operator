import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plane, Compass, Sparkles, Star, ChevronRight, Award, ShieldCheck, Heart, AlertCircle, Clock, MapPin } from "lucide-react";
import Navbar from "./components/Navbar";
import FlightSearch from "./components/FlightSearch";
import SeatMap from "./components/SeatMap";
import PassengerForm, { PassengerData } from "./components/PassengerForm";
import PaymentGateway from "./components/PaymentGateway";
import BoardingPass from "./components/BoardingPass";
import BookingHistory from "./components/BookingHistory";
import OperatorDashboard from "./components/OperatorDashboard";
import AdminPortal from "./components/AdminPortal";
import AIChatAssistant from "./components/AIChatAssistant";
import { PortalType, Flight } from "./types";
import { THEME_PRESETS, applyThemeColors } from "./theme";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentPortal, setPortal] = useState<PortalType>("passenger");
  const [activeTheme, setActiveTheme] = useState(THEME_PRESETS[0]);

  // Passenger booking states
  const [bookingStep, setBookingStep] = useState<"landing" | "search" | "seats" | "checkout" | "payment" | "pass" | "history">("landing");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<PassengerData[]>([]);
  const [extraSeatFare, setExtraSeatFare] = useState(0);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  useEffect(() => {
    // Dark mode management on root document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    applyThemeColors(activeTheme);
  }, [activeTheme]);

  // Handler: Selecting a flight from search results
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setBookingStep("seats");
  };

  // Handler: Completing seat selection
  const handleSeatSelected = (seats: string[], extraFare: number) => {
    setSelectedSeats(seats);
    setExtraSeatFare(extraFare);
    setBookingStep("checkout");
  };

  // Handler: Completing passenger details
  const handlePassengerDetailsSubmit = (details: PassengerData[]) => {
    setPassengerDetails(details);
    setBookingStep("payment");
  };

  // Handler: Payment Complete
  const handlePaymentComplete = (bookingRecord: any) => {
    setCompletedBooking(bookingRecord);
    setBookingStep("pass");
  };

  // Pre-fill landing destinations
  const POPULAR_DESTINATIONS = [
    { name: "Tokyo (HND)", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80", desc: "Cherry blossoms & tech", fare: "$890" },
    { name: "London (LHR)", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=300&q=80", desc: "Heritage & culture", fare: "$450" },
    { name: "Dubai (DXB)", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80", desc: "Luxury skylines", fare: "$280" }
  ];

  const CLIENT_REVIEWS = [
    { name: "Sarah Jenkins", role: "Frequent Flyer", comment: "The interactive seat selection is flawless. Combining AI fare tracking makes Skyscanner feel dated!", rating: 5 },
    { name: "Marco Rossi", role: "Business Class traveler", comment: "Outstanding enterprise portal. Boarding passes sync instantly with mobile, making terminal transit effortless.", rating: 5 }
  ];

  const backgroundStyle = {
    backgroundImage: darkMode
      ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.93), rgba(15, 23, 42, 0.97)), url("https://media.istockphoto.com/id/155439315/photo/passenger-airplane-flying-above-clouds-during-sunset.jpg?s=612x612&w=0&k=20&c=LJWadbs3B-jSGJBVy9s0f8gZMHi2NvWFXa3VJ2lFcL0=")`
      : `linear-gradient(to bottom, rgba(248, 250, 252, 0.88), rgba(248, 250, 252, 0.96)), url("https://media.istockphoto.com/id/155439315/photo/passenger-airplane-flying-above-clouds-during-sunset.jpg?s=612x612&w=0&k=20&c=LJWadbs3B-jSGJBVy9s0f8gZMHi2NvWFXa3VJ2lFcL0=")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <div
      style={backgroundStyle}
      className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans"
    >
      
      {/* Premium Header Bar */}
      <Navbar
        currentPortal={currentPortal}
        setPortal={setPortal}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* ==================== PASSENGER PORTAL ==================== */}
          {currentPortal === "passenger" && (
            <motion.div
              key="passenger-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              
              {/* Secondary Navigation bar within passenger view */}
              <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                <button
                  onClick={() => setBookingStep("landing")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg ${
                    bookingStep === "landing" || bookingStep === "search" || bookingStep === "seats" || bookingStep === "checkout" || bookingStep === "payment" || bookingStep === "pass"
                      ? "bg-brand-600/10 text-brand-600 dark:text-brand-500 font-bold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  Book New Flight
                </button>
                <button
                  onClick={() => setBookingStep("history")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg ${
                    bookingStep === "history"
                      ? "bg-brand-600/10 text-brand-600 dark:text-brand-500 font-bold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  My Flights & Tickets
                </button>
              </div>

              {/* Passenger Sub-flows Routing */}
              {bookingStep === "landing" && (
                <div className="space-y-12 animate-fade-in">
                  
                  {/* Visual Hero Intro Block */}
                  <div className="text-center space-y-4 max-w-2xl mx-auto py-6">
                    <span className="px-3.5 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 text-xs font-bold uppercase tracking-widest rounded-full font-mono">
                      ✈ Next-Gen Aviation Operators
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-brand-600 via-brand-500 to-brand-to-600 dark:from-brand-500 dark:to-brand-to-600 bg-clip-text text-transparent">
                      Aesthetic Skies, Enterprise Precision
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Experience frictionless airline operations, interactive seat mappings, dynamic check-ins, and server-side Gemini AI predictions.
                    </p>
                  </div>

                  {/* Booking Search Widget Row */}
                  <FlightSearch onSelectFlight={handleSelectFlight} />

                  {/* Popular Destinations Bento Grid */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                        <Compass className="w-5 h-5 text-brand-600" />
                        <span>Trending Aviation Destinations</span>
                      </h3>
                      <p className="text-xs text-slate-400">Selected based on seasonal schedules & low emission routes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {POPULAR_DESTINATIONS.map(dest => (
                        <div
                          key={dest.name}
                          onClick={() => setBookingStep("search")}
                          className="group relative h-48 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
                        >
                          <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 text-white space-y-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-500 font-mono">From {dest.fare}</span>
                            <h4 className="font-extrabold text-sm">{dest.name}</h4>
                            <p className="text-[10px] text-slate-300">{dest.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aviation Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-100 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 text-center">
                    <div>
                      <p className="text-2xl font-black text-brand-600 dark:text-brand-500 font-mono">99.2%</p>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">On-Time Departure Ratio</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-brand-600 dark:text-brand-500 font-mono">1.2M</p>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Passengers Transited</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600 font-mono">180 kg</p>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Avg Carbon Offset Balanced</p>
                    </div>
                  </div>

                  {/* Customer Testimonials reviews */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-center">Passenger Stories</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {CLIENT_REVIEWS.map((rev, idx) => (
                        <div key={idx} className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl shadow-sm space-y-3 relative">
                          <div className="flex items-center space-x-1 text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-500" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{rev.comment}"</p>
                          <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center font-bold text-[10px] text-white uppercase">
                              {rev.name[0]}
                            </div>
                            <div>
                              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{rev.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{rev.role}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <footer className="border-t border-slate-200/40 dark:border-slate-800/40 pt-6 text-center space-y-2">
                    <p className="text-xs text-slate-400">© 2026 SkyReserve Aviation Operator Inc. All security and custom routes cleared.</p>
                  </footer>

                </div>
              )}

              {bookingStep === "search" && (
                <FlightSearch onSelectFlight={handleSelectFlight} />
              )}

              {bookingStep === "seats" && selectedFlight && (
                <SeatMap
                  flight={selectedFlight}
                  onProceed={handleSeatSelected}
                  onBack={() => setBookingStep("search")}
                />
              )}

              {bookingStep === "checkout" && selectedFlight && (
                <PassengerForm
                  selectedSeats={selectedSeats}
                  onSubmit={handlePassengerDetailsSubmit}
                  onBack={() => setBookingStep("seats")}
                />
              )}

              {bookingStep === "payment" && selectedFlight && (
                <PaymentGateway
                  flight={selectedFlight}
                  selectedSeats={selectedSeats}
                  passengers={passengerDetails}
                  extraFare={extraSeatFare}
                  onComplete={handlePaymentComplete}
                  onBack={() => setBookingStep("checkout")}
                />
              )}

              {bookingStep === "pass" && completedBooking && (
                <BoardingPass
                  booking={completedBooking}
                  onDone={() => setBookingStep("history")}
                />
              )}

              {bookingStep === "history" && (
                <BookingHistory onRebook={() => setBookingStep("landing")} />
              )}

            </motion.div>
          )}

          {/* ==================== AIRLINE OPERATOR PORTAL ==================== */}
          {currentPortal === "operator" && (
            <motion.div
              key="operator-portal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <OperatorDashboard />
            </motion.div>
          )}

          {/* ==================== ADMINISTRATIVE PORTAL ==================== */}
          {currentPortal === "admin" && (
            <motion.div
              key="admin-portal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <AdminPortal />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating AI Travel Co-Pilot assistant */}
      <AIChatAssistant />

    </div>
  );
}
