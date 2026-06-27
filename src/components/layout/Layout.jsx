import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Avatar from "../ui/Avatar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { 
  Menu, Search, ClipboardCheck, Lightbulb, Bell, LogOut, Sparkles, X 
} from "lucide-react";
import HrChatbot from "../ai/HrChatbot";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-700 select-none">
      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-40 transition-opacity cursor-pointer"
          onClick={() => setMobileNavOpen(false)} 
        />
      )}

      {/* Responsive Left Sidebar Drawer */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-16 flex-shrink-0 h-full bg-[#0B3D2E]
        transform transition-transform duration-300 ease-in-out border-r border-[#0B3D2E]/20
        ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        {/* Close button inside drawer, mobile only */}
        <button 
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white/60 hover:text-white p-2"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Global HROne Top Bar (Deep Green) */}
        <header className="w-full bg-[#0B3D2E] flex-shrink-0 text-white relative z-20 shadow-sm border-b border-white/5">
          <div className="px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu size={20} />
              </button>
              <span className="font-extrabold text-[12px] md:text-sm tracking-wider uppercase">TALENTRIX SOLUTION</span>
            </div>

            {/* Central Search Box */}
            <div className="hidden md:block relative w-80 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate("/employees", { state: { search: searchQuery } });
                  }
                }}
                className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-lg pl-9.5 pr-4 py-1.5 text-xs focus:outline-none shadow-sm focus:ring-1 focus:ring-emerald-300"
                placeholder="Search for requests, reports, people..."
              />
            </div>
            
            {/* Mobile/Tablet Search Button */}
            <button 
              onClick={() => navigate("/employees")} 
              className="md:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              title="Search directory"
            >
              <Search size={18} />
            </button>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              <button className="hidden sm:inline-flex text-white/80 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Requests">
                <ClipboardCheck size={18} />
              </button>
              <button className="hidden sm:inline-flex text-white/80 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Ideas">
                <Lightbulb size={18} />
              </button>
              <button className="text-white/80 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Notifications">
                <Bell size={18} />
              </button>
              <div className="h-7 w-px bg-white/10" />
              
              {/* User Profile avatar image */}
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <Avatar name={user?.fullName} size="sm" />
                </div>
                <span className="hidden sm:inline text-xs font-bold tracking-tight text-white">
                  {user?.fullName?.split(" ")?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Primary Scrollable Page Workspace */}
        <main className="flex-1 overflow-y-auto w-full bg-gray-50">
          {/* Scrollable content — full width, padding instead of max-width */}
          <div className={isDashboard ? "w-full" : "px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-screen-2xl mx-auto"}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "8px",
            background: "#0B3D2E",
            color: "#fff",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }
        }}
      />
      <HrChatbot />
    </div>
  );
}
