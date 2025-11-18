import { connectDB } from "@/lib/mongodb";
import {ServiceCategory} from "@/models";
import { authenticateToken } from "@/lib/auth";

// Xem chi tiết danh mục
export async function GET(_, { params }) {
  await connectDB();
  const category = await ServiceCategory.findById(params.id);
  if (!category) {
    return Response.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }
  return Response.json(category, { status: 200 });
}

// Cập nhật danh mục (Admin/Manager)
export async function PUT(request, { params }) {
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

  const updates = await request.json();
  const category = await ServiceCategory.findByIdAndUpdate(params.id, updates, {
    new: true,
  });
  if (!category) {
    return Response.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }

  return Response.json(
    { message: "Cập nhật danh mục thành công", category },
    { status: 200 }
  );
}

// Xoá danh mục (Admin/Manager)
export async function DELETE(_, { params }) {
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

  const deleted = await ServiceCategory.findByIdAndDelete(params.id);
  if (!deleted) {
    return Response.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }

  return Response.json(
    { message: "Xoá danh mục thành công" },
    { status: 200 }
  );
}
