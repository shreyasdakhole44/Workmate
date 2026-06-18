import React, { useEffect, useState } from "react";
import { payrollAPI, employeeAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Spinner from "../../components/ui/Spinner";
import { Landmark, RefreshCw, Award, ClipboardCheck, ArrowUpRight, Download, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/formatters";

export default function PayrollPage() {
  const { user, isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState("structures"); // "structures" | "payslips" | "promotions"
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Directory List
  const [employees, setEmployees] = useState([]);
  
  // Salary Configuration States
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [structureForm, setStructureForm] = useState({
    basicSalary: 0,
    hra: 0,
    medicalAllowance: 0,
    otherAllowances: 0,
    providentFund: 0,
    professionalTax: 0
  });

  // Payslip Generator States
  const [genForm, setGenForm] = useState({
    employeeId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [slipHistory, setSlipHistory] = useState([]);

  // Promotion States
  const [promoForm, setPromoForm] = useState({
    employeeId: "",
    newRole: "EMPLOYEE",
    newDesignation: "",
    newSalary: 0,
    notes: ""
  });
  const [promoHistory, setPromoHistory] = useState([]);

  useEffect(() => {
    loadDirectory();
  }, []);

  useEffect(() => {
    if (selectedEmpId) {
      loadSalaryStructure(selectedEmpId);
    } else {
      setStructureForm({ basicSalary: 0, hra: 0, medicalAllowance: 0, otherAllowances: 0, providentFund: 0, professionalTax: 0 });
    }
  }, [selectedEmpId]);

  useEffect(() => {
    if (genForm.employeeId) {
      loadPayslipsHistory(genForm.employeeId);
    } else {
      setSlipHistory([]);
    }
  }, [genForm.employeeId]);

  useEffect(() => {
    if (promoForm.employeeId) {
      loadPromotionsHistory(promoForm.employeeId);
    } else {
      setPromoHistory([]);
    }
  }, [promoForm.employeeId]);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getSummaries();
      const list = res.data.data || [];
      setEmployees(list);
      if (list.length > 0) {
        setSelectedEmpId(list[0].id);
        setGenForm(f => ({ ...f, employeeId: list[0].id }));
        setPromoForm(f => ({ ...f, employeeId: list[0].id }));
      }
    } catch {
      toast.error("Failed to load employee list");
    } finally {
      setLoading(false);
    }
  };

  const loadSalaryStructure = async (empId) => {
    try {
      const res = await payrollAPI.getSalaryStructure(empId);
      if (res.data.data) {
        const s = res.data.data;
        setStructureForm({
          basicSalary: s.basicSalary || 0,
          hra: s.hra || 0,
          medicalAllowance: s.medicalAllowance || 0,
          otherAllowances: s.otherAllowances || 0,
          providentFund: s.providentFund || 0,
          professionalTax: s.professionalTax || 0
        });
      } else {
        setStructureForm({ basicSalary: 0, hra: 0, medicalAllowance: 0, otherAllowances: 0, providentFund: 0, professionalTax: 0 });
      }
    } catch {
      setStructureForm({ basicSalary: 0, hra: 0, medicalAllowance: 0, otherAllowances: 0, providentFund: 0, professionalTax: 0 });
    }
  };

  const loadPayslipsHistory = async (empId) => {
    try {
      const res = await payrollAPI.getPayslipsHistory(empId);
      setSlipHistory(res.data.data || []);
    } catch {
      setSlipHistory([]);
    }
  };

  const loadPromotionsHistory = async (empId) => {
    try {
      const res = await payrollAPI.getPromotionHistory(empId);
      setPromoHistory(res.data.data || []);
    } catch {
      setPromoHistory([]);
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await payrollAPI.saveSalaryStructure(selectedEmpId, structureForm);
      toast.success("Salary structure configuration saved!");
    } catch {
      toast.error("Failed to update salary structure");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await payrollAPI.generatePayslip(genForm.employeeId, genForm.year, genForm.month);
      toast.success("Payslip successfully generated!");
      loadPayslipsHistory(genForm.employeeId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate employee payslip");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromoteEmployee = async (e) => {
    e.preventDefault();
    if (!promoForm.newDesignation || !promoForm.newSalary) {
      toast.error("Please fill all promotion fields");
      return;
    }
    setSubmitting(true);
    try {
      await payrollAPI.promoteEmployee(promoForm.employeeId, {
        newRole: promoForm.newRole,
        newDesignation: promoForm.newDesignation,
        newSalary: Number(promoForm.newSalary),
        notes: promoForm.notes
      });
      toast.success("Promotion successfully processed!");
      // Reset details
      setPromoForm(f => ({ ...f, newDesignation: "", newSalary: 0, notes: "" }));
      loadPromotionsHistory(promoForm.employeeId);
      loadDirectory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process promotion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (slipId) => {
    try {
      const res = await payrollAPI.downloadPayslip(slipId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payslip-${slipId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Downloaded PDF successfully!");
    } catch {
      toast.error("Failed to download payslip file");
    }
  };

  const monthNames = [
    "", "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const historyColumns = [
    { key: "period", label: "Period", render: r => `${monthNames[r.month]} ${r.year}` },
    { key: "basicSalary", label: "Basic", render: r => formatCurrency(r.basicSalary) },
    { key: "grossSalary", label: "Gross", render: r => formatCurrency(r.grossSalary) },
    { key: "netSalary", label: "Net Payout", render: r => <span className="font-bold text-emerald-600">{formatCurrency(r.netSalary)}</span> },
    { key: "status", label: "Status", render: r => <Badge label={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <button onClick={() => handleDownloadPdf(r.id)} className="btn btn-white btn-xs flex items-center gap-1.5 cursor-pointer py-1 px-2.5 text-[11px]">
          <Download size={12}/> PDF
        </button>
      )
    }
  ];

  const promoColumns = [
    { key: "promotionDate", label: "Date", render: r => new Date(r.promotionDate).toLocaleDateString() },
    { key: "designation", label: "Designation Change", render: r => `${r.previousDesignation || "N/A"} → ${r.newDesignation}` },
    { key: "role", label: "Clearance Level", render: r => `${r.previousRole} → ${r.newRole}` },
    { key: "salary", label: "Salary Adjustment", render: r => `${formatCurrency(r.previousSalary)} → ${formatCurrency(r.newSalary)}` },
    { key: "notes", label: "Justification", render: r => <span className="text-gray-500 max-w-xs truncate block" title={r.notes}>{r.notes}</span> }
  ];

  return (
    <div className="space-y-6">
      <TopBar
        title="Compensation & Payroll Hub"
        subtitle="Manage employee salary structures, generate monthly payslips, and process role promotion adjustments"
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-lg shadow-sm px-4">
        {[
          { id: "structures", label: "Salary Configuration", icon: Landmark },
          { id: "payslips", label: "Payslip Generator", icon: CreditCard },
          { id: "promotions", label: "Promotions & Adjustments", icon: Award },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer border-b-2 transition-colors
                ${active ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-950"}`}>
              <Icon size={14}/>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB: SALARY CONFIGURATION */}
      {activeTab === "structures" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Select Employee */}
          <div className="lg:col-span-4 card p-4 space-y-3 bg-white">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Select Employee Profile</h3>
            <div className="max-h-[450px] overflow-y-auto space-y-1 pr-1">
              {employees.map(e => (
                <button key={e.id} onClick={() => setSelectedEmpId(e.id)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-bold transition-all border cursor-pointer
                    ${selectedEmpId === e.id 
                      ? "bg-[#FEF2EE] text-[#E8420A] border-[#E8420A]" 
                      : "bg-white text-gray-700 border-gray-100 hover:bg-[#FAF7F2]/50"}`}>
                  <p className="truncate font-bold text-gray-900">{e.fullName}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{e.designation || "No Designation"} · {e.department}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Setup Structure Form */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E8E2D9]/60 p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-[#0B3D2E] mb-1">Base Salary Structure Definition</h3>
            <p className="text-xs text-gray-400 mb-5">Define additions and statutory deductions for the selected profile.</p>

            <form onSubmit={handleSaveStructure} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="space-y-3 bg-[#FAF7F2]/30 p-4 rounded-lg border border-[#E8E2D9]/50">
                  <h4 className="font-bold text-xs text-[#0B3D2E] border-b border-gray-200 pb-1.5 mb-2">Earnings (Monthly)</h4>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Basic Salary *</label>
                    <input type="number" min="0" className="input text-xs"
                      value={structureForm.basicSalary} onChange={e => setStructureForm({ ...structureForm, basicSalary: Number(e.target.value) })} required/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">HRA *</label>
                    <input type="number" min="0" className="input text-xs"
                      value={structureForm.hra} onChange={e => setStructureForm({ ...structureForm, hra: Number(e.target.value) })} required/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Medical Allowance *</label>
                    <input type="number" min="0" className="input text-xs"
                      value={structureForm.medicalAllowance} onChange={e => setStructureForm({ ...structureForm, medicalAllowance: Number(e.target.value) })} required/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Other Allowances *</label>
                    <input type="number" min="0" className="input text-xs"
                      value={structureForm.otherAllowances} onChange={e => setStructureForm({ ...structureForm, otherAllowances: Number(e.target.value) })} required/>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3 bg-[#FAF7F2]/30 p-4 rounded-lg border border-[#E8E2D9]/50">
                  <h4 className="font-bold text-xs text-[#0B3D2E] border-b border-gray-200 pb-1.5 mb-2">Deductions (Monthly)</h4>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Provident Fund (PF) *</label>
                    <input type="number" min="0" className="input text-xs"
                      value={structureForm.providentFund} onChange={e => setStructureForm({ ...structureForm, providentFund: Number(e.target.value) })} required/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Professional Tax *</label>
                    <input type="number" min="0" className="input text-xs"
                      value={structureForm.professionalTax} onChange={e => setStructureForm({ ...structureForm, professionalTax: Number(e.target.value) })} required/>
                  </div>
                </div>
              </div>

              {/* Total calculations block */}
              <div className="p-4 bg-[#FAF7F2]/70 border border-[#E8E2D9]/60 rounded-lg grid grid-cols-3 gap-4 text-xs font-bold shadow-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Gross Earnings</span>
                  <span className="text-[#0B3D2E] text-sm font-extrabold">{formatCurrency(structureForm.basicSalary + structureForm.hra + structureForm.medicalAllowance + structureForm.otherAllowances)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Total Deductions</span>
                  <span className="text-red-655 text-sm font-extrabold">{formatCurrency(structureForm.providentFund + structureForm.professionalTax)}</span>
                </div>
                <div className="border-l border-[#E8E2D9]/60 pl-4">
                  <span className="text-[#E8420A] block mb-0.5 uppercase tracking-wider text-[9px]">Estimated Net Pay</span>
                  <span className="text-emerald-600 text-sm font-black">{formatCurrency((structureForm.basicSalary + structureForm.hra + structureForm.medicalAllowance + structureForm.otherAllowances) - (structureForm.providentFund + structureForm.professionalTax))}</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-150">
                <button type="submit" className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs" disabled={submitting}>
                  {submitting ? <Spinner size="sm" color="white" /> : <RefreshCw size={14}/>} Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: PAYSLIP GENERATOR */}
      {activeTab === "payslips" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Generation form */}
          <div className="lg:col-span-4 card p-6 bg-white">
            <h3 className="font-bold text-sm text-gray-950 mb-1">Run Monthly Payslips</h3>
            <p className="text-xs text-gray-400 mb-5">Generates salary registry ledger entry and activates employee download links.</p>

            <form onSubmit={handleGeneratePayslip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee *</label>
                <select className="input cursor-pointer text-xs"
                  value={genForm.employeeId} onChange={e => setGenForm({ ...genForm, employeeId: e.target.value })} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.empCode || "No Code"})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Year *</label>
                  <select className="input cursor-pointer text-xs"
                    value={genForm.year} onChange={e => setGenForm({ ...genForm, year: Number(e.target.value) })} required>
                    {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Month *</label>
                  <select className="input cursor-pointer text-xs"
                    value={genForm.month} onChange={e => setGenForm({ ...genForm, month: Number(e.target.value) })} required>
                    {monthNames.map((m, idx) => idx > 0 ? <option key={idx} value={idx}>{m}</option> : null)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-1.5 cursor-pointer text-xs" disabled={submitting}>
                {submitting ? <Spinner size="sm" color="white" /> : <Landmark size={15}/>}
                {submitting ? "Processing..." : "Generate Payslip"}
              </button>
            </form>
          </div>

          {/* Recently generated list */}
          <div className="lg:col-span-8 card bg-white">
            <div className="px-6 py-4 border-b border-gray-150 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-gray-400"/>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated Payslips History</span>
            </div>

            <Table
              columns={historyColumns}
              data={slipHistory}
              loading={false}
              emptyMsg="Select an employee to view their generated payouts log history."
            />
          </div>
        </div>
      )}

      {/* TAB: PROMOTIONS & ROLES */}
      {activeTab === "promotions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Promotion Panel */}
          <div className="lg:col-span-4 card p-6 bg-white">
            <h3 className="font-bold text-sm text-gray-950 mb-1">Promote & Adjust Role</h3>
            <p className="text-xs text-gray-400 mb-5">Adjust job designation, base payout, and scale structural allocations.</p>

            {isAdmin ? (
              <form onSubmit={handlePromoteEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee *</label>
                  <select className="input cursor-pointer text-xs"
                    value={promoForm.employeeId} onChange={e => setPromoForm({ ...promoForm, employeeId: e.target.value })} required>
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.designation || "No Title"})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Security Clearance Clearance *</label>
                  <select className="input cursor-pointer text-xs"
                    value={promoForm.newRole} onChange={e => setPromoForm({ ...promoForm, newRole: e.target.value })} required>
                    <option value="EMPLOYEE">Employee (Personal view)</option>
                    <option value="HR_MANAGER">HR Manager (Management view)</option>
                    <option value="ADMIN">Admin (Full Control view)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Designation / Title *</label>
                  <input type="text" className="input text-xs" placeholder="e.g. Lead Engineer"
                    value={promoForm.newDesignation} onChange={e => setPromoForm({ ...promoForm, newDesignation: e.target.value })} required/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Compensation (Annual LPA) *</label>
                  <input type="number" min="0" className="input text-xs" placeholder="e.g. 1200000"
                    value={promoForm.newSalary} onChange={e => setPromoForm({ ...promoForm, newSalary: Number(e.target.value) })} required/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks / Promotion Reason *</label>
                  <textarea className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand min-h-16" placeholder="Log justification details..."
                    value={promoForm.notes} onChange={e => setPromoForm({ ...promoForm, notes: e.target.value })} required/>
                </div>

                <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-1.5 cursor-pointer text-xs" disabled={submitting}>
                  {submitting ? <Spinner size="sm" color="white" /> : <ArrowUpRight size={15}/>}
                  {submitting ? "Processing..." : "Process Promotion"}
                </button>
              </form>
            ) : (
              <div className="bg-red-50 text-red-700 border border-red-150 p-4 rounded-lg text-xs leading-relaxed font-semibold">
                Access Denied: Only users holding Administrator clearance levels are permitted to execute role adjustments and designation promotions.
              </div>
            )}
          </div>

          {/* Promotion History Log */}
          <div className="lg:col-span-8 card bg-white">
            <div className="px-6 py-4 border-b border-gray-150 flex items-center gap-2">
              <Award size={16} className="text-gray-400"/>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Promotion Audit logs Ledger</span>
            </div>

            <Table
              columns={promoColumns}
              data={promoHistory}
              loading={false}
              emptyMsg="Select an employee to view their historical promotion timeline logs."
            />
          </div>
        </div>
      )}
    </div>
  );
}
