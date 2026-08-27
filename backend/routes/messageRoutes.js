import express from "express";
import { getConversations, getThread, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/conversations", getConversations);
router.get("/:userId", getThread);
router.post("/", sendMessage);

export default router;
