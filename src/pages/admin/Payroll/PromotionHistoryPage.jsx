import React, { useState, useEffect } from "react";
import { payrollAPI, employeeAPI } from "../../../api/endpoints";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { Clock, TrendingUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function PromotionHistoryPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("all");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadHistory(selectedEmpId);
  }, [selectedEmpId]);

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.getSummaries();
      const list = res.data.data || [];
      setEmployees(list);
    } catch {
      toast.error("Failed to load employee list");
    }
  };

  const loadHistory = async (empId) => {
    setLoading(true);
    try {
      const res = await payrollAPI.getPromotionHistory(empId);
      setHistory(res.data.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Selector Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-wrap items-center gap-3.5">
        <div className="flex-1 min-w-0 sm:max-w-xs">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Employee Profile:</label>
          <div className="relative">
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="h-10 border border-gray-200 rounded-lg px-3.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
            >
              <option value="all">All Employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.empCode})</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="h-12 w-px bg-gray-100 hidden sm:block" />
        <div className="text-xs text-gray-450 font-medium">
          Select "All Employees" or a specific profile to retrieve historical appraisal modifications, role transitions, and wage adjustments audit logs.
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
          <Clock size={15} className="text-gray-400" /> Career Appraisal Timeline
        </h4>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-slate-50 rounded-lg" />
            <div className="h-12 bg-slate-50 rounded-lg" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
            <TrendingUp size={24} className="text-gray-300 mb-1" />
            <span>No career appraisal history logs found.</span>
          </div>
        ) : (
          <div className="pl-4 py-2">
            {history.map((item, idx) => {
              const formattedDate = item.promotionDate ? formatDate(item.promotionDate) : "Recent Date";
              return (
                <div key={item.id || idx} className="relative pl-6 pb-6 border-l-2 border-gray-100 last:border-0 text-left">
                  {/* Purple timeline bullet */}
                  <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-white" />
                  
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {selectedEmpId === "all" && (
                        <span className="text-blue-700 font-extrabold mr-1.5">
                          {item.employee?.fullName || item.employeeName || "Employee"}:
                        </span>
                      )}
                      Promoted to <span className="text-[#0B3D2E] font-bold">{item.newDesignation}</span>
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      Role Shift: <span className="font-semibold text-gray-700">{item.previousRole}</span> &rarr; <span className="font-semibold text-gray-700">{item.newRole}</span> · 
                      Salary: <span className="font-semibold text-gray-700 line-through mr-1">{formatCurrency(item.previousSalary)}</span> &rarr; <span className="font-bold text-emerald-700 ml-1">{formatCurrency(item.newSalary)}</span>
                    </p>
                    {item.notes && (
                      <div className="text-[11px] text-gray-450 bg-slate-50/70 border border-gray-100 rounded-lg p-2 max-w-lg mt-1 font-normal">
                        {item.notes}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-0.5">
                      {formattedDate} · Processed by Administrator
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
