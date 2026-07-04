import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plane, ShieldAlert, UserCheck, Bell, Sparkles, Sun, Moon, LogIn, ChevronDown, CheckCircle } from "lucide-react";
import { PortalType, Notification } from "../types";
import { BrandTheme, THEME_PRESETS } from "../theme";

interface NavbarProps {
  currentPortal: PortalType;
  setPortal: (portal: PortalType) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeTheme: BrandTheme;
  setActiveTheme: (theme: BrandTheme) => void;
}

export default function Navbar({
  currentPortal,
  setPortal,
  darkMode,
  setDarkMode,
  activeTheme,
  setActiveTheme
}: NavbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", { method: "POST" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header id="app-navbar" className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setPortal("passenger")}>
          <div className="p-2 bg-gradient-to-br from-brand-600 to-brand-to-600 rounded-xl text-white shadow-md shadow-brand-500/20">
            <Plane className="w-6 h-6 rotate-45 transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-sans font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-brand-to-600 dark:from-brand-500 dark:to-brand-to-600 bg-clip-text text-transparent">
                SkyReserve
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-100 rounded-md font-bold">
                Operator
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Enterprise Suite v4.2
            </p>
          </div>
        </div>

        {/* Portal Role Selector Tabs */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setPortal("passenger")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentPortal === "passenger"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-500 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Passenger Portal</span>
          </button>
          
          <button
            onClick={() => setPortal("operator")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentPortal === "operator"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-500 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Operator Dashboard</span>
          </button>

          <button
            onClick={() => setPortal("admin")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentPortal === "admin"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-500 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Right Side Settings & Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Theme customizer presets */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/30 dark:border-slate-700/30 mr-1">
            {THEME_PRESETS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t)}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 relative cursor-pointer ${
                  activeTheme.id === t.id
                    ? "ring-2 ring-offset-2 ring-brand-500 scale-110"
                    : "opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: t.color }}
                title={`Switch accent color to ${t.name}`}
              >
                {activeTheme.id === t.id && (
                  <span className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Interactive Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileDropdown(false);
              }}
              className="p-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 relative transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Alert Center</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-100 font-medium flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Clear unread</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        No active aviation notices.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${notif.unread ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''}`}>
                          <div className="flex items-start space-x-2.5">
                            <span className={`w-2 h-2 mt-1.5 rounded-full ${
                              notif.type === 'delay' ? 'bg-red-500' : notif.type === 'gate' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 block">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile / Status */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center space-x-2 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200/40 dark:border-slate-700/40"
            >
              <div className="w-7.5 h-7.5 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {currentPortal === 'passenger' ? 'PA' : currentPortal === 'operator' ? 'OP' : 'AD'}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
                {currentPortal === 'passenger' ? 'Parmeshwar M.' : currentPortal === 'operator' ? 'Delta Operator' : 'Enterprise Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {currentPortal === 'passenger' ? 'parmeshwar@gmail.com' : currentPortal === 'operator' ? 'ops@skyreserve.com' : 'admin@skyreserve.com'}
                    </p>
                    <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 mt-0.5">
                      Role: {currentPortal}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setPortal("passenger"); setShowProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center space-x-2"
                    >
                      <Plane className="w-3.5 h-3.5" />
                      <span>Passenger View</span>
                    </button>
                    <button
                      onClick={() => { setPortal("operator"); setShowProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center space-x-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Operator View</span>
                    </button>
                    <button
                      onClick={() => { setPortal("admin"); setShowProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center space-x-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Administrator View</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Mobile Portal Navigation Tabs */}
      <div className="md:hidden flex border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/90 divide-x divide-slate-100 dark:divide-slate-800">
        <button
          onClick={() => setPortal("passenger")}
          className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
            currentPortal === "passenger" ? "text-brand-600 dark:text-brand-500 bg-white dark:bg-slate-800" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Passenger
        </button>
        <button
          onClick={() => setPortal("operator")}
          className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
            currentPortal === "operator" ? "text-brand-600 dark:text-brand-500 bg-white dark:bg-slate-800" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Operator
        </button>
        <button
          onClick={() => setPortal("admin")}
          className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
            currentPortal === "admin" ? "text-brand-600 dark:text-brand-500 bg-white dark:bg-slate-800" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Admin Portal
        </button>
      </div>

    </header>
  );
}
