// models/Discount.js
import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discount: { type: String, required: true }, 
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  image: { type: String },
  eventType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventType",
    required: true,
  },
});

export const Discount =
  mongoose.models.Discount || mongoose.model("Discount", DiscountSchema);
