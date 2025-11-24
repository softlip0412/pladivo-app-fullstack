import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type_id: { type: mongoose.Schema.Types.ObjectId, ref: "EventType" },
    title: { type: String, required: true },
    description: String,
    start_datetime: Date,
    duration: String,
    guest_count: Number,
    location: String,
    style_theme: String,
    status: {
      type: String,
      enum: ["draft", "confirmed", "in_progress", "finished", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
