import { connectDB } from "@/app/api/common/db";
import Role from "@/models/Role";
import mongoose from "mongoose";

export async function DELETE(_, { params }) {
  await connectDB();
  const { id } = params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const role = await Role.findByIdAndDelete(id);

  if (!role) {
    return Response.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
  }

  return Response.json(
    { success: true, message: "Xoá vai trò thành công" },
    { status: 200 }
  );
}
