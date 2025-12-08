import mongoose from "mongoose";

const PartnerContractSchema = new mongoose.Schema(
  {
    contract_number: { type: String, required: true, unique: true, trim: true },
    partner_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Partner", 
      required: true 
    },
    event_contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventContract"
    },
    title: { type: String, required: true },
    signed_date: { type: Date },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['draft', 'active', 'expired', 'terminated'], 
      default: 'draft' 
    },
    total_value: { type: Number, default: 0 },
    contract_file_url: { type: String }, // Link to stored fil
    notes: { type: String }
  },
  { timestamps: true }
);

// Prevent Mongoose OverwriteModelError in development
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.PartnerContract;
}

export default mongoose.models.PartnerContract || mongoose.model("PartnerContract", PartnerContractSchema);
