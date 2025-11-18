// models/Task.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    custom_owner: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notes: {
      type: String,
      default: "",
    },
    report: {
      content: {
        type: String,
        default: "",
      },
      images: [
        {
          url: String,
          public_id: String,
          uploaded_at: { type: Date, default: Date.now },
        },
      ],
      submitted_at: {
        type: Date,
        default: null,
      },
      submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        default: null,
      },
    },
    // ✅ Thêm trường đánh giá
    evaluation: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        default: "",
      },
      evaluated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        default: null,
      },
      evaluated_at: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ staff_id: 1, status: 1 });
TaskSchema.index({ booking_id: 1 });
TaskSchema.index({ deadline: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);