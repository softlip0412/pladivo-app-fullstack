import mongoose from "mongoose";

const EmailVerificationTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.EmailVerificationToken ||
  mongoose.model("EmailVerificationToken", EmailVerificationTokenSchema);
