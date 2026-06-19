import React, { useEffect, useState } from "react";
import { employeeAPI, leaveAPI, attendanceAPI, onboardingAPI, recruitmentAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import { 
  Users, Calendar, Clock, ArrowRight, CheckCircle, XCircle, ClipboardCheck, 
  Activity, ChevronDown, Search, Lightbulb, Bell, LogOut, Award, FileText, 
  Heart, MessageSquare, Download, Sparkles, Send, LayoutDashboard, DollarSign, UserCircle, Plus, Smile, Star
} from "lucide-react";
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
export default function HRDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [empTotal, setEmpTotal] = useState(null);
  const [pending, setPending] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Custom Feed & Interaction States
  const [cheeredState, setCheeredState] = useState({});
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      author: "Talentrix HR Team",
      role: "System Announcement",
      time: "1h ago",
      content: "All HR managers: Q2 appraisal review cycles are officially active. Please ensure employee self-evaluations are completed and manager appraisals are submitted on time. Use Spring AI performance review summaries to draft professional templates.",
      likes: 15,
      comments: 3,
      tag: "Alert"
    },
    {
      id: 2,
      author: "Varun Khanna",
      role: "Engineering Team Lead",
      time: "1d ago",
      content: "We welcomed 2 new developers to the IT team today! Onboarding checklists have been successfully seeded for document verification. Looking forward to coding together!",
      likes: 24,
      comments: 6,
      tag: "Social"
    },
    {
      id: 3,
      author: "Sarah Jenkins",
      role: "HR Director",
      time: "2d ago",
      content: "Reminder: The monthly wellness program starts this Friday. Please register on the wellness channel. We will have interactive yoga sessions and health checkup camps.",
      likes: 31,
      comments: 4,
      tag: "Wellness"
    },
    {
      id: 4,
      author: "Amit Sharma",
      role: "Finance Manager",
      time: "3d ago",
      content: "Investment declaration window for tax savings is open. Please upload your investment proofs (80C, 80D, etc.) in the Payroll Hub before the end of the month to avoid extra TDS deductions.",
      likes: 18,
      comments: 9,
      tag: "Finance"
    }
  ]);
  const [postText, setPostText] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);

  // AI Assistant Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "Hello! I am your WorkMate HR Operations AI Assistant. I can draft policy announcements, generate onboarding checklist items, or query candidate pipelines. What can I do for you?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, pendRes, todayRes, onboardRes, jobsRes] = await Promise.all([
        employeeAPI.getAll(0, 1),
        leaveAPI.pending(),
        attendanceAPI.byDate(todayStr),
        onboardingAPI.getAllProgress(),
        recruitmentAPI.getActiveJobs().catch(() => ({ data: { data: [] } }))
      ]);
      setEmpTotal(empRes.data.data?.totalElements ?? 0);
      setPending(pendRes.data.data || []);
      setTodayLogs(todayRes.data.data || []);
      setOnboardings(onboardRes.data.data || []);
      setActiveJobsCount(jobsRes.data.data?.length ?? 0);
    } catch (e) {
      toast.error("Failed to load HR dashboard console");
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
      await leaveAPI.reject(id, user?.userId, "Rejected by HR Manager");
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
      author: user?.fullName || "HR Manager",
      role: "HR Operations Manager",
      time: "Just now",
      content: postText,
      likes: 0,
      comments: 0,
      tag: "Announcement"
    };

    setFeedPosts([newPost, ...feedPosts]);
    setPostText("");
    setPostModalOpen(false);
    toast.success("HR Announcement published successfully!");
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
      let replyText = "Querying Spring AI RAG context for HR Operations...";
      
      const textLower = userText.toLowerCase();
      if (textLower.includes("onboarding") || textLower.includes("checklist")) {
        replyText = "Here are recommended onboarding checklist tasks to seed for new hires: 1. Submit Aadhaar & PAN Card (Document), 2. Dispatch Workmate Slack invitation (IT_Setup), 3. Sign employee NDA policy (HR Approval), 4. Assign buddy contact details (Orientation).";
      } else if (textLower.includes("leave") || textLower.includes("pending")) {
        replyText = `There are currently ${pending.length} pending leave requests in the queue requiring your review. You can approve them directly using the Leave Approval Queue card.`;
      } else if (textLower.includes("announcement") || textLower.includes("draft")) {
        replyText = `Here is a drafted announcement template: "Subject: Q2 Core Value Recognitions. All departments are requested to submit peer endorsement badges by June 30. Award types include Star Performer, Team Player, and Out of the Box Thinker. Thank you."`;
      } else if (textLower.includes("hello") || textLower.includes("hi")) {
        replyText = "Hello HR Manager! I can help you draft warning letters, compile onboarding checklist seeds, or look up candidate review tables. How can I assist?";
      }

      setAiMessages(prev => [...prev, { sender: "ai", text: replyText }]);
    }, 1000);
  };

  const presentToday = todayLogs.filter(l => l.status === "PRESENT" || l.status === "WFH").length;
  const newCandidatesCount = 4; // Mock recruitment pipeline

  return (
    <div className="fixed inset-0 z-30 flex bg-[#F0F4F2] overflow-hidden antialiased text-gray-700">
      
      {/* ==========================================
          LEFT SLIM SIDEBAR (Green, Orange Active)
         ========================================== */}
      <aside className="w-14 bg-[#0A5C36] border-r border-[#084f2e] flex flex-col justify-between items-center py-5 shrink-0 z-10">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo Mark */}
          <div 
            onClick={() => navigate("/dashboard")}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
          >
            <span className="text-[#0A5C36] font-black text-sm">W</span>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col items-center gap-3 w-full">
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
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group active:scale-[0.95] ${
                  item.active 
                    ? "bg-white/10 text-white border-l-2 border-[#E8420A] rounded-l-none pl-0.5 font-bold" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
                <span className="absolute left-full ml-3 px-2 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={() => { logout(); navigate("/login"); }}
          title="Sign Out"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer group relative"
        >
          <LogOut size={16} />
          <span className="absolute left-full ml-3 px-2 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
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
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Pending Leaves">
              <Calendar size={18} />
              {pending.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#F05537] rounded-full" />
              )}
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer animate-pulse" title="Spring AI Operations">
              <Sparkles size={18} />
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="System Alerts">
              <Bell size={18} />
            </button>
            <div className="h-7 w-px bg-white/10" />
            
            <div className="flex items-center gap-2">
              <Avatar name={user?.fullName || "HR"} size="sm" />
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
              Hello, {user?.fullName?.split(" ")?.[0] || "HR Manager"}!
            </h1>
            <p className="text-white/70 text-xs mt-1.5 font-semibold">HR Operations Workspace · Manage logs, onboarding & leaves approvals</p>
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
                  <MessageSquare size={13} className="text-gray-400" /> Write Announcement
                </button>
                <button 
                  onClick={() => navigate("/employees")}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <Users size={13} className="text-blue-500" /> Employee Profiles
                </button>
                <button 
                  onClick={() => navigate("/onboarding")}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <Plus size={13} className="text-purple-500" /> Seed Onboarding
                </button>
                <button 
                  onClick={() => navigate("/payroll")}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <DollarSign size={13} className="text-emerald-500" /> Run Payroll
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 hidden md:block" />
              <div className="text-[11px] font-bold text-[#0A5C36] bg-[#0A5C36]/5 rounded-lg px-3.5 py-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#0A5C36] rounded-full animate-ping" />
                HR Operations Console
              </div>
            </div>

            {/* STATS TILES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Employees</p>
                <span className="text-lg md:text-2xl font-black text-[#1E2A4A] block mt-1">{empTotal ?? "—"}</span>
              </div>
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pending Leaves</p>
                <span className="text-lg md:text-2xl font-black text-rose-600 block mt-1">{pending.length}</span>
              </div>
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Present Today</p>
                <span className="text-lg md:text-2xl font-black text-emerald-600 block mt-1">{presentToday}</span>
              </div>
              <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-4 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Jobs</p>
                <span className="text-lg md:text-2xl font-black text-indigo-650 block mt-1">{activeJobsCount}</span>
              </div>
            </div>

            {/* THREE COLUMNS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. LEAVE APPROVAL QUEUE */}
                <CollapsibleCard title="Leave Approval Queue" count={pending.length}>
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-10 bg-slate-100 rounded" />
                      <div className="h-10 bg-slate-100 rounded" />
                    </div>
                  ) : pending.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-450 flex flex-col items-center gap-1.5">
                      <CheckCircle size={22} className="text-emerald-500" />
                      <span>All caught up! No pending leave requests.</span>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {pending.slice(0, 4).map(l => (
                        <div key={l.id} className="p-3 border border-gray-150 rounded-xl bg-slate-50/50 flex flex-col gap-2.5 text-left shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-gray-800">{l.employeeName}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{l.leaveTypeName} · {l.totalDays} Day{l.totalDays !== 1 ? "s" : ""}</p>
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold">{l.fromDate} to {l.toDate}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => approveLeave(l.id)} 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => rejectLeave(l.id)} 
                              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleCard>

                {/* 2. NEW EMPLOYEE ONBOARDING PROGRESS */}
                <CollapsibleCard title="Onboarding Progress" count={onboardings.length}>
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-8 bg-slate-100 rounded" />
                    </div>
                  ) : onboardings.length === 0 ? (
                    <p className="text-[10px] text-gray-400">No active onboardings.</p>
                  ) : (
                    <div className="space-y-3.5 text-left">
                      {onboardings.slice(0, 4).map(emp => (
                        <div key={emp.employeeId} className="border border-gray-150 rounded-xl p-3 bg-slate-50/50 space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="text-xs font-bold text-gray-800">{emp.employeeName}</h5>
                              <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{emp.empCode} · {emp.department}</p>
                            </div>
                            <span className="text-[10px] text-blue-650 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{emp.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${emp.progressPercent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleCard>

                {/* 3. QUICK LINKS SHORTCUTS */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-4 space-y-3">
                  <h4 className="text-[10px] font-extrabold text-gray-450 uppercase tracking-widest text-left">System Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/attendance" className="p-2 border border-gray-150 rounded-lg hover:bg-slate-50 text-center block">
                      <Clock size={15} className="mx-auto text-emerald-500 mb-1" />
                      <span className="text-[10px] font-bold text-gray-700">Attendance</span>
                    </Link>
                    <Link to="/leave" className="p-2 border border-gray-150 rounded-lg hover:bg-slate-50 text-center block">
                      <Calendar size={15} className="mx-auto text-blue-500 mb-1" />
                      <span className="text-[10px] font-bold text-gray-700">Leave Logs</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: FEED */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">HR Board Announcements</h3>
                  <span className="bg-[#0A5C36]/5 text-[#0A5C36] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0A5C36]/10">Broadcast Enabled</span>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {feedPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-xs text-left space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={post.author} size="sm" />
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              {post.author}
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{post.tag}</span>
                            </h4>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{post.role} · {post.time}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-650 leading-relaxed font-semibold">{post.content}</p>

                      <div className="h-px bg-gray-100" />
                      
                      <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
                        <button 
                          onClick={() => handleCheer(post.id)}
                          className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all cursor-pointer ${
                            cheeredState[post.id] ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-gray-550"
                          }`}
                        >
                          <Heart size={13} fill={cheeredState[post.id] ? "currentColor" : "none"} />
                          <span>Like ({post.likes})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: ATTENDANCE SUMMARY */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* TODAY'S ATTENDANCE SUMMARY */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-wider">Today's Logs</h3>
                    <Link to="/attendance" className="text-[9px] font-bold text-[#0A5C36] hover:underline">Full Log</Link>
                  </div>

                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-6 bg-slate-100 rounded" />
                    </div>
                  ) : todayLogs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No logs submitted today.
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                      {todayLogs.map(l => (
                        <div key={l.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-gray-150 transition-colors">
                          <div className="min-w-0 flex items-center gap-2">
                            <Avatar name={l.employeeName} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1">{l.employeeName}</p>
                              <p className="text-[9px] text-gray-400 font-semibold">In: {l.checkInTime}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            l.status === "PRESENT" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MY TEAM LEGEND STATUS */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-3">
                  <h4 className="text-[11px] font-black text-gray-850 uppercase tracking-wider pb-1.5 border-b border-gray-100">Live Team Ratios</h4>
                  <div className="space-y-2.5 text-[10px] font-semibold text-gray-500">
                    <div className="flex justify-between items-center">
                      <span>Headcount Active</span>
                      <span className="font-bold text-gray-800">{empTotal} Employees</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Attending Today</span>
                      <span className="font-bold text-emerald-600">{presentToday} Present</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Review Pendings</span>
                      <span className="font-bold text-rose-500">{pending.length} Leaves</span>
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
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 border-t border-gray-150 space-y-3 shrink-0 bg-white">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-left font-bold">Quick Actions</p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        "Seed onboarding checklist recommendations",
                        "Show pending leave approval status",
                        "Draft core value appreciation feed note"
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

      {/* WRITE POST MODAL */}
      <AnimatePresence>
        {postModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setPostModalOpen(false)} className="fixed inset-0 bg-[#0F172A]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-gray-150">
              <h3 className="text-sm font-extrabold text-gray-900 text-left mb-4 uppercase tracking-wider">Publish HR Board Announcement</h3>
              <form onSubmit={submitPost} className="space-y-4 text-left">
                <div>
                  <textarea
                    rows={4}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Type team alerts, holiday lists, or appraisal reviews guides..."
                    className="w-full border border-gray-250 rounded-lg p-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-slate-50"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setPostModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-650 text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="bg-[#0A5C36] hover:bg-[#084f2e] text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer">Publish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
