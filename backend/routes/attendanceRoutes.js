import express from "express";
import {
  openSession,
  rotateQrToken,
  closeSession,
  markAttendance,
  manualMark,
  getAttendance,
  getAnalytics,
  getInsights,
  takeAttendance,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/sessions", authorize("admin", "teacher"), openSession);
router.post("/sessions/:id/rotate", authorize("admin", "teacher"), rotateQrToken);
router.post("/sessions/:id/close", authorize("admin", "teacher"), closeSession);

router.post("/mark", authorize("student"), markAttendance);
router.post("/manual", authorize("admin", "teacher"), manualMark);

router.get("/", getAttendance);
router.get("/analytics", getAnalytics);
router.get("/insights/:studentId?", getInsights);

export default router;
