import React, { useEffect, useState } from "react";
import { employeeAPI, leaveAPI, attendanceAPI, onboardingAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import { 
  Users, Calendar, Clock, ArrowRight, CheckCircle, XCircle, Briefcase, ClipboardCheck, 
  DollarSign, Activity, UserPlus, ChevronDown, Search, Lightbulb, Bell, LogOut, Award, 
  FileText, Heart, MessageSquare, Download, Sparkles, Send, LayoutDashboard, UserCircle, Plus, Smile, Star,
  ClipboardList, UserCheck, TrendingUp, Settings
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, LabelList
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
// 1.5. REUSABLE KPI CARD & ACTIVITY MAP
// ==========================================
const KpiCard = ({ label, icon: Icon, iconBg, iconColor, value, valueColor = "#111827", trend }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{backgroundColor: iconBg}}>
        <Icon size={16} style={{color: iconColor}} />
      </div>
    </div>
    <p className="text-3xl font-bold" style={{color: valueColor}}>{value}</p>
    {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
  </div>
);

const activityIconMap = {
  payslip: { icon: FileText, bg: "#E6F4EA", color: "#0F766E" }, // emerald
  promotion: { icon: TrendingUp, bg: "#F3E8FF", color: "#7C3AED" }, // purple
  job_posted: { icon: Briefcase, bg: "#E8F0FE", color: "#2563EB" }, // blue
  config: { icon: Settings, bg: "#FEF3C7", color: "#D97706" }, // amber
  onboarding: { icon: ClipboardCheck, bg: "#E6FFFA", color: "#0D9488" } // teal
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
    },
    {
      id: 3,
      author: "WorkMate Admin Console",
      role: "Security Audit",
      time: "1d ago",
      content: "SSL Certificates for api.workmate.com have been renewed successfully. Automated vulnerability scanning and penetration test completed with zero critical vulnerabilities reported.",
      likes: 12,
      comments: 1,
      tag: "Security"
    },
    {
      id: 4,
      author: "WorkMate Admin Console",
      role: "Database Scheduler",
      time: "2d ago",
      content: "Automated full database backup completed successfully. Archive compressed and stored on AWS S3 Glacier storage class for compliance and disaster recovery plans.",
      likes: 9,
      comments: 0,
      tag: "Backups"
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
        attendanceAPI.byDate(todayStr),
        onboardingAPI.getAllProgress()
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
    { dept: "IT", count: 12 },
    { dept: "HR", count: 4 },
    { dept: "Finance", count: 3 },
    { dept: "Sales", count: 8 },
    { dept: "Support", count: 6 }
  ];

  const recentActivities = [
    { id: 1, text: "System generated monthly payslips", timeAgo: "2 hours ago", type: "payslip" },
    { id: 2, text: "Administrator promoted Shreyas Dakhole to Senior Lead", timeAgo: "4 hours ago", type: "promotion" },
    { id: 3, text: "New job posting published for React Developer", timeAgo: "1 day ago", type: "job_posted" },
    { id: 4, text: "Marked payroll settings audit configuration complete", timeAgo: "2 days ago", type: "config" },
    { id: 5, text: "Onboarding checklist assigned to 3 new candidates", timeAgo: "3 days ago", type: "onboarding" },
  ];

  return (
    <div className="w-full pb-10">
      {/* GREEN BANNER */}
      <div className="bg-[#0B3D2E] pb-24 pt-6 px-8 text-white text-left relative z-0 border-t border-white/5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Hello, {user?.fullName?.split(" ")?.[0] || "Administrator"}!
        </h1>
        <p className="text-white/70 text-xs mt-1.5 font-semibold">Admin Control Console · Review headcount charts, audit configurations, and run salary cycles</p>
      </div>

          {/* PAGE CONTENT CONTAINER */}
          <div className="px-8 -mt-14 space-y-6 relative z-10 w-full max-w-screen-2xl mx-auto">
            
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
              <KpiCard label="Headcount Total" icon={Users} iconBg="#EFF6FF" iconColor="#2563EB" value={`${empTotal ?? "—"} Profiles`} valueColor="#1E2A4A" />
              <KpiCard label="Pending Sign-off" icon={ClipboardList} iconBg="#FEF2F2" iconColor="#DC2626" value={`${pending.length} Requests`} valueColor="#DC2626" />
              <KpiCard label="Checked In Today" icon={UserCheck} iconBg="#ECFDF5" iconColor="#059669" value={`${presentToday} (${attendanceRate}%)`} valueColor="#059669" />
              <KpiCard label="Active Job Posts" icon={Briefcase} iconBg="#F5F3FF" iconColor="#7C3AED" value="5 Positions" valueColor="#4F46E5" />
            </div>

            {/* THREE COLUMNS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. SYSTEM COMMAND SHORTCUTS */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-4">
                  <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">System Actions</h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Link to="/employees" className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-100 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group text-xs font-semibold text-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <UserPlus size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Add New Employee</p>
                        <p className="text-[10px] text-gray-500">Register profile & details</p>
                      </div>
                    </Link>
                    <Link to="/recruitment" className="flex items-center gap-3 p-3 rounded-xl border bg-white border-gray-100 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group text-xs font-semibold text-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Recruitment Pipeline</p>
                        <p className="text-[10px] text-gray-500">Manage candidate reviews</p>
                      </div>
                    </Link>
                    <Link to="/payroll" className="flex items-center gap-3 p-3 rounded-xl border bg-white border-gray-100 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group text-xs font-semibold text-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Payroll Settings</p>
                        <p className="text-[10px] text-gray-500">Distribute monthly PDF slips</p>
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
                    <div className="flex flex-col items-center justify-center py-10 text-center w-full">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                        <CheckCircle size={24} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-gray-750">All caught up!</p>
                      <p className="text-xs text-gray-400 mt-1">No pending leave requests right now.</p>
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
                  <div className="h-52 w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={deptData} layout="vertical" margin={{left: 20}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{fontSize: 11, fill: "#94A3B8"}} />
                        <YAxis type="category" dataKey="dept" tick={{fontSize: 12, fill: "#374151", fontWeight: 500}} width={60} />
                        <Tooltip contentStyle={{fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0"}} />
                        <Bar dataKey="count" fill="#0F766E" radius={[0, 6, 6, 0]} maxBarSize={20}>
                          <LabelList dataKey="count" position="right" style={{fontSize: 11, fontWeight: 600, fill: "#374151"}} />
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
                          <Avatar name={post.author} size="sm" />
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                              {post.author}
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-50 text-emerald-700 border border-gray-150">{post.tag}</span>
                            </h4>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{post.role} · {post.time}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-650 leading-relaxed font-normal">{post.content}</p>

                      <div className="h-px bg-gray-100" />
                      <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-500">
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
                  
                  <div className="flex flex-col">
                    {recentActivities.map((act) => {
                      const iconConfig = activityIconMap[act.type] || { icon: Activity, bg: "#F1F5F9", color: "#64748B" };
                      const Icon = iconConfig.icon;
                      return (
                        <div key={act.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: iconConfig.bg}}>
                            <Icon size={14} style={{color: iconConfig.color}} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-snug">{act.text}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{act.timeAgo}</p>
                          </div>
                        </div>
                      );
                    })}
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
