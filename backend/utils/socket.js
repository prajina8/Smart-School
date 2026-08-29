import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;
const userSockets = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No auth token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.userId;
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);
    socket.join(`user:${uid}`);

    socket.on("disconnect", () => {
      userSockets.get(uid)?.delete(socket.id);
      if (userSockets.get(uid)?.size === 0) userSockets.delete(uid);
    });
  });

  return io;
};

export const getIo = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

export const emitToRoom = (room, event, payload) => {
  if (!io) return;
  io.to(room).emit(event, payload);
};
