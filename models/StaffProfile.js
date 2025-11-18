import mongoose from "mongoose";

const StaffProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: String,
    position: String,
    hire_date: Date,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.StaffProfile ||
  mongoose.model("StaffProfile", StaffProfileSchema);
