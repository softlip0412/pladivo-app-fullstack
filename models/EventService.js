import mongoose from "mongoose";

const EventServiceSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  service_ids: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  ],
  quantities: { type: Number, required: true },
  total_price: { type: Number, required: true },
});

export default mongoose.models.EventService ||
  mongoose.model("EventService", EventServiceSchema);
