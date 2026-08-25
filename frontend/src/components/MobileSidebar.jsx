import { NavLink } from "react-router-dom";
import { X, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `block px-3.5 py-2.5 rounded-xl text-sm font-medium ${
    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

const MobileSidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  if (!open) return null;

  const links = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/courses", label: "Courses" },
    { to: "/attendance", label: "Attendance" },
    { to: "/notices", label: "Notices" },
    { to: "/messages", label: "Messages" },
    { to: "/timetable", label: "Timetable" },
    ...(user?.role === "admin" ? [{ to: "/users", label: "Users" }] : []),
  ];

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <p className="font-bold text-slate-900">Smart Campus</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={onClose}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
