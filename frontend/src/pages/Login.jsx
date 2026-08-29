
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  BookOpen,
} from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    setForm({
      email: map[role],
      password: "password123",
    });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-sage/20">

        <div className="grid min-h-[650px] lg:grid-cols-2">

          {/* =====================================================
              LEFT SIDE - BRANDING
          ====================================================== */}
          <div className="relative hidden overflow-hidden bg-espresso lg:flex">

            {/* Decorative shapes */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-terracotta-600/20" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sage/10" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16 text-white">

              {/* Logo */}
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-600 shadow-lg">
                  <GraduationCap size={27} />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Smart Campus
                  </h1>

                  <p className="text-xs text-white/50">
                    Management System
                  </p>
                </div>

              </div>

              {/* Main content */}
              <div className="max-w-lg">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">

                  <span className="h-2 w-2 rounded-full bg-sage" />

                  <span className="text-xs font-medium text-white/70">
                    Smart education management
                  </span>

                </div>

                <h2 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                  Everything your campus needs,
                  <span className="block text-terracotta-500">
                    in one place.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  Manage students, teachers, academics, timetables and
                  campus activities through one simple and secure platform.
                </p>

                {/* Feature cards */}
                <div className="mt-10 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <Users
                      size={22}
                      className="mb-4 text-terracotta-500"
                    />

                    <h3 className="font-semibold">
                      Manage Users
                    </h3>

                    <p className="mt-1 text-xs text-white/45">
                      Students, teachers and administrators
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <BookOpen
                      size={22}
                      className="mb-4 text-terracotta-500"
                    />

                    <h3 className="font-semibold">
                      Academic Tools
                    </h3>

                    <p className="mt-1 text-xs text-white/45">
                      Organize your campus efficiently
                    </p>
                  </div>

                </div>

              </div>

              {/* Footer */}
              <p className="text-xs text-white/35">
                © {new Date().getFullYear()} Smart Campus
              </p>

            </div>
          </div>


          {/* =====================================================
              RIGHT SIDE - LOGIN
          ====================================================== */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">

            <div className="w-full max-w-md">

              {/* Mobile logo */}
              <div className="mb-9 flex items-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta-600 text-white">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <h1 className="font-bold text-espresso">
                    Smart Campus
                  </h1>

                  <p className="text-xs text-sage">
                    Management System
                  </p>
                </div>

              </div>


              {/* Heading */}
              <div className="mb-8">

                <p className="mb-2 text-sm font-semibold text-terracotta-600">
                  Welcome back 👋
                </p>

                <h2 className="text-3xl font-extrabold tracking-tight text-espresso">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-sage">
                  Enter your credentials to access your campus dashboard.
                </p>

              </div>


              {/* Login form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="label"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage"
                    />

                    <input
                      id="email"
                      type="email"
                      required
                      className="input pl-11"
                      placeholder="you@campus.edu"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="label"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="input pl-11 pr-11"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage hover:text-espresso transition"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>


                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-terracotta-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>


              {/* Demo accounts */}
              <div className="mt-7">

                <div className="flex items-center gap-3">

                  <div className="h-px flex-1 bg-sage/20" />

                  <span className="text-[11px] font-medium uppercase tracking-wider text-sage">
                    Demo accounts
                  </span>

                  <div className="h-px flex-1 bg-sage/20" />

                </div>


                <div className="mt-4 grid grid-cols-3 gap-2">

                  {["admin", "teacher", "student"].map((role) => (

                    <button
                      type="button"
                      key={role}
                      onClick={() => fillDemo(role)}
                      className="rounded-xl border border-sage/25 bg-sage/5 px-3 py-2.5 text-xs font-medium capitalize text-espresso transition-all hover:-translate-y-0.5 hover:border-terracotta-500/40 hover:bg-terracotta-500/5"
                    >
                      {role}
                    </button>

                  ))}

                </div>

                <p className="mt-3 text-center text-[11px] text-sage">
                  Click a role to automatically fill its credentials.
                </p>

              </div>


              {/* Security notice */}
              <div className="mt-7 flex items-start gap-3 rounded-xl border border-sage/20 bg-sage/5 p-4">

                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-sage"
                />

                <div>

                  <p className="text-xs font-semibold text-espresso">
                    Secure access
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-sage">
                    Your credentials are protected with secure
                    authentication.
                  </p>

                </div>

              </div>


              {/* Register */}
              <p className="mt-7 text-center text-sm text-sage">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-terracotta-600 hover:text-terracotta-700"
                >
                  Register
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;

