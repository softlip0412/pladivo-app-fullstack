import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { status } = await req.json();

    // ✅ Kiểm tra hợp lệ với trạng thái mới
    const validStatuses = [
      "draft",
      "pending_manager",
      "manager_approved",
      "pending_customer",
      "customer_approved",
      "in_progress",
      "completed",
      "cancelled",
      "confirmed",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Trạng thái không hợp lệ." },
        { status: 400 }
      );
    }

    // 🔧 Cập nhật trạng thái kế hoạch
    const plan = await EventPlan.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch sự kiện." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
      message: `✅ Đã cập nhật trạng thái thành '${status}'.`,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
