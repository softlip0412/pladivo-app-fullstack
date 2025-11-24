import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const plan = await EventPlan.findById(id);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái
    if (plan.status !== "draft") {
      return NextResponse.json(
        { success: false, message: "Kế hoạch không ở trạng thái nháp" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái
    plan.status = "pending_manager";
    await plan.save();

    // TODO: Gửi thông báo cho quản lý (email/notification)

    return NextResponse.json({
      success: true,
      message: "✅ Đã gửi yêu cầu phê duyệt cho quản lý",
      data: plan,
    });
  } catch (err) {
    console.error("❌ Submit approval error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}