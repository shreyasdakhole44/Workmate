import { useEffect, useState } from "react";
import { attendanceAPI, employeeAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { Search, Calendar, Plus, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

const STATUSES = ["PRESENT", "ABSENT", "WFH", "HALF_DAY", "LEAVE", "HOLIDAY"];

export default function TeamAttendance() {
  const [date,       setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [logs,       setLogs]       = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [marking,   setMarking]   = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    status: "PRESENT",
    remarks: ""
  });

  useEffect(() => {
    loadLogs();
  }, [date]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.byDate(date);
      setLogs(res.data.data || []);
    } catch {
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const openMarkModal = async () => {
    try {
      const res = await employeeAPI.getSummaries();
      setEmployees(res.data.data || []);
      setForm({ employeeId: "", status: "PRESENT", remarks: "" });
      setModal(true);
    } catch {
      toast.error("Failed to load employee list");
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.status) {
      toast.error("Please fill all required fields");
      return;
    }
    setMarking(true);
    try {
      await attendanceAPI.mark(form.employeeId, date, form.status, form.remarks);
      toast.success("Attendance adjusted successfully!");
      setModal(false);
      loadLogs();
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to adjust attendance");
    } finally {
      setMarking(false);
    }
  };

  const columns = [
    {
      key: "empCode",
      label: "Emp Code",
      render: r => <span className="font-semibold text-brand text-xs">{r.empCode}</span>
    },
    {
      key: "name",
      label: "Employee",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm"/>
          <div>
            <p className="font-medium text-gray-950 leading-none mb-0.5">{r.employeeName}</p>
            <p className="text-xs text-gray-400">{r.department}</p>
          </div>
        </div>
      )
    },
    { key: "checkInTime", label: "Check In", render: r => r.checkInTime || "—" },
    { key: "checkOutTime", label: "Check Out", render: r => r.checkOutTime || "—" },
    { key: "workingHours", label: "Working Hours", render: r => r.workingHours !== null ? `${r.workingHours}h` : "—" },
    { key: "status", label: "Status", render: r => <Badge label={r.status}/> },
    { key: "remarks", label: "Remarks", render: r => <span className="text-gray-400 text-xs">{r.remarks || "—"}</span> }
  ];

  return (
    <div>
      <TopBar
        title="Team Attendance Log"
        subtitle="Review and modify employee check-ins"
        action={
          <button onClick={openMarkModal} className="btn-primary flex items-center gap-2 cursor-pointer">
            <Plus size={16}/> Adjust Attendance
          </button>
        }
      />

      {/* Date Filter */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Select Audit Date:</span>
          <input type="date" className="input w-48 py-1 cursor-pointer"
            value={date} onChange={e => setDate(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-400 ml-auto">
          Audit matches {logs.length} employee records for this day.
        </p>
      </div>

      {/* Grid */}
      <div className="card">
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          emptyMsg="No attendance records logged for this date."
        />
      </div>

      {/* Adjust Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Manually Mark Attendance">
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee *</label>
            <select className="input cursor-pointer"
              value={form.employeeId} onChange={e=>setForm({...form, employeeId: e.target.value})} required>
              <option value="">Select Employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.empCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Audit Date</label>
            <input type="text" className="input bg-gray-50 text-gray-500 cursor-not-allowed" value={date} readOnly/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status *</label>
            <select className="input cursor-pointer"
              value={form.status} onChange={e=>setForm({...form, status: e.target.value})} required>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks / Reason</label>
            <input type="text" className="input" placeholder="e.g. Forgot check-in/out, WFH adjustment"
              value={form.remarks} onChange={e=>setForm({...form, remarks: e.target.value})}/>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={marking}>
              {marking ? "Marking..." : "Submit Log"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
