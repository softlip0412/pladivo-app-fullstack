import mongoose from "mongoose";

const BookingFeedbackSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    customer_email: {
      type: String,
      required: true,
      trim: true,
    },
    customer_phone: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback_type: {
      type: String,
      enum: ["complaint", "suggestion", "praise", "question"],
      default: "question",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
    },
    staff_response: {
      type: String,
      default: "",
    },
    responded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    responded_at: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        url: String,
        public_id: String,
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BookingFeedbackSchema.index({ booking_id: 1 });
BookingFeedbackSchema.index({ status: 1 });
BookingFeedbackSchema.index({ priority: 1 });
BookingFeedbackSchema.index({ feedback_type: 1 });

export default mongoose.models.BookingFeedback ||
  mongoose.model("BookingFeedback", BookingFeedbackSchema);
