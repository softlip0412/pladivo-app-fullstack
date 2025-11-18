import { connectDB } from "@/app/api/common/db";
import Role from "@/models/Role";

export async function GET() {
  await connectDB();
  const roles = await Role.find().populate("department_id"); 
  return Response.json({ success: true, data: roles }, { status: 200 });
}

export async function POST(request) {
  await connectDB();
  const { name, description, department_id } = await request.json();

  // Validate
  if (!name) {
    return Response.json({ error: "Tên vai trò là bắt buộc" }, { status: 400 });
  }
  if (!department_id) {
    return Response.json({ error: "Vui lòng chọn bộ phận" }, { status: 400 });
  }

  // Tạo vai trò
  const role = new Role({ name, description, department_id });
  await role.save();

  return Response.json(
    { success: true, message: "Tạo vai trò thành công", data: role },
    { status: 201 }
  );
}
