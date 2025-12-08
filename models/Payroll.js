import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    base_salary: {
      type: Number,
      default: 0,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    kpi_bonus: {
      type: Number,
      default: 0,
    },
    total_tasks: {
      type: Number,
      default: 0,
    },
    previous_month_tasks: {
      type: Number,
      default: 0,
    },
    kpi_percentage: {
      type: Number,
      enum: [0, 50, 100],
      default: 0,
    },
    total_salary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "approved", "paid"],
      default: "draft",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index để tránh duplicate cho cùng staff/month/year
PayrollSchema.index({ staff_id: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Payroll || mongoose.model("Payroll", PayrollSchema);
