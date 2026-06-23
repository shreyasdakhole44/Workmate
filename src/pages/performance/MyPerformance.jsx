import { useEffect, useState } from "react";
import { performanceAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Star, Award, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import toast from "react-hot-toast";

export default function MyPerformance() {
  const { user } = useAuth();
  const empId = user?.employeeId;

  const [reviews,  setReviews]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (empId) {
      loadPerformanceData();
    }
  }, [empId]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const [revRes, statsRes] = await Promise.all([
        performanceAPI.byEmployee(empId),
        performanceAPI.stats(empId)
      ]);
      setReviews(revRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch {
      toast.error("Failed to load performance reviews");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...reviews]
    .reverse()
    .map(r => ({
      period: r.reviewPeriod,
      score: r.score
    }));

  const getScoreColor = (score) => {
    if (score >= 8.5) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 7.0) return "text-blue-600 bg-blue-50 border-blue-100";
    if (score >= 5.0) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  return (
    <div>
      <TopBar title="My Performance Reviews" subtitle="Track your review history and ratings" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-brand rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Award}
            title="No Reviews Yet"
            desc="Your performance reviews will appear here once submitted by your reporting manager."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Average Rating" value={stats?.averageScore !== undefined ? `${stats.averageScore.toFixed(1)}/10` : "—"} icon={Star} accent="purple" sub="Cumulative rating" />
            <StatCard label="Total Reviews" value={stats?.totalReviews || reviews.length} icon={Award} accent="green" sub="Completed evaluations" />
            <StatCard label="Latest Rating" value={reviews[0] ? `${reviews[0].score}/10` : "—"} icon={TrendingUp} accent="blue" sub={reviews[0]?.scoreLabel || "Latest evaluation"} />
          </div>

          {/* Performance Chart and Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="card p-5 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Performance Rating Trend</h3>
                <p className="text-xs text-gray-400 mb-4">Historical progression of your appraisal scores</p>
              </div>
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                    <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}/>
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5} activeDot={{ r: 6 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List */}
            <div className="card p-5 flex flex-col">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Evaluation Details</h3>
              <p className="text-xs text-gray-400 mb-4">List of completed feedback reviews</p>
              <div className="space-y-4 overflow-y-auto max-h-[280px] pr-1">
                {reviews.map(r => (
                  <div key={r.id} className="p-3 border border-gray-100 rounded-xl bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{r.reviewPeriod}</p>
                        <p className="text-[10px] text-gray-400">{r.reviewDate}</p>
                      </div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreColor(r.score)}`}>
                        {r.score}/10
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 italic">"{r.comments || r.feedbackText}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Feedback timeline logs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Detailed Review Feedback</h3>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="card p-6 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{r.reviewPeriod} Evaluation</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getScoreColor(r.score)}`}>
                          {r.scoreLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar size={12}/> Reviewed on {r.reviewDate} by {r.reviewerName || "Reporting Manager"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{r.score} <span className="text-xs text-gray-400 font-normal">/ 10</span></p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Feedback Comments:</p>
                    <p className="text-xs text-gray-700 leading-relaxed italic">"{r.comments || r.feedbackText}"</p>
                    {r.aiSummary && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100 text-left">
                        <p className="text-[10px] font-semibold text-purple-700 mb-1 flex items-center gap-1.5">
                          <Sparkles size={12} /> AI-generated summary
                        </p>
                        <p className="text-xs text-purple-900 leading-relaxed font-normal">
                          {r.aiSummary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
