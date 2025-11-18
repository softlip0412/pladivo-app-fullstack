import mongoose from "mongoose";

const ServiceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
}, { timestamps: true });

export default mongoose.models.ServiceCategory || mongoose.model("ServiceCategory", ServiceCategorySchema);
