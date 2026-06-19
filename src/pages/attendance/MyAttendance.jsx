import { useEffect, useState } from "react";
import { attendanceAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/ui/EmptyState";
import { Clock, Calendar, CheckCircle, XCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

const MONTHS = [
  { v: 1, l: "January" }, { v: 2, l: "February" }, { v: 3, l: "March" },
  { v: 4, l: "April" },   { v: 5, l: "May" },      { v: 6, l: "June" },
  { v: 7, l: "July" },    { v: 8, l: "August" },   { v: 9, l: "September" },
  { v: 10, l: "October" },{ v: 11, l: "November" },{ v: 12, l: "December" }
];

export default function MyAttendance() {
  const { user } = useAuth();
  const empId = user?.employeeId;

  const [today,     setToday]     = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [acting,    setActing]    = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [stats, setStats] = useState({ present: 0, absent: 0, wfh: 0, totalHours: 0 });

  useEffect(() => {
    if (empId) {
      loadToday();
      loadLogs();
      loadMonthlyReport();
    }
  }, [empId, page, month, year]);

  const loadToday = async () => {
    try {
      const res = await attendanceAPI.today(empId);
      setToday(res.data.data);
    } catch {}
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.logs(empId, "", page, 10);
      const dataVal = res.data.data;
      const logsList = Array.isArray(dataVal) ? dataVal : (dataVal?.content || []);
      setLogs(logsList);
      setTotal(Array.isArray(dataVal) ? dataVal.length : (dataVal?.totalElements || 0));
    } catch {
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const res = await attendanceAPI.monthly(empId, month, year);
      const data = res.data.data || [];
      const reportStats = { present: 0, absent: 0, wfh: 0, totalHours: 0 };
      data.forEach(item => {
        if (item.status === "PRESENT") reportStats.present++;
        if (item.status === "ABSENT") reportStats.absent++;
        if (item.status === "WFH") reportStats.wfh++;
        if (item.workingHours) reportStats.totalHours += Number(item.workingHours);
      });
      setStats(reportStats);
    } catch {}
  };

  const checkIn = async () => {
    setActing(true);
    try {
      await attendanceAPI.checkIn(empId, {});
      toast.success("Check-in successful! 🌤");
      loadToday();
      loadLogs();
      loadMonthlyReport();
    } catch(err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setActing(false);
    }
  };

  const checkOut = async () => {
    setActing(true);
    try {
      await attendanceAPI.checkOut(empId, {});
      toast.success("Check-out successful! 🌙");
      loadToday();
      loadLogs();
      loadMonthlyReport();
    } catch(err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    } finally {
      setActing(false);
    }
  };

  const columns = [
    { key: "date", label: "Date" },
    { key: "checkInTime", label: "Check In", render: r => r.checkInTime || "—" },
    { key: "checkOutTime", label: "Check Out", render: r => r.checkOutTime || "—" },
    { key: "workingHours", label: "Working Hours", render: r => r.workingHours !== null ? `${r.workingHours}h` : "—" },
    { key: "status", label: "Status", render: r => <Badge label={r.status}/> },
    { key: "remarks", label: "Remarks", render: r => <span className="text-gray-400 text-xs">{r.remarks || "—"}</span> }
  ];

  return (
    <div>
      <TopBar title="My Attendance" subtitle="Track your check-ins and hours" />

      {/* Clock Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Clock Dashboard</h2>
            {!today ? (
              <p className="text-sm text-gray-400">Not checked in yet today.</p>
            ) : (
              <div className="flex flex-wrap gap-4 text-sm mt-1">
                <span className="text-gray-500">
                  Check-in: <span className="font-semibold text-emerald-600">{today.checkInTime}</span>
                </span>
                {today.checkOutTime && (
                  <span className="text-gray-500">
                    Check-out: <span className="font-semibold text-red-500">{today.checkOutTime}</span>
                  </span>
                )}
                {today.workingHours !== null && today.workingHours !== undefined && (
                  <span className="text-gray-500">
                    Hours: <span className="font-semibold">{today.workingHours}h</span>
                  </span>
                )}
                <Badge label={today.status}/>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!today && (
              <button onClick={checkIn} disabled={acting}
                className="btn-success flex items-center gap-2 px-5 py-2.5 cursor-pointer">
                <Clock size={16}/> {acting ? "Clocking In..." : "Check In"}
              </button>
            )}
            {today && !today.checkedOut && (
              <button onClick={checkOut} disabled={acting}
                className="btn-danger flex items-center gap-2 px-5 py-2.5 cursor-pointer">
                <Clock size={16}/> {acting ? "Clocking Out..." : "Check Out"}
              </button>
            )}
            {today?.checkedOut && (
              <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                <CheckCircle size={18}/> Shift completed today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly statistics */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-800 text-sm">Monthly Summary</h3>
          <div className="flex gap-2">
            <select className="input w-36 py-1 cursor-pointer" value={month} onChange={e=>setMonth(Number(e.target.value))}>
              {MONTHS.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select className="input w-24 py-1 cursor-pointer" value={year} onChange={e=>setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Present Days" value={stats.present} icon={CheckCircle} accent="green"/>
          <StatCard label="WFH Days" value={stats.wfh} icon={Clock} accent="blue"/>
          <StatCard label="Absent Days" value={stats.absent} icon={XCircle} accent="red"/>
          <StatCard label="Working Hours" value={`${stats.totalHours.toFixed(1)}h`} icon={FileText} accent="teal"/>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">Attendance Log History</h2>
        </div>
        <Table columns={columns} data={logs} loading={loading} emptyMsg="No attendance history logs recorded." />
        {total > 10 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {logs.length} of {total} entries</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn btn-white btn-sm py-1 px-3 cursor-pointer">
                Previous
              </button>
              <button disabled={(page + 1) * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn btn-white btn-sm py-1 px-3 cursor-pointer">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
