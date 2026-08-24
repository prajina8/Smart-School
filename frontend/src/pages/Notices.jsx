import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Bell, FileText, Plus, X, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const Notices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", type: "notice", audience: "all", dueDate: "" });
  const canPost = user?.role === "admin" || user?.role === "teacher";

  const load = async () => {
    const { data } = await api.get(`/notices${filter ? `?type=${filter}` : ""}`);
    setNotices(data.notices);
  };

  useEffect(() => {
    load();
    
  }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      let attachments = [];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
        attachments = [data];
      }
      await api.post("/notices", { ...form, attachments });
      toast.success(`${form.type === "assignment" ? "Assignment" : "Notice"} posted`);
      setShowForm(false);
      setForm({ title: "", content: "", type: "notice", audience: "all", dueDate: "" });
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notices & assignments</h1>
          <p className="text-slate-500 text-sm">Stay up to date with campus announcements</p>
        </div>
        {canPost && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <Plus size={16} /> New post
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="notice">Notice</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="label">Audience</label>
              <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea required className="input" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          {form.type === "assignment" && (
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label">Attachment (optional)</label>
            <input type="file" className="text-sm" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Post</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2">
        {["", "notice", "assignment"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`btn-outline text-xs ${filter === t ? "bg-brand-600 text-white border-brand-600" : ""}`}
          >
            {t === "" ? "All" : t === "notice" ? "Notices" : "Assignments"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n._id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                {n.type === "assignment" ? <FileText size={18} /> : <Bell size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{n.title}</p>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{n.content}</p>
                {n.dueDate && (
                  <p className="text-xs text-amber-600 mt-2">Due {new Date(n.dueDate).toLocaleDateString()}</p>
                )}
                {n.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {n.attachments.map((a, i) => (
                      <a
                        key={i}
                        href={`${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${a.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand-600 flex items-center gap-1"
                      >
                        <Paperclip size={12} /> {a.filename}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  {n.postedBy?.name} · {n.course?.title || "Campus-wide"}
                </p>
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="text-sm text-slate-400">No posts yet.</p>}
      </div>
    </div>
  );
};

export default Notices;
