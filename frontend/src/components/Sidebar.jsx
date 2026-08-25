import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck2,
  Bell,
  MessageSquare,
  CalendarDays,
  Users,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
          <GraduationCap size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-900 leading-tight">Smart Campus</p>
          <p className="text-xs text-slate-400 leading-tight">Management System</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/courses" className={linkClass}>
          <BookOpen size={18} /> Courses
        </NavLink>
        <NavLink to="/attendance" className={linkClass}>
          <CalendarCheck2 size={18} /> Attendance
        </NavLink>
        <NavLink to="/notices" className={linkClass}>
          <Bell size={18} /> Notices
        </NavLink>
        <NavLink to="/messages" className={linkClass}>
          <MessageSquare size={18} /> Messages
        </NavLink>
        <NavLink to="/timetable" className={linkClass}>
          <CalendarDays size={18} /> Timetable
        </NavLink>
        {user?.role === "admin" && (
          <NavLink to="/users" className={linkClass}>
            <Users size={18} /> Users
          </NavLink>
        )}
      </nav>

      <div className="mt-auto px-2 py-3 text-xs text-slate-400">
        Signed in as <span className="font-medium text-slate-600">{user?.role}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
