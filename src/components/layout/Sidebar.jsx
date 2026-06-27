import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import { leaveAPI } from "../../api/endpoints";
import {
  LayoutDashboard, Users, Clock, Calendar, Star,
  LogOut, Briefcase, UserCircle, ClipboardCheck, DollarSign, X, Shield, Activity
} from "lucide-react";

const NAV = {
  ADMIN: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/employees", label: "Employees", icon: Users },
    { to: "/user-management", label: "Users", icon: Shield },
    { to: "/recruitment", label: "Recruitment", icon: Briefcase },
    { to: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
    { to: "/attendance", label: "Attendance", icon: Clock },
    { to: "/leave", label: "Leaves", icon: Calendar },
    { to: "/performance", label: "Performance", icon: Star },
    { to: "/payroll", label: "Payroll", icon: DollarSign },
    { to: "/reports", label: "Reports", icon: Activity },
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

export default function Sidebar({ onNavigate }) {
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

  return (
    <div className="flex flex-col h-full bg-[#0B3D2E] text-white select-none py-4 justify-between items-stretch lg:items-center w-full">
      <div className="flex flex-col items-stretch lg:items-center gap-6 w-full">
        {/* Sidebar Header with Logo */}
        <div 
          onClick={() => { navigate("/dashboard"); onNavigate?.(); }}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 w-full justify-start lg:justify-center px-4 lg:px-0"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform shrink-0">
            <span className="text-[#0B3D2E] font-black text-sm">W</span>
          </div>
          <span className="lg:hidden text-white font-extrabold text-sm tracking-wider uppercase">WorkMate</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2.5 w-full items-stretch lg:items-center px-2 lg:px-0">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center w-full px-4 py-3 rounded-lg lg:w-10 lg:h-10 lg:p-0 lg:justify-center transition-all relative group active:scale-[0.95]
                 ${isActive
                   ? "bg-white/10 text-white border-l-4 border-[#E8420A] lg:border-l-2 lg:rounded-l-none lg:pl-0.5 font-bold"
                   : "text-white/60 hover:bg-white/5 hover:text-white"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  
                  {/* Label Text — visible on mobile/tablet drawer, hidden on desktop compact rail */}
                  <span className="lg:hidden ml-3 text-xs font-semibold whitespace-nowrap">{label}</span>

                  {/* Floating tooltip — only on desktop */}
                  <span className="hidden lg:block absolute left-full ml-3 px-2 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
                    {label}
                    {label === "Leaves" && pendingLeaveCount > 0 && ` (${pendingLeaveCount} pending)`}
                  </span>

                  {/* Leaves Badge */}
                  {label === "Leaves" && pendingLeaveCount > 0 && (
                    <span className="absolute top-1/2 -translate-y-1/2 right-4 lg:-top-1 lg:right-0 lg:translate-y-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 border border-white">
                      {pendingLeaveCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="flex flex-col items-stretch lg:items-center gap-4 shrink-0 w-full px-2 lg:px-0">
        {/* User initials bubble / details */}
        <div 
          onClick={() => { navigate("/profile"); onNavigate?.(); }}
          title="My Profile"
          className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 lg:hover:bg-transparent lg:p-0 justify-start lg:justify-center select-none"
        >
          <Avatar name={user?.fullName} size="sm" />
          <div className="lg:hidden text-left min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
            <p className="text-[9px] text-white/60 font-semibold uppercase tracking-wider truncate">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-full lg:w-9 h-10 lg:h-9 rounded-lg flex items-center justify-start lg:justify-center px-4 lg:px-0 gap-3 lg:gap-0 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors group relative"
        >
          <LogOut size={16} />
          <span className="lg:hidden text-xs font-semibold">Sign Out</span>
          <span className="hidden lg:block absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-md">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
