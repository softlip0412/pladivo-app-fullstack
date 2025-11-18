import { connectDB } from "@/lib/mongodb";
import {ServiceCategory} from "@/models";
import { authenticateToken } from "@/lib/auth";

// Lấy danh sách danh mục dịch vụ
export async function GET() {
  await connectDB();
  const categories = await ServiceCategory.find();
  return Response.json(categories, { status: 200 });
}

// Tạo danh mục dịch vụ (Admin/Manager)
export async function POST(request) {
  await connectDB();
  let user;
  try {
    user = authenticateToken();
    if (!["admin", "manager"].includes(user.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { name, image } = await request.json();
  if (!name) {
    return Response.json({ error: "Tên danh mục bắt buộc" }, { status: 400 });
  }

  const category = new ServiceCategory({ name, image });
  await category.save();

  return Response.json({ message: "Tạo danh mục thành công", category }, { status: 201 });
}
