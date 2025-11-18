import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { authenticateToken } from "@/lib/auth";

// ✅ GET: Lấy danh sách booking
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    let query = {};

    if (monthParam && yearParam) {
      const month = parseInt(monthParam);
      const year = parseInt(yearParam);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.event_date = { $gte: start, $lte: end };
    }

    const bookings = await Booking.find(query).sort({ event_date: 1 }).lean();

    // Nhóm theo ngày
    const bookingsByDay = {};
    bookings.forEach((b) => {
      if (!b?.event_date) return;
      const day = new Date(b.event_date).getDate();
      if (!bookingsByDay[day]) bookingsByDay[day] = [];
      bookingsByDay[day].push(b);
    });

    return NextResponse.json({ success: true, bookings, bookingsByDay });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST: Tạo booking mới
export async function POST(request) {
  try {
    await connectDB();

    // 🟢 Luôn yêu cầu token trong Header
    const user = authenticateToken(request); // Nếu không có token -> throw error

    const data = await request.json();

    const requiredFields = [
      "customer_name",
      "phone",
      "email",
      "address",
      "event_date",
      "event_type",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `Thiếu thông tin: ${field}` },
          { status: 400 }
        );
      }
    }

    // ✅ Lưu kèm user_id từ token
    const booking = await Booking.create({
      ...data,
      user_id: user?.user_id, // Lấy từ token
      booked_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Tạo booking thành công",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


// ✅ PATCH: Cập nhật trạng thái booking
export async function PATCH(request) {
  try {
    await connectDB();

    const { id, status } = await request.json();

    const allowedStatus = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { booking_status: status },
      { new: true }
    ).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy booking" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
