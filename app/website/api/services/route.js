import { connectDB } from "@/lib/mongodb";
import { Service } from "@/models";
import { authenticateToken } from "@/lib/auth";

// Lấy danh sách dịch vụ
export async function GET() {
  await connectDB();
  const services = await Service.find().populate("category_id", "name");
  return Response.json({ success: true, data: services }, { status: 200 });
}

// Tạo dịch vụ (Admin/Manager)
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

  const { category_id, name, description, price, unit, images } =
    await request.json();

  if (!category_id || !name || !price) {
    return Response.json(
      { error: "category_id, name, price là bắt buộc" },
      { status: 400 }
    );
  }

  const service = new Service({
    category_id,
    name,
    description,
    price,
    unit,
    images,
  });
  await service.save();

  return Response.json(
    { success: true, message: "Tạo dịch vụ thành công", data: service },
    { status: 201 }
  );
}
