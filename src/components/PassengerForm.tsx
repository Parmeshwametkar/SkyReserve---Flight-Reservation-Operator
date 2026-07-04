import { useState, FormEvent } from "react";
import { User, ShieldCheck, CreditCard, ChevronRight, AlertCircle, Heart } from "lucide-react";

interface PassengerFormProps {
  selectedSeats: string[];
  onSubmit: (passengers: PassengerData[]) => void;
  onBack: () => void;
}

export interface PassengerData {
  name: string;
  passportNumber: string;
  nationality: string;
  seat: string;
  mealPreference: string;
  specialAssistance: string;
}

export default function PassengerForm({ selectedSeats, onSubmit, onBack }: PassengerFormProps) {
  const [formData, setFormData] = useState<PassengerData[]>(
    selectedSeats.map(seat => ({
      name: "",
      passportNumber: "",
      nationality: "United States",
      seat,
      mealPreference: "Vegetarian",
      specialAssistance: "None",
    }))
  );

  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (index: number, field: keyof PassengerData, value: string) => {
    setFormData(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    // Simple robust passport validation
    formData.forEach((p, idx) => {
      if (!p.name.trim()) {
        errs.push(`Passenger ${idx + 1} name is required.`);
      }
      if (!p.passportNumber.trim()) {
        errs.push(`Passenger ${idx + 1} passport number is required for international flights.`);
      } else if (p.passportNumber.trim().length < 6) {
        errs.push(`Passenger ${idx + 1} passport number seems invalid (too short).`);
      }
    });

    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    setErrors([]);
    onSubmit(formData);
  };

  return (
    <div id="passenger-form-container" className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl relative">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-3xl" />

      {/* Header */}
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <button onClick={onBack} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-mono flex items-center space-x-1 mb-1">
            <span>← Back to seat selection</span>
          </button>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Passenger Credentials & Secure Customs</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            TSA PreCheck & Secure Flight Passenger Data requirements.
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 font-bold text-xs uppercase mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Form Validation Errors</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-red-600 dark:text-red-400 space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {formData.map((passenger, idx) => (
          <div key={passenger.seat} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-mono">
                  {idx + 1}
                </span>
                <span>Passenger Details</span>
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold rounded-lg">
                Seat {passenger.seat}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Full Name (Matches Passport)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={passenger.name}
                  onChange={(e) => handleChange(idx, "name", e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Passport Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Passport / ID Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. L9038202"
                  value={passenger.passportNumber}
                  onChange={(e) => handleChange(idx, "passportNumber", e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Nationality */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Nationality</label>
                <select
                  value={passenger.nationality}
                  onChange={(e) => handleChange(idx, "nationality", e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>India</option>
                  <option>Japan</option>
                  <option>Singapore</option>
                  <option>Australia</option>
                  <option>Germany</option>
                </select>
              </div>

              {/* Meal Preference */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">In-Flight Meal Preference</label>
                <select
                  value={passenger.mealPreference}
                  onChange={(e) => handleChange(idx, "mealPreference", e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option>Vegetarian Hindu Meal (AVML)</option>
                  <option>Vegan Meal (VGML)</option>
                  <option>Halal Certified (MOML)</option>
                  <option>Gluten Friendly (GFML)</option>
                  <option>Non-Vegetarian Standard</option>
                  <option>No Meal Required</option>
                </select>
              </div>

              {/* Special Medical / Assistance Options */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Special Assistance Requirement</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {[
                    { value: "None", label: "No Assistance" },
                    { value: "Wheelchair", label: "Wheelchair (WCHR)" },
                    { value: "Infant", label: "Infant in lap (INF)" },
                    { value: "Senior", label: "Senior Citizen (SR)" }
                  ].map(item => (
                    <label
                      key={item.value}
                      className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer text-xs transition-all ${
                        passenger.specialAssistance === item.value
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`assistance-${idx}`}
                        checked={passenger.specialAssistance === item.value}
                        onChange={() => handleChange(idx, "specialAssistance", item.value)}
                        className="hidden"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ))}

        {/* Secure TSA Precheck alert */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Secure flight TSA Data Protected</h5>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
              SkyReserve transmits booking records directly using AES-256 encrypted channels to security services. Secure flight regulations require passport validation prior to departure.
            </p>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-bold font-mono"
          >
            Go Back
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-1 shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            <span>Mock Secure Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}
