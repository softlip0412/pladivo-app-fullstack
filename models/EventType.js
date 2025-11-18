import mongoose from "mongoose";

const EventTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.EventType ||
  mongoose.model("EventType", EventTypeSchema);
