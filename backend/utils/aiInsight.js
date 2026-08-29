import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const generateInsight = async (studentId) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [recent, previous, student] = await Promise.all([
    Attendance.find({ student: studentId, markedAt: { $gte: thirtyDaysAgo } }),
    Attendance.find({ student: studentId, markedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    User.findById(studentId),
  ]);

  const pct = (records) => {
    if (!records.length) return null;
    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    return Math.round((present / records.length) * 1000) / 10;
  };

  const recentPct = pct(recent);
  const previousPct = pct(previous);

  const stats = {
    studentId,
    studentName: student?.name,
    recentPercentage: recentPct,
    previousPercentage: previousPct,
    recentSessionCount: recent.length,
    previousSessionCount: previous.length,
  };

  const summary = buildSummary(stats);
  const severity = classifySeverity(stats);

  return { ...stats, summary, severity, generatedAt: new Date() };
};

function buildSummary({ studentName, recentPercentage, previousPercentage }) {
  if (recentPercentage === null) {
    return `No attendance records in the last 30 days yet for ${studentName || "this student"}.`;
  }
  if (previousPercentage === null) {
    return `${studentName || "This student"}'s attendance over the last 30 days is ${recentPercentage}%.`;
  }

  const delta = Math.round((recentPercentage - previousPercentage) * 10) / 10;

  if (delta <= -15) {
    return `${studentName}'s attendance has dropped sharply from ${previousPercentage}% to ${recentPercentage}% over the last month — this is a significant decline worth checking in on.`;
  }
  if (delta < 0) {
    return `${studentName}'s attendance has dipped from ${previousPercentage}% to ${recentPercentage}% over the last month.`;
  }
  if (delta === 0) {
    return `${studentName}'s attendance has stayed steady at ${recentPercentage}% over the last month.`;
  }
  return `${studentName}'s attendance has improved from ${previousPercentage}% to ${recentPercentage}% over the last month. Nice trend.`;
}

function classifySeverity({ recentPercentage, previousPercentage }) {
  if (recentPercentage === null) return "unknown";
  if (recentPercentage < 60) return "critical";
  const delta = previousPercentage === null ? 0 : recentPercentage - previousPercentage;
  if (delta <= -15 || recentPercentage < 75) return "warning";
  return "good";
}
