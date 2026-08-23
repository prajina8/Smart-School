import { useEffect, useState } from "react";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import { Users, GraduationCap, BookOpen, Bell, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#1e40af", "#3b82f6", "#1d4ed8"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">Loading dashboard...</p>;
  if (!data) return <p className="text-slate-400">No data available yet.</p>;

  const trend = data.attendanceTrend.map((d) => ({
    date: d._id.slice(5),
    rate: d.total ? Math.round((d.present / d.total) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin overview</h1>
        <p className="text-slate-500 text-sm">Campus-wide stats at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Students" value={data.counts.studentCount} accent="brand" />
        <StatCard icon={Users} label="Teachers" value={data.counts.teacherCount} accent="purple" />
        <StatCard icon={BookOpen} label="Courses" value={data.counts.courseCount} accent="green" />
        <StatCard icon={Bell} label="Notices" value={data.counts.noticeCount} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-4">Attendance rate — last 30 days</h2>
          {trend.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Students by department</h2>
          {data.departmentBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400">No department data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.departmentBreakdown}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={80}
                  label
                >
                  {data.departmentBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" /> At-risk students (below 75% in the
          last 30 days)
        </h2>
        {data.atRiskStudents.length === 0 ? (
          <p className="text-sm text-slate-400">No at-risk students right now. 🎉</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.atRiskStudents.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.rollNumber}</p>
                </div>
                <span className="badge bg-red-50 text-red-600">{Math.round(s.percentage)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
