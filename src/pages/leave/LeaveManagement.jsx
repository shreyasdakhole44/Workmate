import { useEffect, useState } from "react";
import { leaveAPI, employeeAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { Search, Calendar, CheckCircle, XCircle, Settings, Award } from "lucide-react";
import toast from "react-hot-toast";

export default function LeaveManagement() {
  const { user, isAdmin } = useAuth();
  
  const [requests,   setRequests]   = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,      setPage]      = useState(0);
  const [total,     setTotal]     = useState(0);
  const [status,    setStatus]    = useState("");
  
  // Rejection/Action Modals
  const [actionModal, setActionModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType,  setActionType]  = useState(""); // "APPROVE" | "REJECT"
  const [rejectReason,setRejectReason]= useState("");
  const [processing,  setProcessing]  = useState(false);

  // Balance Initialize Modal
  const [initModal,   setInitModal]   = useState(false);
  const [initEmpId,   setInitEmpId]   = useState("");
  const [initYear,    setInitYear]    = useState(new Date().getFullYear());
  const [initializing,setInitializing]= useState(false);

  useEffect(() => {
    loadRequests();
  }, [page, status]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.all(page, 10, status);
      setRequests(res.data.data?.content || []);
      setTotal(res.data.data?.totalElements || 0);
    } catch {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setRejectReason("");
    setActionModal(true);
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (actionType === "APPROVE") {
        await leaveAPI.approve(selectedReq.id, user?.userId);
        toast.success("Leave request approved successfully!");
      } else {
        if (!rejectReason) {
          toast.error("Please provide a rejection reason");
          setProcessing(false);
          return;
        }
        await leaveAPI.reject(selectedReq.id, user?.userId, rejectReason);
        toast.success("Leave request rejected");
      }
      setActionModal(false);
      loadRequests();
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to complete request action");
    } finally {
      setProcessing(false);
    }
  };

  const openInitModal = async () => {
    try {
      const res = await employeeAPI.getSummaries();
      setEmployees(res.data.data || []);
      setInitEmpId("");
      setInitYear(new Date().getFullYear());
      setInitModal(true);
    } catch {
      toast.error("Failed to load employee directory");
    }
  };

  const handleInitBalance = async (e) => {
    e.preventDefault();
    if (!initEmpId || !initYear) {
      toast.error("Please fill in all details");
      return;
    }
    setInitializing(true);
    try {
      await leaveAPI.initBalance(initEmpId, initYear);
      toast.success("Leave balances initialized successfully!");
      setInitModal(false);
    } catch(err) {
      toast.error(err.response?.data?.message || "Balance already initialized or failed");
    } finally {
      setInitializing(false);
    }
  };

  const columns = [
    {
      key: "employeeName",
      label: "Employee",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm"/>
          <div>
            <p className="font-medium text-gray-950 leading-none mb-0.5">{r.employeeName}</p>
            <p className="text-xs text-gray-400">{r.empCode} · {r.department}</p>
          </div>
        </div>
      )
    },
    { key: "leaveTypeName", label: "Leave Type", render: r => <Badge label={r.leaveTypeName} color="blue"/> },
    { key: "fromDate", label: "From" },
    { key: "toDate", label: "To" },
    { key: "totalDays", label: "Days", render: r => <span className="font-semibold text-brand text-xs">{r.totalDays}d</span> },
    { key: "reason", label: "Reason", render: r => <span className="text-gray-500 max-w-xs truncate block">{r.reason}</span> },
    { key: "status", label: "Status", render: r => <Badge label={r.status}/> },
    {
      key: "actions",
      label: "Actions",
      render: r => r.status === "PENDING" ? (
        <div className="flex gap-2">
          <button onClick={() => openActionModal(r, "APPROVE")}
            className="btn btn-success btn-sm cursor-pointer py-1 px-2.5 flex items-center gap-1">
            <CheckCircle size={13}/> Approve
          </button>
          <button onClick={() => openActionModal(r, "REJECT")}
            className="btn btn-danger btn-sm cursor-pointer py-1 px-2.5 flex items-center gap-1">
            <XCircle size={13}/> Reject
          </button>
        </div>
      ) : (
        <span className="text-gray-400 text-xs">Reviewed by {r.approvedByName || "System"}</span>
      )
    }
  ];

  return (
    <div>
      <TopBar
        title="Leave Request Management"
        subtitle="Approve leave applications and configure balances"
        action={
          <button onClick={openInitModal} className="btn-white flex items-center gap-2 cursor-pointer">
            <Award size={16}/> Initialize Balances
          </button>
        }
      />

      {/* Filter Options */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter State:</span>
        {["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0); }}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors
              ${status === s
                ? "bg-brand text-white shadow-sm"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"}`}>
            {s === "" ? "All Requests" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card">
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMsg="No leave requests logged."
        />

        {/* Pagination */}
        {total > 10 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {requests.length} of {total} entries</span>
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

      {/* Action Decision Modal */}
      <Modal open={actionModal} onClose={() => setActionModal(false)}
        title={actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}>
        <form onSubmit={handleAction} className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to {actionType === "APPROVE" ? "approve" : "reject"} the leave request from{" "}
            <span className="font-semibold text-gray-900">{selectedReq?.employeeName}</span> for{" "}
            <span className="font-semibold text-brand">{selectedReq?.totalDays} days</span>?
          </p>
          {actionType === "REJECT" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rejection Reason *</label>
              <textarea className="input h-20" placeholder="Please type the reason for rejection..."
                value={rejectReason} onChange={e=>setRejectReason(e.target.value)} required/>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={()=>setActionModal(false)}>Cancel</button>
            <button type="submit"
              className={`btn cursor-pointer ${actionType === "APPROVE" ? "btn-success" : "btn-danger"}`}
              disabled={processing}>
              {processing ? "Processing..." : actionType === "APPROVE" ? "Approve Request" : "Reject Request"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Balance Initialize Modal */}
      <Modal open={initModal} onClose={() => setInitModal(false)} title="Initialize Leave Balances">
        <form onSubmit={handleInitBalance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee *</label>
            <select className="input cursor-pointer"
              value={initEmpId} onChange={e=>setInitEmpId(e.target.value)} required>
              <option value="">Select Employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.empCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Calendar Year *</label>
            <select className="input cursor-pointer"
              value={initYear} onChange={e=>setInitYear(Number(e.target.value))} required>
              {[2024, 2025, 2026, 2027].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={()=>setInitModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={initializing}>
              {initializing ? "Initializing..." : "Initialize Balances"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
