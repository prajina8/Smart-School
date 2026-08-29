import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    isOpen: { type: Boolean, default: true },
    currentQrToken: { type: String, required: true },
    qrTokenIssuedAt: { type: Date, default: Date.now },
    geofence: {
      lat: Number,
      lng: Number,
      radiusMeters: Number,
    },
  },
  { timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["present", "late", "absent"], default: "present" },
    markedAt: { type: Date, default: Date.now },


    qrTokenUsed: { type: String },
    location: {
      lat: Number,
      lng: Number,
      distanceMeters: Number,
      withinGeofence: Boolean,
    },
    deviceFingerprint: { type: String },

  
    clientRecordId: { type: String },
    syncedFromOffline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ course: 1, student: 1, session: 1 }, { unique: true });
attendanceSchema.index({ clientRecordId: 1 }, { sparse: true, unique: true });

export const AttendanceSession = mongoose.model("AttendanceSession", attendanceSessionSchema);
export default mongoose.model("Attendance", attendanceSchema);
