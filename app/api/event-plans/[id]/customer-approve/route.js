import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { approved, comment } = body;

    const plan = await EventPlan.findById(id);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái
    if (plan.status !== "pending_customer") {
      return NextResponse.json(
        {
          success: false,
          message: "Kế hoạch không ở trạng thái chờ khách hàng duyệt",
        },
        { status: 400 }
      );
    }

    if (approved) {
      // Khách hàng phê duyệt
      plan.status = "customer_approved";
      plan.approvals.customer = {
        approved: true,
        approvedAt: new Date(),
        comment: comment || "",
      };
    } else {
      // Khách hàng từ chối - quay về manager_approved để chỉnh sửa
      plan.status = "manager_approved";
      plan.approvals.customer = {
        approved: false,
        approvedAt: new Date(),
        comment: comment || "",
      };
    }

    await plan.save();

    // TODO: Gửi thông báo cho team

    return NextResponse.json({
      success: true,
      message: approved
        ? "✅ Khách hàng đã phê duyệt kế hoạch"
        : "❌ Khách hàng yêu cầu chỉnh sửa",
      data: plan,
    });
  } catch (err) {
    console.error("❌ Customer approve error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
