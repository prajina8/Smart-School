import { useEffect, useState } from "react";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import { BookOpen, CalendarCheck2, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const severityStyle = {
  critical: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  good: "bg-green-50 text-green-700 border-green-200",
  unknown: "bg-slate-50 text-slate-600 border-slate-200",
};

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [insight, setInsight] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/courses").then(({ data }) => setCourses(data.courses)).catch(() => {});
    api.get("/attendance/insights").then(({ data }) => setInsight(data)).catch(() => {});
    api.get("/attendance/analytics").then(({ data }) => setAnalytics(data)).catch(() => {});
  }, []);

  const overallPct = analytics?.byStudent?.[0]?.percentage;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your dashboard</h1>
        <p className="text-slate-500 text-sm">Here's what's happening across your courses</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Enrolled courses" value={courses.length} accent="brand" />
        <StatCard
          icon={CalendarCheck2}
          label="Attendance (30d)"
          value={insight?.recentPercentage != null ? `${insight.recentPercentage}%` : "—"}
          accent="green"
        />
        <Link to="/attendance" className="card p-5 flex items-center gap-4 hover:border-brand-300 transition-colors">
          <div className="h-11 w-11 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
            <CalendarCheck2 size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Mark attendance</p>
            <p className="text-xs text-slate-500">Scan QR + verify location</p>
          </div>
        </Link>
      </div>

      {insight && (
        <div className={`card p-5 border ${severityStyle[insight.severity]}`}>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                AI attendance insight
              </p>
              <p className="text-sm font-medium">{insight.summary}</p>
              {insight.previousPercentage != null && insight.recentPercentage != null && (
                <div className="flex items-center gap-1 text-xs mt-2 opacity-80">
                  {insight.recentPercentage >= insight.previousPercentage ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {insight.previousPercentage}% → {insight.recentPercentage}% over 60 days
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Your courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400">You're not enrolled in any courses yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <div key={c._id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-800">{c.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {c.code} · {c.teacher?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
