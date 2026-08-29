import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "10:00"
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    room: { type: String, trim: true },
  },
  { _id: true }
);

const timetableSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    slots: [slotSchema],
  },
  { timestamps: true }
);

timetableSchema.index({ department: 1, semester: 1 }, { unique: true });

export default mongoose.model("Timetable", timetableSchema);
