import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["notice", "assignment"], default: "notice" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
      },
    ],
    audience: { type: String, enum: ["all", "students", "teachers"], default: "all" },
  },
  { timestamps: true }
);

noticeSchema.index({ title: "text", content: "text" });

export default mongoose.model("Notice", noticeSchema);
