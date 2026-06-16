import { useEffect, useState } from "react";
import { leaveAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { Calendar, Plus, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function MyLeave() {
  const { user } = useAuth();
  const empId = user?.employeeId;

  const [balances,   setBalances]   = useState([]);
  const [types,      setTypes]      = useState([]);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const now = new Date();
  const year = now.getFullYear();

  useEffect(() => {
    if (empId) {
      loadBalances();
      loadHistory();
      loadTypes();
    }
  }, [empId]);

  const loadBalances = async () => {
    try {
      const res = await leaveAPI.balance(empId, year);
      setBalances(res.data.data?.balances || []);
    } catch {}
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.mine(empId);
      setHistory(res.data.data || []);
    } catch {
      toast.error("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const res = await leaveAPI.types();
      setTypes(res.data.data || []);
    } catch {}
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.leaveTypeId || !form.fromDate || !form.toDate || !form.reason) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await leaveAPI.apply({
        employeeId: empId,
        leaveTypeId: Number(form.leaveTypeId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason
      });
      toast.success("Leave application submitted!");
      setModal(false);
      loadBalances();
      loadHistory();
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this pending leave request?")) return;
    try {
      await leaveAPI.cancel(id, empId);
      toast.success("Leave request cancelled successfully!");
      loadBalances();
      loadHistory();
    } catch {
      toast.error("Failed to cancel leave request");
    }
  };

  const columns = [
    { key: "leaveTypeName", label: "Leave Type", render: r => <Badge label={r.leaveTypeName} color="blue"/> },
    { key: "fromDate", label: "From" },
    { key: "toDate", label: "To" },
    { key: "totalDays", label: "Days", render: r => <span className="font-semibold text-brand text-xs">{r.totalDays}d</span> },
    { key: "reason", label: "Reason", render: r => <span className="text-gray-500 max-w-xs truncate block">{r.reason}</span> },
    { key: "status", label: "Status", render: r => <Badge label={r.status}/> },
    { key: "rejectedReason", label: "Feedback Notes", render: r => <span className="text-red-500 text-xs">{r.rejectedReason || "—"}</span> },
    {
      key: "actions",
      label: "Actions",
      render: r => r.status === "PENDING" ? (
        <button onClick={() => handleCancel(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-colors" title="Cancel Request">
          <Trash2 size={15}/>
        </button>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      )
    }
  ];

  return (
    <div>
      <TopBar
        title="My Leaves Dashboard"
        subtitle="Manage leave balances and applications"
        action={
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 cursor-pointer">
            <Plus size={16}/> Apply for Leave
          </button>
        }
      />

      {/* Leave Balance Meters */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Leave Balances for Year {year}</h2>
        {balances.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">No active leave balances initialized.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {balances.map(b => (
              <div key={b.leaveTypeId} className="text-center p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <p className="text-xs text-gray-500 mb-1 truncate">{b.leaveTypeName}</p>
                <p className="text-xl font-bold text-gray-900">{b.remainingDays}</p>
                <p className="text-xs text-gray-400 font-medium">of {b.totalDays} days</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all"
                    style={{width:`${Math.min((b.remainingDays/b.totalDays)*100,100)}%`}}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Grid */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">Leave History Log</h2>
        </div>
        <Table columns={columns} data={history} loading={loading} emptyMsg="No leave applications logged." />
      </div>

      {/* Apply Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Apply for Leave">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Leave Type *</label>
            <select className="input cursor-pointer"
              value={form.leaveTypeId} onChange={e=>setForm({...form, leaveTypeId: e.target.value})} required>
              <option value="">Select Leave Type</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Max {t.maxDays} days)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">From Date *</label>
              <input type="date" className="input cursor-pointer"
                value={form.fromDate} onChange={e=>setForm({...form, fromDate: e.target.value})} required/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">To Date *</label>
              <input type="date" className="input cursor-pointer"
                value={form.toDate} onChange={e=>setForm({...form, toDate: e.target.value})} required/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason for Leave *</label>
            <textarea className="input h-24" placeholder="Briefly describe the reason for your leave request..."
              value={form.reason} onChange={e=>setForm({...form, reason: e.target.value})} required/>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? "Submitting..." : "Apply"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
