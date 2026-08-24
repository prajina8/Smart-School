import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Search, Plus, BookOpen, X } from "lucide-react";
import toast from "react-hot-toast";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", department: "", semester: "", credits: 3, description: "" });
  const canCreate = user?.role === "admin" || user?.role === "teacher";

  const load = async (query = "") => {
    const { data } = await api.get(`/courses${query ? `?q=${query}` : ""}`);
    setCourses(data.courses);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(q);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/courses", form);
      toast.success("Course created");
      setShowForm(false);
      setForm({ title: "", code: "", department: "", semester: "", credits: 3, description: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-500 text-sm">Browse and manage course offerings</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <Plus size={16} /> New course
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Code</label>
            <input required className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label className="label">Semester</label>
            <input type="number" className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSearch} className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search courses..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c._id} className="card p-5">
            <div className="h-9 w-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
              <BookOpen size={18} />
            </div>
            <p className="font-semibold text-slate-800">{c.title}</p>
            <p className="text-xs text-slate-400 mb-2">{c.code} · {c.credits} credits</p>
            <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>{c.teacher?.name || "Unassigned"}</span>
              <span>{c.students?.length || 0} students</span>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="text-sm text-slate-400">No courses found.</p>}
      </div>
    </div>
  );
};

export default Courses;
