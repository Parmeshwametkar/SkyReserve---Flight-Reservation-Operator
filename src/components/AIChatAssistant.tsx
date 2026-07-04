import { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, UserCheck, HelpCircle, ArrowRight, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Welcome aboard! I am SkyReserve's AI Co-Pilot. How can I assist you with your flight reservations or enterprise Spring Boot microservice architectures today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "model", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", content: "Apologies, the secure aviation router is having trouble. Please check back shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  const PRE_FILLED_PROMPTS = [
    "Predict price JFK to LHR",
    "Where is the Spring Boot code?",
    "Show me exit row rules"
  ];

  return (
    <div id="ai-chat-widget" className="fixed bottom-6 right-6 z-50">
      
      {/* Chat Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center relative group transition-all transform hover:scale-105 cursor-pointer border border-indigo-400/20"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute right-14 bg-slate-900/90 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Talk to AI Co-Pilot
          </span>
        </button>
      )}

      {/* Floating Chat Panel Box */}
      {isOpen && (
        <div className="w-80 h-[440px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <div>
                <span className="text-xs font-black tracking-wider uppercase block">SkyReserve Co-Pilot</span>
                <span className="text-[9px] text-white/70 font-mono font-medium block">Enterprise Gemini Core v2.5</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/15 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100/50">
            {messages.map((m, idx) => {
              const isAi = m.role === "model";
              return (
                <div key={idx} className={`flex items-start space-x-2 pt-2 first:pt-0 ${isAi ? "justify-start" : "justify-end"}`}>
                  {isAi && (
                    <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-[10px] text-white font-bold">AI</span>
                  )}
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isAi
                      ? "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-tl-sm border border-slate-200/40"
                      : "bg-indigo-600 text-white rounded-tr-sm shadow-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-mono p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Co-Pilot is typing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested Quick Prompts */}
          {messages.length < 3 && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
              {PRE_FILLED_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Chat input box */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex space-x-2 items-center">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => sendMessage(input)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
