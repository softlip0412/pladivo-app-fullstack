import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Task from "@/models/Task";

// ====== [POST] ĐÁNH GIÁ CÔNG VIỆC ======
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const { rating, comment, evaluated_by } = body;

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating phải từ 1-5" },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          "evaluation.rating": rating,
          "evaluation.comment": comment || "",
          "evaluation.evaluated_by": evaluated_by,
          "evaluation.evaluated_at": new Date(),
        },
      },
      { new: true }
    )
      .populate("staff_id", "full_name email phone avatar_url")
      .populate("booking_id", "customer_name event_type event_date")
      .populate("evaluation.evaluated_by", "full_name");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: "✅ Đánh giá thành công",
    });
  } catch (err) {
    console.error("❌ POST /tasks/[id]/evaluate error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [GET] XEM ĐÁNH GIÁ ======
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findById(id)
      .populate("staff_id", "full_name email phone")
      .populate("evaluation.evaluated_by", "full_name email");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task.evaluation,
    });
  } catch (err) {
    console.error("❌ GET /tasks/[id]/evaluate error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [DELETE] XÓA ĐÁNH GIÁ ======
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          "evaluation.rating": null,
          "evaluation.comment": "",
          "evaluation.evaluated_by": null,
          "evaluation.evaluated_at": null,
        },
      },
      { new: true }
    );

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ Xóa đánh giá thành công",
    });
  } catch (err) {
    console.error("❌ DELETE /tasks/[id]/evaluate error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}