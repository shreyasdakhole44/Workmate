import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import { ArrowRight, AlertTriangle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangeRoleModal({ open, onClose, user, onConfirm, saving }) {
  const [newRole, setNewRole] = useState("EMPLOYEE");

  useEffect(() => {
    if (user?.role) {
      setNewRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const currentRole = user.role || "EMPLOYEE";
  const isDowngrading = (currentRole === "ADMIN" || currentRole === "HR_MANAGER") && newRole === "EMPLOYEE";

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100 uppercase">ADMIN</span>;
      case "HR_MANAGER":
        return <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 uppercase">HR MANAGER</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100 uppercase">EMPLOYEE</span>;
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (newRole === currentRole) {
      toast.error("New role is the same as the current role");
      return;
    }
    onConfirm(user.id, newRole);
  };

  return (
    <Modal open={open} onClose={onClose} title="Modify Security Clearances" size="md">
      <form onSubmit={handleSave} className="space-y-5 text-left">
        <p className="text-xs text-gray-500">
          Changing login credentials permission levels for <span className="font-semibold text-gray-900">{user.fullName || `${user.firstName} ${user.lastName}`}</span> ({user.email}).
        </p>

        {/* Visual Before -> After comparison */}
        <div className="bg-slate-50 rounded-xl p-4 border border-gray-150 flex items-center justify-center gap-6">
          <div className="text-center">
            {getRoleBadge(currentRole)}
            <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Current Role</p>
          </div>
          <ArrowRight size={18} className="text-gray-300 animate-pulse" />
          <div className="text-center">
            {getRoleBadge(newRole)}
            <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Target Role</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select New Permission Role *</label>
          <div className="relative">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="h-11 border border-gray-200 rounded-lg px-3.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
              required
            >
              <option value="EMPLOYEE">Employee (Personal Access)</option>
              <option value="HR_MANAGER">HR Manager (Leaves & Recruitment Access)</option>
              <option value="ADMIN">Admin (Full System access)</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Downgrade Warning Box */}
        {isDowngrading && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-snug">
              <strong>Caution:</strong> This user will lose access to team management features immediately.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
          <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 text-xs rounded-lg transition-colors cursor-pointer" disabled={saving}>
            {saving ? "Saving..." : "Change Role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
