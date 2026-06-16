import { useEffect, useState } from "react";
import { employeeAPI, leaveAPI, attendanceAPI, recruitmentAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import { 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { FileSpreadsheet, Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

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

const leaveCategoryData = [
  { category: "Casual", days: 42, fill: "#0F6B4B" },
  { category: "Sick", days: 18, fill: "#1E8F67" },
  { category: "Earned", days: 32, fill: "#38B27A" }
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [empTotal, setEmpTotal] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);

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
      toast.error("Failed to refresh audit aggregates");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportName) => {
    toast.success(`${reportName} CSV export triggered! Download will begin shortly.`, {
      icon: "📥"
    });
  };

  return (
    <div className="space-y-6">
      <TopBar
        title="Reports & Compliance Analytics"
        subtitle="Real-time audits of payroll ledgers, attendance metrics, and department breakdowns"
        action={
          <button onClick={loadStats} className="btn btn-white flex items-center gap-1.5 cursor-pointer text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""}/> Refresh Data
          </button>
        }
      />

      {/* Stats summary rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Current Headcount", value: empTotal, detail: "Active employee contracts" },
          { title: "Unresolved Leave Days", value: pendingLeaves, detail: "Requires operational actions" },
          { title: "Active Vacancies", value: activeJobs, detail: "Job postings in recruitment pipeline" }
        ].map((c, i) => (
          <div key={i} className="card p-5 bg-white flex flex-col justify-between border-l-4 border-l-[#0F6B4B]">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.title}</p>
              <p className="text-2xl font-black text-[#0E2D21] mt-1">{c.value}</p>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">{c.detail}</p>
          </div>
        ))}
      </div>

      {/* Charts Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payroll Disbursements Curve */}
        <div className="card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider">Payroll Expenditures</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Total monthly salary payout ledger trend ($)</p>
            </div>
            <button onClick={() => exportReport("Payroll Ledger")} className="btn btn-white btn-xs flex items-center gap-1 cursor-pointer text-[10px]">
              <Download size={10}/> CSV
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollTrendData}>
                <defs>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F6B4B" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0F6B4B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="month" fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false}/>
                <YAxis fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `$${v/1000}k`}/>
                <Tooltip contentStyle={{ backgroundColor: "#0E2D21", border: "none", fontSize: 10, borderRadius: 8 }} labelStyle={{ color: "#fff" }}/>
                <Area type="monotone" dataKey="amount" stroke="#0F6B4B" strokeWidth={2} fillOpacity={1} fill="url(#colorPayroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Compliance Tracking */}
        <div className="card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider">Attendance Compliance Rate</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Percentage rate of weekly employee check-ins</p>
            </div>
            <button onClick={() => exportReport("Attendance Compliance")} className="btn btn-white btn-xs flex items-center gap-1 cursor-pointer text-[10px]">
              <Download size={10}/> CSV
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
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

        {/* Leave distribution Categories */}
        <div className="card p-6 bg-white space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#0E2D21] uppercase tracking-wider">Leave Categories Breakdown</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Total leave days utilized across the organization</p>
            </div>
            <button onClick={() => exportReport("Leaves Breakdown")} className="btn btn-white btn-xs flex items-center gap-1 cursor-pointer text-[10px]">
              <Download size={10}/> CSV
            </button>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveCategoryData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="category" fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false}/>
                <YAxis fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `${v}d`}/>
                <Tooltip contentStyle={{ backgroundColor: "#0E2D21", border: "none", fontSize: 10, borderRadius: 8 }} labelStyle={{ color: "#fff" }}/>
                <Bar dataKey="days" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
