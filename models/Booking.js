import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    event_type: {
      type: String,
      required: true,
      trim: true,
    },
    ticket_sale: {
      type: Boolean,
      default: false,
    },

    tickets: [
      {
        type: { type: String, required: true },
        quantity: { type: Number, default: 0 },
      },
    ],

    allow_auditing: { type: Boolean, default: false },
    auditing_areas: [
      {
        area_type: { type: String, required: true },
        quantity: { type: Number, default: 0 },
      },
    ],

    customer_name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },

    scale: { type: Number, default: 0 },

    services: [
      {
        service_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    booking_status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    notes: { type: String },

    payment_method: {
      type: String,
      enum: ["cash", "bank_transfer", "credit_card", "online"],
    },

    event_date: { type: Date, required: true },
    event_time: { type: String, trim: true },
    event_end_time: { type: String, trim: true },

    partner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: false,
    },

    booked_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
