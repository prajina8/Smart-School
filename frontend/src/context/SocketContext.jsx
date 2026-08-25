import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("sc_token");
    if (!user || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
      toast(notif.title, { icon: "🔔" });
    });

    socket.on("message:new", (msg) => {
      toast(`New message`, { icon: "💬" });
    });

    socket.on("attendance:session-open", (payload) => {
      toast(`Attendance open for ${payload.courseTitle}`, { icon: "📍" });
    });

    return () => socket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, notifications, unreadCount, setUnreadCount, setNotifications }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
