import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models";
import { authenticateToken } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/events/[id]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateToken(request);
    const { id } = params;

    const event = await Event.findById(id)
      .populate("type_id")
      .populate("user_id", "username email");

    if (!event) {
      return NextResponse.json({ error: "Không tìm thấy sự kiện" }, { status: 404 });
    }

    const isOwner =
      event.user_id._id?.toString() === user.user_id ||
      event.user_id.toString() === user.user_id;

    if (user.role !== "admin" && !isOwner) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: event }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/events/[id]
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateToken(request);
    const { id } = params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Không tìm thấy sự kiện" }, { status: 404 });
    }

    const isOwner = event.user_id.toString() === user.user_id;
    if (user.role !== "admin" && !isOwner) {
      return NextResponse.json({ error: "Không có quyền cập nhật" }, { status: 403 });
    }

    const data = await request.json();
    Object.assign(event, data);
    await event.save();

    return NextResponse.json({ success: true, message: "Cập nhật thành công", event }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateToken(request);
    const { id } = params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Không tìm thấy sự kiện" }, { status: 404 });
    }

    const isOwner = event.user_id.toString() === user.user_id;
    if (user.role !== "admin" && !isOwner) {
      return NextResponse.json({ error: "Không có quyền xoá" }, { status: 403 });
    }

    if (!["draft", "cancelled"].includes(event.status)) {
      return NextResponse.json({ error: "Sự kiện đã ký hợp đồng, không thể xoá" }, { status: 400 });
    }

    await event.deleteOne();

    return NextResponse.json({ success: true, message: "Xoá thành công" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
