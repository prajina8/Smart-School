import Notice from "../models/Notice.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitToUser } from "../utils/socket.js";

export const getNotices = async (req, res, next) => {
  try {
    const { q, courseId, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (type) filter.type = type;
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);
    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .populate("postedBy", "name role")
        .populate("course", "title code")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Notice.countDocuments(filter),
    ]);
    res.json({ notices, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("postedBy", "name role")
      .populate("course", "title code");
    if (!notice) return res.status(404).json({ message: "Not found" });
    res.json({ notice });
  } catch (err) {
    next(err);
  }
};

export const createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, postedBy: req.user._id });

   
    let recipients = [];
    if (notice.course) {
      const course = await Course.findById(notice.course);
      recipients = course ? [...course.students, course.teacher].filter(Boolean) : [];
    } else {
      const roleFilter =
        notice.audience === "students"
          ? { role: "student" }
          : notice.audience === "teachers"
          ? { role: "teacher" }
          : {};
      recipients = (await User.find(roleFilter, "_id")).map((u) => u._id);
    }

    const notifDocs = recipients.map((r) => ({
      recipient: r,
      title: notice.type === "assignment" ? `New assignment: ${notice.title}` : `New notice: ${notice.title}`,
      body: notice.content.slice(0, 140),
      type: notice.type,
      link: `/notices/${notice._id}`,
    }));
    if (notifDocs.length) {
      const created = await Notification.insertMany(notifDocs);
      created.forEach((n) => emitToUser(n.recipient, "notification:new", n));
    }

    res.status(201).json({ notice });
  } catch (err) {
    next(err);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: "Not found" });
    res.json({ notice });
  } catch (err) {
    next(err);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
