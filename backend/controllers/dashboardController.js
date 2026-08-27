import User from "../models/User.js";
import Course from "../models/Course.js";
import Attendance from "../models/Attendance.js";
import Notice from "../models/Notice.js";


export const getSummary = async (req, res, next) => {
  try {
    const [studentCount, teacherCount, courseCount, noticeCount] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      Course.countDocuments(),
      Notice.countDocuments(),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendanceTrend = await Attendance.aggregate([
      { $match: { markedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$markedAt" } },
          present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const departmentBreakdown = await User.aggregate([
      { $match: { role: "student", department: { $ne: null } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    const atRiskStudents = await Attendance.aggregate([
      { $match: { markedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$student",
          present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
        },
      },
      { $match: { percentage: { $lt: 75 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $project: { name: "$student.name", rollNumber: "$student.rollNumber", percentage: 1 } },
      { $sort: { percentage: 1 } },
      { $limit: 10 },
    ]);

    res.json({
      counts: { studentCount, teacherCount, courseCount, noticeCount },
      attendanceTrend,
      departmentBreakdown,
      atRiskStudents,
    });
  } catch (err) {
    next(err);
  }
};
