import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { Search, Trash2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const roleBadge = {
  admin: "bg-purple-50 text-purple-700",
  teacher: "bg-blue-50 text-blue-700",
  student: "bg-green-50 text-green-700",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    const { data } = await api.get(`/users?${params.toString()}`);
    setUsers(data.users);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u._id}`, { isActive: !u.isActive });
    toast.success(`${u.name} ${u.isActive ? "deactivated" : "activated"}`);
    load();
  };

  const remove = async (u) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    await api.delete(`/users/${u._id}`);
    toast.success("User deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm">Manage students, teachers, and admins</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearch} className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 w-56" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        {["", "admin", "teacher", "student"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`btn-outline text-xs capitalize ${role === r ? "bg-brand-600 text-white border-brand-600" : ""}`}
          >
            {r || "All roles"}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.department || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)} className="flex items-center gap-1 text-xs">
                    <ShieldCheck size={14} className={u.isActive ? "text-green-500" : "text-slate-300"} />
                    {u.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(u)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-sm text-slate-400 p-6 text-center">No users found.</p>}
      </div>
    </div>
  );
};

export default Users;
