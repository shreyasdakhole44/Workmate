import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceAPI, employeeAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import TimeDisplay from "../../components/ui/TimeDisplay";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import StatCard from "../../components/ui/StatCard";
import Spinner from "../../components/ui/Spinner";
import { 
  Clock, Play, Power, CalendarDays, Eye, 
  FileSpreadsheet, CheckCircle, HelpCircle, Users 
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdminOrHR = ["ADMIN", "HR_MANAGER"].includes(user?.role);
  const year = new Date().getFullYear();

  
  // Tab control: "my" (My Attendance) or "team" (Team View)
  const [activeTab, setActiveTab] = useState(isAdminOrHR ? "team" : "my");

  // Common Clock-in States
  const [todayLog, setTodayLog] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [tickingHours, setTickingHours] = useState("0h 0m");

  // Employee View States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [personalLogs, setPersonalLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, halfDays: 0, wfh: 0, rate: 100 });

  // HR Team View States
  const [teamLogs, setTeamLogs] = useState([]);
  const [teamDate, setTeamDate] = useState(new Date().toISOString().split("T")[0]);
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  useEffect(() => {
    if (activeTab === "my") {
      loadPersonalLogs();
    } else {
      loadTeamLogs();
    }
  }, [activeTab, selectedMonth, selectedYear, teamDate]);

  // Dynamic ticking counter for working hours
  useEffect(() => {
    if (todayLog?.checkInTime && !todayLog?.checkOutTime) {
      const calculateHours = () => {
        const checkIn = new Date(`${new Date().toDateString()} ${todayLog.checkInTime}`);
        const diffMs = new Date() - checkIn;
        if (diffMs > 0) {
          const diffHrs = diffMs / (1000 * 60 * 60);
          const h = Math.floor(diffHrs);
          const m = Math.floor((diffHrs - h) * 60);
          setTickingHours(`${h}h ${m}m`);
        } else {
          setTickingHours("0h 0m");
        }
      };
      calculateHours();
      const interval = setInterval(calculateHours, 60000);
      return () => clearInterval(interval);
    } else if (todayLog?.workingHours) {
      setTickingHours(`${todayLog.workingHours} hrs`);
    } else {
      setTickingHours("0h 0m");
    }
  }, [todayLog]);

  const loadTodayAttendance = async () => {
    if (!user?.employeeId) return;
    try {
      const res = await attendanceAPI.today(user.employeeId);
      setTodayLog(res.data.data);
    } catch (e) {
      // Fallback silent
    }
  };

  const loadPersonalLogs = async () => {
    if (!user?.employeeId) return;
    setLogsLoading(true);
    try {
      const res = await attendanceAPI.monthly(user.employeeId, selectedMonth, selectedYear);
      const logs = res.data.data || [];
      setPersonalLogs(logs);

      // Calculate monthly stats
      let present = 0;
      let absent = 0;
      let halfDays = 0;
      let wfh = 0;

      logs.forEach(l => {
        if (l.status === "PRESENT") present++;
        else if (l.status === "ABSENT") absent++;
        else if (l.status === "HALF_DAY") halfDays++;
        else if (l.status === "WFH") wfh++;
      });

      const totalDays = logs.length || 1;
      const presentDays = present + wfh + (halfDays * 0.5);
      const rate = Math.round((presentDays / totalDays) * 100) || 100;

      setStats({ present, absent, halfDays, wfh, rate });
    } catch (e) {
      toast.error("Failed to load personal logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const loadTeamLogs = async () => {
    if (!isAdminOrHR) return;
    setTeamLoading(true);
    try {
      const res = await attendanceAPI.byDate(teamDate);
      setTeamLogs(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load team logs");
    } finally {
      setTeamLoading(false);
    }
  };

  const handleCheckIn = async () => {
    // Optimistic check-in
    setClockLoading(true);
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    const fallback = todayLog;
    setTodayLog({
      checkInTime: now,
      checkOutTime: null,
      status: "PRESENT",
      workingHours: 0
    });

    try {
      await attendanceAPI.checkIn(user.employeeId);
      toast.success("Punch-in registered!");
      loadTodayAttendance();
      loadPersonalLogs();
    } catch (e) {
      toast.error("Failed to record punch-in. Reverting.");
      setTodayLog(fallback);
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    // Optimistic check-out
    setClockLoading(true);
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    const fallback = todayLog;
    setTodayLog(prev => ({
      ...prev,
      checkOutTime: now,
    }));

    try {
      await attendanceAPI.checkOut(user.employeeId);
      toast.success("Punch-out registered!");
      loadTodayAttendance();
      loadPersonalLogs();
    } catch (e) {
      toast.error("Failed to record punch-out. Reverting.");
      setTodayLog(fallback);
    } finally {
      setClockLoading(false);
    }
  };

  const handleExport = () => {
    toast("Excel export functionality is coming soon!", {
      icon: "📊",
    });
  };

  // Row color codes based on logs
  const getRowColor = (status) => {
    switch (status) {
      case "PRESENT": return "bg-emerald-50/20 hover:bg-emerald-50/40 text-emerald-950";
      case "ABSENT": return "bg-red-50/20 hover:bg-red-50/40 text-red-950";
      case "HALF_DAY": return "bg-amber-50/20 hover:bg-amber-50/40 text-amber-950";
      case "WFH": return "bg-blue-50/20 hover:bg-blue-50/40 text-blue-950";
      default: return "";
    }
  };

  const myColumns = [
    {
      key: "date",
      label: "Date",
      render: r => <span className="font-semibold text-xs text-gray-800">{formatDate(r.date)}</span>
    },
    {
      key: "day",
      label: "Day",
      render: r => {
        const d = new Date(r.date);
        return <span className="text-gray-500 font-medium text-xs">{d.toLocaleDateString("en-US", { weekday: "long" })}</span>;
      }
    },
    {
      key: "checkInTime",
      label: "Check In",
      render: r => <span className="font-mono text-xs font-semibold text-gray-800">{r.checkInTime || "—"}</span>
    },
    {
      key: "checkOutTime",
      label: "Check Out",
      render: r => <span className="font-mono text-xs font-semibold text-gray-800">{r.checkOutTime || "—"}</span>
    },
    {
      key: "workingHours",
      label: "Hours Logged",
      render: r => <span className="font-mono text-xs font-bold text-gray-950">{r.workingHours ? `${r.workingHours} hrs` : "—"}</span>
    },
    {
      key: "status",
      label: "Status Badge",
      render: r => <Badge label={r.status} />
    }
  ];

  const teamColumns = [
    {
      key: "employeeName",
      label: "Employee",
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {r.employeeName ? r.employeeName[0].toUpperCase() : "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 leading-none mb-1">{r.employeeName}</p>
            <p className="text-[11px] text-gray-400">{r.empCode || "No Code"}</p>
          </div>
        </div>
      )
    },
    {
      key: "checkIn",
      label: "Punch In",
      render: r => <span className="font-mono text-xs font-semibold text-gray-700">{r.checkInTime || "—"}</span>
    },
    {
      key: "checkOut",
      label: "Punch Out",
      render: r => <span className="font-mono text-xs font-semibold text-gray-700">{r.checkOutTime || "—"}</span>
    },
    {
      key: "hours",
      label: "Hours Worked",
      render: r => <span className="font-mono text-xs font-bold text-gray-900">{r.workingHours ? `${r.workingHours} hrs` : "—"}</span>
    },
    {
      key: "status",
      label: "Status",
      render: r => <Badge label={r.status} />
    }
  ];

  const isPunchingInDisabled = todayLog?.checkInTime;
  const isPunchingOutDisabled = !todayLog?.checkInTime || todayLog?.checkOutTime;

  return (
    <div className="space-y-6">
      <TopBar
        title="Attendance Center"
        subtitle="Log shift attendance, check-in, and audit daily logs history"
        isSharedView={true}
      />

      {/* Tabs Switcher for HR/Admins */}
      {isAdminOrHR && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("team")}
            className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "team" 
                ? "border-brand text-brand" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Team View (Daily Summary)
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "my" 
                ? "border-brand text-brand" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            My Attendance
          </button>
        </div>
      )}

      {activeTab === "my" ? (
        // ── EMPLOYEE PERSONAL PORTAL VIEW ──
        <div className="space-y-6">
          
          {/* Punch Card Widget */}
          <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              <div className="flex items-center justify-center w-12 h-12 bg-[#FEF2EE] border border-[#E8420A]/10 rounded-2xl">
                {todayLog?.checkInTime && !todayLog?.checkOutTime ? (
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                ) : (
                  <div className="w-3.5 h-3.5 bg-gray-300 rounded-full" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-bold text-gray-405 uppercase tracking-wider">Attendance Clock</p>
                <div className="flex items-center gap-2">
                  <TimeDisplay />
                  {todayLog?.status && <Badge label={todayLog.checkOutTime ? "PRESENT" : "PRESENT"} />}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-md w-full md:w-auto text-center md:text-left">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Punch In</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{todayLog?.checkInTime || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Punch Out</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{todayLog?.checkOutTime || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hours Worked</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{tickingHours}</p>
              </div>
            </div>

            <div>
              {clockLoading ? (
                <Spinner size="md" />
              ) : !todayLog?.checkInTime ? (
                <button
                  onClick={handleCheckIn}
                  className="bg-[#E8420A] hover:bg-[#C73708] text-white font-bold text-xs px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto transition-colors"
                >
                  <Play size={14} fill="currentColor" /> Punch In Shift
                </button>
              ) : !todayLog?.checkOutTime ? (
                <button
                  onClick={handleCheckOut}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto transition-colors"
                >
                  <Power size={14} /> Punch Out Shift
                </button>
              ) : (
                <div className="text-xs font-bold text-gray-450 border border-gray-150 px-4 py-2.5 rounded-lg bg-gray-50 flex items-center gap-2 select-none">
                  <CheckCircle size={14} className="text-emerald-500" /> Attendance Logged For Today
                </div>
              )}
            </div>
          </div>

          {/* Monthly Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <StatCard label="Present Days" value={stats.present} accent="emerald" />
            <StatCard label="WFH Days" value={stats.wfh} accent="blue" />
            <StatCard label="Half Days" value={stats.halfDays} accent="amber" />
            <StatCard label="Absent Days" value={stats.absent} accent="red" />
            <StatCard label="Attendance %" value={`${stats.rate}%`} accent="purple" sub="Monthly Rate" />
          </div>

          {/* Filters & Daily log table */}
          <div className="bg-white rounded-xl border border-[#E8E2D9]/60 shadow-sm p-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-[15px] font-bold text-[#0B3D2E]">Attendance Log History</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="input py-1 px-2.5 text-xs h-9 cursor-pointer w-32"
                >
                  {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                </select>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="input py-1 px-2.5 text-xs h-9 cursor-pointer w-24"
                >
                  <option value={selectedYear}>{selectedYear}</option>
                  <option value={selectedYear - 1}>{selectedYear - 1}</option>
                </select>
              </div>
            </div>

            {/* Custom table matching rows color coding */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF7F2]/60 border-b border-[#E8E2D9]/60">
                    {myColumns.map(col => (
                      <th key={col.key} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]/30">
                  {logsLoading ? (
                    [...Array(4)].map((_, rIdx) => (
                      <tr key={rIdx} className="animate-pulse">
                        {myColumns.map(col => (
                          <td key={col.key} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-2/3" /></td>
                        ))}
                      </tr>
                    ))
                  ) : personalLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 font-medium bg-white">
                        No logs recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    personalLogs.map((row, i) => (
                      <tr key={row.id || i} className={`transition-colors ${getRowColor(row.status)}`}>
                        {myColumns.map(col => (
                          <td key={col.key} className="px-5 py-3 text-gray-800 font-bold whitespace-nowrap">
                            {col.render ? col.render(row) : row[col.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      ) : (
        // ── HR DAILY AUDITS TEAM VIEW ──
        <div className="space-y-6 animate-fadeIn">
          {/* Controls row */}
          <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Auditing Date</label>
              <input
                type="date"
                className="input py-1 px-3 text-xs w-44 cursor-pointer"
                value={teamDate}
                onChange={e => setTeamDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleExport}
              className="bg-white hover:bg-slate-50 border border-[#E8E2D9] text-[#E8420A] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export Records
            </button>
          </div>

          {/* Team table grid */}
          <div className="bg-white rounded-xl border border-[#E8E2D9]/60 shadow-sm p-0">
            <Table
              columns={teamColumns}
              data={teamLogs}
              loading={teamLoading}
              emptyMsg="No employees recorded attendance check-ins on this date."
            />
          </div>
        </div>
      )}
    </div>
  );
}
