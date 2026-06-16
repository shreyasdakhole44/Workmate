import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Clock, Calendar,
  Star, LogOut, Briefcase, UserCircle, ClipboardCheck, DollarSign, FileSpreadsheet, Menu, X
} from "lucide-react";

const NAV = {
  HR_MANAGER: [
    { to: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { to: "/employees",   label: "Employees",   icon: Users },
    { to: "/attendance",  label: "Attendance",  icon: Clock },
    { to: "/leave",       label: "Leave",       icon: Calendar },
    { to: "/performance", label: "Performance", icon: Star },
    { to: "/recruitment", label: "Recruitment", icon: Briefcase },
    { to: "/onboarding",  label: "Onboarding",  icon: ClipboardCheck },
    { to: "/payroll",     label: "Payroll",     icon: DollarSign },
    { to: "/reports",     label: "Reports & Audits", icon: FileSpreadsheet },
    { to: "/profile",     label: "My Profile",  icon: UserCircle },
  ],
  EMPLOYEE: [
    { to: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { to: "/attendance",  label: "My Attendance",icon: Clock },
    { to: "/leave",       label: "My Leave",    icon: Calendar },
    { to: "/performance", label: "My Reviews",  icon: Star },
    { to: "/onboarding",  label: "My Onboarding",icon: ClipboardCheck },
    { to: "/payslips",    label: "My Payslips",  icon: DollarSign },
    { to: "/profile",     label: "My Profile",  icon: UserCircle },
  ],
};

const ROLE_LABEL = {
  HR_MANAGER: "HR Manager",
  EMPLOYEE: "Employee",
};

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const items = NAV[user?.role] || [];
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-150 sticky top-0 z-50">
      {/* top green strip */}
      <div className="h-1 bg-[#0F6B4B] w-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-[#0F6B4B] rounded-xl flex items-center justify-center shadow-md shadow-[#0F6B4B]/15 shrink-0">
              <Briefcase size={16} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-[14px] text-[#0E2D21] leading-none">WorkMate</p>
              <p className="text-[10px] text-[#1E8F67] font-bold uppercase tracking-wider mt-0.5">HRMS Suite</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex h-full space-x-1 items-center px-4 overflow-x-auto scrollbar-thin">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 h-10 text-[12.5px] font-semibold border-b-2 transition-all active:scale-[0.98]
                   ${isActive
                     ? "border-[#0F6B4B] text-[#0F6B4B] bg-[#0F6B4B]/5 rounded-t-lg"
                     : "border-transparent text-gray-600 hover:text-[#0F6B4B] hover:bg-slate-50"}`
                }
              >
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Details & Sign out */}
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex items-center gap-2.5 pl-4 border-l border-gray-100">
              <div className="w-8 h-8 bg-[#1E8F67] rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
                {(user?.fullName || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-bold text-gray-900 leading-none">
                  {user?.fullName || user?.email?.split("@")[0]}
                </p>
                <p className="text-[9px] text-[#1E8F67] font-bold mt-1 uppercase tracking-wider">{ROLE_LABEL[user?.role]}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <div className="flex xl:hidden items-center gap-3">
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-[#0E2D21] hover:bg-slate-100 rounded-lg cursor-pointer focus:outline-none"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile/Tablet Menu Dropdown */}
      {isOpen && (
        <div className="xl:hidden bg-white border-t border-gray-150 px-4 py-3 space-y-1 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 bg-[#1E8F67] rounded-full flex items-center justify-center text-[12px] font-bold text-white">
              {(user?.fullName || user?.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-950">
                {user?.fullName || user?.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold">{ROLE_LABEL[user?.role]}</p>
            </div>
          </div>
          <div className="py-2 space-y-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all
                   ${isActive
                     ? "bg-[#0F6B4B]/10 text-[#0F6B4B]"
                     : "text-gray-600 hover:bg-slate-50 hover:text-[#0F6B4B]"}`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
