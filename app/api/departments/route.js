import { connectDB } from "@/app/api/common/db";
import Department from "@/models/Department";

export async function GET() {
  await connectDB();
  const departments = await Department.find();
  return Response.json({ success: true, data: departments }, { status: 200 });
}

export async function POST(request) {
  await connectDB();
  const { name, description } = await request.json();

  if (!name) {
    return Response.json({ error: "Tên bộ phận là bắt buộc" }, { status: 400 });
  }

  const dep = new Department({ name, description });
  await dep.save();

  return Response.json({ success: true, message: "Tạo bộ phận thành công", data: dep }, { status: 201 });
}
