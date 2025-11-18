import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    full_name: String,
    company_name: String,
    address: String,
    tax_code: String,
    payment_info: String,
    verified: { type: Boolean, default: false },
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.UserProfile ||
  mongoose.model("UserProfile", UserProfileSchema);
