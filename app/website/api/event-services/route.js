import { connectDB } from "@/lib/mongodb";
import {EventService, Service, Event} from "@/models";
import { authenticateToken } from "@/lib/auth";

// Lấy danh sách event-services
export async function GET() {
  await connectDB();

  try {
    const eventServices = await EventService.find()
      .populate({
        path: "event_id",
        populate: { path: "type_id", model: "EventType" }, // lấy EventType trong Event
      })
      .populate("service_ids"); // lấy Service

    return Response.json(eventServices, { status: 200 });
  } catch (error) {
    console.error("Error fetching event services:", error);
    return Response.json({ error: "Failed to fetch event services" }, { status: 500 });
  }
}
// Tạo event-service
export async function POST(request) {
  await connectDB();
  let user;
  try {
    user = authenticateToken(); // cần đăng nhập
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { event_id, service_ids } = await request.json();

  if (!event_id || !Array.isArray(service_ids) || service_ids.length === 0) {
    return Response.json(
      { error: "event_id và service_ids là bắt buộc" },
      { status: 400 }
    );
  }

  // Lấy thông tin services
  const services = await Service.find({ _id: { $in: service_ids } });

  if (services.length !== service_ids.length) {
    return Response.json(
      { error: "Một hoặc nhiều service_ids không tồn tại" },
      { status: 400 }
    );
  }

  // Số lượng service trong mảng
  const quantities = service_ids.length;

  // Tính tổng giá dựa trên mỗi service
  const total_price = services.reduce((sum, service) => sum + service.price, 0);

  const record = new EventService({
    event_id,
    service_ids,
    quantities,
    total_price,
  });

  await record.save();

  return Response.json(
    { message: "Thêm dịch vụ cho sự kiện thành công", record },
    { status: 201 }
  );
}
