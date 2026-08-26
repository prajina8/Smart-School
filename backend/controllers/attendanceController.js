import Attendance, { AttendanceSession } from "../models/Attendance.js";
import Course from "../models/Course.js";
import { generateQrToken } from "../utils/generateToken.js";
import { isWithinGeofence } from "../utils/geo.js";
import { emitToUser, emitToRoom } from "../utils/socket.js";
import Notification from "../models/Notification.js";

const defaultGeofence = () => ({
  lat: Number(process.env.CAMPUS_LAT) || 27.7,
  lng: Number(process.env.CAMPUS_LNG) || 85.3,
  radiusMeters: Number(process.env.CAMPUS_RADIUS_METERS) || 200,
});

export const openSession = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (req.user.role === "teacher" && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your course" });
    }

    const geofence = course.geofence?.lat ? course.geofence : defaultGeofence();

    const session = await AttendanceSession.create({
      course: course._id,
      teacher: req.user._id,
      currentQrToken: generateQrToken(),
      qrTokenIssuedAt: new Date(),
      geofence,
    });

   
    course.students.forEach((sid) => {
      emitToUser(sid, "attendance:session-open", {
        sessionId: session._id,
        courseId: course._id,
        courseTitle: course.title,
      });
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};


export const rotateQrToken = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session || !session.isOpen) {
      return res.status(404).json({ message: "Session not found or closed" });
    }
    session.currentQrToken = generateQrToken();
    session.qrTokenIssuedAt = new Date();
    await session.save();
    res.json({
      qrToken: session.currentQrToken,
      issuedAt: session.qrTokenIssuedAt,
      rotateSeconds: Number(process.env.QR_ROTATE_SECONDS) || 20,
    });
  } catch (err) {
    next(err);
  }
};


export const closeSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findByIdAndUpdate(
      req.params.id,
      { isOpen: false },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) {
    next(err);
  }
};


export const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, qrToken, lat, lng, deviceFingerprint, clientRecordId, offline } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session || !session.isOpen) {
      return res.status(400).json({ message: "Attendance session is not open" });
    }

  
    if (clientRecordId) {
      const existing = await Attendance.findOne({ clientRecordId });
      if (existing) return res.json({ attendance: existing, deduped: true });
    }

    if (qrToken !== session.currentQrToken) {
      return res.status(400).json({ message: "QR code expired or invalid. Please rescan." });
    }

  
    let geoResult = { withinGeofence: true, distanceMeters: 0 };
    if (typeof lat === "number" && typeof lng === "number" && session.geofence?.lat) {
      geoResult = isWithinGeofence(lat, lng, session.geofence, session.geofence.radiusMeters);
      if (!geoResult.withinGeofence) {
        return res.status(400).json({
          message: `You appear to be ${geoResult.distanceMeters}m from campus — outside the allowed ${session.geofence.radiusMeters}m radius.`,
        });
      }
    }

    const attendance = await Attendance.create({
      session: session._id,
      course: session.course,
      student: req.user._id,
      status: "present",
      qrTokenUsed: qrToken,
      location: { lat, lng, ...geoResult },
      deviceFingerprint,
      clientRecordId,
      syncedFromOffline: !!offline,
    });

    emitToUser(session.teacher, "attendance:marked", {
      sessionId: session._id,
      studentId: req.user._id,
      studentName: req.user.name,
    });

    res.status(201).json({ attendance });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Attendance already marked for this session" });
    }
    next(err);
  }
};


export const manualMark = async (req, res, next) => {
  try {
    const { sessionId, studentId, status } = req.body;
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const attendance = await Attendance.findOneAndUpdate(
      { session: sessionId, student: studentId },
      { session: sessionId, course: session.course, student: studentId, status },
      { upsert: true, new: true }
    );
    res.json({ attendance });
  } catch (err) {
    next(err);
  }
};


export const getAttendance = async (req, res, next) => {
  try {
    const { courseId, studentId, from, to, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (studentId) filter.student = studentId;
    if (req.user.role === "student") filter.student = req.user._id;
    if (from || to) {
      filter.markedAt = {};
      if (from) filter.markedAt.$gte = new Date(from);
      if (to) filter.markedAt.$lte = new Date(to);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate("student", "name rollNumber email")
        .populate("course", "title code")
        .sort("-markedAt")
        .skip(skip)
        .limit(Number(limit)),
      Attendance.countDocuments(filter),
    ]);
    res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.query;
    const matchStage = {};
    if (courseId) matchStage.course = courseId;
    if (studentId) matchStage.student = studentId;
    if (req.user.role === "student") matchStage.student = String(req.user._id);

    const mongoose = (await import("mongoose")).default;
    const match = {};
    if (matchStage.course) match.course = new mongoose.Types.ObjectId(matchStage.course);
    if (matchStage.student) match.student = new mongoose.Types.ObjectId(matchStage.student);

    const byDay = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$markedAt" } },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byStudent = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$student",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "student" },
      },
      { $unwind: "$student" },
      {
        $project: {
          name: "$student.name",
          rollNumber: "$student.rollNumber",
          present: 1,
          total: 1,
          percentage: {
            $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$present", "$total"] }, 100] }],
          },
        },
      },
      { $sort: { percentage: 1 } },
    ]);

    res.json({ byDay, byStudent });
  } catch (err) {
    next(err);
  }
};


export const getInsights = async (req, res, next) => {
  try {
    const { generateInsight } = await import("../utils/aiInsight.js");
    const studentId = req.params.studentId || req.user._id;
    const insight = await generateInsight(studentId);
    res.json(insight);
  } catch (err) {
    next(err);
  }
};
