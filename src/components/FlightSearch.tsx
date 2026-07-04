import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, Shield, AlertTriangle, HelpCircle, Sparkles, TrendingDown, DollarSign, Clock, Calendar, Compass, Star } from "lucide-react";
import { Flight } from "../types";

interface FlightSearchProps {
  onSelectFlight: (flight: Flight, returnFlight?: Flight) => void;
}

export default function FlightSearch({ onSelectFlight }: FlightSearchProps) {
  const [tripType, setTripType] = useState<"one-way" | "round-trip" | "multi-city">("one-way");
  const [source, setSource] = useState("New York (JFK)");
  const [destination, setDestination] = useState("London (LHR)");
  const [departureDate, setDepartureDate] = useState("2026-07-15");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("Economy");

  // Search results state
  const [flightsList, setFlightsList] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters state
  const [filterDirectOnly, setFilterDirectOnly] = useState(false);
  const [filterRefundableOnly, setFilterRefundableOnly] = useState(false);
  const [filterMaxPrice, setFilterMaxPrice] = useState(1500);
  const [filterAirline, setFilterAirline] = useState("All");

  // Sorting
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest" | "best" | "earliest">("cheapest");

  // AI Fare Prediction State
  const [showAiPrediction, setShowAiPrediction] = useState(false);
  const [predictingFare, setPredictingFare] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Airports list for Auto-Complete
  const AIRPORTS = [
    { code: "JFK", name: "New York (JFK)" },
    { code: "LHR", name: "London (LHR)" },
    { code: "BOM", name: "Mumbai (BOM)" },
    { code: "DXB", name: "Dubai (DXB)" },
    { code: "SIN", name: "Singapore (SIN)" },
    { code: "HND", name: "Tokyo (HND)" },
    { code: "CDG", name: "Paris (CDG)" },
    { code: "SYD", name: "Sydney (SYD)" }
  ];

  // Initial fetch
  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setShowAiPrediction(false);
    try {
      const res = await fetch(`/api/flights?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&class=${travelClass}`);
      if (res.ok) {
        const data = await res.json();
        setFlightsList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial search on mount
  useEffect(() => {
    handleSearch();
  }, []);

  // Filter & Sort Application
  useEffect(() => {
    let result = [...flightsList];

    if (filterDirectOnly) {
      result = result.filter(f => f.stops === 0);
    }
    if (filterRefundableOnly) {
      result = result.filter(f => f.refundable);
    }
    if (filterAirline !== "All") {
      result = result.filter(f => f.airline === filterAirline);
    }
    result = result.filter(f => f.fare <= filterMaxPrice);

    // Apply Sorting
    if (sortBy === "cheapest") {
      result.sort((a, b) => a.fare - b.fare);
    } else if (sortBy === "fastest") {
      result.sort((a, b) => {
        const d1 = parseInt(a.duration) || 10;
        const d2 = parseInt(b.duration) || 10;
        return d1 - d2;
      });
    } else if (sortBy === "earliest") {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sortBy === "best") {
      // Balance fare, short duration, fewer stops
      result.sort((a, b) => (a.fare + a.stops * 200) - (b.fare + b.stops * 200));
    }

    setFilteredFlights(result);
  }, [flightsList, filterDirectOnly, filterRefundableOnly, filterMaxPrice, filterAirline, sortBy]);

  // AI Predict Fare Action
  const handleAiPredictFare = async () => {
    setPredictingFare(true);
    setShowAiPrediction(true);
    try {
      const res = await fetch("/api/ai/predict-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, date: departureDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      }
    } catch (err) {
      console.error("AI Fare Prediction Failed", err);
    } finally {
      setPredictingFare(false);
    }
  };

  const swapRoute = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div id="flight-search-container" className="space-y-6">
      
      {/* Search Widget Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-violet-500/0 rounded-full blur-3xl pointer-events-none" />
        
        {/* Trip type tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(["one-way", "round-trip", "multi-city"] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  setTripType(type);
                  if (type === "one-way") setReturnDate("");
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  tripType === type
                    ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-500 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {type.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAiPredictFare}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-brand-to-600 hover:from-brand-700 hover:to-brand-to-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Price Predictor</span>
            </button>
          </div>
        </div>

        {/* Search Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 items-end">
          
          {/* Source Airport Selection */}
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Source Airport</label>
            <div className="relative">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              >
                {AIRPORTS.map(ap => (
                  <option key={ap.code} value={ap.name}>{ap.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-1 lg:mb-2 cursor-pointer col-span-1">
            <button
              onClick={swapRoute}
              type="button"
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-600 rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-all"
              title="Swap Locations"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Airport Selection */}
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Destination Airport</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            >
              {AIRPORTS.map(ap => (
                <option key={ap.code} value={ap.name}>{ap.name}</option>
              ))}
            </select>
          </div>

          {/* Departure Date */}
          <div className="md:col-span-2 lg:col-span-2 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Departure Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Return Date (only if Round Trip) */}
          <div className={`md:col-span-2 lg:col-span-2 space-y-2 transition-opacity ${tripType === "one-way" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={tripType === "one-way"}
              placeholder="Select date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Class Select */}
          <div className="md:col-span-1 lg:col-span-1 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Class</label>
            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option>Economy</option>
              <option>Premium Economy</option>
              <option>Business</option>
              <option>First Class</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-1 lg:col-span-1">
            <button
              onClick={handleSearch}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-[42px] rounded-xl shadow-md shadow-indigo-500/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* AI Prediction Section (Glassmorphism card block) */}
      {showAiPrediction && (
        <div className="bg-gradient-to-r from-indigo-900/10 to-violet-900/10 border border-indigo-500/30 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden transition-all">
          <div className="absolute top-1/2 left-4 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="text-xs uppercase font-bold tracking-widest font-mono">Gemini AI Market Forecaster</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Fare Intelligence for {source} to {destination}
              </h3>
              {predictingFare ? (
                <div className="flex items-center space-x-2 py-3">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-mono">Analyzing past fare logs & seasonality models...</span>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {aiResult?.aiAnalysis}
                </p>
              )}
            </div>

            {!predictingFare && aiResult && (
              <div className="grid grid-cols-2 gap-4 bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-lg min-w-[260px]">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Forecast Price</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-sans">${aiResult.predictedFare}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Market Trend</span>
                  <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{aiResult.trend}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confidence Level</span>
                  <p className="text-xs font-mono font-bold text-emerald-600">{aiResult.confidence}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recommendation</span>
                  <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">{aiResult.recommendation}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Filters */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filter Flights</span>
            </h4>
            <button
              onClick={() => {
                setFilterDirectOnly(false);
                setFilterRefundableOnly(false);
                setFilterMaxPrice(1500);
                setFilterAirline("All");
              }}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Stops filter */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Stops</span>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterDirectOnly}
                  onChange={(e) => setFilterDirectOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Direct Flights Only</span>
              </label>
            </div>
          </div>

          {/* Refundability */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Refund Policy</span>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterRefundableOnly}
                  onChange={(e) => setFilterRefundableOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-50 dark:bg-slate-800 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Fully Refundable</span>
              </label>
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Max One-Way Fare</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">${filterMaxPrice}</span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Airlines list selection */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Preferred Airline</span>
            <select
              value={filterAirline}
              onChange={(e) => setFilterAirline(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option>All</option>
              <option>SkyReserve Airlines</option>
              <option>JetGlide Express</option>
              <option>AeroPremium</option>
              <option>OceanWinds</option>
            </select>
          </div>

          {/* Multi-portal highlight banner */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Smart Booking Shield</span>
            </h5>
            <p className="text-[10px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
              Every checkout includes automatic baggage protection, flexible carbon balancing offsets, and flexible rescheduling options.
            </p>
          </div>

        </div>

        {/* Search Results Main */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Sorting / Results bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
              {filteredFlights.length} flights found from {source} to {destination}
            </span>

            {/* Sorting buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(["cheapest", "fastest", "best", "earliest"] as const).map(sortType => (
                <button
                  key={sortType}
                  onClick={() => setSortBy(sortType)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    sortBy === sortType
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {sortType}
                </button>
              ))}
            </div>
          </div>

          {/* Flights Cards List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 h-40 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-12 text-center space-y-4">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto animate-bounce" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">No matching flights in service</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  Try clearing your filters, selecting different hubs, or lowering the price filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlights.map(flight => (
                <div
                  key={flight.id}
                  className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 h-full group-hover:scale-y-110 transition-transform" />
                  
                  {/* Top Row: Airline, Logo & Fare details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
                        {flight.airlineCode}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{flight.airline}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md font-semibold">{flight.flightNumber}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wide">{travelClass} Class</p>
                      </div>
                    </div>

                    {/* Fare Calculation Display */}
                    <div className="text-right flex items-center space-x-3 self-end sm:self-center">
                      {flight.discount > 0 && (
                        <span className="text-xs text-red-500 bg-red-100/50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg font-bold">
                          ${flight.discount} OFF
                        </span>
                      )}
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 line-through font-semibold font-mono inline mr-1.5">
                          ${flight.fare + flight.discount}
                        </p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white font-sans inline">${flight.fare}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Times, Duration, Route */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center mb-5">
                    
                    {/* Departure */}
                    <div className="space-y-1">
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white">{flight.departureTime}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{flight.sourceCode}</p>
                    </div>

                    {/* Timeline line decoration */}
                    <div className="col-span-1 sm:col-span-3 text-center space-y-1 relative px-4">
                      <p className="text-[10px] font-bold text-slate-400 font-mono">{flight.duration}</p>
                      <div className="relative flex items-center justify-center">
                        <div className="w-full border-t border-dashed border-slate-300 dark:border-slate-700" />
                        <div className="absolute w-2 h-2 rounded-full bg-brand-600" />
                      </div>
                      <p className="text-[9px] font-bold text-brand-500 font-mono">
                        {flight.stops === 0 ? "Nonstop" : `${flight.stops} Stop (${flight.layovers.join(", ")})`}
                      </p>
                    </div>

                    {/* Arrival */}
                    <div className="space-y-1 text-right">
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white">{flight.arrivalTime}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{flight.destinationCode}</p>
                    </div>

                  </div>

                  {/* Footer Row: Meta indices & SELECT action */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100/40 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1">
                        <span>🌱 Carbon: {flight.carbonEmission}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md font-semibold">
                        👜 {flight.baggage}
                      </span>
                      {flight.refundable && (
                        <span className="text-[10px] font-mono text-brand-600 bg-brand-100/40 dark:bg-brand-950/20 px-2 py-0.5 rounded-md font-bold">
                          ✓ Refundable
                        </span>
                      )}
                    </div>

                    {/* Available Seats & CTA */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                        🔥 Only {flight.seatsAvailable} seats left!
                      </span>
                      <button
                        onClick={() => onSelectFlight(flight)}
                        className="px-5 py-2 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-slate-900/10"
                      >
                        Book Seat Map
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
