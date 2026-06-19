import React, { useEffect, useState } from "react";
import { employeeAPI, leaveAPI, recruitmentAPI } from "../../../api/endpoints";
import TopBar from "../../../components/layout/TopBar";
import { 
  ResponsiveContainer, AreaChart, Area, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { Download, RefreshCw, Filter, Calendar } from "lucide-react";
import toast from "react-hot-toast";

import DepartmentHeadcountChart from "./DepartmentHeadcountChart";
import SystemActivityLog from "./SystemActivityLog";

const payrollTrendData = [
  { month: "Jan", amount: 42000 },
  { month: "Feb", amount: 43500 },
  { month: "Mar", amount: 45000 },
  { month: "Apr", amount: 44800 },
  { month: "May", amount: 46200 },
  { month: "Jun", amount: 48500 }
];

const attendanceComplianceData = [
  { week: "W1", compliance: 95 },
  { week: "W2", compliance: 97 },
  { week: "W3", compliance: 96 },
  { week: "W4", compliance: 98 },
  { week: "W5", compliance: 97 },
  { week: "W6", compliance: 99 }
];

export default function OrgReportsPage() {
  const [loading, setLoading] = useState(true);
  const [empTotal, setEmpTotal] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);

  // Filter States
  const [selectedDept, setSelectedDept] = useState("");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");

  // Headcount chart data
  const deptData = [
    { dept: "IT", count: 12 },
    { dept: "HR", count: 4 },
    { dept: "Finance", count: 3 },
    { dept: "Sales", count: 8 },
    { dept: "Support", count: 6 }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [empRes, leaveRes, jobRes] = await Promise.all([
        employeeAPI.getAll(0, 1),
        leaveAPI.pending(),
        recruitmentAPI.getActiveJobs().catch(() => ({ data: { data: [] } }))
      ]);
      setEmpTotal(empRes.data.data?.totalElements ?? 0);
      setPendingLeaves(leaveRes.data.data?.length ?? 0);
      setActiveJobs(jobRes.data.data?.length ?? 0);
    } catch {
      toast.error("Failed to refresh report aggregations");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success("CSV Report export initiated! Your download will start shortly.", {
      icon: "📥"
    });
  };

  return (
    <div className="space-y-6 text-left">
      <TopBar
        title="Reports & Compliance Analytics"
        subtitle="Real-time audits of payroll disbursements, headcount breakdowns, and system log activity logs"
        action={
          <div className="flex gap-2">
            <button 
              onClick={handleExport} 
              className="border border-gray-250 bg-white hover:bg-slate-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Download size={14} className="text-gray-400" /> Export Report
            </button>
            <button 
              onClick={loadStats} 
              className="border border-gray-250 bg-white hover:bg-slate-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""}/> Refresh Data
            </button>
          </div>
        }
      />

      {/* Top Filter Row Card */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-4 flex flex-col sm:flex-row items-center gap-3.5 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            className="h-10 border border-gray-200 rounded-lg pl-9.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            <option value="">Filter by Department (All)</option>
            {["IT", "HR", "Finance", "Sales", "Support"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="date"
              className="h-10 border border-gray-200 rounded-lg pl-9 pr-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none text-xs cursor-pointer bg-white w-full sm:w-36"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <span className="text-gray-400 text-xs font-semibold">&rarr;</span>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="date"
              className="h-10 border border-gray-200 rounded-lg pl-9 pr-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none text-xs cursor-pointer bg-white w-full sm:w-36"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats summary rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Current Headcount", value: empTotal, detail: "Active personnel contracts" },
          { title: "Unresolved Leave Requests", value: pendingLeaves, detail: "Awaiting administrative action" },
          { title: "Active Vacancies", value: activeJobs, detail: "Listed recruitment pipelines" }
        ].map((c, i) => (
          <div key={i} className="card p-5 bg-white flex flex-col justify-between border border-gray-100 rounded-xl shadow-sm border-l-4 border-l-[#0F6B4B]">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.title}</p>
              <p className="text-3xl font-extrabold text-[#0E2D21] mt-1.5">{c.value}</p>
            </div>
            <p className="text-[10px] text-gray-450 mt-2 font-medium">{c.detail}</p>
          </div>
        ))}
      </div>

      {/* Main Reports Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Donut Headcount & Activity Audits */}
        <div className="lg:col-span-5 space-y-6">
          {/* Donut Chart */}
          <div className="bg-white border border-[#E8E2D9]/60 rounded-xl p-5 shadow-sm">
            <div>
              <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider mb-0.5">Department Headcount</h3>
              <p className="text-[10px] text-gray-400">Total staff distribution ratio</p>
            </div>
            <div className="border-t border-gray-50 pt-4 mt-3">
              <DepartmentHeadcountChart data={deptData} />
            </div>
          </div>

          {/* Audit Activity logs */}
          <div className="bg-white border border-[#E8E2D9]/60 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider border-b border-gray-50 pb-3 mb-4">
              System Audit Trails
            </h3>
            <SystemActivityLog />
          </div>
        </div>

        {/* Right Side: Expenditure Line/Area charts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payroll Disbursements Curve */}
          <div className="bg-white border border-[#E8E2D9]/60 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider">Payroll Expenditures</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Total monthly salary payout ledger trend (₹)</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={payrollTrendData}>
                  <defs>
                    <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F6B4B" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0F6B4B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false}/>
                  <YAxis fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `₹${v/1000}k`}/>
                  <Tooltip contentStyle={{ backgroundColor: "#0E2D21", border: "none", fontSize: 10, borderRadius: 8 }} labelStyle={{ color: "#fff" }}/>
                  <Area type="monotone" dataKey="amount" stroke="#0F6B4B" strokeWidth={2} fillOpacity={1} fill="url(#colorPayroll)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Compliance Tracking */}
          <div className="bg-white border border-[#E8E2D9]/60 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider">Attendance Compliance Rate</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Percentage rate of weekly employee check-ins</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={attendanceComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="week" fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false}/>
                  <YAxis domain={[80, 100]} fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/>
                  <Tooltip contentStyle={{ backgroundColor: "#0E2D21", border: "none", fontSize: 10, borderRadius: 8 }} labelStyle={{ color: "#fff" }}/>
                  <Line type="monotone" dataKey="compliance" stroke="#1E8F67" strokeWidth={2.5} dot={{ fill: "#38B27A", r: 4 }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
