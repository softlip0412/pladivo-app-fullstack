import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { authenticateToken } from "@/lib/auth";

export async function GET(request, { params }) {
  await connectDB();
  let user;
  try {
    user = authenticateToken(request);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { id } = params;
  
  if (user.id !== id && !["admin", "manager"].includes(user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await Booking.find({ user_id: id })
    .populate("event_id", "title start_datetime")
    .populate("services.service_id", "name price");

  return Response.json({ success: true, data: bookings }, { status: 200 });
}
