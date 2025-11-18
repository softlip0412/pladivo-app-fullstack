import mongoose, { Schema } from "mongoose";

const ContractSchema = new Schema(
  {
    contract_code: { type: String, required: true, unique: true }, 
    partner_id: { type: String, required: true }, 
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    value: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "terminated", "draft"],
      default: "draft",
    },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models?.Contract || mongoose.model("Contract", ContractSchema);
