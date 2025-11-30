import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import EventPlan from "@/models/EventPlan";
import Booking from "@/models/Booking";

// GET: Lấy hợp đồng theo booking_id
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get("booking_id");

    if (!booking_id) {
      return NextResponse.json(
        { success: false, message: "Missing booking_id" },
        { status: 400 }
      );
    }

    const contract = await EventContract.findOne({ booking_id });
    const eventPlan = await EventPlan.findOne({ booking_id }).lean();
    
    // Nếu chưa có hợp đồng, trả về thông tin gợi ý từ EventPlan và Booking để điền form
    if (!contract) {
        const booking = await Booking.findById(booking_id).lean();

        if (!booking || !eventPlan) {
             return NextResponse.json(
                { success: false, message: "Booking or EventPlan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            exists: false,
            data: {
                booking,
                eventPlan
            }
        });
    }

    return NextResponse.json({ 
        success: true, 
        exists: true, 
        data: {
            ...contract.toObject(),
            eventPlan // Return eventPlan alongside contract data
        }
    });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc cập nhật hợp đồng
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Kiểm tra xem đã có hợp đồng chưa
    let contract = await EventContract.findOne({ booking_id: data.booking_id });

    if (contract) {
      // Update
      contract = await EventContract.findByIdAndUpdate(contract._id, data, { new: true });
    } else {
      // Create
      contract = await EventContract.create(data);
    }

    return NextResponse.json({
      success: true,
      data: contract,
      message: "Lưu hợp đồng thành công",
    });
  } catch (error) {
    console.error("Error saving contract:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
