import { connectDB } from "@/lib/mongodb";
import {EventService, Service} from "@/models";
import { authenticateToken } from "@/lib/auth";

// Lấy chi tiết event-service
export async function GET(_, { params }) {
  await connectDB();
  const record = await EventService.findById(params.id)
    .populate("event_id", "title")
    .populate("service_ids", "name price");
  if (!record) {
    return Response.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }
  return Response.json(record, { status: 200 });
}

// Cập nhật event-service
export async function PUT(request, { params }) {
  await connectDB();
  let user;
  try {
    user = authenticateToken();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { service_ids } = await request.json();

  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    return Response.json({ error: "service_ids là bắt buộc" }, { status: 400 });
  }

  // Số lượng service
  const quantities = service_ids.length;

  // Tính tổng giá
  const services = await Service.find({ _id: { $in: service_ids } });
  if (services.length !== service_ids.length) {
    return Response.json(
      { error: "Một hoặc nhiều service_ids không tồn tại" },
      { status: 400 }
    );
  }

  const total_price = services.reduce((sum, service) => sum + service.price, 0);

  const record = await EventService.findByIdAndUpdate(
    params.id,
    { service_ids, quantities, total_price },
    { new: true }
  )
    .populate("event_id", "title")
    .populate("service_ids", "name price");

  if (!record) {
    return Response.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }

  return Response.json(
    { message: "Cập nhật thành công", record },
    { status: 200 }
  );
}

// Xoá event-service
export async function DELETE(_, { params }) {
  await connectDB();
  let user;
  try {
    user = authenticateToken();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const deleted = await EventService.findByIdAndDelete(params.id);
  if (!deleted) {
    return Response.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }

  return Response.json({ message: "Xoá thành công" }, { status: 200 });
}
