import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    email: { type: String, unique: true },
    phone: String,
    role: {
      type: String,
      enum: ["customer", "staff", "manager", "admin", "system_admin", "employee"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
