import api from "../api/axios.js";

const QUEUE_KEY = "sc_offline_attendance_queue";
const DEVICE_ID_KEY = "sc_device_id";

// Stable per-browser device fingerprint (persisted, not tied to any account)
export const getDeviceFingerprint = () => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${navigator.userAgent.slice(0, 40)}-${screen.width}x${screen.height}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

const readQueue = () => JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
const writeQueue = (q) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));

export const queueLength = () => readQueue().length;

// Attempts to mark attendance immediately; if the network request fails
// (offline, timeout, etc.) the record is queued locally with a stable
// clientRecordId and retried automatically once connectivity returns.
export const markAttendanceWithOfflineSupport = async (payload) => {
  const clientRecordId = `${payload.sessionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = { ...payload, clientRecordId, deviceFingerprint: getDeviceFingerprint() };

  try {
    const { data } = await api.post("/attendance/mark", record);
    return { status: "synced", data };
  } catch (err) {
    if (!navigator.onLine || err.code === "ERR_NETWORK") {
      const q = readQueue();
      q.push({ ...record, offline: true, queuedAt: Date.now() });
      writeQueue(q);
      return { status: "queued", record };
    }
    throw err;
  }
};

export const syncOfflineQueue = async () => {
  const q = readQueue();
  if (!q.length) return { synced: 0, remaining: 0 };
  const remaining = [];
  let synced = 0;
  for (const record of q) {
    try {
      await api.post("/attendance/mark", record);
      synced++;
    } catch {
      remaining.push(record);
    }
  }
  writeQueue(remaining);
  return { synced, remaining: remaining.length };
};

export const initOfflineSync = (onSynced) => {
  window.addEventListener("online", async () => {
    const result = await syncOfflineQueue();
    if (result.synced > 0 && onSynced) onSynced(result);
  });
};
