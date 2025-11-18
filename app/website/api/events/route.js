import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models";
import { authenticateToken } from "@/lib/auth";

// Tạo sự kiện
export async function POST(request) {
  await connectDB();
  const user = authenticateToken();

  const {
    type_id,
    title,
    description,
    start_datetime,
    duration,
    guest_count,
    location,
    style_theme,
    images,
  } = await request.json();

  const newEvent = new Event({
    user_id: user.user_id,
    type_id,
    title,
    description,
    start_datetime,
    duration,
    guest_count,
    location,
    style_theme,
    images,
  });

  await newEvent.save();

  return Response.json(
    { success: true, message: "Tạo sự kiện thành công", data: newEvent },
    { status: 201 }
  );
}

// Lấy danh sách sự kiện
export async function GET() {
  await connectDB();
  authenticateToken();

  const events = await Event.find()
    .populate("type_id")
    .populate("user_id", "username email");

  return Response.json({ success: true, data: events }, { status: 200 });
}
