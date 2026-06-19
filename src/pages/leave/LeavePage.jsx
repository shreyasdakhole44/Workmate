import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { leaveAPI, employeeAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";
import { 
  CalendarDays, Plus, CheckCircle, XCircle, Info, 
  HelpCircle, Trash2, ShieldCheck, UserCheck 
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";
import { LEAVE_TYPES } from "../../utils/constants";

export default function LeavePage() {
  const { user } = useAuth();
  const isAdminOrHR = ["ADMIN", "HR_MANAGER"].includes(user?.role);
  
  // Tabs: "my" (My Leaves) | "pending" (Pending Approvals) | "all" (All Leaves)
  const [activeTab, setActiveTab] = useState(isAdminOrHR ? "pending" : "my");

  // Common loading states
  const [balances, setBalances] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter States (All Leaves Tab)
  const [statusFilter, setStatusFilter] = useState("");
  const [allPage, setAllPage] = useState(0);
  const [allTotal, setAllTotal] = useState(0);

  // Apply Leave Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const [applyForm, setApplyForm] = useState({
    leaveTypeId: 1,
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const year = new Date().getFullYear();

  useEffect(() => {
    loadLeaveBalances();
  }, [user]);

  useEffect(() => {
    if (activeTab === "my") {
      loadMyLeaves();
    } else if (activeTab === "pending") {
      loadPendingLeaves();
    } else if (activeTab === "all") {
      loadAllLeaves();
    }
  }, [activeTab, statusFilter, allPage]);

  const loadLeaveBalances = async () => {
    if (!user?.employeeId) return;
    try {
      const res = await leaveAPI.balance(user.employeeId, year);
      setBalances(res.data.data || []);
    } catch (e) {
      // Fallback
    }
  };

  const loadMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.mine(user?.employeeId);
      setMyHistory(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load your leave history");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.pending();
      setPendingRequests(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load pending queue leaves");
    } finally {
      setLoading(false);
    }
  };

  const loadAllLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.all(allPage, 10, statusFilter);
      const dataVal = res.data.data;
      const requestsList = Array.isArray(dataVal) ? dataVal : (dataVal?.content || []);
      setAllRequests(requestsList);
      setAllTotal(Array.isArray(dataVal) ? dataVal.length : (dataVal?.totalElements || 0));
    } catch (e) {
      toast.error("Failed to load leaves ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!applyForm.fromDate || !applyForm.toDate || !applyForm.reason) {
      toast.error("Please fill in all details");
      return;
    }
    if (new Date(applyForm.fromDate) > new Date(applyForm.toDate)) {
      toast.error("From Date cannot be after To Date");
      return;
    }

    setSubmitting(true);
    try {
      await leaveAPI.apply({
        employeeId: user.employeeId,
        leaveTypeId: Number(applyForm.applyLeaveTypeId || applyForm.leaveTypeId),
        fromDate: applyForm.fromDate,
        toDate: applyForm.toDate,
        reason: applyForm.reason
      });
      toast.success("Leave application submitted successfully!");
      setApplyModalOpen(false);
      setApplyForm({ leaveTypeId: 1, fromDate: "", toDate: "", reason: "" });
      loadLeaveBalances();
      loadMyLeaves();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to apply for leave. Balance might be insufficient.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    try {
      await leaveAPI.cancel(id, user.employeeId);
      toast.success("Leave request cancelled");
      loadMyLeaves();
      loadLeaveBalances();
    } catch (e) {
      toast.error("Failed to cancel leave request");
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveAPI.approve(id, user.userId);
      toast.success("Leave approved");
      loadPendingLeaves();
    } catch (e) {
      toast.error("Failed to approve leave request");
    }
  };

  const triggerReject = (id) => {
    setSelectedLeaveId(id);
    setRejectionReason("");
    setRejectionModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await leaveAPI.reject(selectedLeaveId, user.userId, rejectionReason);
      toast.success("Leave request rejected");
      setRejectionModalOpen(false);
      loadPendingLeaves();
    } catch (e) {
      toast.error("Failed to reject leave request");
    }
  };

  const myColumns = [
    {
      key: "leaveTypeName",
      label: "Leave Type",
      render: r => <span className="font-semibold text-xs text-gray-800">{r.leaveTypeName}</span>
    },
    {
      key: "period",
      label: "Period Range",
      render: r => <span className="text-gray-500 font-medium text-xs">{r.fromDate} to {r.toDate}</span>
    },
    {
      key: "totalDays",
      label: "Days Count",
      render: r => <span className="font-semibold text-gray-800 text-xs">{r.totalDays} Day{r.totalDays !== 1 ? "s" : ""}</span>
    },
    {
      key: "reason",
      label: "Reason",
      render: r => <span className="text-gray-500 text-xs truncate max-w-xs block" title={r.reason}>{r.reason}</span>
    },
    {
      key: "status",
      label: "Status",
      render: r => <Badge label={r.status} />
    },
    {
      key: "actions",
      label: "Action",
      render: r => r.status === "PENDING" ? (
        <button
          onClick={() => handleCancelLeave(r.id)}
          className="text-red-500 hover:text-red-700 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={13} /> Cancel
        </button>
      ) : <span className="text-gray-400">—</span>
    }
  ];

  const allColumns = [
    {
      key: "employeeName",
      label: "Employee",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm" />
          <p className="font-semibold text-gray-900 leading-none">{r.employeeName}</p>
        </div>
      )
    },
    {
      key: "leaveTypeName",
      label: "Leave Type",
      render: r => <span className="font-medium text-xs text-gray-750">{r.leaveTypeName}</span>
    },
    {
      key: "period",
      label: "Period Range",
      render: r => <span className="text-gray-500 text-xs">{r.fromDate} to {r.toDate}</span>
    },
    {
      key: "totalDays",
      label: "Days",
      render: r => <span className="font-semibold text-gray-850 text-xs">{r.totalDays}</span>
    },
    {
      key: "status",
      label: "Status",
      render: r => <Badge label={r.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <TopBar
        title="Leave Center"
        subtitle="Submit time-off requests, check balances, and manage department reviews"
        isSharedView={true}
      />

      {/* Tabs */}
      {isAdminOrHR && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "pending" 
                ? "border-brand text-brand" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Pending Approvals ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "all" 
                ? "border-brand text-brand" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            All Leaves Log
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "my" 
                ? "border-brand text-brand" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            My Leaves
          </button>
        </div>
      )}

      {activeTab === "my" ? (
        // ── EMPLOYEE TIME-OFF VIEW ──
        <div className="space-y-6">
          {/* Balance Cards Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-[15px] font-bold text-gray-800">Leave Balance Account</h2>
            <button
              onClick={() => setApplyModalOpen(true)}
              className="bg-[#E8420A] hover:bg-[#C73708] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Plus size={15} /> Apply for Leave
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {balances.map(bal => {
              const percent = Math.round((bal.remainingDays / bal.allocatedDays) * 100) || 0;
              return (
                <div key={bal.id} className="bg-white rounded-xl border border-[#E8E2D9]/60 p-5 flex flex-col justify-between space-y-3 shadow-sm">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{bal.leaveTypeName}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-[26px] font-extrabold text-[#0B3D2E] leading-none">{bal.remainingDays}</span>
                      <span className="text-xs text-gray-450 font-medium">of {bal.allocatedDays} days allocated</span>
                    </div>
                  </div>
                  <ProgressBar percentage={percent} color={percent < 30 ? "red" : (percent < 60 ? "amber" : "emerald")} height="h-2" />
                </div>
              );
            })}
          </div>

          {/* Leaves History Table */}
          <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-0 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-semibold text-gray-900">Leave History Ledger</h3>
            </div>
            <Table
              columns={myColumns}
              data={myHistory}
              loading={loading}
              emptyMsg="No leave requests logged."
            />
          </div>
        </div>
      ) : activeTab === "pending" ? (
        // ── HR PENDING CARDS VIEW ──
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-800">Leaves Request Approvals</h2>
            <span className="text-xs font-bold bg-[#FEF2EE] text-[#E8420A] px-3 py-1 rounded-full border border-[#E8420A]/10 shadow-sm">
              {pendingRequests.length} Requests Pending
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center space-y-2 shadow-sm">
              <UserCheck size={32} className="text-emerald-500" />
              <p className="font-semibold text-gray-700">All caught up!</p>
              <p>No team leaves pending administrator approvals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-[#E8E2D9]/60 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <Avatar name={req.employeeName} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate leading-none mb-1">{req.employeeName}</p>
                      <Badge label={req.leaveTypeName} />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Leave Period:</span>
                      <span className="font-semibold text-gray-800">{req.fromDate} to {req.toDate}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Total Days:</span>
                      <span className="font-extrabold text-[#E8420A]">{req.totalDays} Day{req.totalDays !== 1 ? "s" : ""}</span>
                    </div>
                    {req.reason && (
                      <div className="bg-[#FAF7F2]/50 border border-[#E8E2D9]/40 rounded-lg p-2.5 mt-1.5 text-gray-600 max-h-16 overflow-y-auto italic font-medium leading-relaxed">
                        "{req.reason}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="btn btn-success btn-sm py-2 px-3 text-[11px] font-semibold flex-1 justify-center cursor-pointer"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => triggerReject(req.id)}
                      className="btn btn-danger btn-sm py-2 px-3 text-[11px] font-semibold flex-1 justify-center cursor-pointer"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ── HR ALL LEAVES TABLE VIEW ──
        <div className="space-y-6 animate-fadeIn">
          {/* Status Filter Card */}
          <div className="card p-4 flex flex-wrap items-center gap-3 bg-white">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Status Audit</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setAllPage(0); }}
              className="input w-48 text-xs cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="card">
            <Table
              columns={allColumns}
              data={allRequests}
              loading={loading}
              emptyMsg="No leave ledgers found."
            />
            
            {allTotal > 10 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Showing {allRequests.length} of {allTotal} leave requests</span>
                <div className="flex gap-2">
                  <button disabled={allPage === 0} onClick={() => setAllPage(p => p - 1)} className="btn btn-white btn-sm py-1 px-3 cursor-pointer">Previous</button>
                  <button disabled={(allPage + 1) * 10 >= allTotal} onClick={() => setAllPage(p => p + 1)} className="btn btn-white btn-sm py-1 px-3 cursor-pointer">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR LEAVE */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="Apply for Leave" size="md">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Leave Type *</label>
            <select
              value={applyForm.applyLeaveTypeId || applyForm.leaveTypeId}
              onChange={e => setApplyForm({...applyForm, applyLeaveTypeId: Number(e.target.value)})}
              className="input cursor-pointer text-xs"
              required
            >
              {LEAVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name} (Max {t.maxDays} days)</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">From Date *</label>
              <input
                type="date"
                className="input text-xs cursor-pointer"
                value={applyForm.fromDate}
                onChange={e => setApplyForm({...applyForm, fromDate: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">To Date *</label>
              <input
                type="date"
                className="input text-xs cursor-pointer"
                value={applyForm.toDate}
                onChange={e => setApplyForm({...applyForm, toDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason for Absence *</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-24"
              placeholder="Provide a reason for leave submission..."
              value={applyForm.reason}
              onChange={e => setApplyForm({...applyForm, reason: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="btn btn-white text-xs cursor-pointer"
              onClick={() => setApplyModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs cursor-pointer flex items-center justify-center min-w-24"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" color="white" /> : "Apply Leave"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REJECTION REASON DIALOG */}
      <Modal open={rejectionModalOpen} onClose={() => setRejectionModalOpen(false)} title="Reject Leave Request" size="sm">
        <form onSubmit={handleReject} className="space-y-4">
          <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>Rejecting leave applications requires explaining comments for employee documentation files.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Comments / Reason *</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-20"
              placeholder="e.g. Critical deployment conflict"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="btn btn-white text-xs cursor-pointer"
              onClick={() => setRejectionModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger text-xs cursor-pointer"
            >
              Reject Leave
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
