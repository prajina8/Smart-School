import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });


export const generateQrToken = () => crypto.randomBytes(16).toString("hex");
