import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { GraduationCap } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const map = {
      admin: "admin@campus.edu",
      teacher: "teacher@campus.edu",
      student: "student1@campus.edu",
    };
    setForm({ email: map[role], password: "password123" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mb-3">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Smart Campus</h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              placeholder="you@campus.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="h-px bg-slate-200 flex-1" /> or try a demo account{" "}
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["admin", "teacher", "student"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => fillDemo(r)}
                className="btn-outline text-xs capitalize"
              >
                {r}
              </button>
            ))}
          </div>
        </form>

        
      </div>
    </div>
  );
};

export default Login;
