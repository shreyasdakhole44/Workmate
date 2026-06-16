import { useEffect, useState } from "react";
import { performanceAPI, employeeAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { Plus, Award, Star, Sparkles, Calendar, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import toast from "react-hot-toast";

const PERIODS = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Annual 2025", "Q1 2026"];

const COLORS = ["#2563EB", "#0F766E", "#D97706", "#4F46E5", "#06B6D4", "#EC4899", "#8B5CF6", "#10B981"];

const AI_FEEDBACK_TEMPLATES = {
  excellent: [
    "Demonstrates exceptional work quality and technical skill. Proactively takes ownership of tasks, collaborates seamlessly across teams, and consistently exceeds deliverables. A critical leader and asset to the team.",
    "Outstanding performance this period. Solves complex problems with innovative designs, mentors junior peers, and models excellent code hygiene and productivity standards.",
    "Shows remarkable execution efficiency. Leads technical initiatives, maintains great communication, and always goes above and beyond to deliver top-tier business results."
  ],
  good: [
    "Consistently meets all key deliverables. Demonstrates reliable technical capability, works well with colleagues, and shows a strong work ethic. Recommended to take more proactive ownership of design initiatives.",
    "Consistent and dependable. Code quality is high, deliveries are on time, and cooperation in team reviews is excellent. Can focus on developing broader system design skills.",
    "A valuable and reliable team player. Meets sprint targets consistently and contributes constructive feedback in team meetings. Should push for more independent task completion."
  ],
  average: [
    "Meets basic expectations but has significant scope for skill enhancement. Execution speed is steady but requires focus on attention to detail and reduced dependency on senior engineers.",
    "Satisfactory performance, though deliverables are occasionally delayed. Needs to improve communication updates, technical code quality, and proactive query resolution.",
    "Demonstrates baseline competence. Requires guidance on system architecture and should focus on meeting sprint deadlines more consistently."
  ],
  needs_improvement: [
    "Currently falling short of department standards. Has missed multiple sprint deadlines and struggles with code quality. Needs structured monitoring and skill training to reach benchmarks.",
    "Underperforming in key execution metrics. Lacks team collaboration and technical deliveries require frequent bug refactoring. Performance improvement plan (PIP) recommended."
  ]
};

export default function TeamPerformance() {
  const { user } = useAuth();

  const [reviews,    setReviews]    = useState([]);
  const [deptStats,  setDeptStats]  = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,      setPage]      = useState(0);
  const [total,     setTotal]     = useState(0);
  
  // Appraise Modal
  const [modal,      setModal]      = useState(false);
  const [creating,   setCreating]   = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    score: "8",
    comments: "",
    reviewPeriod: "Q1 2025"
  });

  useEffect(() => {
    loadData();
    loadDeptStats();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await performanceAPI.all(page, 10);
      setReviews(res.data.data?.content || []);
      setTotal(res.data.data?.totalElements || 0);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const loadDeptStats = async () => {
    try {
      const res = await performanceAPI.deptStats();
      setDeptStats(res.data.data || []);
    } catch {}
  };

  const openAppraiseModal = async () => {
    try {
      const res = await employeeAPI.getSummaries();
      setEmployees(res.data.data || []);
      setForm({ employeeId: "", score: "8", comments: "", reviewPeriod: "Q1 2025" });
      setModal(true);
    } catch {
      toast.error("Failed to load employee list");
    }
  };

  const handleAIWriter = () => {
    setAiLoading(true);
    setTimeout(() => {
      const rating = Number(form.score);
      let pool = [];
      if (rating >= 9) pool = AI_FEEDBACK_TEMPLATES.excellent;
      else if (rating >= 7) pool = AI_FEEDBACK_TEMPLATES.good;
      else if (rating >= 5) pool = AI_FEEDBACK_TEMPLATES.average;
      else pool = AI_FEEDBACK_TEMPLATES.needs_improvement;

      const randomText = pool[Math.floor(Math.random() * pool.length)];
      setForm(prev => ({ ...prev, comments: randomText }));
      setAiLoading(false);
      toast.success("AI feedback drafted successfully!");
    }, 850);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.score || !form.comments || !form.reviewPeriod) {
      toast.error("Please fill in all details");
      return;
    }
    setCreating(true);
    try {
      await performanceAPI.create({
        employeeId: Number(form.employeeId),
        reviewerId: user?.userId,
        score: Number(form.score),
        comments: form.comments,
        reviewPeriod: form.reviewPeriod,
        reviewDate: new Date().toISOString().split("T")[0]
      });
      toast.success("Performance appraisal review created!");
      setModal(false);
      loadData();
      loadDeptStats();
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to create appraisal review");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this performance review history?")) return;
    try {
      await performanceAPI.delete(id);
      toast.success("Review history deleted");
      loadData();
      loadDeptStats();
    } catch {
      toast.error("Failed to delete review");
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
    { key: "reviewPeriod", label: "Review Period" },
    { key: "score", label: "Rating Score", render: r => <span className="font-semibold text-brand text-xs">{r.score}/10</span> },
    { key: "scoreLabel", label: "Category", render: r => <Badge label={r.scoreLabel}/> },
    { key: "comments", label: "Comments Feedbacks", render: r => <span className="text-gray-500 max-w-sm truncate block">{r.comments}</span> },
    { key: "reviewerName", label: "Reviewer", render: r => <span className="text-xs text-gray-500">{r.reviewerName || "Manager"}</span> },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-colors" title="Delete Review">
          <Trash2 size={15}/>
        </button>
      )
    }
  ];

  return (
    <div>
      <TopBar
        title="Team Performance Evaluations"
        subtitle="Appraise employees and view department metrics"
        action={
          <button onClick={openAppraiseModal} className="btn-primary flex items-center gap-2 cursor-pointer">
            <Plus size={16}/> Create Review Evaluation
          </button>
        }
      />

      {/* Recharts Analytics Bar Chart */}
      {deptStats.length > 0 && (
        <div className="card p-5 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Department Performance Metrics</h3>
            <p className="text-xs text-gray-400 mb-4">Average appraisal rating scores classified by department</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}/>
                <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                  {deptStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grid list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Evaluation Audit logs</h2>
        </div>
        <Table columns={columns} data={reviews} loading={loading} emptyMsg="No performance review logs found." />

        {/* Pagination */}
        {total > 10 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {reviews.length} of {total} entries</span>
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

      {/* Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Appraisal Evaluation">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Review Period *</label>
              <select className="input cursor-pointer"
                value={form.reviewPeriod} onChange={e=>setForm({...form, reviewPeriod: e.target.value})} required>
                {PERIODS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rating Score (1-10) *</label>
              <select className="input cursor-pointer"
                value={form.score} onChange={e=>setForm({...form, score: e.target.value})} required>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">Review Feedback Comments *</label>
              <button type="button" onClick={handleAIWriter} disabled={aiLoading}
                className="text-xs text-brand font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                <Sparkles size={12}/> {aiLoading ? "AI Writer thinking..." : "AI Review Writer"}
              </button>
            </div>
            <textarea className="input h-28" placeholder="Enter evaluation comments, strengths, or training targets. Click 'AI Review Writer' above to draft comments automatically."
              value={form.comments} onChange={e=>setForm({...form, comments: e.target.value})} required/>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={creating}>
              {creating ? "Creating..." : "Save Evaluation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
