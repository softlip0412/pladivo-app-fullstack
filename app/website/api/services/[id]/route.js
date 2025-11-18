import { connectDB } from "@/lib/mongodb";
import {Service} from "@/models";
import { authenticateToken } from "@/lib/auth";

// Lấy chi tiết dịch vụ
export async function GET(_, { params }) {
  await connectDB();
  const service = await Service.findById(params.id).populate("category_id", "name");
  if (!service) {
    return Response.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }
  return Response.json(service, { status: 200 });
}

// Cập nhật dịch vụ (Admin/Manager)
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
  const service = await Service.findByIdAndUpdate(params.id, updates, { new: true });
  if (!service) {
    return Response.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }
  return Response.json({ message: "Cập nhật dịch vụ thành công", service }, { status: 200 });
}

// Xoá dịch vụ (Admin/Manager)
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

  const deleted = await Service.findByIdAndDelete(params.id);
  if (!deleted) {
    return Response.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }
  return Response.json({ message: "Xoá dịch vụ thành công" }, { status: 200 });
}
