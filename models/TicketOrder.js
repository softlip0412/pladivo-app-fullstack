import mongoose from "mongoose";

const TicketOrderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    quantity: Number,
    total_price: Number,
    payment_status: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.TicketOrder ||
  mongoose.model("TicketOrder", TicketOrderSchema);
