import { connectDB } from "@/lib/mongodb";
import { EventType } from "@/models";
import { authorizeRole } from "@/lib/auth";


export async function GET() {
  await connectDB();
  const eventTypes = await EventType.find();
  return Response.json(eventTypes, { status: 200 });
}


export async function POST(request) {
  await connectDB();

  try {
    authorizeRole("admin"); 
  } catch (err) {
    return Response.json({ error: err.message }, { status: 403 });
  }

  const { name, description } = await request.json();

  if (!name) {
    return Response.json({ error: "Tên loại sự kiện là bắt buộc" }, { status: 400 });
  }

  const exists = await EventType.findOne({ name });
  if (exists) {
    return Response.json({ error: "Loại sự kiện đã tồn tại" }, { status: 400 });
  }

  const newEventType = new EventType({ name, description });
  await newEventType.save();

  return Response.json(newEventType, { status: 201 });
}
