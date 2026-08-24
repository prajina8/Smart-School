import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, CheckCircle2, WifiOff, ScanLine } from "lucide-react";
import toast from "react-hot-toast";
import { markAttendanceWithOfflineSupport, syncOfflineQueue, initOfflineSync } from "../../utils/offlineQueue.js";

const StudentCheckIn = () => {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get("session") || "");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [status, setStatus] = useState("idle"); // idle | locating | submitting | success | queued | error
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    initOfflineSync((result) => toast.success(`Synced ${result.synced} queued attendance record(s)`));
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleCheckIn = async () => {
    if (!sessionId || !token) {
      toast.error("Enter or scan a valid session and code first");
      return;
    }
    setStatus("locating");
    setMessage("");

    if (!navigator.geolocation) {
      toast.error("Your browser doesn't support location services");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("submitting");
        try {
          const result = await markAttendanceWithOfflineSupport({
            sessionId,
            qrToken: token,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          if (result.status === "synced") {
            setStatus("success");
            setMessage("Attendance marked successfully!");
            toast.success("Checked in!");
          } else {
            setStatus("queued");
            setMessage("You're offline — saved locally and will sync automatically once you're back online.");
            toast("Saved offline, will sync later", { icon: "📴" });
          }
        } catch (err) {
          setStatus("error");
          setMessage(err.response?.data?.message || "Could not mark attendance");
        }
      },
      () => {
        setStatus("error");
        setMessage("Location permission denied. Enable GPS to check in.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const manualSync = async () => {
    const result = await syncOfflineQueue();
    toast(`Synced ${result.synced}, ${result.remaining} still queued`, { icon: "🔄" });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mark attendance</h1>
        <p className="text-slate-500 text-sm">Scan your teacher's QR code, or enter it manually below</p>
      </div>

      {!isOnline && (
        <div className="card p-3 bg-amber-50 border-amber-200 flex items-center gap-2 text-amber-700 text-sm">
          <WifiOff size={16} /> You're offline — check-ins will be queued and synced automatically.
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Session ID</label>
          <input
            className="input font-mono text-xs"
            placeholder="Paste from teacher's screen or scan QR"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Attendance code</label>
          <input
            className="input font-mono text-xs"
            placeholder="Current rotating code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <button
          onClick={handleCheckIn}
          disabled={status === "locating" || status === "submitting"}
          className="btn-primary w-full"
        >
          <MapPin size={16} />
          {status === "locating"
            ? "Getting your location..."
            : status === "submitting"
            ? "Submitting..."
            : "Check in"}
        </button>

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 rounded-xl p-3">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}
        {status === "queued" && (
          <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 rounded-xl p-3">
            <WifiOff size={18} /> {message}
          </div>
        )}
        {status === "error" && (
          <div className="text-red-600 text-sm bg-red-50 rounded-xl p-3">{message}</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <ScanLine size={14} /> Tip: scanning the QR pre-fills these fields automatically
        </span>
        <button onClick={manualSync} className="underline">
          Sync now
        </button>
      </div>
    </div>
  );
};

export default StudentCheckIn;
