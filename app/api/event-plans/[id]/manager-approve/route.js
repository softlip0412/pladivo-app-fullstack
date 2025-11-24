import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { approved, comment, managerId } = body;

    const plan = await EventPlan.findById(id);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái
    if (plan.status !== "pending_manager") {
      return NextResponse.json(
        { success: false, message: "Kế hoạch không ở trạng thái chờ duyệt" },
        { status: 400 }
      );
    }

    if (approved) {
      // Phê duyệt
      plan.status = "manager_approved";
      plan.approvals.manager = {
        approved: true,
        approvedBy: managerId,
        approvedAt: new Date(),
        comment: comment || "",
      };
    } else {
      // Từ chối - quay về draft
      plan.status = "draft";
      plan.approvals.manager = {
        approved: false,
        approvedBy: managerId,
        approvedAt: new Date(),
        comment: comment || "",
      };
    }

    await plan.save();

    // TODO: Gửi thông báo cho người tạo kế hoạch

    return NextResponse.json({
      success: true,
      message: approved ? "✅ Đã phê duyệt kế hoạch" : "❌ Đã từ chối kế hoạch",
      data: plan,
    });
  } catch (err) {
    console.error("❌ Manager approve error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
