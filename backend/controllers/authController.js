import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";


export const register = async (req, res, next) => {
  try {
    return res.status(403).json({
      message:
        "Self-registration is disabled. Ask an admin to create your account.",
    });
  

    const { name, email, password, role, rollNumber, department, semester, employeeId, phone } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    
    const safeRole = ["student", "teacher"].includes(role) ? role : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      rollNumber,
      department,
      semester,
      employeeId,
      phone,
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ user: user.toSafeObject(), token });
  } catch (err) {
    next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }
    const token = generateToken(user._id, user.role);
    res.json({ user: user.toSafeObject(), token });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};


export const updateMe = async (req, res, next) => {
  try {
    const updatable = ["name", "phone", "department", "semester", "avatarUrl"];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};


export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};
