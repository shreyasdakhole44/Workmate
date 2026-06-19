import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import { payrollAPI } from "../../../api/endpoints";
import { ArrowRight, TrendingUp, ArrowLeftRight, IndianRupee, ChevronDown } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";
import toast from "react-hot-toast";

export default function PromoteEmployeeModal({ open, onClose, employee, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [newDesignation, setNewDesignation] = useState("");
  const [newSalary, setNewSalary] = useState(0);
  const [newRole, setNewRole] = useState("EMPLOYEE");
  const [promotionType, setPromotionType] = useState("PROMOTION");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && employee) {
      setNewDesignation(employee.designation || "");
      setNewSalary(employee.salary || 0);
      setNewRole(employee.role || "EMPLOYEE");
      setPromotionType("PROMOTION");
      setNotes("");
    }
  }, [open, employee]);

  if (!employee) return null;

  const prevDesignation = employee.designation || "—";
  const prevSalary = employee.salary || 0;
  const prevRole = employee.role || "EMPLOYEE";

  const handlePromote = async (e) => {
    e.preventDefault();
    if (newSalary <= 0) {
      toast.error("Please enter a valid salary amount");
      return;
    }
    setSubmitting(true);
    try {
      await payrollAPI.promoteEmployee(employee.id, {
        newRole,
        newDesignation,
        newSalary: Number(newSalary),
        notes: `Type: ${promotionType}. ${notes}`
      });
      toast.success("Employee promotion logged successfully!");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to complete promotion logs");
    } finally {
      setSubmitting(false);
    }
  };

  const getPromoIcon = (type) => {
    switch (type) {
      case "LATERAL_TRANSFER":
        return <ArrowLeftRight size={15} className="text-blue-500" />;
      case "SALARY_REVISION":
        return <IndianRupee size={15} className="text-amber-500" />;
      default:
        return <TrendingUp size={15} className="text-emerald-500" />;
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Appraise & Promote: ${employee.fullName}`} size="md">
      <form onSubmit={handlePromote} className="space-y-4 text-left">
        
        {/* OLD -> NEW COMPARISONS */}
        <div className="bg-slate-50 border border-gray-150 rounded-xl p-4.5 space-y-3.5 shadow-2xs">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200/60 pb-1.5">
            Appraisal Parameters
          </h4>

          {/* 1. Designation */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Designation</span>
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400">{prevDesignation}</span>
              <ArrowRight size={12} className="text-gray-300" />
              <span className="font-bold text-emerald-700">{newDesignation || "—"}</span>
            </div>
          </div>

          {/* 2. Compensation */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Compensation (Gross)</span>
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400">{formatCurrency(prevSalary)}</span>
              <ArrowRight size={12} className="text-gray-300" />
              <span className="font-bold text-emerald-700">{formatCurrency(newSalary)}</span>
            </div>
          </div>

          {/* 3. Security Role */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Security Role</span>
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400">{prevRole}</span>
              <ArrowRight size={12} className="text-gray-300" />
              <span className="font-bold text-emerald-700 uppercase">{newRole}</span>
            </div>
          </div>
        </div>

        {/* INPUT FORM FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New Designation *</label>
            <input 
              type="text" 
              className="h-10 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
              value={newDesignation}
              onChange={e => setNewDesignation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New Gross Salary *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
              <input 
                type="number" 
                className="h-10 border border-gray-200 rounded-lg pl-7 pr-3 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                value={newSalary}
                onChange={e => setNewSalary(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Security Role *</label>
            <div className="relative">
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="h-10 border border-gray-200 rounded-lg px-3 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
                required
              >
                <option value="EMPLOYEE">Employee (Personal portal)</option>
                <option value="HR_MANAGER">HR Manager (HR console)</option>
                <option value="ADMIN">Admin (Full access)</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Appraisal Type *</label>
            <div className="relative">
              <select
                value={promotionType}
                onChange={e => setPromotionType(e.target.value)}
                className="h-10 border border-gray-200 rounded-lg pl-9 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
                required
              >
                <option value="PROMOTION">Promotion</option>
                <option value="LATERAL_TRANSFER">Lateral Transfer</option>
                <option value="SALARY_REVISION">Salary Revision</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {getPromoIcon(promotionType)}
              </div>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Appraisal Review Notes *</label>
          <textarea 
            className="border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs h-20 resize-none" 
            placeholder="Log strengths, reasons for promotion, or salary review details..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
          <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 text-xs rounded-lg transition-colors cursor-pointer" disabled={submitting}>
            {submitting ? "Appraising..." : "Process Appraisal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
