import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, trim: true },
    partner_type: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Partner || mongoose.model("Partner", PartnerSchema);
