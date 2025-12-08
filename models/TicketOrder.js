import mongoose from "mongoose";

const TicketOrderSchema = new mongoose.Schema(
  {
    order_code: {
      type: String,
      required: true,
      unique: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    // Customer Information
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    customer_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customer_phone: {
      type: String,
      required: true,
      trim: true,
    },
    // Ticket Details
    ticket_type: {
      type: String,
      required: true,
    },
    ticket_area: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Payment Information
    payment_status: {
      type: String,
      enum: ["pending", "paid", "refunded", "cancelled"],
      default: "pending",
    },
    payment_method: {
      type: String,
      enum: ["bank_transfer", "cash", "online"],
      default: "bank_transfer",
    },
    paid_at: {
      type: Date,
    },
    // QR Codes for tickets (array of base64 strings)
    qr_codes: [
      {
        type: String,
      },
    ],
    // Event Information (denormalized for quick access)
    event_name: String,
    event_date: Date,
    event_location: String,
  },
  { timestamps: true }
);

// Xóa model cũ nếu tồn tại để đảm bảo schema mới được sử dụng
if (mongoose.models.TicketOrder) {
  delete mongoose.models.TicketOrder;
}

export default mongoose.model("TicketOrder", TicketOrderSchema);
