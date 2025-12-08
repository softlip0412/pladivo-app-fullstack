import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();
    const tickets = await Ticket.find().populate("event_id", "title start_datetime");
    return NextResponse.json({ success: true, data: tickets });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
