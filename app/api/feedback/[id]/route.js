import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import BookingFeedback from "@/models/BookingFeedback";

// ====== [GET] Get Single Feedback ======
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const feedback = await BookingFeedback.findById(id)
      .populate("booking_id", "customer_name event_type event_date phone email")
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
    });
  } catch (err) {
    console.error("❌ GET /feedback/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PUT] Update Feedback ======
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const feedback = await BookingFeedback.findByIdAndUpdate(
      id,
      { $set: body },
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
    console.error("❌ PUT /feedback/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [DELETE] Delete Feedback ======
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const feedback = await BookingFeedback.findByIdAndDelete(id);

    if (!feedback) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phản hồi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ Xóa phản hồi thành công",
    });
  } catch (err) {
    console.error("❌ DELETE /feedback/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
