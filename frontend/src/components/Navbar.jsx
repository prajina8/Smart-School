import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, setUnreadCount, setNotifications } = useSocket();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/notifications").then(({ data }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unread);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenBell = async () => {
    setOpen((o) => !o);
    if (unreadCount > 0) {
      await api.put("/notifications/read-all").catch(() => {});
      setUnreadCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur px-4 md:px-6 py-3">
      <button className="md:hidden text-slate-600" onClick={onMenuClick}>
        <Menu size={22} />
      </button>
      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={handleOpenBell}
          className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card p-2 z-30">
            <p className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase">Notifications</p>
            {notifications.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-slate-400">You're all caught up</p>
            )}
            {notifications.map((n) => (
              <div key={n._id || n.title + n.createdAt} className="px-2 py-2 rounded-lg hover:bg-slate-50">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                {n.body && <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
          <UserIcon size={16} />
        </div>
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="ml-2 p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
