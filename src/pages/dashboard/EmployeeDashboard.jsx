import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { leaveAPI, attendanceAPI, performanceAPI } from "../../api/endpoints";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Calendar, Star, Play, Power, CalendarDays, ChevronDown, Search,
  Lightbulb, Bell, Send, LogOut, Award, FileText, ArrowRight, Heart, 
  MessageSquare, Download, Sparkles, User, BadgeAlert, Plus, Smile, HelpCircle, Check, Info, LayoutDashboard, ClipboardCheck, DollarSign, UserCircle
} from "lucide-react";
import toast from "react-hot-toast";

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
export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(null);
  const [balances, setBalances] = useState([]);
  const [latestReview, setLatestReview] = useState(null);
  const [workingHours, setWorkingHours] = useState("0h 0m");
  const [time, setTime] = useState("");

  // UI Interactive States
  const [wishedState, setWishedState] = useState({});
  const [cheeredState, setCheeredState] = useState({});
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      author: "Pranav Goyal",
      role: "Human Resource · HR Team",
      time: "2d ago",
      badge: "Out of the Box Thinker",
      content: "Shreyas has done an absolutely fantastic job redesigning the WorkMate SaaS landing page. The Framer Motion animations are incredibly smooth and the design looks production-grade! Congratulations on the release! 🚀🎉",
      likes: 90,
      comments: 10,
      sender: "Varun Khanna",
      tag: "Core Value"
    },
    {
      id: 2,
      author: "Rajesh Nigam",
      role: "Human Resource · HR Team",
      time: "2d ago",
      content: "Welcome to all our new team members who completed onboarding checklist modules this week! Please click below to download the updated IT Setup guidelines and Employee handbook.",
      likes: 12,
      comments: 2,
      downloadable: true,
      tag: "Featured"
    }
  ]);

  // Modal / Form States
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  
  // Badge Form States
  const [badgeRecipient, setBadgeRecipient] = useState("Kamal Hassan");
  const [badgeType, setBadgeType] = useState("Out of the Box Thinker");
  const [badgeNote, setBadgeNote] = useState("");

  // AI Assistant Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "Hello! I am your WorkMate AI Assistant, powered by Spring AI. How can I help you manage your workforce today?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  const year = new Date().getFullYear();

  // Ticking time effect
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setTime(date.toLocaleTimeString("en-US", { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch telemetry
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Increment working hours if checked in
  useEffect(() => {
    if (attendance?.checkInTime && !attendance?.checkOutTime) {
      const calculateHours = () => {
        const checkIn = new Date(`${new Date().toDateString()} ${attendance.checkInTime}`);
        const diffMs = new Date() - checkIn;
        if (diffMs > 0) {
          const diffHrs = diffMs / (1000 * 60 * 60);
          const h = Math.floor(diffHrs);
          const m = Math.floor((diffHrs - h) * 60);
          setWorkingHours(`${h}h ${m}m`);
        } else {
          setWorkingHours("0h 0m");
        }
      };
      
      calculateHours();
      const interval = setInterval(calculateHours, 60000);
      return () => clearInterval(interval);
    } else if (attendance?.workingHours) {
      setWorkingHours(`${attendance.workingHours} hrs`);
    } else {
      setWorkingHours("0h 0m");
    }
  }, [attendance]);

  const loadDashboardData = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const [todayAtt, leaveBal, perfLatest] = await Promise.all([
        attendanceAPI.today(user.employeeId).catch(() => ({ data: { data: null } })),
        leaveAPI.balance(user.employeeId, year).catch(() => ({ data: { data: [] } })),
        performanceAPI.latest(user.employeeId).catch(() => ({ data: { data: null } }))
      ]);

      setAttendance(todayAtt.data.data);
      setBalances(leaveBal.data.data || []);
      setLatestReview(perfLatest.data.data);
    } catch (e) {
      toast.error("Failed to load personal workspace telemetry");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    const checkInTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    const previousAttendanceState = attendance;
    
    setAttendance({
      checkInTime: checkInTimeStr,
      checkOutTime: null,
      status: "PRESENT",
      workingHours: 0
    });
    toast.success("Punching in... registered!");

    try {
      await attendanceAPI.checkIn(user.employeeId);
      loadDashboardData();
    } catch (e) {
      toast.error("Failed to execute check-in on backend. Reverting.");
      setAttendance(previousAttendanceState);
    }
  };

  const handleCheckOut = async () => {
    const checkOutTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    const previousAttendanceState = attendance;

    setAttendance(prev => ({
      ...prev,
      checkOutTime: checkOutTimeStr,
      status: "PRESENT"
    }));
    toast.success("Punching out... registered!");

    try {
      await attendanceAPI.checkOut(user.employeeId);
      loadDashboardData();
    } catch (e) {
      toast.error("Failed to execute check-out on backend. Reverting.");
      setAttendance(previousAttendanceState);
    }
  };

  const handleWish = (id, name, type) => {
    setWishedState(prev => ({ ...prev, [id]: true }));
    toast.success(`Sent celebration wishes to ${name}! 🎈`, {
      style: { background: "#0A5C36", color: "#fff", borderRadius: "10px" }
    });
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

  // Create post submission
  const submitPost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: user?.fullName || "Employee User",
      role: "Operations · Talentrix",
      time: "Just now",
      content: postText,
      likes: 0,
      comments: 0,
      tag: "Post"
    };

    setFeedPosts([newPost, ...feedPosts]);
    setPostText("");
    setPostModalOpen(false);
    toast.success("Post successfully published to feed!");
  };

  // Create badge submission
  const submitBadge = (e) => {
    e.preventDefault();
    if (!badgeNote.trim()) return;

    const newPost = {
      id: Date.now(),
      author: badgeRecipient,
      role: "Operations Team Member",
      time: "Just now",
      badge: badgeType,
      content: badgeNote,
      likes: 0,
      comments: 0,
      sender: user?.fullName || "Colleague",
      tag: "Recognition"
    };

    setFeedPosts([newPost, ...feedPosts]);
    setBadgeNote("");
    setBadgeModalOpen(false);
    toast.success(`Badge awarded to ${badgeRecipient}! 🎉`);
  };

  // AI message submit
  const sendAiMessage = (textToSend) => {
    const userText = textToSend || aiInput;
    if (!userText.trim()) return;

    const newMsg = { sender: "user", text: userText };
    setAiMessages(prev => [...prev, newMsg]);
    setAiInput("");
    setAiTyping(true);

    // AI Responses mapping
    setTimeout(() => {
      setAiTyping(false);
      let replyText = "I'm analyzing your request via Spring AI. Let me query the WorkMate database.";
      
      const textLower = userText.toLowerCase();
      if (textLower.includes("leave") || textLower.includes("balance")) {
        const balString = balances.map(b => `${b.leaveTypeName}: ${b.remainingDays}/${b.allocatedDays} days`).join(", ");
        replyText = `Your current leave balances are: ${balString || "Casual Leave: 8/12 days, Sick Leave: 5/6 days"}.`;
      } else if (textLower.includes("who") && textLower.includes("leave")) {
        replyText = "Checking today's planned leaves. Amit Sharma is on Leave, and Sneha Patil is working from home (WFH) today.";
      } else if (textLower.includes("draft") || textLower.includes("thank")) {
        replyText = `Here is a custom thank you note draft: "A big shoutout to Varun Khanna for showing outstanding collaboration and help in resolving the Spring AI + Java 24 configuration blockages this week! You are an Out of the Box Thinker! #WorkmateCoreValues"`;
      } else if (textLower.includes("hello") || textLower.includes("hi")) {
        replyText = "Hello! I can draft appreciation feeds, check who is checked in, or calculate your remaining leaves. Just ask me!";
      }

      setAiMessages(prev => [...prev, { sender: "ai", text: replyText }]);
    }, 1000);
  };

  // Calendar dates generation
  const renderCalendarDays = () => {
    // June 2026 calendar starts on Monday (June 1)
    const days = [];
    // 1 empty slot for Sunday
    days.push({ date: null, status: "empty" });

    // 30 days in June
    for (let d = 1; d <= 30; d++) {
      let status = "present";
      // Weekends: June 6, 7, 13, 14, 20, 21, 27, 28
      const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(d);
      
      if (isWeekend) {
        status = "holiday";
      } else if (d === 5) {
        status = "absent";
      } else if (d === 12) {
        status = "leave";
      } else if (d === 15) {
        status = "today";
      }
      days.push({ date: d, status });
    }
    return days;
  };

  const isCheckedIn = attendance?.checkInTime && !attendance?.checkOutTime;

  return (
    <div className="fixed inset-0 z-30 flex bg-[#F0F4F2] overflow-hidden antialiased text-gray-700">
      
      {/* ==========================================
          LEFT SLIM SIDEBAR (White, Green Active)
         ========================================== */}
      <aside className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col justify-between items-center py-5 shrink-0 z-10">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo Mark */}
          <div className="w-10 h-10 bg-[#0A5C36] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-sm tracking-tight">W</span>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col items-center gap-3 w-full px-2">
            {[
              { to: "/dashboard", icon: LayoutDashboard, active: true, label: "Home" },
              { to: "/attendance", icon: Clock, label: "Attendance" },
              { to: "/leave", icon: Calendar, label: "Leave" },
              { to: "/performance", icon: Star, label: "Reviews" },
              { to: "/onboarding", icon: ClipboardCheck, label: "Onboarding" },
              { to: "/payslip", icon: DollarSign, label: "Payslips" },
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
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
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
        
        {/* TOP BAR (Green Header) */}
        <header className="h-14 bg-[#0A5C36] text-white px-5 md:px-8 flex items-center justify-between shrink-0 shadow-sm border-b border-white/5 relative z-20">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[12px] md:text-sm tracking-wider uppercase">TALENTRIX SOLUTION</span>
          </div>

          {/* Search Box */}
          <div className="hidden sm:block relative w-80 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-lg pl-9.5 pr-4 py-1.5 text-xs focus:outline-none shadow-sm focus:ring-1 focus:ring-emerald-300"
              placeholder="Search for requests, reports, people..."
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3.5">
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Requests">
              <ClipboardCheck size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F05537] rounded-full" />
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Ideas">
              <Lightbulb size={18} />
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Notifications">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F05537] rounded-full" />
            </button>
            <div className="h-7 w-px bg-white/10" />
            
            {/* User Profile Info */}
            <div className="flex items-center gap-2">
              <div className="w-8.5 h-8.5 rounded-full bg-white/10 text-white font-extrabold border border-white/20 flex items-center justify-center text-xs shadow-sm">
                {(user?.fullName || "SD")[0]}
              </div>
              <span className="hidden md:inline text-xs font-bold tracking-tight text-white/90">
                {user?.fullName?.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL WINDOW */}
        <div className="flex-1 overflow-y-auto bg-[#F0F4F2] pb-10">
          
          {/* GREEN BANNER */}
          <div className="bg-[#0A5C36] pb-24 pt-6 px-6 md:px-8 text-white text-left relative z-0 border-t border-white/5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName?.split(" ")[0] || "Employee"}!
            </h1>
            <p className="text-white/70 text-xs mt-1.5 font-semibold">Hope you are having a great day</p>
          </div>

          {/* PAGE CONTENT CONTAINER (Floating layout) */}
          <div className="px-5 md:px-8 -mt-14 space-y-6 relative z-10 max-w-7xl mx-auto">
            
            {/* FLOATING ACTION TAB BAR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setPostModalOpen(true)}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <MessageSquare size={13} className="text-gray-400" /> Write Post
                </button>
                <button 
                  onClick={() => setBadgeModalOpen(true)}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <Award size={13} className="text-amber-500" /> Give Badge
                </button>
                <button 
                  onClick={() => {
                    toast.success("Reward points portal locked for Admin allocation.", { icon: "🔒", style: { background: "#1E2A4A", color: "#fff", fontSize: "12px", borderRadius: "10px" } });
                  }}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <Plus size={13} className="text-blue-500" /> Reward Point
                </button>
                <button 
                  onClick={() => {
                    toast.success("Select a feed colleague post below to cheer / endorse them.");
                  }}
                  className="px-4 py-2 hover:bg-slate-50 text-gray-700 text-xs font-extrabold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <Smile size={13} className="text-purple-500" /> Endorse
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 hidden md:block" />
              <div className="text-[11px] font-bold text-[#0A5C36] bg-[#0A5C36]/5 rounded-lg px-3.5 py-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#0A5C36] rounded-full animate-ping" />
                Live Feed Active
              </div>
            </div>

            {/* THREE COLUMNS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: WIDGETS */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* 1. ATTENDANCE PUNCH CLOCK (Preserves backend APIs) */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-4.5 text-left space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Punching</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isCheckedIn ? "text-emerald-600" : "text-amber-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                      {isCheckedIn ? "Checked In" : "Checked Out"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-mono text-xl font-bold text-gray-900">{time || "—"}</div>
                    <p className="text-[10px] text-gray-400 font-semibold">Today: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>

                  {/* Punch details */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-gray-100 text-center">
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">In</p>
                      <p className="text-[10px] font-bold text-gray-700">{attendance?.checkInTime || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Out</p>
                      <p className="text-[10px] font-bold text-gray-700">{attendance?.checkOutTime || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Hours</p>
                      <p className="text-[10px] font-bold text-gray-700">{workingHours}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {!attendance?.checkInTime ? (
                      <button
                        onClick={handleCheckIn}
                        className="w-full bg-[#0A5C36] hover:bg-[#084f2e] text-white text-xs font-bold py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play size={12} fill="currentColor" /> Punch In Shift
                      </button>
                    ) : !attendance?.checkOutTime ? (
                      <button
                        onClick={handleCheckOut}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Power size={12} /> Punch Out Shift
                      </button>
                    ) : (
                      <div className="text-[11px] font-bold text-gray-400 border border-gray-150 p-2.5 rounded-lg bg-gray-50 flex items-center justify-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Attendance Logged
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. TODAY'S CELEBRATION (HROne copy) */}
                <CollapsibleCard title="Today's Celebration" count={2}>
                  <div className="space-y-4">
                    {/* Celebration 1 */}
                    <div className="flex justify-between items-center text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 rounded-full bg-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                          KH
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">Kamal Hassan</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">🎂 Birthday today</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleWish("kh", "Kamal Hassan", "birthday")}
                        disabled={wishedState["kh"]}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          wishedState["kh"] 
                            ? "bg-slate-50 text-emerald-600 border border-emerald-100" 
                            : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                        }`}
                      >
                        {wishedState["kh"] ? "Wished! ❤️" : "Wish"}
                      </button>
                    </div>

                    {/* Celebration 2 */}
                    <div className="flex justify-between items-center text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 rounded-full bg-emerald-100 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                          AM
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">Aarav Mehta</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">💼 1 year Work Anniversary</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleWish("am", "Aarav Mehta", "anniversary")}
                        disabled={wishedState["am"]}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          wishedState["am"] 
                            ? "bg-slate-50 text-emerald-600 border border-emerald-100" 
                            : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                        }`}
                      >
                        {wishedState["am"] ? "Wished! ❤️" : "Wish"}
                      </button>
                    </div>

                    {/* Celebration 3 */}
                    <div className="flex justify-between items-center text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 rounded-full bg-amber-100 text-amber-600 font-extrabold flex items-center justify-center text-xs">
                          KB
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">Kunal Bansal</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">💍 Wedding Anniversary</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleWish("kb", "Kunal Bansal", "wedding")}
                        disabled={wishedState["kb"]}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          wishedState["kb"] 
                            ? "bg-slate-50 text-emerald-600 border border-emerald-100" 
                            : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                        }`}
                      >
                        {wishedState["kb"] ? "Wished! ❤️" : "Wish"}
                      </button>
                    </div>
                  </div>
                </CollapsibleCard>

                {/* 3. MY LEAVE BALANCES (Backend integrated) */}
                <CollapsibleCard title="My Leave Balances" count={balances?.length || 0}>
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-6 bg-slate-100 rounded" />
                      <div className="h-6 bg-slate-100 rounded" />
                    </div>
                  ) : balances.length === 0 ? (
                    <p className="text-[10px] text-gray-400">No active leave balances.</p>
                  ) : (
                    <div className="space-y-3 text-left">
                      {balances.map(bal => {
                        const percent = Math.round((bal.remainingDays / bal.allocatedDays) * 100) || 0;
                        return (
                          <div key={bal.id} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                              <span>{bal.leaveTypeName}</span>
                              <span className="font-mono text-gray-700">{bal.remainingDays} / {bal.allocatedDays} left</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${percent < 30 ? "bg-red-500" : percent < 60 ? "bg-amber-400" : "bg-emerald-500"}`} 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CollapsibleCard>

                {/* 4. REFERRALS / IJP */}
                <CollapsibleCard title="Referrals / IJP" count={3} defaultOpen={false}>
                  <div className="space-y-2 text-left text-xs font-semibold">
                    <div className="p-2 bg-slate-50 border border-gray-150 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-gray-700 font-bold">Java Backend Lead</p>
                        <p className="text-[9px] text-gray-400">Exp: 4+ yrs · Mumbai</p>
                      </div>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">3 Openings</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-gray-150 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-gray-700 font-bold">Full Stack Intern</p>
                        <p className="text-[9px] text-gray-400">React + Spring Boot</p>
                      </div>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">Internship</span>
                    </div>
                    <button 
                      onClick={() => toast.success("Opening referrals submission form...")}
                      className="w-full mt-2 bg-slate-100 hover:bg-slate-200 border border-gray-200 text-gray-700 text-[10px] font-bold py-2 rounded-lg text-center cursor-pointer"
                    >
                      Submit Referral Profile
                    </button>
                  </div>
                </CollapsibleCard>

                {/* 5. TEAM PLANNED LEAVES */}
                <CollapsibleCard title="Team Planned Leaves" count={2} defaultOpen={false}>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-extrabold flex items-center justify-center text-xs">
                        AS
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800">Amit Sharma</h5>
                        <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wider mt-0.5">Casual Leave · Today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-extrabold flex items-center justify-center text-xs">
                        SP
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800">Sneha Patil</h5>
                        <p className="text-[9px] text-pink-600 font-bold uppercase tracking-wider mt-0.5">WFH · Tomorrow</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleCard>

                {/* 6. T20 PREDICTION LEAGUE */}
                <CollapsibleCard title="T20 Prediction League" defaultOpen={false}>
                  <div className="text-left text-xs space-y-2">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-gray-150">
                      <div>
                        <p className="font-bold text-gray-800">Tonight's Match</p>
                        <p className="text-[9px] text-gray-400">RCB vs MI · Match 42</p>
                      </div>
                      <span className="bg-[#0A5C36]/10 text-[#0A5C36] text-[10px] font-bold px-2 py-0.5 rounded">Predict</span>
                    </div>
                    <p className="text-[9px] text-gray-400 text-center">Score points for correct match prediction stubs.</p>
                  </div>
                </CollapsibleCard>
              </div>

              {/* CENTER COLUMN: SOCIAL FEED */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Feed Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-extrabold text-gray-800 uppercase tracking-wider">Feed</h2>
                    <span className="bg-[#0A5C36] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {feedPosts.length} posts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 2 new posts dropdown indicator */}
                    <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-2xs text-[10px] font-bold text-gray-500 cursor-pointer">
                      <span>Recent posts</span>
                      <ChevronDown size={12} />
                    </div>
                  </div>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {feedPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-xs text-left space-y-4"
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-[#0A5C36] font-black border border-gray-250 flex items-center justify-center text-sm shadow-2xs">
                            {post.author[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                              {post.author}
                              {post.tag && (
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  post.tag === "Core Value" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                  post.tag === "Featured" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                                  "bg-blue-50 text-blue-600 border border-blue-100"
                                }`}>
                                  {post.tag}
                                </span>
                              )}
                            </h4>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{post.role} · {post.time}</p>
                          </div>
                        </div>
                        {post.badge && (
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-[9px] bg-rose-50 text-rose-500 border border-rose-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              🎖️ {post.badge}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="text-xs text-gray-650 leading-relaxed font-semibold">
                        {post.content}
                      </div>

                      {/* Sender details if badge */}
                      {post.sender && (
                        <div className="bg-[#0A5C36]/5 rounded-lg p-2.5 border border-[#0A5C36]/10 flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                          <Award size={14} className="text-[#0A5C36] shrink-0" />
                          <span>Appreciation Badge Received From {post.sender}</span>
                        </div>
                      )}

                      {/* Download attachment mockup */}
                      {post.downloadable && (
                        <div className="bg-slate-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center text-xs font-bold text-gray-750">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-red-500" />
                            <span>WorkMate_IT_Guidelines_2026.pdf</span>
                          </div>
                          <button 
                            onClick={() => {
                              toast.success("Attachment file download initiated!");
                            }}
                            className="bg-white border border-gray-200 hover:bg-slate-50 text-slate-650 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      )}

                      {/* Footer border line */}
                      <div className="h-px bg-gray-100" />

                      {/* Post Actions */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                        <button 
                          onClick={() => handleCheer(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            cheeredState[post.id] 
                              ? "bg-blue-50 text-blue-600 border border-blue-100" 
                              : "hover:bg-slate-50 text-gray-600"
                          }`}
                        >
                          <Heart size={14} fill={cheeredState[post.id] ? "currentColor" : "none"} className={cheeredState[post.id] ? "text-blue-500" : "text-gray-400"} />
                          <span>Cheer ({post.likes})</span>
                        </button>
                        
                        <button 
                          onClick={() => toast.success("Comments section closed for read-only.")}
                          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-gray-600 cursor-pointer"
                        >
                          <MessageSquare size={14} className="text-gray-400" />
                          <span>Comment ({post.comments})</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: TEAM & CALENDAR */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* 1. MY TEAM MEMBERS */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-4.5">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-wider">My Team Members</h3>
                    <span 
                      onClick={() => toast.success("Displaying complete organization directory...")}
                      className="text-[10px] font-bold text-[#0A5C36] hover:underline cursor-pointer"
                    >
                      See all
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Varun Khanna", initial: "VK", color: "border-emerald-500", status: "Checked In" },
                      { name: "Rajesh Nigam", initial: "RN", color: "border-emerald-500", status: "Checked In" },
                      { name: "Amit Sharma", initial: "AS", color: "border-purple-500", status: "On Leave" },
                      { name: "Sneha Patil", initial: "SP", color: "border-pink-500", status: "WFH Today" },
                      { name: "Kamal Hassan", initial: "KH", color: "border-gray-300", status: "Not Checked In" },
                      { name: "Aarav Mehta", initial: "AM", color: "border-gray-300", status: "Not Checked In" },
                    ].map((member, idx) => (
                      <div 
                        key={idx} 
                        className={`w-9.5 h-9.5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black border-2 ${member.color} cursor-pointer group relative`}
                      >
                        {member.initial}
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-gray-900 text-white p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[9px] pointer-events-none whitespace-nowrap text-left">
                          <p className="font-bold">{member.name}</p>
                          <p className="text-gray-350">{member.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Ring Color Legend */}
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 border-t border-gray-100 text-[9px] font-bold text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Checked-in</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Leave</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      <span>WFH</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      <span>Not Checked-in</span>
                    </div>
                  </div>
                </div>

                {/* 2. ATTENDANCE CALENDAR (Dynamic june 2026 logs) */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200/60 p-5 text-left space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-wider">Calendar</h3>
                    <span 
                      onClick={() => navigate("/attendance")}
                      className="text-[10px] font-bold text-[#0A5C36] hover:underline cursor-pointer"
                    >
                      Go to Calendar
                    </span>
                  </div>

                  {/* Month selectors */}
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800 px-1">
                    <span>June 2026</span>
                    <div className="flex gap-2">
                      <span className="text-gray-400 cursor-not-allowed">❮</span>
                      <span className="text-gray-400 cursor-not-allowed">❯</span>
                    </div>
                  </div>

                  {/* Calendar Grid S M T W T F S */}
                  <div className="grid grid-cols-7 gap-x-1 gap-y-2.5 text-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                  </div>

                  {/* Calendar Dates Grid */}
                  <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center text-xs font-bold text-gray-700">
                    {renderCalendarDays().map((day, idx) => {
                      if (!day.date) {
                        return <span key={idx} className="w-6 h-6 flex items-center justify-center" />;
                      }
                      return (
                        <div key={idx} className="flex flex-col items-center justify-center relative group cursor-pointer">
                          <span className={`w-6.5 h-6.5 flex items-center justify-center rounded-full transition-colors ${
                            day.status === "today" ? "border-2 border-gray-900 bg-slate-50 font-black" :
                            day.status === "absent" ? "bg-red-50 text-red-650" :
                            day.status === "leave" ? "bg-purple-50 text-purple-600" :
                            day.status === "holiday" ? "bg-amber-50 text-amber-600" :
                            "bg-emerald-50/70 text-emerald-700"
                          }`}>
                            {day.date}
                          </span>
                          
                          {/* Dot indicator */}
                          <span className={`w-1.5 h-1.5 rounded-full absolute -bottom-1 ${
                            day.status === "today" ? "bg-gray-900" :
                            day.status === "absent" ? "bg-red-500" :
                            day.status === "leave" ? "bg-purple-500" :
                            day.status === "holiday" ? "bg-amber-400" :
                            "bg-emerald-500"
                          }`} />

                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[9px] p-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                            {day.status === "today" ? "Today (Jun 15)" :
                             day.status === "absent" ? "Absent (Unexcused)" :
                             day.status === "leave" ? "On Approved Leave" :
                             day.status === "holiday" ? "Weekly Off / Holiday" :
                             "Present (Checked In)"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend indicator */}
                  <div className="grid grid-cols-3 gap-y-1.5 gap-x-1 pt-3.5 border-t border-gray-150 text-[9px] font-bold text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                      <span>Today</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span>Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      <span>Holiday / Off</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            AI CHAT ASSISTANT FLOATING ROBOT
           ========================================== */}
        <div 
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
          className="fixed right-6 bottom-6 z-40 bg-[#F05537] text-white w-14 h-14 rounded-full shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 flex items-center justify-center cursor-pointer hover:scale-105 transition-all group animate-pulse"
        >
          <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute right-0 top-0 bg-[#0A5C36] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white">
            AI
          </span>
          {/* Tooltip */}
          <div className="absolute right-full mr-3.5 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask Spring AI Assistant
          </div>
        </div>

        {/* AI DRAWER MODAL */}
        <AnimatePresence>
          {aiDrawerOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setAiDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-[#0F172A]"
              />

              {/* Chat Panel */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-white z-50 shadow-2xl flex flex-col justify-between"
              >
                {/* Header */}
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
                  <button 
                    onClick={() => setAiDrawerOpen(false)}
                    className="text-white/80 hover:text-white text-xs font-extrabold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} text-left`}>
                      <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-[#0A5C36] text-white rounded-br-none shadow-xs" 
                          : "bg-white text-gray-700 border border-gray-200 rounded-bl-none shadow-2xs"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {aiTyping && (
                    <div className="flex justify-start text-left">
                      <div className="bg-white text-gray-400 border border-gray-200 rounded-xl rounded-bl-none p-3 text-xs flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompts Shortcuts & Input Footer */}
                <div className="p-3.5 border-t border-gray-150 space-y-3 shrink-0 bg-white">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-left">Quick Actions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Who is on leave today?",
                        "Show my remaining leave balance",
                        "Draft a thank you post for Varun"
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendAiMessage(prompt)}
                          className="bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-gray-650 text-left transition-colors cursor-pointer block w-full"
                        >
                          ✦ {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => { e.preventDefault(); sendAiMessage(); }}
                    className="flex gap-2 pt-1.5"
                  >
                    <input 
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-250 rounded-lg px-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none h-9 bg-slate-50"
                    />
                    <button 
                      type="submit"
                      className="bg-[#0A5C36] hover:bg-[#084f2e] text-white p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center w-9 shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>

      {/* ==========================================
          MODALS FOR FLOATING ACTIONS
         ========================================== */}
      
      {/* 1. WRITE POST MODAL */}
      <AnimatePresence>
        {postModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setPostModalOpen(false)}
              className="fixed inset-0 bg-[#0F172A]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative z-10 overflow-hidden border border-gray-150"
            >
              <h3 className="text-sm font-extrabold text-gray-900 text-left mb-4 uppercase tracking-wider">Create Social Feed Post</h3>
              <form onSubmit={submitPost} className="space-y-4 text-left">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">What's on your mind?</label>
                  <textarea
                    rows={4}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share achievements, updates, or links with the team..."
                    className="w-full border border-gray-250 rounded-lg p-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-slate-50"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPostModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-650 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#0A5C36] hover:bg-[#084f2e] text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. GIVE BADGE MODAL */}
      <AnimatePresence>
        {badgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setBadgeModalOpen(false)}
              className="fixed inset-0 bg-[#0F172A]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative z-10 overflow-hidden border border-gray-150"
            >
              <h3 className="text-sm font-extrabold text-gray-900 text-left mb-4 uppercase tracking-wider">Give Appreciation Badge</h3>
              <form onSubmit={submitBadge} className="space-y-4 text-left">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Colleague</label>
                  <select
                    value={badgeRecipient}
                    onChange={(e) => setBadgeRecipient(e.target.value)}
                    className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none h-10 cursor-pointer"
                  >
                    <option>Kamal Hassan</option>
                    <option>Aarav Mehta</option>
                    <option>Varun Khanna</option>
                    <option>Sneha Patil</option>
                    <option>Amit Sharma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Badge Type</label>
                  <select
                    value={badgeType}
                    onChange={(e) => setBadgeType(e.target.value)}
                    className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none h-10 cursor-pointer"
                  >
                    <option>Out of the Box Thinker</option>
                    <option>Star Performer</option>
                    <option>Team Player</option>
                    <option>Customer Champion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Appreciation Note</label>
                  <textarea
                    rows={3}
                    value={badgeNote}
                    onChange={(e) => setBadgeNote(e.target.value)}
                    placeholder="Tell them why they deserve this recognition..."
                    className="w-full border border-gray-250 rounded-lg p-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-slate-50"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setBadgeModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-650 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#0A5C36] hover:bg-[#084f2e] text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Award Badge
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
