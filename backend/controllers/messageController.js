import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import { emitToUser } from "../utils/socket.js";
import mongoose from "mongoose";


export const getConversations = async (req, res, next) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user._id);
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: uid }, { recipient: uid }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", uid] }, "$recipient", "$sender"],
          },
          lastMessage: { $first: "$content" },
          lastAt: { $first: "$createdAt" },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$recipient", uid] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          role: "$user.role",
          lastMessage: 1,
          lastAt: 1,
          unread: 1,
        },
      },
      { $sort: { lastAt: -1 } },
    ]);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};


export const getThread = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherId },
        { sender: otherId, recipient: req.user._id },
      ],
    }).sort("createdAt");

    await Message.updateMany(
      { sender: otherId, recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};


export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content?.trim()) {
      return res.status(400).json({ message: "recipientId and content are required" });
    }
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim(),
    });

    emitToUser(recipientId, "message:new", message);

    const notif = await Notification.create({
      recipient: recipientId,
      title: `New message from ${req.user.name}`,
      body: content.slice(0, 140),
      type: "message",
      link: `/messages/${req.user._id}`,
    });
    emitToUser(recipientId, "notification:new", notif);

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};
