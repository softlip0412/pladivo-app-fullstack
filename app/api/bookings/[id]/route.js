import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Booking from "@/models/Booking";
import { authenticateToken } from "@/app/api/common/auth";

// ✅ UPDATE booking
export async function PUT(request, { params }) {
  try {
    await connectDB();
    authenticateToken(request);

    const id = params.id;
    const data = await request.json();

    const updated = await Booking.findByIdAndUpdate(id, data, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy booking" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Cập nhật booking thành công",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
export async function GET(req, { params }) {
  try {
    await connectDB();

    const booking = await Booking.findById(params.id).lean();
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
