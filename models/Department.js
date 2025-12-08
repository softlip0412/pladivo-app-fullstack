import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, unique: true, sparse: true },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Department ||
  mongoose.model("Department", DepartmentSchema);
