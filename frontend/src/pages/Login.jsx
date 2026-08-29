import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
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
      toast.error(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demoAccounts = {
      teacher: {
        email: "teacher@campus.edu",
        password: "password123",
      },
      student: {
        email: "student1@campus.edu",
        password: "password123",
      },
    };

    setForm(demoAccounts[role]);
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Logo and Heading */}
        <div className="login-header">

          <div className="login-logo">
            <GraduationCap size={30} />
          </div>

          <h1>Smart Campus</h1>

          <p>
            Login to manage your campus account
          </p>

        </div>


      
        <div className="login-card">

          <h2>Login</h2>

          <p className="login-subtitle">
            Enter your email and password to continue
          </p>


          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="login-field">

              <label htmlFor="email">
                Email
              </label>

              <div className="login-input-wrapper">

                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  required
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
            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <Lock size={19} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
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
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>


          
          <div className="login-divider">
            <span></span>
            <p>or login as</p>
            <span></span>
          </div>


   
          <div className="demo-buttons">

            <button
              type="button"
              onClick={() => fillDemo("teacher")}
            >
              Login as Teacher
            </button>

            <button
              type="button"
              onClick={() => fillDemo("student")}
            >
              Login as Student
            </button>

          </div>


        
          <p className="login-info">
            Demo accounts automatically fill the login details.
          </p>

        </div>


      
        <p className="login-footer">
          © {new Date().getFullYear()} Smart Campus
        </p>

      </div>

    </div>
  );
};

export default Login;

