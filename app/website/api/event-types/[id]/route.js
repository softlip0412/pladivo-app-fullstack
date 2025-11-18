import { connectDB } from "@/lib/mongodb";
import { EventType } from "@/models";
import { authorizeRole } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(_, { params }) {
  await connectDB();
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const eventType = await EventType.findById(id);
  if (!eventType) {
    return Response.json({ error: "Không tìm thấy loại sự kiện" }, { status: 404 });
  }

  return Response.json(eventType, { status: 200 });
}


export async function PUT(request, { params }) {
  await connectDB();
  try {
    authorizeRole("admin");
  } catch (err) {
    return Response.json({ error: err.message }, { status: 403 });
  }

  const { id } = params;
  const { name, description } = await request.json();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const updated = await EventType.findByIdAndUpdate(
    id,
    { name, description },
    { new: true }
  );

  if (!updated) {
    return Response.json({ error: "Không tìm thấy loại sự kiện" }, { status: 404 });
  }

  return Response.json(updated, { status: 200 });
}

export async function DELETE(_, { params }) {
  await connectDB();
  try {
    authorizeRole("admin");
  } catch (err) {
    return Response.json({ error: err.message }, { status: 403 });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const deleted = await EventType.findByIdAndDelete(id);
  if (!deleted) {
    return Response.json({ error: "Không tìm thấy loại sự kiện" }, { status: 404 });
  }

  return Response.json({ message: "Xoá thành công" }, { status: 200 });
}
