import Course from "../models/Course.js";
import User from "../models/User.js";


export const getCourses = async (req, res, next) => {
  try {
    const { q, department, semester, teacher, sort = "-createdAt", page = 1, limit = 20 } =
      req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    if (teacher) filter.teacher = teacher;
    if (q) filter.$text = { $search: q };


    if (req.user.role === "student") filter.students = req.user._id;
    if (req.user.role === "teacher" && !req.query.all) filter.teacher = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("teacher", "name email")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);

    res.json({ courses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email rollNumber");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};


export const createCourse = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user.role === "teacher") payload.teacher = req.user._id;
    const course = await Course.create(payload);
    if (course.teacher) {
      await User.findByIdAndUpdate(course.teacher, { $addToSet: { teachingCourses: course._id } });
    }
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (req.user.role === "teacher" && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your course" });
    }
    Object.assign(course, req.body);
    await course.save();
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};


export const enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }
    await Course.findByIdAndUpdate(course._id, { $addToSet: { students: studentId } });
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: course._id } });
    res.json({ message: "Student enrolled" });
  } catch (err) {
    next(err);
  }
};

export const unenrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    await Course.findByIdAndUpdate(req.params.id, { $pull: { students: studentId } });
    await User.findByIdAndUpdate(studentId, { $pull: { enrolledCourses: req.params.id } });
    res.json({ message: "Student unenrolled" });
  } catch (err) {
    next(err);
  }
};
