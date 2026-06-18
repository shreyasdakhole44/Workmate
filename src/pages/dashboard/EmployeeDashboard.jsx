import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { leaveAPI, attendanceAPI, performanceAPI } from "../../api/endpoints";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Bell, ClipboardList, Users, Headphones, BarChart2, Settings, 
  Search, Printer, Gift, Bookmark, ChevronDown, ChevronUp, SlidersHorizontal, 
  Download, Heart, MessageSquare, Play, Power, CheckCircle2, Circle, Clock, 
  X, Send, Sparkles, Star, Award, Plus, Smile, ClipboardCheck, DollarSign, 
  UserCircle, LogOut, CalendarDays, FileText, HelpCircle, Check
} from "lucide-react";
import toast from "react-hot-toast";

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Core Data States from APIs
  const [attendance, setAttendance] = useState(null);
  const [balances, setBalances] = useState([]);
  const [latestReview, setLatestReview] = useState(null);
  
  // Ticking Time & Hours States
  const [time, setTime] = useState("");
  const [workingHours, setWorkingHours] = useState("0h 0m");
  const [loading, setLoading] = useState(true);

  // UI Interactive States
  const [openWidgets, setOpenWidgets] = useState({
    celebrations: true,
    values: false,
    referrals: false,
    leaves: true,
    league: true
  });
  const [showBirthdayCard, setShowBirthdayCard] = useState(true);
  const [cheeredPosts, setCheeredPosts] = useState({});
  const [wishedState, setWishedState] = useState({});

  // Write Post / Give Badge Modal States
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [badgeRecipient, setBadgeRecipient] = useState("Kamal Hassan");
  const [badgeType, setBadgeType] = useState("Out of the Box Thinker");
  const [badgeNote, setBadgeNote] = useState("");

  // Feed Posts State
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      author: "Pranav Goyal",
      role: "Human Resource · HR Team",
      time: "2d ago",
      content: "Shreyas has done an absolutely fantastic job redesigning the WorkMate SaaS landing page. The Framer Motion animations are incredibly smooth and the design looks production-grade! Congratulations on the release! 🚀🎉",
      likes: 90,
      comments: 10,
      badge: "Out of the Box Thinker",
      sender: "Varun Khanna",
      tag1: "CORE VALUE",
      tag2: "OUT OF THE BOX THINKER"
    },
    {
      id: 2,
      author: "Rajesh Nigam",
      role: "Human Resource · HR Team",
      time: "2d ago",
      content: "Welcome to all our new team members who completed onboarding checklist modules this week! Please click below to download the updated IT Setup guidelines and Employee handbook.",
      likes: 45,
      comments: 3,
      tag1: "FEATURED",
      attachment: "WorkMate_IT_Guidelines_2026.pdf"
    }
  ]);

  // AI Assistant Drawer States
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "Hello! I am your WorkMate AI Assistant, powered by Spring AI. How can I help you manage your workspace today?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  const year = new Date().getFullYear();

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString("en-US", { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial telemetry
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Ticking working hours calculation
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
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchClick = async () => {
    if (!user?.employeeId) return;
    const isCheckedIn = attendance?.checkInTime && !attendance?.checkOutTime;

    if (!isCheckedIn) {
      // Punch In
      const checkInTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
      const previousState = attendance;
      setAttendance({
        checkInTime: checkInTimeStr,
        checkOutTime: null,
        status: "PRESENT",
        workingHours: 0
      });
      toast.success("Punch-in registered successfully!");

      try {
        await attendanceAPI.checkIn(user.employeeId);
        loadDashboardData();
      } catch {
        toast.error("Failed to execute check-in. Reverting.");
        setAttendance(previousState);
      }
    } else {
      // Punch Out
      const checkOutTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
      const previousState = attendance;
      setAttendance(prev => ({
        ...prev,
        checkOutTime: checkOutTimeStr
      }));
      toast.success("Punch-out registered successfully!");

      try {
        await attendanceAPI.checkOut(user.employeeId);
        loadDashboardData();
      } catch {
        toast.error("Failed to execute check-out. Reverting.");
        setAttendance(previousState);
      }
    }
  };

  const toggleWidget = (name) => {
    setOpenWidgets(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleWish = (name) => {
    setWishedState(prev => ({ ...prev, [name]: true }));
    toast.success(`Sent birthday wishes to ${name}! 🎈`);
  };

  const handleCheer = (postId) => {
    const cheered = cheeredPosts[postId];
    setCheeredPosts(prev => ({ ...prev, [postId]: !cheered }));
    setFeedPosts(posts => posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: cheered ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const submitPost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: user?.fullName || "Shreyas Dakhole",
      role: "Operations Member · BCPL",
      time: "Just now",
      content: postText,
      likes: 0,
      comments: 0
    };

    setFeedPosts([newPost, ...feedPosts]);
    setPostText("");
    setPostModalOpen(false);
    toast.success("Post successfully published to feed!");
  };

  const submitBadge = (e) => {
    e.preventDefault();
    if (!badgeNote.trim()) return;

    const newPost = {
      id: Date.now(),
      author: badgeRecipient,
      role: "Team Colleague",
      time: "Just now",
      content: badgeNote,
      likes: 0,
      comments: 0,
      badge: badgeType,
      sender: user?.fullName || "Shreyas Dakhole",
      tag1: "APPRECIATION",
      tag2: badgeType.toUpperCase()
    };

    setFeedPosts([newPost, ...feedPosts]);
    setBadgeNote("");
    setBadgeModalOpen(false);
    toast.success(`Badge awarded to ${badgeRecipient}! 🎉`);
  };

  // AI assistant responses logic
  const handleAiSend = (textToSend) => {
    const query = textToSend || aiInput;
    if (!query.trim()) return;

    setAiMessages(prev => [...prev, { sender: "user", text: query }]);
    setAiInput("");
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      let reply = "I'm analyzing your request via Spring AI. Let me query the database.";
      const qLower = query.toLowerCase();

      if (qLower.includes("leave") || qLower.includes("balance")) {
        const balList = balances.map(b => `${b.leaveTypeName}: ${b.remainingDays}/${b.allocatedDays} days`).join(", ");
        reply = `Your current leave balances are: ${balList || "Casual: 7/12 days, Sick: 2/6 days, Earned: 4/15 days"}.`;
      } else if (qLower.includes("attendance") || qLower.includes("punch")) {
        reply = attendance?.checkInTime 
          ? `You checked in today at ${attendance.checkInTime}. Total elapsed time is ${workingHours}.` 
          : "You haven't checked in for shift duty today yet. Click 'Mark Attendance' in the left panel to check in.";
      } else if (qLower.includes("draft") || qLower.includes("appreciation")) {
        reply = `Here is a custom thank you note draft: "A big shoutout to Kamal Hassan for outstanding collaboration and HR support this week! You are an Out of the Box Thinker! #WorkmateCoreValues"`;
      } else if (qLower.includes("hi") || qLower.includes("hello")) {
        reply = "Hello! I can draft appreciation cards, check leave balances, or trace your attendance logs. What can I do for you?";
      }

      setAiMessages(prev => [...prev, { sender: "ai", text: reply }]);
    }, 1000);
  };

  // June 2026 starts on Monday. 1 empty block for Sunday.
  const renderCalendar = () => {
    const days = [];
    days.push({ date: "", status: "empty" });

    for (let d = 1; d <= 30; d++) {
      const isSaturday = [6, 13, 20, 27].includes(d);
      const isSunday = [7, 14, 21, 28].includes(d);
      
      let status = "present"; // Green dot
      if (isSaturday || isSunday) {
        status = "weekend"; // Orange dot
      } else if (d === 15) {
        status = "today"; // Circled
      } else if ([5, 12, 19, 26].includes(d)) {
        status = "leave"; // Purple dot
      }

      days.push({ date: d, status });
    }
    return days;
  };

  const isCheckedIn = attendance?.checkInTime && !attendance?.checkOutTime;

  // Retrieve leave balances or use defaults
  const getLeaveBalance = (type) => {
    const bal = balances.find(b => b.leaveTypeName?.toLowerCase().includes(type.toLowerCase()));
    if (bal) return bal.remainingDays;
    if (type === "casual") return 7;
    if (type === "sick") return 2;
    if (type === "earned") return 4;
    return 0;
  };

  const todayStr = `Today: ${new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}`;

  return (
    <div className="fixed inset-0 z-30 flex bg-gray-50 overflow-hidden font-sans text-gray-700 select-none antialiased text-[14px]">
      
      {/* ==========================================
          ZONE A — LEFT SIDEBAR
         ========================================== */}
      <aside className="w-14 bg-[#0A5C36] flex flex-col justify-between items-center py-4 shrink-0 z-20 shadow-lg border-r border-[#084f2e]">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo Circle */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform">
            <span className="text-[#0A5C36] font-black text-sm">W</span>
          </div>

          {/* Icons Stack */}
          <div className="flex flex-col gap-3 w-full items-center">
            {[
              { icon: LayoutDashboard, active: true, route: "/dashboard", label: "Dashboard" },
              { icon: Clock, route: "/attendance", label: "Attendance" },
              { icon: CalendarDays, route: "/leave", label: "Leave" },
              { icon: Star, route: "/performance", label: "Performance" },
              { icon: ClipboardCheck, route: "/onboarding", label: "Onboarding" },
              { icon: DollarSign, route: "/payroll", label: "Payroll" },
              { icon: UserCircle, route: "/profile", label: "Profile" }
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(item.route)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  item.active 
                    ? "bg-white/10 text-white border-l-2 border-[#E8420A] rounded-l-none pl-1" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                title={item.label}
              >
                <item.icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Logout */}
        <button 
          onClick={() => {
            logout();
            navigate("/");
            toast.success("Logged out successfully");
          }}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* ==========================================
          ZONE B — TOP BAR
         ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-14 bg-[#0B3D2E] border-b border-[#0A5C36] px-5 flex items-center justify-between shrink-0 relative z-15 shadow-sm text-white">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-[14px] tracking-widest uppercase">Talentrix Solution</span>
          </div>

          {/* Search Box */}
          <div className="relative w-[500px] max-w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              className="w-full bg-white placeholder-gray-400 rounded-lg pl-9.5 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#E8420A]/20 text-gray-800 h-9 transition-all font-bold"
              placeholder="Search for requests, reports, people..."
            />
          </div>

          {/* Action icon badges */}
          <div className="flex items-center gap-4 text-white/80">
            <button className="hover:text-white transition-colors cursor-pointer relative" title="Requests">
              <ClipboardCheck size={18} />
            </button>
            <button className="hover:text-white transition-colors cursor-pointer" title="Help / Info">
              <HelpCircle size={18} />
            </button>
            <button className="hover:text-white transition-colors cursor-pointer relative" title="Notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 bg-[#E8420A] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#0B3D2E]">1</span>
            </button>
            
            {/* User Profile Avatar with Name */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div 
                onClick={() => navigate("/profile")}
                className="w-7 h-7 rounded-full bg-white/20 text-white font-extrabold flex items-center justify-center text-xs shadow-sm cursor-pointer hover:bg-white/30 transition-all overflow-hidden border border-white/10 shrink-0"
              >
                <img 
                  src={user?.employeeId === 5 
                    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" 
                    : user?.employeeId === 3
                      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80"
                      : "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100&q=80"
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                {user?.fullName || "Employee"}
              </span>
            </div>
          </div>
        </header>

        {/* ==========================================
            ZONE C — MAIN CONTENT
           ========================================== */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* COLUMN 1: LEFT WIDGETS */}
          <section className="w-[280px] shrink-0 border-r border-[#F0F0F0] bg-white p-4 overflow-y-auto space-y-4 text-left">
            
            {/* Shift Punching Card */}
            <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Shift Punching</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isCheckedIn ? "text-emerald-600" : "text-[#E8420A]"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? "bg-emerald-500" : "bg-[#E8420A]"}`} />
                  {isCheckedIn ? "Checked In" : "Checked Out"}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-805 tracking-tight leading-none">{time || "10:48:13 PM"}</h3>
                <p className="text-[11px] text-gray-400 font-bold mt-1.5">{todayStr}</p>
              </div>
              
              {/* Punch IN / OUT Details */}
              <div className="bg-gray-50 border border-gray-150 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">In</p>
                  <p className="text-[11px] font-extrabold text-gray-700 mt-0.5">{attendance?.checkInTime || "--:--:--"}</p>
                </div>
                <div className="border-l border-r border-gray-150">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Out</p>
                  <p className="text-[11px] font-extrabold text-gray-700 mt-0.5">{attendance?.checkOutTime || "--:--:--"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Hours</p>
                  <p className="text-[11px] font-extrabold text-gray-700 mt-0.5">{workingHours}</p>
                </div>
              </div>

              {/* Punch CTA Button */}
              <button 
                onClick={handlePunchClick}
                disabled={attendance?.checkInTime && attendance?.checkOutTime}
                className={`w-full font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider h-10 flex items-center justify-center ${
                  attendance?.checkInTime && attendance?.checkOutTime
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                    : isCheckedIn
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-[#E8420A] hover:bg-[#C73708] text-white"
                }`}
              >
                {attendance?.checkInTime && attendance?.checkOutTime ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Check size={14} /> Attendance Logged
                  </span>
                ) : isCheckedIn ? (
                  "Punch Out Shift"
                ) : (
                  "Mark attendance"
                )}
              </button>
            </div>

            {/* Today's Celebration Card */}
            <div className="bg-white rounded-xl border border-gray-150 hover:shadow-xs transition-shadow">
              <button 
                onClick={() => toggleWidget("celebrations")}
                className="w-full px-4 py-3 flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Today's Celebration</span>
                  <span className="bg-slate-100 text-gray-650 text-[10px] font-bold px-2 py-0.5 rounded-full">2</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${openWidgets.celebrations ? "rotate-180" : ""}`} />
              </button>
              {openWidgets.celebrations && (
                <div className="p-4 pt-3 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-100 shrink-0">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="Kamal Hassan" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-800 leading-tight">Kamal Hassan</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">🍰 Birthday today</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWish("Kamal Hassan")}
                      disabled={wishedState["Kamal Hassan"]}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        wishedState["Kamal Hassan"] 
                          ? "bg-gray-100 text-gray-450" 
                          : "bg-[#FEF2EE] text-[#E8420A] hover:bg-[#E8420A] hover:text-white"
                      }`}
                    >
                      {wishedState["Kamal Hassan"] ? "Wished" : "Wish"}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-100 shrink-0">
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80" alt="Aarav Mehta" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-800 leading-tight">Aarav Mehta</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">💼 1 year Work Anniversary</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWish("Aarav Mehta")}
                      disabled={wishedState["Aarav Mehta"]}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        wishedState["Aarav Mehta"] 
                          ? "bg-gray-100 text-gray-450" 
                          : "bg-[#FEF2EE] text-[#E8420A] hover:bg-[#E8420A] hover:text-white"
                      }`}
                    >
                      {wishedState["Aarav Mehta"] ? "Wished" : "Wish"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-100 shrink-0">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="Kunal Bansal" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-800 leading-tight">Kunal Bansal</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">💍 Wedding Anniversary</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWish("Kunal Bansal")}
                      disabled={wishedState["Kunal Bansal"]}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        wishedState["Kunal Bansal"] 
                          ? "bg-gray-100 text-gray-450" 
                          : "bg-[#FEF2EE] text-[#E8420A] hover:bg-[#E8420A] hover:text-white"
                      }`}
                    >
                      {wishedState["Kunal Bansal"] ? "Wished" : "Wish"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* My Leave Balances Card */}
            <div className="bg-white rounded-xl border border-gray-150 hover:shadow-xs transition-shadow">
              <button 
                onClick={() => toggleWidget("leaves")}
                className="w-full px-4 py-3 flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">My Leave Balances</span>
                  <span className="bg-slate-100 text-gray-650 text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${openWidgets.leaves ? "rotate-180" : ""}`} />
              </button>
              {openWidgets.leaves && (
                <div className="p-4 pt-3 text-left space-y-3.5">
                  {[
                    { name: "Casual Leave", remaining: getLeaveBalance("casual"), total: 12, color: "bg-amber-500" },
                    { name: "Sick Leave", remaining: getLeaveBalance("sick"), total: 6, color: "bg-rose-500" },
                    { name: "Earned Leave", remaining: getLeaveBalance("earned"), total: 15, color: "bg-emerald-500" }
                  ].map((leave, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-700">{leave.name}</span>
                        <span className="text-gray-950">{leave.remaining} / {leave.total} days</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${leave.color} rounded-full`}
                          style={{ width: `${(leave.remaining / leave.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          {/* RIGHT AREA: QUICK ACTIONS + FEED/RIGHT COLUMN */}
          <section className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
            
            {/* Quick Actions horizontal white card */}
            <div className="p-4 pb-0 shrink-0">
              <div className="bg-white border border-gray-150 rounded-xl px-5 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setPostModalOpen(true)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#E8420A] cursor-pointer transition-colors"
                  >
                    <FileText size={16} className="text-gray-400" /> Write Post
                  </button>
                  <button 
                    onClick={() => setBadgeModalOpen(true)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#E8420A] cursor-pointer transition-colors"
                  >
                    <Award size={16} className="text-gray-400" /> Give Badge
                  </button>
                  <button 
                    onClick={() => toast.success("Reward points allocation locked.")}
                    className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#E8420A] cursor-pointer transition-colors"
                  >
                    <Plus size={16} className="text-gray-400" /> Reward Point
                  </button>
                  <button 
                    onClick={() => toast.success("Select 'Cheer' to endorse a colleague below.")}
                    className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#E8420A] cursor-pointer transition-colors"
                  >
                    <Smile size={16} className="text-gray-400" /> Endorse
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 border-l border-gray-100 pl-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed Active
                </div>
              </div>
            </div>

            {/* Bottom Feed & Right Column Grid */}
            <div className="flex-1 flex overflow-hidden p-4 pt-3 gap-4">
              
              {/* CENTER COLUMN: FEED */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Feed</h3>
                    <span className="bg-[#0B3D2E]/10 text-[#0B3D2E] text-[10px] font-extrabold px-2 py-0.5 rounded-full">2 posts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-800 transition-colors">
                    <span>Recent posts</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                {/* Feed posts */}
                {feedPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl border border-gray-150 p-4 text-left shadow-xs space-y-3.5 animate-fadeIn">
                    {/* Author details */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-150 flex items-center justify-center text-xs shadow-xs uppercase font-extrabold text-white bg-teal-650 shrink-0">
                          {post.author === "Pranav Goyal" ? (
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Pranav Goyal" className="w-full h-full object-cover" />
                          ) : post.author === "Rajesh Nigam" ? (
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80" alt="Rajesh Nigam" className="w-full h-full object-cover" />
                          ) : post.author === "Shreyas Prakash Dakhole" || post.author === "Shreyas Dakhole" ? (
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80" alt="Shreyas Dakhole" className="w-full h-full object-cover" />
                          ) : user?.fullName === post.author || post.author === "Rohit Sharma" ? (
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" alt="Rohit Sharma" className="w-full h-full object-cover" />
                          ) : (
                            <span>{post.author.split(" ").map(w => w[0]).join("")}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-gray-950">{post.author}</span>
                            {post.tag1 && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${
                                post.tag1 === "CORE VALUE" 
                                  ? "bg-[#FEF2EE] text-[#E8420A]" 
                                  : post.tag1 === "FEATURED"
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-blue-50 text-blue-700"
                              }`}>
                                {post.tag1}
                              </span>
                            )}
                            {post.tag2 && (
                              <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-700 text-[8px] font-extrabold tracking-wider">
                                {post.tag2}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{post.role} · {post.time}</p>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-gray-600 cursor-pointer">•••</button>
                    </div>

                    {/* Content text */}
                    <p className="text-gray-700 text-xs leading-relaxed font-semibold">
                      {post.content}
                    </p>

                    {/* Appreciation badge card */}
                    {post.badge && (
                      <div className="bg-slate-50 border border-gray-150 rounded-lg px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-600">
                        <span className="text-base select-none">🤝</span>
                        <span>Appreciation Badge Received From {post.sender || "Varun Khanna"}</span>
                      </div>
                    )}

                    {/* PDF attachment */}
                    {post.attachment && (
                      <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl p-3.5 flex justify-between items-center text-xs font-bold text-gray-700 hover:bg-[#FEF2EE]/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">📄</span>
                          <span>{post.attachment}</span>
                        </div>
                        <button 
                          onClick={() => toast.success(`Starting download: ${post.attachment}`)}
                          className="p-1.5 hover:bg-white rounded-lg border border-gray-250 cursor-pointer text-gray-450 hover:text-gray-750 transition-all bg-white/60"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    )}

                    {/* Footer Counts and Actions */}
                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleCheer(post.id)}
                          className={`flex items-center gap-1.5 cursor-pointer text-xs ${
                            cheeredPosts[post.id] ? "text-[#E8420A] font-extrabold" : "text-gray-500 hover:text-[#E8420A]"
                          }`}
                        >
                          <span>👍 Cheer</span>
                          <span>({post.likes})</span>
                        </button>
                        <button 
                          onClick={() => toast.success("Comments section disabled in mock dashboard.")}
                          className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 hover:text-[#E8420A]"
                        >
                          <span>💬 Comment</span>
                          <span>({post.comments})</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

              </div>

              {/* COLUMN 3: RIGHT SECTION */}
              <div className="w-[300px] shrink-0 overflow-y-auto space-y-4 pr-1">
                
                {/* My Team Members Card */}
                <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[12px] font-extrabold text-gray-800 uppercase tracking-wider">My Team Members</h4>
                    <button 
                      onClick={() => navigate("/employees")}
                      className="text-[#E8420A] hover:underline text-[10px] font-bold"
                    >
                      See all
                    </button>
                  </div>
                  
                  {/* Row of Avatar Bubbles */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { name: "Varun Khanna", initials: "VK", border: "border-emerald-500", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" },
                      { name: "Rajesh Nigam", initials: "RN", border: "border-purple-500", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" },
                      { name: "Amit Sharma", initials: "AS", border: "border-pink-500", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80" },
                      { name: "Shreyas Prakash", initials: "SP", border: "border-emerald-500", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80&q=80" },
                      { name: "Kamal Hassan", initials: "KH", border: "border-gray-300", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80" },
                      { name: "Aarav Mehta", initials: "AM", border: "border-pink-500", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80" }
                    ].map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 ${m.border} shadow-xs shrink-0 cursor-pointer`}
                        title={`Name: ${m.name} | Status: ${m.border === "border-emerald-500" ? "Checked-In" : m.border === "border-purple-500" ? "Leave" : m.border === "border-pink-500" ? "WFH" : "Not Checked-In"}`}
                      >
                        <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[9px] font-bold text-gray-400 border-t border-gray-50 pt-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Checked-In
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Leave
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> WFH
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Not Checked-In
                    </span>
                  </div>
                </div>

                {/* Birthday notification badge card */}
                {showBirthdayCard && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 relative shadow-xs animate-fadeIn">
                    <span className="text-xl mt-0.5 shrink-0 select-none">🎁</span>
                    <div className="text-left min-w-0 pr-4">
                      <h4 className="text-[12px] font-extrabold text-gray-800">Happy Birthday!</h4>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5">🎂 15 people wished you today</p>
                      <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Today</p>
                    </div>
                    <button 
                      onClick={() => setShowBirthdayCard(false)}
                      className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-655 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* Calendar Card */}
                <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-xs">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[12px] font-extrabold text-gray-800 uppercase tracking-wider">Calendar</h4>
                    <button 
                      onClick={() => navigate("/attendance")}
                      className="text-[#E8420A] hover:underline text-[10px] font-bold"
                    >
                      Go to Calendar
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-3.5">
                    <button className="p-1 hover:bg-gray-100 rounded cursor-pointer select-none text-gray-400">◀</button>
                    <span>June 2026</span>
                    <button className="p-1 hover:bg-gray-100 rounded cursor-pointer select-none text-gray-400">▶</button>
                  </div>

                  {/* S M T W T F S headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[9px] font-bold text-gray-400 uppercase">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-y-1 gap-x-1 justify-items-center">
                    {renderCalendar().map((cell, idx) => {
                      if (cell.status === "empty") {
                        return <div key={idx} className="w-8 h-8" />;
                      }
                      
                      let containerClass = "w-7.5 h-7.5 flex flex-col items-center justify-center relative text-xs font-bold text-gray-700 rounded-full hover:bg-slate-50 cursor-pointer";
                      let dotClass = "";

                      if (cell.status === "today") {
                        containerClass = "w-7.5 h-7.5 flex flex-col items-center justify-center relative text-xs font-extrabold text-[#E8420A] border-2 border-[#E8420A] rounded-full shadow-xs bg-[#FEF2EE]/40 cursor-pointer";
                        dotClass = "bg-[#E8420A]";
                      } else if (cell.status === "leave") {
                        dotClass = "bg-purple-500";
                      } else if (cell.status === "weekend") {
                        dotClass = "bg-amber-500";
                        containerClass = "w-7.5 h-7.5 flex flex-col items-center justify-center relative text-xs font-bold text-gray-400 rounded-full hover:bg-slate-50 cursor-pointer";
                      } else if (cell.status === "present") {
                        dotClass = "bg-emerald-500";
                      }

                      return (
                        <div key={idx} className={containerClass}>
                          <span>{cell.date}</span>
                          {dotClass && (
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass} absolute bottom-0.5`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </section>

        </main>
      </div>

      {/* Floating AI chatbot Assistant Button */}
      <div className="fixed bottom-6 right-6 z-45">
        <button 
          onClick={() => setAiDrawerOpen(true)}
          className="w-12 h-12 rounded-full bg-[#E8420A] hover:bg-[#C73708] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer relative"
          title="AI HR Assistant"
        >
          <Sparkles size={20} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* AI Assistant drawer */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiDrawerOpen(false)}
              className="fixed inset-0 bg-black z-45 cursor-pointer"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white z-50 shadow-2xl border-l border-gray-150 flex flex-col justify-between"
            >
              <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-[#0B3D2E] text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#E8420A]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Spring AI Copilot</span>
                </div>
                <button 
                  onClick={() => setAiDrawerOpen(false)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
                {aiMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col max-w-[85%] rounded-lg p-2.5 font-bold leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-[#E8420A] text-white ml-auto" 
                        : "bg-white text-gray-700 border border-gray-150 mr-auto"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {aiTyping && (
                  <div className="bg-white text-gray-400 border border-gray-150 rounded-lg p-2.5 mr-auto max-w-[80%] font-bold italic animate-pulse">
                    AI is querying WorkMate...
                  </div>
                )}
              </div>

              {/* Presets and Chat input */}
              <div className="p-3 border-t border-gray-150 bg-white">
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {[
                    "Leave balance",
                    "Attendance info",
                    "Draft thank you note"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAiSend(preset)}
                      className="px-2.5 py-1 bg-[#FAF7F2] text-[#0B3D2E] hover:bg-[#FEF2EE] hover:text-[#E8420A] border border-[#E8E2D9] text-[9px] font-bold rounded-full transition-colors cursor-pointer"
                    >
                      ✦ {preset}
                    </button>
                  ))}
                </div>
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleAiSend(); }}
                  className="flex gap-2"
                >
                  <input 
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask AI Copilot..."
                    className="flex-1 border border-gray-250 bg-slate-50 rounded-lg px-3 text-xs outline-none h-9 focus:ring-1 focus:ring-[#E8420A]/30 focus:bg-white transition-all font-bold"
                  />
                  <button 
                    type="submit"
                    className="bg-[#0B3D2E] hover:bg-[#0B3D2E]/90 text-white p-2 rounded-lg transition-colors cursor-pointer w-9 shrink-0 flex items-center justify-center shadow-sm"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODALS FOR POST / BADGE CREATION
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
              className="bg-white rounded-xl w-full max-w-md p-5 shadow-2xl relative z-10 overflow-hidden border border-gray-150 text-left"
            >
              <h3 className="text-xs font-extrabold text-gray-900 mb-4 uppercase tracking-wider">Create Social Feed Post</h3>
              <form onSubmit={submitPost} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">What's on your mind?</label>
                  <textarea
                    rows={4}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share achievements, updates, or positive thoughts..."
                    className="w-full border border-gray-250 rounded-lg p-3 text-xs focus:ring-1 focus:ring-[#E8420A]/30 outline-none resize-none bg-slate-50 font-bold"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPostModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-655 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#E8420A] hover:bg-[#C73708] text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
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
              className="bg-white rounded-xl w-full max-w-md p-5 shadow-2xl relative z-10 overflow-hidden border border-gray-150 text-left"
            >
              <h3 className="text-xs font-extrabold text-gray-900 mb-4 uppercase tracking-wider">Give Appreciation Badge</h3>
              <form onSubmit={submitBadge} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Colleague</label>
                  <select
                    value={badgeRecipient}
                    onChange={(e) => setBadgeRecipient(e.target.value)}
                    className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#E8420A]/30 outline-none h-10 cursor-pointer font-bold"
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
                    className="w-full border border-gray-250 bg-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#E8420A]/30 outline-none h-10 cursor-pointer font-bold"
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
                    className="w-full border border-gray-250 rounded-lg p-3 text-xs focus:ring-1 focus:ring-[#E8420A]/30 outline-none resize-none bg-slate-50 font-bold"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setBadgeModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-655 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#E8420A] hover:bg-[#C73708] text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
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
