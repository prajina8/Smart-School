import express from "express";
import { getTimetable, upsertTimetable, deleteTimetable } from "../controllers/timetableController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getTimetable);
router.post("/", authorize("admin", "teacher"), upsertTimetable);
router.delete("/:id", authorize("admin"), deleteTimetable);

export default router;
