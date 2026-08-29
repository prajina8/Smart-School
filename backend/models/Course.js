import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, trim: true },
    department: { type: String, trim: true },
    semester: { type: Number },
    credits: { type: Number, default: 3 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    geofence: {
      lat: { type: Number },
      lng: { type: Number },
      radiusMeters: { type: Number },
    },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", code: "text", department: "text" });

export default mongoose.model("Course", courseSchema);
