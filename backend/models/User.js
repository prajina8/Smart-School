import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "teacher", "student"], default: "student" },

    
    rollNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    semester: { type: Number },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    
    employeeId: { type: String, trim: true },
    teachingCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    avatarUrl: { type: String, default: "" },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text", rollNumber: "text", department: "text" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
