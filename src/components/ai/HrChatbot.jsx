import { useState } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const quickReplies = [
  { label: "Leave Rules 📅", query: "What is the leave policy?" },
  { label: "My Balance ⚖️", query: "What is my current leave balance?" },
  { label: "Working Hours ⏰", query: "What are the working hours rules?" },
  { label: "Payroll Details 💵", query: "Explain the payroll policy" }
];

export default function HrChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask me about leave balance, attendance rules, or payroll policy." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input;
    setMessages(m => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/ai/chat/ask", {
        question, employeeId: user?.employeeId
      });
      setMessages(m => [...m, { role: "bot", text: res.data.data }]);
    } catch {
      setMessages(m => [...m, { role: "bot", 
        text: "Sorry, I couldn't process that. Try asking HR directly." }]);
    } finally { setLoading(false); }
  };

  const handleQuickReply = async (query) => {
    setMessages(m => [...m, { role: "user", text: query }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/chat/ask", {
        question: query, employeeId: user?.employeeId
      });
      setMessages(m => [...m, { role: "bot", text: res.data.data }]);
    } catch {
      setMessages(m => [...m, { role: "bot", 
        text: "Sorry, I couldn't process that. Try asking HR directly." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF5A36] 
                   text-white shadow-lg hover:bg-[#E04F2E] hover:scale-105 transition-all 
                   flex items-center justify-center z-50 cursor-pointer border border-white/10">
        {open ? (
          <X size={22}/>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Sparkles size={24} className="text-white fill-none stroke-[2]" />
            <div className="absolute -top-1 -right-1 bg-[#024E31] text-[9px] 
                            font-black text-white px-1.5 py-0.5 rounded-lg 
                            border border-white shadow-sm flex items-center justify-center leading-none">
              AI
            </div>
          </div>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-50 
                        rounded-2xl shadow-2xl border border-slate-100 
                        flex flex-col z-50 overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="bg-[#0f172a] px-4 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#FF7A59] flex items-center justify-center shadow-md">
                <Sparkles size={18} className="text-white fill-none stroke-[2]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f172a] animate-pulse"></span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm leading-tight">WorkMate Assistant</h4>
                <p className="text-gray-400 text-[10px] flex items-center gap-1">
                  <span>AI Copilot</span>
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                  <span>Online</span>
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800">
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`text-xs md:text-sm rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm leading-relaxed transition-all
                  ${m.role === "user" 
                    ? "bg-[#FF5A36] text-white rounded-tr-none font-medium" 
                    : "bg-white text-gray-800 border border-slate-100 rounded-tl-none"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-16 justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#FF5A36] rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-[#FF5A36] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#FF5A36] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies / Suggestions */}
          <div className="px-4 py-2.5 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-none border-t border-slate-100 select-none">
            {quickReplies.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(r.query)}
                className="whitespace-nowrap bg-white border border-slate-200 hover:border-[#FF5A36]/40 hover:bg-[#FF5A36]/5 text-[11px] text-slate-600 font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about leave, payroll, attendance…"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 
                         text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#FF5A36]/20 
                         focus:border-[#FF5A36]/60 transition-all text-gray-800 placeholder-gray-400"
            />
            <button 
              onClick={send}
              className="w-9 h-9 rounded-full bg-[#FF5A36] hover:bg-[#E04F2E] text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm active:scale-95 cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
