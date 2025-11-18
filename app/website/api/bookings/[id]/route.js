// app/api/bookings/[id]/route.js
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { authenticateToken } from "@/lib/auth";

// 📍 Lấy 1 booking
export async function GET(request, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const booking = await Booking.findById(id)
      .populate("user_id", "username email")
      .populate("event_id", "title")
      .populate("services.service_id", "name price");

    if (!booking) {
      return Response.json({ error: "Booking không tồn tại" }, { status: 404 });
    }

    return Response.json({ success: true, data: booking }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

// 📍 Sửa booking (Admin/Manager hoặc chính user đó)
export async function PUT(request, { params }) {
  await connectDB();
  let user;
  try {
    user = authenticateToken(request);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { id } = params;
  const booking = await Booking.findById(id);

  if (!booking) {
    return Response.json({ error: "Booking không tồn tại" }, { status: 404 });
  }

  if (
    !["admin", "manager"].includes(user.role) &&
    booking.user_id.toString() !== user.id
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  Object.assign(booking, body);
  await booking.save();

  return Response.json({ success: true, booking }, { status: 200 });
}

// 📍 Xoá booking (Admin/Manager hoặc chính user đó)
export async function DELETE(request, { params }) {
  await connectDB();
  let user;
  try {
    user = authenticateToken(request);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { id } = params;
  const booking = await Booking.findById(id);

  if (!booking) {
    return Response.json({ error: "Booking không tồn tại" }, { status: 404 });
  }

  if (
    !["admin", "manager"].includes(user.role) &&
    booking.user_id.toString() !== user.id
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await booking.deleteOne();

  return Response.json({ success: true, message: "Xoá booking thành công" }, { status: 200 });
}
