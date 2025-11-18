import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Message from "@/models/Message";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("booking_id");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "booking_id required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({ booking_id: bookingId })
      .populate("sender_id", "username full_name avatar_url")
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const message = await Message.create(body);

    const populated = await Message.findById(message._id).populate(
      "sender_id",
      "username full_name avatar_url"
    );

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}