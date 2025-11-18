import { connectDB } from "@/app/api/common/db";
import Department from "@/models/Department";
import mongoose from "mongoose";

export async function DELETE(_, { params }) {
  await connectDB();
  const { id } = params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const dep = await Department.findByIdAndDelete(id);

  if (!dep) {
    return Response.json({ error: "Không tìm thấy bộ phận" }, { status: 404 });
  }

  return Response.json(
    { success: true, message: "Xoá bộ phận thành công" },
    { status: 200 }
  );
}
