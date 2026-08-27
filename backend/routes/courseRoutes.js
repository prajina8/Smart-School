import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
} from "../controllers/courseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getCourses);
router.post("/", authorize("admin", "teacher"), createCourse);
router.get("/:id", getCourseById);
router.put("/:id", authorize("admin", "teacher"), updateCourse);
router.delete("/:id", authorize("admin"), deleteCourse);
router.post("/:id/enroll", authorize("admin", "teacher"), enrollStudent);
router.post("/:id/unenroll", authorize("admin", "teacher"), unenrollStudent);

export default router;
