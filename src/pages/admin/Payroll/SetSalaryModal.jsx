import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import { payrollAPI } from "../../../api/endpoints";
import toast from "react-hot-toast";

export default function SetSalaryModal({ open, onClose, employee, onSaved }) {
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0, // Transport
    otherAllowances: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0
  });

  useEffect(() => {
    if (open && employee?.id) {
      loadStructure();
    }
  }, [open, employee]);

  const loadStructure = async () => {
    try {
      const res = await payrollAPI.getSalaryStructure(employee.id);
      const data = res.data.data || {};
      setForm({
        basicSalary: data.basicSalary || 0,
        hra: data.hra || 0,
        conveyanceAllowance: data.conveyanceAllowance || 0,
        otherAllowances: data.otherAllowances || 0,
        providentFund: data.providentFund || 0,
        professionalTax: data.professionalTax || 200, // PT defaults to 200
        incomeTax: data.incomeTax || 0
      });
    } catch {
      // Fallback defaults
      setForm({
        basicSalary: 0,
        hra: 0,
        conveyanceAllowance: 0,
        otherAllowances: 0,
        providentFund: 0,
        professionalTax: 200,
        incomeTax: 0
      });
    }
  };

  const handleInputChange = (field, value) => {
    const numVal = Math.max(0, Number(value) || 0);
    setForm(prev => ({ ...prev, [field]: numVal }));
  };

  const earnings = form.basicSalary + form.hra + form.conveyanceAllowance + form.otherAllowances;
  const deductions = form.providentFund + form.professionalTax + form.incomeTax;
  const calculatedNet = earnings - deductions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await payrollAPI.saveSalaryStructure(employee.id, {
        ...form,
        specialAllowance: 0,
        performanceBonus: 0,
        medicalAllowance: 0,
        esi: 0
      });
      toast.success("Salary structure updated successfully!");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to update salary structure");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Configure Salary: ${employee?.fullName || "Employee"}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 border-l-4 border-l-emerald-500 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-gray-50 pb-2">
              Earnings
            </h4>
            
            <div className="space-y-3">
              {[
                { label: "Basic Salary *", field: "basicSalary" },
                { label: "House Rent Allowance (HRA) *", field: "hra" },
                { label: "Transport Allowance (Conveyance)", field: "conveyanceAllowance" },
                { label: "Other Allowances", field: "otherAllowances" }
              ].map((item, idx) => (
                <div key={idx}>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">{item.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <input 
                      type="number" 
                      className="h-10 border border-gray-200 rounded-lg pl-7 pr-3 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                      value={form[item.field] || ""}
                      onChange={e => handleInputChange(item.field, e.target.value)}
                      required={item.label.includes("*")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 border-l-4 border-l-red-500 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider border-b border-gray-50 pb-2">
              Deductions
            </h4>
            
            <div className="space-y-3">
              {[
                { label: "Provident Fund (PF) *", field: "providentFund" },
                { label: "Professional Tax (PT) *", field: "professionalTax" },
                { label: "Income Tax (TDS)", field: "incomeTax" }
              ].map((item, idx) => (
                <div key={idx}>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">{item.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <input 
                      type="number" 
                      className="h-10 border border-gray-200 rounded-lg pl-7 pr-3 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                      value={form[item.field] || ""}
                      onChange={e => handleInputChange(item.field, e.target.value)}
                      required={item.label.includes("*")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Calculation Preview Box */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex justify-between items-center mt-4 shadow-2xs">
          <div className="text-left">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Calculated Net Pay</span>
            <p className="text-[10px] text-teal-650 font-medium mt-0.5">Earnings (₹{earnings.toLocaleString('en-IN')}) - Deductions (₹{deductions.toLocaleString('en-IN')})</p>
          </div>
          <span className="text-2xl font-black text-teal-700">
            ₹{calculatedNet.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
          <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 text-xs rounded-lg transition-colors cursor-pointer" disabled={saving}>
            {saving ? "Saving..." : "Save Salary Settings"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
