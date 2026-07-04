import { useState, useEffect, FormEvent } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Plus, Trash, Edit3, Settings, ShieldAlert, Sparkles, DollarSign, Calendar, Users, Percent, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { Flight, PricingRule } from "../types";

export default function OperatorDashboard() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [activeTab, setActiveTab] = useState<"analytics" | "flights" | "pricing" | "ai-delay">("analytics");
  const [loading, setLoading] = useState(false);

  // Flight form state
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [flightForm, setFlightForm] = useState({
    flightNumber: "",
    airline: "SkyReserve Airlines",
    airlineCode: "SR",
    source: "",
    sourceCode: "",
    destination: "",
    destinationCode: "",
    departureTime: "10:00 AM",
    arrivalTime: "04:00 PM",
    duration: "6h 00m",
    stops: 0,
    fare: 350,
    discount: 30,
    seatsAvailable: 60,
    refundable: true,
  });

  // Pricing Rule form
  const [ruleName, setRuleName] = useState("");
  const [ruleCriteria, setRuleCriteria] = useState("Occupancy > 80%");
  const [ruleMarkup, setRuleMarkup] = useState("+15%");

  // AI Delay State
  const [aiFlightNum, setAiFlightNum] = useState("SR-101");
  const [aiAirport, setAiAirport] = useState("JFK");
  const [assessingDelay, setAssessingDelay] = useState(false);
  const [delayReport, setDelayReport] = useState<any>(null);

  useEffect(() => {
    fetchFlights();
    fetchPricingRules();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flights");
      if (res.ok) {
        const data = await res.json();
        setFlights(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingRules = async () => {
    try {
      const res = await fetch("/api/pricing-rules");
      if (res.ok) {
        const data = await res.json();
        setPricingRules(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlightSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingFlight ? `/api/flights/${editingFlight.id}` : "/api/flights";
    const method = editingFlight ? "PUT" : "POST";

    const bodyData = {
      ...flightForm,
      class: "Economy",
      carbonEmission: "150 kg CO2",
      baggage: "1 Cabin + 1 Checked",
      layovers: [],
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        alert(editingFlight ? "Flight configuration updated." : "New flight added to operations.");
        setShowFlightModal(false);
        setEditingFlight(null);
        fetchFlights();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (!window.confirm("Are you sure you want to retire this flight from scheduling?")) return;
    try {
      const res = await fetch(`/api/flights/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFlights();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRule = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pricing-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ruleName, criteria: ruleCriteria, markup: ruleMarkup, active: true }),
      });
      if (res.ok) {
        setRuleName("");
        fetchPricingRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/pricing-rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPricingRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const assessAviationDelay = async () => {
    setAssessingDelay(true);
    setDelayReport(null);
    try {
      const res = await fetch("/api/ai/delay-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightNumber: aiFlightNum, airport: aiAirport }),
      });
      if (res.ok) {
        const data = await res.json();
        setDelayReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssessingDelay(false);
    }
  };

  // Static high-fidelity charts dataset
  const REVENUE_DATA = [
    { name: "Mon", bookings: 120, revenue: 54000 },
    { name: "Tue", bookings: 145, revenue: 65000 },
    { name: "Wed", bookings: 190, revenue: 85500 },
    { name: "Thu", bookings: 160, revenue: 72000 },
    { name: "Fri", bookings: 220, revenue: 99000 },
    { name: "Sat", bookings: 240, revenue: 108000 },
    { name: "Sun", bookings: 210, revenue: 94500 }
  ];

  const PERFORMANCE_DATA = [
    { route: "JFK-LHR", factor: 92, fill: "#6366f1" },
    { route: "LHR-BOM", factor: 84, fill: "#8b5cf6" },
    { route: "BOM-DXB", factor: 78, fill: "#10b981" },
    { route: "SIN-HND", factor: 88, fill: "#f59e0b" },
    { route: "CDG-SYD", factor: 95, fill: "#ec4899" }
  ];

  return (
    <div id="operator-dashboard-container" className="space-y-6">
      
      {/* Top section with title & tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Settings className="w-5 h-5" />
            </span>
            <span>Delta Airline Operations Center</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            Operational dashboard for carriers, fleet managers, and dynamic schedules.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-center">
          {[
            { id: "analytics", label: "Analytics Hub" },
            { id: "flights", label: "Fleet CRUD" },
            { id: "pricing", label: "Pricing Engines" },
            { id: "ai-delay", label: "AI Delay Assessor" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Analytics Hub View */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          
          {/* Key Indicators grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Today's Revenue</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">$578,000</p>
              <span className="text-[10px] font-mono font-bold text-emerald-600">+12% vs last Saturday</span>
              <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 p-1 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Flight Departures</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">28 / 32</p>
              <span className="text-[10px] font-mono font-bold text-indigo-500">4 flights scheduled evening</span>
              <div className="absolute top-4 right-4 text-indigo-500 bg-indigo-500/10 p-1 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Total Passengers</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">4,890</p>
              <span className="text-[10px] font-mono font-bold text-slate-500">Peak hour terminal 1</span>
              <div className="absolute top-4 right-4 text-purple-500 bg-purple-500/10 p-1 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Average Load Factor</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">87.4%</p>
              <span className="text-[10px] font-mono font-bold text-emerald-600">Optimal seat efficiency</span>
              <div className="absolute top-4 right-4 text-amber-500 bg-amber-500/10 p-1 rounded-lg">
                <Percent className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bookings / Revenue Trend (Col-8) */}
            <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-md space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Revenue & Booking Volumetric Timeline</h4>
                <p className="text-xs text-slate-400">Weekly cumulative ticket sales and gross pricing values.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Area type="monotone" dataKey="revenue" name="Sales ($)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance by Route (Col-4) */}
            <div className="lg:col-span-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-md space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Route Occupancy Rating</h4>
                <p className="text-xs text-slate-400">Seat utility levels across core airport paths.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="route" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: "12px" }} />
                    <Bar dataKey="factor" name="Load Factor (%)" radius={[4, 4, 0, 0]}>
                      {PERFORMANCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. Fleet Scheduling CRUD */}
      {activeTab === "flights" && (
        <div className="space-y-4">
          
          {/* Header Actions bar */}
          <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-500 font-mono">{flights.length} active scheduled flights</span>
            <button
              onClick={() => {
                setEditingFlight(null);
                setFlightForm({
                  flightNumber: `SR-${Math.floor(100 + Math.random() * 900)}`,
                  airline: "SkyReserve Airlines",
                  airlineCode: "SR",
                  source: "Mumbai (BOM)",
                  sourceCode: "BOM",
                  destination: "Dubai (DXB)",
                  destinationCode: "DXB",
                  departureTime: "01:00 PM",
                  arrivalTime: "04:30 PM",
                  duration: "3h 30m",
                  stops: 0,
                  fare: 280,
                  discount: 20,
                  seatsAvailable: 80,
                  refundable: true,
                });
                setShowFlightModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-md shadow-indigo-500/15"
            >
              <Plus className="w-4 h-4" />
              <span>Create Flight scheduling</span>
            </button>
          </div>

          {/* Flights list panel */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[10px] uppercase font-bold text-slate-400 font-mono">
                  <th className="p-4">Flight</th>
                  <th className="p-4">Source Hub</th>
                  <th className="p-4">Destination Hub</th>
                  <th className="p-4">Base Fare</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {flights.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      <div>
                        <span className="font-extrabold">{f.flightNumber}</span>
                        <p className="text-[10px] font-mono text-slate-400 font-medium">{f.airline}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{f.sourceCode}</td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{f.destinationCode}</td>
                    <td className="p-4 font-mono font-black text-slate-950 dark:text-white">${f.fare}</td>
                    <td className="p-4 font-mono text-amber-600 font-bold">{f.seatsAvailable} Left</td>
                    <td className="p-4 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingFlight(f);
                          setFlightForm({
                            flightNumber: f.flightNumber,
                            airline: f.airline,
                            airlineCode: f.airlineCode,
                            source: f.source,
                            sourceCode: f.sourceCode,
                            destination: f.destination,
                            destinationCode: f.destinationCode,
                            departureTime: f.departureTime,
                            arrivalTime: f.arrivalTime,
                            duration: f.duration,
                            stops: f.stops,
                            fare: f.fare,
                            discount: f.discount,
                            seatsAvailable: f.seatsAvailable,
                            refundable: f.refundable,
                          });
                          setShowFlightModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlight(f.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal popup form for Flight scheduling */}
          {showFlightModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
                <h4 className="font-bold text-md text-slate-800 dark:text-white">
                  {editingFlight ? "Edit Fleet Scheduling" : "Create New Carrier Scheduling"}
                </h4>

                <form onSubmit={handleFlightSubmit} className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Flight Number</label>
                    <input
                      type="text"
                      required
                      value={flightForm.flightNumber}
                      onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Airline Name</label>
                    <input
                      type="text"
                      required
                      value={flightForm.airline}
                      onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Source Hub (Airport Code)</label>
                    <input
                      type="text"
                      required
                      placeholder="New York (JFK)"
                      value={flightForm.source}
                      onChange={(e) => setFlightForm({ ...flightForm, source: e.target.value, sourceCode: e.target.value.match(/\((.*?)\)/)?.[1] || "JFK" })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Destination Hub (Airport Code)</label>
                    <input
                      type="text"
                      required
                      placeholder="London (LHR)"
                      value={flightForm.destination}
                      onChange={(e) => setFlightForm({ ...flightForm, destination: e.target.value, destinationCode: e.target.value.match(/\((.*?)\)/)?.[1] || "LHR" })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Base Price ($)</label>
                    <input
                      type="number"
                      required
                      value={flightForm.fare}
                      onChange={(e) => setFlightForm({ ...flightForm, fare: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Total Inventory (Seats)</label>
                    <input
                      type="number"
                      required
                      value={flightForm.seatsAvailable}
                      onChange={(e) => setFlightForm({ ...flightForm, seatsAvailable: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setShowFlightModal(false); setEditingFlight(null); }}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. Dynamic Pricing Engines */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Configure Rule (Left Col-1) */}
          <div className="lg:col-span-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 pb-2">
              Add Dynamic Rule
            </h4>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Season Surge"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Operational Trigger</label>
                <select
                  value={ruleCriteria}
                  onChange={(e) => setRuleCriteria(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                >
                  <option>Occupancy &gt; 80%</option>
                  <option>Days to Departure &lt; 3</option>
                  <option>Departure is Tue/Wed</option>
                  <option>Weather alert: high risk</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Surge / Discount Markup</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +15% or -10%"
                  value={ruleMarkup}
                  onChange={(e) => setRuleMarkup(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow"
              >
                Launch Pricing Rule
              </button>
            </form>
          </div>

          {/* Active Pricing Rules List (Right Col-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider block">Active pricing engine rules</h4>

            <div className="space-y-3">
              {pricingRules.map(rule => (
                <div key={rule.id} className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{rule.name}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Trigger: {rule.criteria}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-black rounded-lg">
                      {rule.markup}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. AI Delay Assessor */}
      {activeTab === "ai-delay" && (
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold uppercase font-mono tracking-widest">SkyReserve Gemini Flight intelligence</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Route Congestion & Meteorological delay prediction</h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Uses the Google Gemini generative model to dynamically assess real-time terminal airport wind, traffic density, and flight parameters to forecast delayed risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/40">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Flight Number</label>
              <input
                type="text"
                value={aiFlightNum}
                onChange={(e) => setAiFlightNum(e.target.value.toUpperCase())}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Airport Code (ICAO/IATA)</label>
              <input
                type="text"
                value={aiAirport}
                onChange={(e) => setAiAirport(e.target.value.toUpperCase())}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <button
                onClick={assessAviationDelay}
                disabled={assessingDelay}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:bg-slate-400 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-md shadow-indigo-500/15 h-[34px]"
              >
                {assessingDelay ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing airspace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Assess Airspace Risk</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Block */}
          {delayReport && (
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-indigo-100 dark:border-indigo-900 pb-3">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Aviation Delay Assessment: {aiFlightNum} at {aiAirport}</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                  delayReport.riskLevel === "High" ? "bg-red-100 text-red-600" : delayReport.riskLevel === "Medium" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                }`}>
                  {delayReport.riskLevel} Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Delay Probability</span>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-sans">{delayReport.probability}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Operational Cause</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{delayReport.reason}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-100/30">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block mb-1">Terminal METAR Weather Report</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-mono leading-relaxed">{delayReport.meteorologicalBrief}</p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
