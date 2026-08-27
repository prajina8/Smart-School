import express from "express";
import { getSummary } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/summary", authorize("admin", "teacher"), getSummary);

export default router;
