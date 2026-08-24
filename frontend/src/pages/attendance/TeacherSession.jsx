import { useEffect, useRef, useState } from "react";
import api from "../../api/axios.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { QrCode, Play, Square, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const ROTATE_SECONDS = 20;

const TeacherSession = () => {
  const { socket } = useSocket();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [session, setSession] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [countdown, setCountdown] = useState(ROTATE_SECONDS);
  const [checkins, setCheckins] = useState([]);
  const rotateTimer = useRef(null);
  const countdownTimer = useRef(null);

  useEffect(() => {
    api.get("/courses").then(({ data }) => {
      setCourses(data.courses);
      if (data.courses[0]) setSelectedCourse(data.courses[0]._id);
    });
    return () => {
      clearInterval(rotateTimer.current);
      clearInterval(countdownTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setCheckins((prev) => [{ ...payload, time: new Date() }, ...prev]);
      toast.success(`${payload.studentName} checked in`);
    };
    socket.on("attendance:marked", handler);
    return () => socket.off("attendance:marked", handler);
  }, [socket]);

  const startRotation = (sessionId) => {
    clearInterval(rotateTimer.current);
    clearInterval(countdownTimer.current);
    setCountdown(ROTATE_SECONDS);

    rotateTimer.current = setInterval(async () => {
      const { data } = await api.post(`/attendance/sessions/${sessionId}/rotate`);
      setQrToken(data.qrToken);
      setCountdown(ROTATE_SECONDS);
    }, ROTATE_SECONDS * 1000);

    countdownTimer.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
  };

  const openSession = async () => {
    try {
      const { data } = await api.post("/attendance/sessions", { courseId: selectedCourse });
      setSession(data.session);
      setQrToken(data.session.currentQrToken);
      setCheckins([]);
      startRotation(data.session._id);
      toast.success("Attendance session opened");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to open session");
    }
  };

  const closeSession = async () => {
    if (!session) return;
    await api.post(`/attendance/sessions/${session._id}/close`);
    clearInterval(rotateTimer.current);
    clearInterval(countdownTimer.current);
    setSession(null);
    setQrToken(null);
    toast("Session closed", { icon: "🔒" });
  };

  const checkInUrl = session
    ? `${window.location.origin}/attendance?session=${session._id}&token=${qrToken}`
    : "";
  const qrImageSrc = checkInUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(checkInUrl)}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance session</h1>
        <p className="text-slate-500 text-sm">
          Geofenced, rotating-QR check-in — screenshots expire in {ROTATE_SECONDS}s
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          {!session ? (
            <div className="space-y-4">
              <div>
                <label className="label">Course</label>
                <select
                  className="input"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-primary w-full" onClick={openSession} disabled={!selectedCourse}>
                <Play size={16} /> Open attendance session
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                {qrImageSrc && (
                  <img src={qrImageSrc} alt="Attendance QR code" className="rounded-xl border border-slate-200" />
                )}
                <div className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                  {countdown}s
                </div>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <RefreshCw size={14} /> Refreshes automatically every {ROTATE_SECONDS}s
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Students scan this with their phone camera, or open Attendance → enter the session
                and code manually.
              </p>
              <button className="btn-danger" onClick={closeSession}>
                <Square size={16} /> Close session
              </button>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={18} /> Live check-ins ({checkins.length})
          </h2>
          {checkins.length === 0 ? (
            <p className="text-sm text-slate-400">
              {session ? "Waiting for students to check in..." : "Open a session to see live check-ins here."}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {checkins.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <p className="text-sm font-medium text-slate-800">{c.studentName}</p>
                  <p className="text-xs text-slate-400">{c.time.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherSession;
