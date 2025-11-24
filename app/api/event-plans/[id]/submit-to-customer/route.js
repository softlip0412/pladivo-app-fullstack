import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";
import Booking from "@/models/Booking";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const plan = await EventPlan.findById(id).populate("booking_id");
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái
    if (plan.status !== "manager_approved") {
      return NextResponse.json(
        { success: false, message: "Kế hoạch chưa được quản lý phê duyệt" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái
    plan.status = "pending_customer";
    await plan.save();

    // TODO: Gửi email cho khách hàng với link phê duyệt
    const customerEmail = plan.booking_id?.email;
    const customerPhone = plan.booking_id?.phone;

    // Ví dụ: Gửi email hoặc SMS
    // await sendEmailToCustomer(customerEmail, plan);

    return NextResponse.json({
      success: true,
      message: "✅ Đã gửi kế hoạch cho khách hàng",
      data: plan,
    });
  } catch (err) {
    console.error("❌ Submit to customer error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}