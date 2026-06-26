import React, { useState } from "react";
import Modal from "../../../components/ui/Modal";
import { Eye, EyeOff, Info } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI, employeeAPI } from "../../../api/endpoints";

const ROLE_DESCRIPTIONS = {
  ADMIN: "Full system access to database configurations, user permissions, and audit logs.",
  HR_MANAGER: "Can approve leaves, manage recruitment, and view team reports.",
  EMPLOYEE: "Personal portal access to view payslips, request leaves, and check-in attendance."
};

export default function CreateUserModal({ open, onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !role || !firstName.trim() || !lastName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8 || !/\d/.test(password)) {
      toast.error("Password must be at least 8 characters and include a number");
      return;
    }
    setSubmitting(true);
    try {
      // Step 1: Register User Account
      const userRes = await authAPI.register({
        email,
        password,
        role
      });
      const userId = userRes.data.data?.userId;

      // Determine default department and designation based on role
      let department = "Engineering";
      let designation = "Software Engineer";
      if (role === "HR_MANAGER") {
        department = "HR";
        designation = "HR Manager";
      } else if (role === "ADMIN") {
        department = "Management";
        designation = "Administrator";
      }

      // Step 2: Create Employee Profile
      await employeeAPI.create({
        firstName,
        lastName,
        department,
        designation,
        phone: "+91 99999 11111",
        joinDate: new Date().toISOString().split("T")[0],
        salary: role === "HR_MANAGER" ? 1200000 : (role === "ADMIN" ? 1500000 : 600000),
        userId
      });

      toast.success("User account and profile created successfully!");
      onCreated();
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setRole("EMPLOYEE");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Login Account" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
            <input 
              type="text" 
              placeholder="First Name"
              className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
            <input 
              type="text" 
              placeholder="Last Name"
              className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
          <input 
            type="email" 
            placeholder="user@workmate.com"
            className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              className="h-11 border border-gray-200 rounded-lg pl-3.5 pr-11 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Minimum 8 characters, include a number
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Security Role *</label>
          <select 
            className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Dynamic Role Info Box */}
        <div className="bg-gray-50 border border-gray-150 rounded-lg p-3.5 flex items-start gap-2.5">
          <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600 leading-snug">
            {ROLE_DESCRIPTIONS[role]}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
          <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 text-xs rounded-lg transition-colors cursor-pointer" disabled={submitting}>
            {submitting ? "Processing..." : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
