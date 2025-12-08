import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import BookingFeedback from "@/models/BookingFeedback";
import Booking from "@/models/Booking";
import Staff from "@/models/Staff";
import mongoose from "mongoose";

// ====== [GET] Fetch All Feedback ======
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const feedback_type = searchParams.get("feedback_type");
    const booking_id = searchParams.get("booking_id");

    // Build filter
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (feedback_type && feedback_type !== "all") {
      filter.feedback_type = feedback_type;
    }

    if (booking_id && booking_id !== "all") {
      filter.booking_id = mongoose.Types.ObjectId.isValid(booking_id)
        ? new mongoose.Types.ObjectId(booking_id)
        : booking_id;
    }

    const feedback = await BookingFeedback.find(filter)
      .populate("booking_id", "customer_name event_type event_date")
      .populate("responded_by", "full_name email avatar_url")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: feedback,
      count: feedback.length,
    });
  } catch (err) {
    console.error("❌ GET /feedback error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [POST] Create New Feedback ======
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.booking_id || !body.customer_name || !body.customer_email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "booking_id, customer_name, customer_email, và message là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await Booking.findById(body.booking_id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy booking" },
        { status: 404 }
      );
    }

    const feedback = await BookingFeedback.create(body);

    const populatedFeedback = await BookingFeedback.findById(feedback._id)
      .populate("booking_id", "customer_name event_type event_date")
      .populate("responded_by", "full_name email avatar_url");

    return NextResponse.json(
      {
        success: true,
        data: populatedFeedback,
        message: "✅ Tạo phản hồi thành công",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ POST /feedback error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PATCH] Update Feedback (Add Response/Update Status) ======
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { feedback_id, staff_response, status, priority, staff_id } = body;

    if (!feedback_id) {
      return NextResponse.json(
        { success: false, message: "feedback_id là bắt buộc" },
        { status: 400 }
      );
    }

    const updateData = {};

    if (staff_response !== undefined) {
      updateData.staff_response = staff_response;
      updateData.responded_at = new Date();
      if (staff_id) {
        updateData.responded_by = staff_id;
      }
    }

    if (status) {
      updateData.status = status;
    }

    if (priority) {
      updateData.priority = priority;
    }

    const feedback = await BookingFeedback.findByIdAndUpdate(
      feedback_id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("booking_id", "customer_name event_type event_date")
      .populate("responded_by", "full_name email avatar_url");

    if (!feedback) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phản hồi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback,
      message: "✅ Cập nhật phản hồi thành công",
    });
  } catch (err) {
    console.error("❌ PATCH /feedback error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
