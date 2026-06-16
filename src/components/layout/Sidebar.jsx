import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { leaveAPI } from "../../api/endpoints";
import {
  LayoutDashboard, Users, Clock, Calendar, Star,
  LogOut, Briefcase, UserCircle, ClipboardCheck, DollarSign, X
} from "lucide-react";

const NAV = {
  ADMIN: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/employees", label: "Employees", icon: Users },
    { to: "/recruitment", label: "Recruitment", icon: Briefcase },
    { to: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
    { to: "/attendance", label: "Attendance", icon: Clock },
    { to: "/leave", label: "Leaves", icon: Calendar },
    { to: "/performance", label: "Performance", icon: Star },
    { to: "/payroll", label: "Payroll", icon: DollarSign },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  HR_MANAGER: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/employees", label: "Employees", icon: Users },
    { to: "/recruitment", label: "Recruitment", icon: Briefcase },
    { to: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
    { to: "/attendance", label: "Attendance", icon: Clock },
    { to: "/leave", label: "Leaves", icon: Calendar },
    { to: "/performance", label: "Performance", icon: Star },
    { to: "/payroll", label: "Payroll", icon: DollarSign },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  EMPLOYEE: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/attendance", label: "My Attendance", icon: Clock },
    { to: "/leave", label: "My Leave", icon: Calendar },
    { to: "/performance", label: "My Reviews", icon: Star },
    { to: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
    { to: "/payslip", label: "My Payslips", icon: DollarSign },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  const items = NAV[user?.role] || [];

  useEffect(() => {
    if (user && ["ADMIN", "HR_MANAGER"].includes(user.role)) {
      const fetchLeaves = async () => {
        try {
          const res = await leaveAPI.pending();
          setPendingLeaveCount(res.data.data?.length || 0);
        } catch (e) {
          // Silent fallback
        }
      };
      fetchLeaves();
      const interval = setInterval(fetchLeaves, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-gray-700 select-none">
      
      {/* Sidebar Header with Logo */}
      <div className="py-5 flex flex-col items-center border-b border-gray-150 shrink-0">
        <div 
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 bg-[#0A5C36] rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="text-white font-extrabold text-sm tracking-tight">W</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 flex flex-col items-center gap-3.5 overflow-y-auto shrink-0 w-full px-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `w-11 h-11 rounded-xl flex items-center justify-center transition-all relative group active:scale-[0.95]
               ${isActive
                 ? "bg-[#0A5C36]/10 text-[#0A5C36] border border-[#0A5C36]/20 font-bold"
                 : "text-gray-450 hover:bg-slate-50 hover:text-[#0A5C36]"}`
            }
          >
            {({ isActive }) => (
              <>
                {/* Left vertical active bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0A5C36] rounded-r-full" />
                )}
                
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />

                {/* Floating tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
                  {label}
                  {label === "Leaves" && pendingLeaveCount > 0 && ` (${pendingLeaveCount} pending)`}
                </span>

                {/* Leaves Badge */}
                {label === "Leaves" && pendingLeaveCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 border border-white">
                    {pendingLeaveCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="py-5 border-t border-gray-150 flex flex-col items-center gap-4 shrink-0 bg-slate-50/50">
        {/* User initials bubble */}
        <div 
          onClick={() => navigate("/profile")}
          title="My Profile"
          className="w-9 h-9 rounded-full bg-[#0A5C36] text-white font-extrabold border border-emerald-600/30 flex items-center justify-center text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform"
        >
          {(user?.fullName || "U")[0].toUpperCase()}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer group relative"
        >
          <LogOut size={16} />
          <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
            Sign Out
          </span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-16 md:w-20 h-screen sticky top-0 shrink-0 z-20 shadow-xs border-r border-gray-200">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs transition-opacity"
          />
          {/* Menu Drawer */}
          <div className="relative flex flex-col w-16 md:w-20 h-full bg-white z-10 animate-slide-in shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
