import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";

export async function GET(req) {
  try {
    await connectDB();
    const plans = await EventPlan.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: plans });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
