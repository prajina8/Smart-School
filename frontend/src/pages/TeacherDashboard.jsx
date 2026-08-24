import { useEffect, useState } from "react";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import { BookOpen, Users, AlertTriangle, CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    api.get("/courses").then(({ data }) => {
      setCourses(data.courses);
      if (data.courses[0]) setSelectedCourse(data.courses[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/attendance/analytics?courseId=${selectedCourse}`).then(({ data }) => setAnalytics(data));
  }, [selectedCourse]);

  const totalStudents = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const atRisk = (analytics?.byStudent || []).filter((s) => s.percentage < 75);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher dashboard</h1>
          <p className="text-slate-500 text-sm">Manage your classes and track engagement</p>
        </div>
        <Link to="/attendance" className="btn-primary">
          <CalendarCheck2 size={16} /> Open attendance session
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Your courses" value={courses.length} accent="brand" />
        <StatCard icon={Users} label="Total students" value={totalStudents} accent="green" />
        <StatCard icon={AlertTriangle} label="At-risk (this course)" value={atRisk.length} accent="amber" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Attendance by student</h2>
          <select
            className="input w-auto"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        {!analytics || analytics.byStudent.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance data recorded yet for this course.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {analytics.byStudent.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.rollNumber}</p>
                </div>
                <span
                  className={`badge ${
                    s.percentage < 75 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                  }`}
                >
                  {Math.round(s.percentage)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
