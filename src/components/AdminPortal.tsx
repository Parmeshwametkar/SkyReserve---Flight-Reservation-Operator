import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, FileCode, CheckCircle, Copy, Download, RefreshCw, Terminal, Heart, Radio } from "lucide-react";
import { AuditLog } from "../types";

export default function AdminPortal() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"audits" | "fraud" | "java-src">("audits");
  const [loading, setLoading] = useState(false);

  // Java Explorer state
  const [javaFiles, setJavaFiles] = useState<Record<string, string>>({});
  const [selectedJavaFile, setSelectedJavaFile] = useState("SkyReserveApplication.java");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    fetchJavaCodebase();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJavaCodebase = async () => {
    try {
      const res = await fetch("/api/java-code");
      if (res.ok) {
        const data = await res.json();
        setJavaFiles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = () => {
    const code = javaFiles[selectedJavaFile];
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = () => {
    const code = javaFiles[selectedJavaFile];
    if (code) {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedJavaFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Mock Fraud Alerts
  const FRAUD_ALERTS = [
    { id: "FR-401", severity: "HIGH", description: "Suspicious passport sequence reuse detected on multiple international routes", passenger: "John Doe", time: "2026-07-04 11:20 AM" },
    { id: "FR-402", severity: "MEDIUM", description: "Rapid credit card charge retries below rate limit guidelines", passenger: "A. Metkar", time: "2026-07-04 10:45 AM" },
    { id: "FR-403", severity: "LOW", description: "Unusual meal preference override triggers standard security profile review", passenger: "Sarah Smith", time: "2026-07-04 09:12 AM" }
  ];

  return (
    <div id="admin-portal-container" className="space-y-6">
      
      {/* Header and statistics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>Security & Administrative Portal</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            Audit logs, security fraud alert monitors, and Java 21 Spring Boot enterprise sources.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-center">
          <button
            onClick={() => setActiveTab("audits")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === "audits" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400"
            }`}
          >
            Audit Trails
          </button>
          <button
            onClick={() => setActiveTab("fraud")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === "fraud" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400"
            }`}
          >
            Fraud Alerts
          </button>
          <button
            onClick={() => setActiveTab("java-src")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === "java-src" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400"
            }`}
          >
            Java Microservice Codebase
          </button>
        </div>
      </div>

      {/* 1. Audit Trails Tab */}
      {activeTab === "audits" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-500 font-mono">System activities and operator modifications</span>
            <button
              onClick={fetchAuditLogs}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[10px] uppercase font-bold text-slate-400 font-mono">
                  <th className="p-4">Action</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{log.action}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{log.user}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{log.details}</td>
                    <td className="p-4 text-right text-slate-400 font-mono">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Fraud Alerts Tab */}
      {activeTab === "fraud" && (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Real-time Fraud detection engine online</span>
              <p className="leading-relaxed">
                SkyReserve monitoring processes passenger booking frequencies, double passport registers, card handshake rates, and issues instant advisory warnings.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {FRAUD_ALERTS.map(alert => (
              <div key={alert.id} className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black ${
                      alert.severity === 'HIGH' ? 'bg-red-100 text-red-600' : alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {alert.severity} RISK
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{alert.id}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{alert.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Assigned Passenger: {alert.passenger} | Time: {alert.time}</p>
                </div>

                <button
                  onClick={() => window.alert(`Review complete for passenger ${alert.passenger}. Flagged under administrative investigation.`)}
                  className="px-3.5 py-1.5 bg-slate-950 text-white rounded-xl text-[10px] font-bold uppercase transition-all"
                >
                  Action review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Spring Boot Code Explorer Tab */}
      {activeTab === "java-src" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File selector sidebar (Col-4) */}
          <div className="lg:col-span-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-5 shadow-md space-y-4">
            <div>
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>Java Source Files</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">Enterprise Spring Boot 3.2 + Hibernate source tree.</p>
            </div>

            <div className="space-y-1.5">
              {Object.keys(javaFiles).map(fileName => (
                <button
                  key={fileName}
                  onClick={() => setSelectedJavaFile(fileName)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold font-mono truncate transition-all flex items-center space-x-2 border ${
                    selectedJavaFile === fileName
                      ? "bg-indigo-600 text-white border-indigo-500 shadow shadow-indigo-500/20"
                      : "border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-[10px]">☕</span>
                  <span className="truncate">{fileName}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/40 space-y-1.5">
              <h5 className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">Java Production Package</h5>
              <p className="text-[10px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
                Source incorporates Spring Security stateless JWT interceptors, Caffeine database caches, dynamic route controller endpoints, and JPA query mappings.
              </p>
            </div>
          </div>

          {/* Code Viewer (Col-8) */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Toolbar */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-300">{selectedJavaFile}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyCode}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center space-x-1 text-[10px] font-bold font-mono"
                  title="Copy Code"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={downloadFile}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center space-x-1 text-[10px] font-bold font-mono"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 max-h-[480px] overflow-auto">
              <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre font-medium">
                {javaFiles[selectedJavaFile]}
              </pre>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
