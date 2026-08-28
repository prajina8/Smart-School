import express from "express";

import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "teacher"), getUsers);

router.post("/", authorize("admin"), createUser);

router.get("/:id", getUserById);

router.put("/:id", authorize("admin"), updateUser);

router.delete("/:id", authorize("admin"), deleteUser);

export default router;