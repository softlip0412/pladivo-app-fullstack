import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Task from "@/models/Task";
import cloudinary from "@/lib/cloudinary";

// ====== [POST] NỘP BÁO CÁO ======
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const { content, images, staff_id } = body;

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          "report.content": content,
          "report.images": images || [],
          "report.submitted_at": new Date(),
          "report.submitted_by": staff_id,
          status: "completed",
        },
      },
      { new: true }
    ).populate("staff_id", "full_name email phone"); // ✅ Chỉ populate staff_id

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: "✅ Nộp báo cáo thành công",
    });
  } catch (err) {
    console.error("❌ POST /tasks/[id]/report error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [GET] XEM BÁO CÁO ======
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findById(id)
      .populate("staff_id", "full_name email phone") // ✅ Chỉ populate staff_id
      .populate("report.submitted_by", "full_name email"); // ✅ Populate submitted_by

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy task" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task.report,
    });
  } catch (err) {
    console.error("❌ GET /tasks/[id]/report error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [DELETE] XÓA HÌNH ẢNH TRONG BÁO CÁO ======
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const public_id = searchParams.get("public_id");

    if (!public_id) {
      return NextResponse.json(
        { success: false, message: "public_id là bắt buộc" },
        { status: 400 }
      );
    }

    // Xóa ảnh trên Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Xóa ảnh trong database
    const task = await Task.findByIdAndUpdate(
      id,
      {
        $pull: {
          "report.images": { public_id },
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
      message: "✅ Xóa hình ảnh thành công",
    });
  } catch (err) {
    console.error("❌ DELETE /tasks/[id]/report error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}