import React, { useState, useEffect } from "react";
import { employeeAPI, payrollAPI } from "../../../api/endpoints";
import { useAuth } from "../../../context/AuthContext";
import TopBar from "../../../components/layout/TopBar";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import Spinner from "../../../components/ui/Spinner";
import { formatCurrency } from "../../../utils/formatters";
import { DollarSign, ClipboardCheck, ArrowUpRight, History, Settings, Landmark, Download, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import SetSalaryModal from "./SetSalaryModal";
import PromoteEmployeeModal from "./PromoteEmployeeModal";
import PromotionHistoryPage from "./PromotionHistoryPage";

export default function SalaryStructurePage() {
  const { user } = useAuth();
  const isOnlyHR = user?.role === "HR_MANAGER";
  const [activeTab, setActiveTab] = useState(isOnlyHR ? "runs" : "structures"); // "runs" | "structures" | "promotions" | "history"
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  // Modals
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);

  // Payslip runs states (Migrated from original PayrollPage.jsx)
  const [submitting, setSubmitting] = useState(false);
  const [genForm, setGenForm] = useState({
    employeeId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [slipHistory, setSlipHistory] = useState([]);

  useEffect(() => {
    loadDirectory();
  }, []);

  useEffect(() => {
    if (genForm.employeeId) {
      loadPayslipsHistory(genForm.employeeId);
    } else {
      setSlipHistory([]);
    }
  }, [genForm.employeeId]);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getAll(0, 1000);
      const list = res.data.data?.content || res.data.data || [];
      setEmployees(list);
      if (list.length > 0) {
        setGenForm(f => ({ ...f, employeeId: f.employeeId || list[0].id }));
      }
    } catch {
      toast.error("Failed to load employee directory");
    } finally {
      setLoading(false);
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

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await payrollAPI.generatePayslip(genForm.employeeId, genForm.year, genForm.month);
      toast.success("Payslip generated successfully!");
      loadPayslipsHistory(genForm.employeeId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate employee payslip");
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
        <button onClick={() => handleDownloadPdf(r.id)} className="border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
          <Download size={14} className="text-gray-400" /> PDF
        </button>
      )
    }
  ];

  const structureColumns = [
    {
      key: "name",
      label: "Employee Profile",
      render: r => (
        <div className="font-semibold text-gray-900">{r.fullName} ({r.empCode})</div>
      )
    },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation", render: r => <span className="text-gray-500 font-medium">{r.designation || "—"}</span> },
    { key: "salary", label: "Annual Compensation (Net)", render: r => <span className="font-bold text-emerald-700">{formatCurrency(r.salary)}</span> },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedEmp(r); setSalaryModalOpen(true); }}
            className="border border-gray-200 bg-white hover:bg-slate-50 text-gray-750 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Settings size={13} className="text-gray-400" /> Set Salary
          </button>
          <button
            onClick={() => { setSelectedEmp(r); setPromoteModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ArrowUpRight size={13} /> Appraise/Promote
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TopBar 
        title={isOnlyHR ? "Run Monthly Payslips" : "Compensation & Payroll Hub"}
        subtitle={isOnlyHR ? "Select an employee and period to generate monthly salary receipts" : "Manage salary configurations, payslips payouts, and log employee appraisal histories"}
      />

      {/* Tabs System Navigation */}
      {!isOnlyHR && (
        <div className="flex border-b border-gray-200 bg-white rounded-lg shadow-sm px-4">
          {[
            { id: "structures", label: "Salary Structures", icon: Settings },
            { id: "runs", label: "Payslips Runs Registry", icon: Landmark },
            { id: "history", label: "Promotions & Appraisals logs", icon: History }
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs uppercase tracking-wider cursor-pointer border-b-2 transition-all duration-200
                  ${active ? "border-[#E8420A] text-[#E8420A] font-bold" : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"}`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* TAB CONTENTS */}
      {activeTab === "structures" && (
        <div className="bg-white border border-[#E8E2D9]/60 rounded-xl shadow-sm overflow-hidden">
          <Table 
            columns={structureColumns}
            data={employees}
            loading={false}
            emptyMsg="No employee profiles found."
          />
        </div>
      )}

      {activeTab === "runs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Generation form */}
          <div className="lg:col-span-4 card p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="font-extrabold text-sm text-gray-900 mb-1">Run Monthly Payslips</h3>
            <p className="text-xs text-gray-400 mb-5">Select an employee and period to generate their monthly salary receipt.</p>

            <form onSubmit={handleGeneratePayslip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee *</label>
                <div className="relative">
                  <select 
                    className="h-11 border border-gray-200 rounded-lg px-3 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-slate-50 appearance-none"
                    value={genForm.employeeId} 
                    onChange={e => setGenForm({ ...genForm, employeeId: e.target.value })} 
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.empCode || "No Code"})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Year *</label>
                  <div className="relative">
                    <select 
                      className="h-11 border border-gray-200 rounded-lg px-3 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-slate-50 appearance-none"
                      value={genForm.year} 
                      onChange={e => setGenForm({ ...genForm, year: Number(e.target.value) })} 
                      required
                    >
                      {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Month *</label>
                  <div className="relative">
                    <select 
                      className="h-11 border border-gray-200 rounded-lg px-3 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-slate-50 appearance-none"
                      value={genForm.month} 
                      onChange={e => setGenForm({ ...genForm, month: Number(e.target.value) })} 
                      required
                    >
                      {monthNames.map((m, idx) => idx > 0 ? <option key={idx} value={idx}>{m}</option> : null)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-455 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-105 pt-4 mt-2">
                <button type="submit" className="w-full bg-[#0A5C36] hover:bg-[#084f2e] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs h-10 transition-colors" disabled={submitting}>
                  {submitting ? <Spinner size="sm" color="white" /> : <Landmark size={15}/>}
                  {submitting ? "Processing..." : "Generate Payslip"}
                </button>
              </div>
            </form>
          </div>

          {/* Recently generated list */}
          <div className="lg:col-span-8 bg-white border border-[#E8E2D9]/60 shadow-sm rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <ClipboardCheck size={16} className="text-gray-400"/>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Generated Payslips History</span>
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

      {activeTab === "history" && (
        <PromotionHistoryPage />
      )}

      {/* MODAL WRAPPERS */}
      <SetSalaryModal 
        open={salaryModalOpen}
        onClose={() => { setSalaryModalOpen(false); setSelectedEmp(null); }}
        employee={selectedEmp}
        onSaved={loadDirectory}
      />

      <PromoteEmployeeModal 
        open={promoteModalOpen}
        onClose={() => { setPromoteModalOpen(false); setSelectedEmp(null); }}
        employee={selectedEmp}
        onSaved={loadDirectory}
      />
    </div>
  );
}
