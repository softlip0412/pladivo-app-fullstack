import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Task from "@/models/Task";

// ====== [GET] LẤY CHI TIẾT 1 TASK ======
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findById(id)
      .populate("staff_id", "full_name email phone department role avatar_url")
      .populate("booking_id", "customer_name event_type event_date address");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (err) {
    console.error("❌ GET /tasks/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PUT] CẬP NHẬT TOÀN BỘ TASK ======
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const task = await Task.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate("staff_id", "full_name email phone")
      .populate("booking_id", "customer_name event_type");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: "✅ Cập nhật task thành công",
    });
  } catch (err) {
    console.error("❌ PUT /tasks/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [DELETE] XÓA TASK ======
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ Xóa task thành công",
    });
  } catch (err) {
    console.error("❌ DELETE /tasks/[id] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}