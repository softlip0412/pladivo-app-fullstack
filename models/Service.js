import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    name: { type: String, required: true },
    description: String,

    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },

    unit: String,
    type: {
      type: String,
      enum: ["Hội nghị", "Sự kiện đại chúng", "Sự kiện công ty"],
      default: "Hội nghị",
    },
    status: { type: Boolean, default: true },

    images: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);
