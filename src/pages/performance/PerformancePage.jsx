import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { performanceAPI, employeeAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import StatCard from "../../components/ui/StatCard";
import ScoreRing from "../../components/ui/ScoreRing";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Cell, CartesianGrid, LabelList 
} from "recharts";
import { 
  Star, Clipboard, MessageSquare, Award, Plus, 
  CheckCircle, ArrowRight, UserCheck, CalendarDays, Search 
} from "lucide-react";
import toast from "react-hot-toast";

export default function PerformancePage() {
  const { user } = useAuth();
  const isAdminOrHR = ["ADMIN", "HR_MANAGER"].includes(user?.role);

  // Tab control: "my" (My Performance) | "team" (Team Management)
  const [activeTab, setActiveTab] = useState(isAdminOrHR ? "team" : "my");

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Employee View States
  const [myReviews, setMyReviews] = useState([]);
  const [myStats, setMyStats] = useState({ totalReviews: 0, averageScore: 0 });

  // HR View States
  const [deptStats, setDeptStats] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [allTotal, setAllTotal] = useState(0);
  const [allPage, setAllPage] = useState(0);

  // Create Review States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [newReview, setNewReview] = useState({
    employeeId: "",
    period: "",
    score: 8,
    feedback: ""
  });

  // Filter States
  const [employeeFilter, setEmployeeFilter] = useState("");

  useEffect(() => {
    if (activeTab === "my") {
      loadMyPerformanceData();
    } else {
      loadHRPerformanceData();
    }
  }, [activeTab, allPage, employeeFilter]);

  const loadMyPerformanceData = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        performanceAPI.byEmployee(user.employeeId),
        performanceAPI.stats(user.employeeId)
      ]);
      setMyReviews(reviewsRes.data.data || []);
      setMyStats(statsRes.data.data || { totalReviews: 0, averageScore: 0 });
    } catch (e) {
      toast.error("Failed to load performance metrics");
    } finally {
      setLoading(false);
    }
  };

  const loadHRPerformanceData = async () => {
    setLoading(true);
    try {
      const [deptRes, allRes, empRes] = await Promise.all([
        performanceAPI.deptStats(),
        performanceAPI.all(allPage, 10),
        employeeAPI.getSummaries()
      ]);
      setDeptStats(deptRes.data.data || []);
      
      const dataVal = allRes.data.data;
      const reviewsList = Array.isArray(dataVal) ? dataVal : (dataVal?.content || []);
      // Apply local filtering by employee name if employeeFilter is specified
      const filteredReviews = employeeFilter 
        ? reviewsList.filter(r => r.employeeName?.toLowerCase().includes(employeeFilter.toLowerCase())) 
        : reviewsList;

      setAllReviews(filteredReviews);
      setAllTotal(filteredReviews.length);
      setEmployees(empRes.data.data || []);
    } catch (e) {
      toast.error("Failed to load department audit metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.employeeId || !newReview.period || !newReview.feedback) {
      toast.error("Please fill in all details");
      return;
    }
    setSaving(true);
    try {
      await performanceAPI.create({
        employeeId: Number(newReview.employeeId),
        reviewPeriod: newReview.period,
        score: Number(newReview.score),
        feedbackText: newReview.feedback
      });
      toast.success("Performance appraisal review submitted successfully!");
      setCreateModalOpen(false);
      setNewReview({ employeeId: "", period: "", score: 8, feedback: "" });
      loadHRPerformanceData();
    } catch (err) {
      toast.error("Failed to create performance review");
    } finally {
      setSaving(false);
    }
  };

  // Recharts color mapper matching theme
  const getDeptColor = (name) => {
    const map = {
      IT: "#2563EB",
      HR: "#EF4444",
      Finance: "#10B981",
      Marketing: "#F59E0B",
      Sales: "#8B5CF6",
    };
    return map[name] || "#6B7280";
  };

  const hrColumns = [
    {
      key: "employeeName",
      label: "Employee",
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100">
            {r.employeeName ? r.employeeName[0].toUpperCase() : "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-950 leading-none mb-1">{r.employeeName}</p>
            <p className="text-[10px] text-gray-400">Review Period: {r.period}</p>
          </div>
        </div>
      )
    },
    {
      key: "score",
      label: "Appraisal Rating",
      render: r => (
        <div className="flex items-center gap-1.5">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="font-bold text-gray-900 text-xs">{r.score}</span>
          <span className="text-[10px] text-gray-400">/ 10</span>
        </div>
      )
    },
    {
      key: "feedback",
      label: "Appraiser Feedback",
      render: r => <span className="text-gray-500 text-xs truncate max-w-xs block" title={r.feedback}>{r.feedback || "—"}</span>
    },
    {
      key: "reviewerName",
      label: "Reviewed By",
      render: r => <span className="text-gray-500 text-xs">{r.reviewerName || "System Appraiser"}</span>
    }
  ];

  const latestScore = myReviews[0]?.score || 0;

  return (
    <div className="space-y-6">
      <TopBar
        title="Performance Portal"
        subtitle="Track workforce feedback, complete appraisals reviews, and trace progress"
      />

      {/* Admin Tabs */}
      {isAdminOrHR && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("team")}
            className={`py-3 px-6 text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === "team" 
                ? "border-[#E8420A] text-[#E8420A] font-bold" 
                : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            Team Audit appraisals
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`py-3 px-6 text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === "my" 
                ? "border-[#E8420A] text-[#E8420A] font-bold" 
                : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            My Performance Review
          </button>
        </div>
      )}

      {activeTab === "my" ? (
        // ── EMPLOYEE REVIEW HISTORY VIEW ──
        <div className="space-y-6">
          {/* Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Appraisals" value={myStats.totalReviews} icon={Clipboard} accent="emerald" />
            <StatCard label="Average Rating" value={Number(myStats.averageScore).toFixed(1)} icon={Award} accent="emerald" />
            <StatCard label="Latest Rating Score" value={latestScore} icon={Star} accent="emerald" />
          </div>

          <h2 className="text-[15px] font-bold text-gray-800 pt-2">Performance History Timeline</h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="h-24 bg-gray-100 rounded-xl" />
            </div>
          ) : myReviews.length === 0 ? (
            <div className="card p-12 text-center text-gray-400 text-xs">
              No performance reviews logged under your profile.
            </div>
          ) : (
            // Timeline view cards
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[45px] before:w-0.5 before:bg-gray-150">
              {myReviews.map((rev, index) => (
                <div key={rev.id || index} className="flex gap-4 relative animate-fadeIn">
                  {/* Left Circle dot */}
                  <div className="w-[90px] flex items-center justify-center shrink-0 z-10 bg-white">
                    <ScoreRing score={rev.score} max={10} size={70} />
                  </div>
                  {/* Card Info Box */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Review Period</p>
                        <h4 className="text-xs font-extrabold text-[#0B3D2E] mt-0.5">{rev.period}</h4>
                      </div>
                      <span className="text-[10px] font-medium text-gray-455 flex items-center gap-1">
                        Reviewed by <span className="font-bold text-gray-800">{rev.reviewerName || "Manager"}</span>
                      </span>
                    </div>
                    <div className="bg-[#FAF7F2]/50 border border-[#E8E2D9]/40 rounded-lg p-3 mt-2 text-xs text-gray-655 leading-relaxed italic font-medium">
                      "{rev.feedback || "Good job! Keep performing well."}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ── HR TEAM APPRISAL AUDITS VIEW ──
        <div className="space-y-6">
          {/* Top chart card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Department Average Performance Ratings</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats} margin={{ top: 18, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="department" fontSize={10} stroke="#9ca3af" tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} fontSize={10} stroke="#9ca3af" tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0B3D2E", border: "none", fontSize: 11, borderRadius: 8 }} labelStyle={{ color: "#fff" }} />
                  <Bar dataKey="averageScore" radius={[6, 6, 0, 0]} barSize={32}>
                    <LabelList dataKey="averageScore" position="top" style={{ fill: '#374151', fontSize: 10, fontWeight: 'bold' }} />
                    {deptStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getDeptColor(entry.department)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input pl-9 text-xs"
                placeholder="Search reviews by employee..."
                value={employeeFilter}
                onChange={e => setEmployeeFilter(e.target.value)}
              />
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#E8420A] hover:bg-[#C73708] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Plus size={15} /> Create review
            </button>
          </div>

          {/* Reviews table */}
          {allReviews.length === 0 && !loading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <EmptyState
                icon={Star}
                title="No reviews yet this cycle"
                desc="Submit a performance review for team members to track feedback."
                action={
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-[#E8420A] hover:bg-[#C73708] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Plus size={15} /> Create Review
                  </button>
                }
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-0">
              <Table
                columns={hrColumns}
                data={allReviews}
                loading={loading}
                emptyMsg="No review files submitted."
              />
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE PERFORMANCE REVIEW */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Appraisal Review" size="md">
        <form onSubmit={handleCreateReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee *</label>
            <select
              value={newReview.employeeId}
              onChange={e => setNewReview({...newReview, employeeId: e.target.value})}
              className="input cursor-pointer text-xs"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.department})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Review Period *</label>
              <input
                type="text"
                className="input text-xs"
                placeholder="e.g. Q2 2026, Mid-Year"
                value={newReview.period}
                onChange={e => setNewReview({...newReview, period: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rating Score (1-10) *</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                className="input text-xs"
                placeholder="8.5"
                value={newReview.score}
                onChange={e => setNewReview({...newReview, score: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback Comments *</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-24"
              placeholder="State key accomplishments, strengths, and goals..."
              value={newReview.feedback}
              onChange={e => setNewReview({...newReview, feedback: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              className="btn btn-white text-xs cursor-pointer"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs cursor-pointer flex items-center justify-center min-w-24"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" color="white" /> : "Submit Review"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
