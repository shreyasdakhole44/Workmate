import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
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
    <div className="flex flex-col h-full bg-[#0B3D2E] text-white select-none py-4 justify-between items-center w-full">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Sidebar Header with Logo */}
        <div 
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
        >
          <span className="text-[#0B3D2E] font-black text-sm">W</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2.5 w-full items-center">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group active:scale-[0.95]
                 ${isActive
                   ? "bg-white/10 text-white border-l-2 border-[#E8420A] rounded-l-none pl-0.5 font-bold"
                   : "text-white/60 hover:bg-white/5 hover:text-white"}`
              }
            >
              {({ isActive }) => (
                <>
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
      </div>

      {/* Footer Profile & Logout */}
      <div className="flex flex-col items-center gap-4 shrink-0 w-full">
        {/* User initials bubble */}
        <div 
          onClick={() => navigate("/profile")}
          title="My Profile"
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <Avatar name={user?.fullName} size="sm" />
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors group relative"
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
      <aside className="hidden md:flex flex-col w-16 h-screen sticky top-0 shrink-0 z-20 shadow-md border-r border-[#0B3D2E]/20">
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
          <div className="relative flex flex-col w-16 h-full bg-[#0B3D2E] z-10 animate-slide-in shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
