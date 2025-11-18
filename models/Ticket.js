import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    type: String,
    price: Number,
    seat_info: String,
    quantity_total: Number,
    quantity_sold: { type: Number, default: 0 },
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
