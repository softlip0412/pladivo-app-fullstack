import mongoose from "mongoose";

const EquipmentSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    status: {
      type: String,
      enum: ["available", "in_use", "maintenance", "broken"],
      default: "available",
    },
    purchase_date: Date,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.Equipment ||
  mongoose.model("Equipment", EquipmentSchema);
