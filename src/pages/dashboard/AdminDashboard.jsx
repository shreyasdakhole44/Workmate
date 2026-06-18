import React, { useEffect, useState } from "react";
import { employeeAPI, leaveAPI, attendanceAPI, onboardingAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, Calendar, Clock, ArrowRight, CheckCircle, XCircle, Briefcase, ClipboardCheck, 
  DollarSign, Activity, UserPlus, ChevronDown, Search, Lightbulb, Bell, LogOut, Award, 
  FileText, Heart, MessageSquare, Download, Sparkles, Send, LayoutDashboard, UserCircle, Plus, Smile, Star
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from "recharts";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// 1. COLLAPSIBLE CARD WIDGET
// ==========================================
const CollapsibleCard = ({ title, count, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4.5 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors border-b border-gray-150 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[11px] text-gray-800 uppercase tracking-wider">{title}</span>
          {count !== undefined && (
            <span className="bg-slate-100 text-gray-650 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [empTotal, setEmpTotal] = useState(null);
  const [pending, setPending] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Feed / Cheer state
  const [cheeredState, setCheeredState] = useState({});
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      author: "WorkMate Admin Console",
      role: "System Audit Log",
      time: "Just now",
      content: "System-wide automated payslips generation sequence has completed successfully. All PDF files compiled using iText7 and archived for staff portals access. PF/TDS tax deductions computed.",
      likes: 5,
      comments: 0,
      tag: "System Status"
    },
    {
      id: 2,
      author: "Shreyas Prakash Dakhole",
      role: "Lead Administrator",
      time: "3h ago",
      content: "System designation promotions successfully processed: Shreyas promoted to Senior Lead React Architect. Salary updates synchronized with payroll database schedules.",
      likes: 42,
      comments: 8,
      tag: "Promotion Log"
    }
  ]);
  const [postText, setPostText] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);

  // AI Assistant Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "Hello Administrator! I am your WorkMate System Audit AI Assistant. I can generate database reports, fetch system performance logs, or draft payroll notifications. How can I serve you?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, pendRes, todayRes, onboardRes] = await Promise.all([
        employeeAPI.getAll(0, 1),
        leaveAPI.pending(),
        attendanceAPI.byDate(todayStr).catch(() => ({ data: { data: [] } })),
        onboardingAPI.getAllProgress().catch(() => ({ data: { data: [] } }))
      ]);
      setEmpTotal(empRes.data.data?.totalElements ?? 0);
      setPending(pendRes.data.data || []);
      setTodayLogs(todayRes.data.data || []);
      setOnboardings(onboardRes.data.data || []);
    } catch (e) {
      toast.error("Failed to load administrator console data");
    } finally {
      setLoading(false);
    }
  };

  const approveLeave = async (id) => {
    try {
      await leaveAPI.approve(id, user?.userId);
      toast.success("Leave request approved successfully!");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve leave");
    }
  };

  const rejectLeave = async (id) => {
    try {
      await leaveAPI.reject(id, user?.userId, "Rejected by Administrator");
      toast.success("Leave request rejected");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reject leave");
    }
  };

  const handleCheer = (postId) => {
    const isCheered = cheeredState[postId];
    setCheeredState(prev => ({ ...prev, [postId]: !isCheered }));
    setFeedPosts(feedPosts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: isCheered ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const submitPost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: user?.fullName || "Administrator",
      role: "System Administrator",
      time: "Just now",
      content: postText,
      likes: 0,
      comments: 0,
      tag: "System Announcement"
    };

    setFeedPosts([newPost, ...feedPosts]);
    setPostText("");
    setPostModalOpen(false);
    toast.success("System Announcement published!");
  };

  const sendAiMessage = (textToSend) => {
    const userText = textToSend || aiInput;
    if (!userText.trim()) return;

    const newMsg = { sender: "user", text: userText };
    setAiMessages(prev => [...prev, newMsg]);
    setAiInput("");
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      let replyText = "Querying system diagnostics via Spring AI...";
      
      const textLower = userText.toLowerCase();
      if (textLower.includes("performance") || textLower.includes("health")) {
        replyText = "System Health: OK. Backend Framework: Spring Boot 3.5.0, Java 24 VM, Database: MySQL 9 (Active). Latency: 12ms. Server Uptime: 99.98% SLA.";
      } else if (textLower.includes("audit") || textLower.includes("reports")) {
        replyText = "Drafting audit report template: 'System Audit Log - June 2026. Activities processed: 4 leaves approvals, 1 designation promotion, 24 payslip generations. Security validation: JWT + BCrypt layer fully operational.'";
      } else if (textLower.includes("payroll") || textLower.includes("calculate")) {
        replyText = "Indian Statutory deductions computed: Basic 50%, HRA 20%, Allowances 30%, EPF deducted at 12%, TDS mapped to Old/New Tax Regime tables successfully.";
      } else if (textLower.includes("hello") || textLower.includes("hi")) {
        replyText = "Hello Administrator! I can generate server diagnostics, check role clearance flags, or draft system-wide payroll announcements. What is your request?";
      }

      setAiMessages(prev => [...prev, { sender: "ai", text: replyText }]);
    }, 1000);
  };

  const presentToday = todayLogs.filter(l => l.status === "PRESENT" || l.status === "WFH").length;
  const attendanceRate = empTotal > 0 ? Math.round((presentToday / empTotal) * 100) : 0;

  // Recharts Data (Green matching HROne styling)
  const deptData = [
    { name: "IT", value: 12, fill: "#0A5C36" },
    { name: "HR", value: 4, fill: "#138F56" },
    { name: "Finance", value: 3, fill: "#35B97D" },
    { name: "Sales", value: 8, fill: "#0A5C36" },
    { name: "Support", value: 6, fill: "#138F56" }
  ];

  const recentActivities = [
    { id: 1, text: "System generated monthly payslips", time: "2 hours ago" },
    { id: 2, text: "Administrator promoted Shreyas Dakhole to Senior Lead", time: "4 hours ago" },
    { id: 3, text: "New job posting published for React Developer", time: "1 day ago" },
    { id: 4, text: "Marked payroll settings audit configuration complete", time: "2 days ago" },
    { id: 5, text: "Onboarding checklist assigned to 3 new candidates", time: "3 days ago" },
  ];

  return (
    <div className="fixed inset-0 z-30 flex bg-[#F0F4F2] overflow-hidden antialiased text-gray-700">
      
      {/* ==========================================
          LEFT SLIM SIDEBAR (White, Green Active)
         ========================================== */}
      <aside className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col justify-between items-center py-5 shrink-0 z-10">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-10 h-10 bg-[#0A5C36] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-sm tracking-tight">W</span>
          </div>

          <div className="flex flex-col items-center gap-3 w-full px-2">
            {[
              { to: "/dashboard", icon: LayoutDashboard, active: true, label: "Home" },
              { to: "/employees", icon: Users, label: "Employees" },
              { to: "/recruitment", icon: ClipboardCheck, label: "Recruitment" },
              { to: "/onboarding", icon: ClipboardCheck, label: "Onboarding" },
              { to: "/attendance", icon: Clock, label: "Attendance" },
              { to: "/leave", icon: Calendar, label: "Leave" },
              { to: "/performance", icon: Star, label: "Reviews" },
              { to: "/payroll", icon: DollarSign, label: "Payroll" },
              { to: "/profile", icon: UserCircle, label: "Profile" }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.to)}
                title={item.label}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  item.active 
                    ? "bg-[#0A5C36]/10 text-[#0A5C36] border border-[#0A5C36]/20 font-bold" 
                    : "text-gray-450 hover:bg-slate-50 hover:text-[#0A5C36]"
                }`}
              >
                {item.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0A5C36] rounded-r-full" />
                )}
                <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { logout(); navigate("/login"); }}
          title="Sign Out"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer group relative"
        >
          <LogOut size={18} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
            Sign Out
          </span>
        </button>
      </aside>

      {/* ==========================================
          RIGHT VIEWPORT CONTAINER
         ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOP BAR */}
        <header className="h-14 bg-[#0A5C36] text-white px-5 md:px-8 flex items-center justify-between shrink-0 shadow-sm border-b border-white/5 relative z-20">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[12px] md:text-sm tracking-wider uppercase">TALENTRIX SOLUTION</span>
          </div>

          <div className="hidden sm:block relative w-80 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-lg pl-9.5 pr-4 py-1.5 text-xs focus:outline-none shadow-sm focus:ring-1 focus:ring-emerald-300"
              placeholder="Search for requests, reports, people..."
            />
          </div>

          <div className="flex items-center gap-3.5">
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Leaves Awaiting Sign-off">
              <Calendar size={18} />
              {pending.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#F05537] rounded-full" />
              )}
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer animate-pulse" title="System Logs">
              <Activity size={18} />
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Alerts">
              <Bell size={18} />
            </button>
            <div className="h-7 w-px bg-white/10" />
            
            <div className="flex items-center gap-2">
              <div className="w-8.5 h-8.5 rounded-full bg-white/10 text-white font-extrabold border border-white/20 flex items-center justify-center text-xs shadow-sm">
                {(user?.fullName || "AD")[0]}
              </div>
              <span className="hidden md:inline text-xs font-bold tracking-tight text-white/90">
                {user?.fullName?.split(" ")?.[0]}
              </span>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL WINDOW */}
        <div className="flex-1 overflow-y-auto bg-[#F0F4F2] pb-10">
          
          {/* GREEN BANNER */}
          <div className="bg-[#0A5C36] pb-24 pt-6 px-6 md:px-8 text-white text-left relative z-0 border-t border-white/5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName?.split(" ")?.[0] || "Administrator"}!
            </h1>
            <p className="text-white/70 text-xs mt-1.5 font-semibold">Admin Control Console · Review headcount charts, audit configurations, and run salary cycles</p>
          </div>

          {/* PAGE CONTENT CONTAINER */}
          <div className="px-5 md:px-8 -mt-14 space-y-6 relative z-10 max-w-7xl mx-auto">
            
            {/* FLOATING ACTION TAB BAR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setPostModalOpen(true)}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <MessageSquare size={13} className="text-gray-400" /> System Post
                </button>
                <button 
                  onClick={() => navigate("/employees")}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <UserPlus size={13} className="text-blue-500" /> Add Employee
                </button>
                <button 
                  onClick={() => navigate("/recruitment")}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <Briefcase size={13} className="text-purple-500" /> Post Job opening
                </button>
                <button 
                  onClick={() => navigate("/payroll")}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <DollarSign size={13} className="text-emerald-500" /> Payroll Ledger
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 hidden md:block" />
              <div className="text-[11px] font-bold text-[#0A5C36] bg-[#0A5C36]/5 rounded-lg px-3.5 py-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#0A5C36] rounded-full animate-ping" />
                Admin Console Mode
              </div>
            </div>

            {/* STATS TILES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Headcount Total</p>
                <span className="text-lg md:text-2xl font-black text-[#1E2A4A] block mt-1">{empTotal ?? "—"} Profiles</span>
              </div>
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pending Sign-off</p>
                <span className="text-lg md:text-2xl font-black text-rose-600 block mt-1">{pending.length} Requests</span>
              </div>
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Checked In Today</p>
                <span className="text-lg md:text-2xl font-black text-emerald-600 block mt-1">{presentToday} ({attendanceRate}%)</span>
              </div>
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Job Posts</p>
                <span className="text-lg md:text-2xl font-black text-indigo-650 block mt-1">5 Positions</span>
              </div>
            </div>

            {/* THREE COLUMNS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. SYSTEM COMMAND SHORTCUTS */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-4">
                  <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">System Actions</h4>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <Link to="/employees" className="flex items-center gap-3 p-3 rounded-lg border border-gray-150 hover:bg-slate-50 transition-colors group text-xs font-semibold text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <UserPlus size={15} />
                      </div>
                      <div>
                        <p className="font-bold">Add New Employee</p>
                        <p className="text-[9px] text-gray-400">Register profile & details</p>
                      </div>
                    </Link>
                    <Link to="/recruitment" className="flex items-center gap-3 p-3 rounded-lg border border-gray-150 hover:bg-slate-50 transition-colors group text-xs font-semibold text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Briefcase size={15} />
                      </div>
                      <div>
                        <p className="font-bold">Recruitment Pipeline</p>
                        <p className="text-[9px] text-gray-400">Manage candidate reviews</p>
                      </div>
                    </Link>
                    <Link to="/payroll" className="flex items-center gap-3 p-3 rounded-lg border border-gray-150 hover:bg-slate-50 transition-colors group text-xs font-semibold text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-605 flex items-center justify-center shrink-0">
                        <DollarSign size={15} />
                      </div>
                      <div>
                        <p className="font-bold">Payroll Settings</p>
                        <p className="text-[9px] text-gray-400">Distribute monthly PDF slips</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* 2. LEAVE APPROVAL QUEUE */}
                <CollapsibleCard title="Leave Approval Queue" count={pending.length}>
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-10 bg-slate-100 rounded" />
                    </div>
                  ) : pending.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-450 flex flex-col items-center gap-1.5">
                      <CheckCircle size={22} className="text-emerald-500" />
                      <span>No pending leave requests.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pending.slice(0, 3).map(l => (
                        <div key={l.id} className="p-3 border border-gray-150 rounded-xl bg-slate-50/50 flex flex-col gap-2.5 text-left shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-gray-800">{l.employeeName}</h4>
                              <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{l.leaveTypeName} · {l.totalDays} Day{l.totalDays !== 1 ? "s" : ""}</p>
                            </div>
                            <span className="text-[9px] text-gray-450 font-bold">{l.fromDate}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button onClick={() => approveLeave(l.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1.5 rounded-lg cursor-pointer">Approve</button>
                            <button onClick={() => rejectLeave(l.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-bold py-1.5 rounded-lg cursor-pointer">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleCard>
              </div>

              {/* CENTER COLUMN: CHART & FEED */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* HEADCOUNT CHART */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left">
                  <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Headcount by Department</h3>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                        <XAxis type="number" fontSize={9} stroke="#9ca3af" tickLine={false} axisLine={false}/>
                        <YAxis dataKey="name" type="category" fontSize={9} stroke="#9ca3af" tickLine={false} axisLine={false}/>
                        <Tooltip contentStyle={{ backgroundColor: "#0A5C36", color: "#fff", border: "none", fontSize: 10, borderRadius: 8 }} labelStyle={{ color: "#fff" }}/>
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                          {deptData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SYSTEM FEED LOGS */}
                <div className="space-y-4">
                  {feedPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-xs text-left space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8.5 h-8.5 rounded-full bg-[#0A5C36]/10 text-[#0A5C36] font-bold flex items-center justify-center text-xs">
                            {post.author?.[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                              {post.author}
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-50 text-emerald-700 border border-gray-150">{post.tag}</span>
                            </h4>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{post.role} · {post.time}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-650 leading-relaxed font-semibold">{post.content}</p>

                      <div className="h-px bg-gray-100" />
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
                        <button onClick={() => handleCheer(post.id)} className={`flex items-center gap-1 py-1 px-2.5 rounded transition-all cursor-pointer ${
                          cheeredState[post.id] ? "bg-blue-50 text-blue-650" : "hover:bg-slate-50"
                        }`}>
                          <Heart size={13} fill={cheeredState[post.id] ? "currentColor" : "none"} />
                          <span>Like ({post.likes})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: RECENT ACTIVITIES */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* RECENT ACTIVITIES (HROne Timeline) */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-4">
                  <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">System Activity</h3>
                  
                  <div className="flow-root pl-1">
                    <ul className="-mb-8">
                      {recentActivities.map((act, idx) => (
                        <li key={act.id}>
                          <div className="relative pb-6 text-left">
                            {idx !== recentActivities.length - 1 ? (
                              <span className="absolute top-4 left-3.5 -ml-px h-full w-0.5 bg-gray-100" />
                            ) : null}
                            <div className="relative flex space-x-3.5">
                              <div>
                                <span className="h-7 w-7 rounded-full bg-slate-105 border border-gray-150 text-[#0A5C36] flex items-center justify-center ring-4 ring-white shrink-0">
                                  <Activity size={12} />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[11px] text-gray-700 font-bold leading-tight">{act.text}</p>
                                <span className="text-[9px] text-gray-400 font-semibold mt-1 block">{act.time}</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* RUNTIME ENVIRONMENT STATS */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-3">
                  <h4 className="text-[11px] font-black text-gray-850 uppercase tracking-wider pb-2 border-b border-gray-100">System Environment</h4>
                  <div className="space-y-2 text-[9px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Server Engine</span>
                      <span className="text-gray-850">Spring Boot 3.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Runtime VM</span>
                      <span className="text-gray-850">Java 24 (LTS)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security API</span>
                      <span className="text-[#0A5C36]">JWT Clearance</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Model</span>
                      <span className="text-purple-650">Spring AI Client</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SPRING AI FLOATING ASSISTANT */}
        <div 
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
          className="fixed right-6 bottom-6 z-40 bg-[#F05537] text-white w-14 h-14 rounded-full shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 flex items-center justify-center cursor-pointer hover:scale-105 transition-all group animate-pulse"
        >
          <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute right-0 top-0 bg-[#0A5C36] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white">
            AI
          </span>
        </div>

        {/* AI DRAWER MODAL */}
        <AnimatePresence>
          {aiDrawerOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setAiDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-[#0F172A]"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-white z-50 shadow-2xl flex flex-col justify-between"
              >
                <div className="bg-[#0A5C36] text-white p-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">WorkMate AI Assistant</h4>
                      <p className="text-[9px] text-emerald-200 mt-0.5 font-semibold">Spring AI + RAG active</p>
                    </div>
                  </div>
                  <button onClick={() => setAiDrawerOpen(false)} className="text-white/80 hover:text-white text-xs font-extrabold cursor-pointer">Close</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} text-left`}>
                      <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.sender === "user" ? "bg-[#0A5C36] text-white rounded-br-none" : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiTyping && (
                    <div className="flex justify-start text-left">
                      <div className="bg-white text-gray-400 border border-gray-200 rounded-xl rounded-bl-none p-3 text-xs flex items-center gap-1 animate-pulse">
                        <span>AI diagnostics running...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 border-t border-gray-150 space-y-3 shrink-0 bg-white">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-left font-extrabold">Quick Actions</p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        "Query server VM health diagnostics",
                        "Show system audit logs template",
                        "Calculate Indian statutory EPF/TDS formulas"
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendAiMessage(prompt)}
                          className="bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold text-gray-650 text-left transition-colors cursor-pointer w-full block"
                        >
                          ✦ {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); sendAiMessage(); }} className="flex gap-2 pt-1.5">
                    <input 
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-250 rounded-lg px-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none h-9 bg-slate-50"
                    />
                    <button type="submit" className="bg-[#0A5C36] hover:bg-[#084f2e] text-white p-2 rounded-lg transition-colors cursor-pointer w-9 shrink-0 flex items-center justify-center">
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* SYSTEM POST MODAL */}
      <AnimatePresence>
        {postModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setPostModalOpen(false)} className="fixed inset-0 bg-[#0F172A]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-gray-150">
              <h3 className="text-sm font-extrabold text-gray-900 text-left mb-4 uppercase tracking-wider">Create System Broadcast</h3>
              <form onSubmit={submitPost} className="space-y-4 text-left">
                <div>
                  <textarea
                    rows={4}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Type server audits, promotion logs, or payslip distribution updates..."
                    className="w-full border border-gray-250 rounded-lg p-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-slate-50"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setPostModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-650 text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="bg-[#0A5C36] hover:bg-[#084f2e] text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer">Broadcast</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
