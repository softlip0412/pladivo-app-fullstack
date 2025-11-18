import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";

// ====== [GET] XEM KẾ HOẠCH THEO ID ======
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const plan = await EventPlan.findById(id)
      .populate("booking_id")
      .populate("step2.selectedPartner")
      .populate("step2.prepTimeline.manager.id")
      .populate("step2.staffAssign.manager.id")
      .populate("step2.eventTimeline.manager.id");

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (err) {
    console.error("❌ Lỗi GET EventPlan:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PATCH] SỬA KẾ HOẠCH THEO ID ======
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await req.json();

    const plan = await EventPlan.findByIdAndUpdate(id, { $set: data }, { new: true });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
      message: "✅ Cập nhật kế hoạch thành công",
    });
  } catch (err) {
    console.error("❌ Lỗi PATCH EventPlan:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
