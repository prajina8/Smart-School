import express from "express";
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getNotices);
router.post("/", authorize("admin", "teacher"), createNotice);
router.get("/:id", getNoticeById);
router.put("/:id", authorize("admin", "teacher"), updateNotice);
router.delete("/:id", authorize("admin", "teacher"), deleteNotice);

export default router;
