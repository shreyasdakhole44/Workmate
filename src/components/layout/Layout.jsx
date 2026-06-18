import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { 
  Menu, Search, ClipboardCheck, Lightbulb, Bell, LogOut, Sparkles 
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#F0F4F2] overflow-hidden font-sans text-gray-700 select-none">
      {/* Slim Left Sidebar (White, Green Active) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Global HROne Top Bar (Deep Green) */}
        <header className="h-14 bg-[#0A5C36] text-white px-5 md:px-8 flex items-center justify-between shrink-0 shadow-sm border-b border-white/5 relative z-20">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-[12px] md:text-sm tracking-wider uppercase">TALENTRIX SOLUTION</span>
          </div>

          {/* Central Search Box */}
          <div className="hidden sm:block relative w-80 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-lg pl-9.5 pr-4 py-1.5 text-xs focus:outline-none shadow-sm focus:ring-1 focus:ring-emerald-300"
              placeholder="Search for requests, reports, people..."
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3.5">
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Requests">
              <ClipboardCheck size={18} />
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Ideas">
              <Lightbulb size={18} />
            </button>
            <button className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative" title="Notifications">
              <Bell size={18} />
            </button>
            <div className="h-7 w-px bg-white/10" />
            
            {/* User Profile avatar image */}
            <div className="flex items-center gap-2">
              <div 
                onClick={() => navigate("/profile")}
                className="w-8.5 h-8.5 rounded-full bg-white/10 text-white font-extrabold border border-white/20 flex items-center justify-center text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform overflow-hidden shrink-0"
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
              <span className="hidden md:inline text-xs font-bold tracking-tight text-white/90">
                {user?.fullName?.split(" ")?.[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Primary Scrollable Page Workspace */}
        <main className="flex-1 overflow-y-auto bg-[#F0F4F2]">
          {/* Conditional padding: Full-bleed for Dashboard, standard layout margins for sub-pages */}
          <div className={isDashboard ? "w-full" : "p-6 max-w-7xl mx-auto w-full"}>
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
            background: "#0A5C36",
            color: "#fff",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }
        }}
      />
    </div>
  );
}
