import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Task from "@/models/Task";
import Booking from "@/models/Booking";
import Staff from "@/models/Staff";
import mongoose from "mongoose";

// ====== [GET] LẤY DANH SÁCH TASKS ======
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const staff_id = searchParams.get("staff_id");
    const booking_id = searchParams.get("booking_id");
    const status = searchParams.get("status");

    // Build query filter
    const filter = {};
    
    if (staff_id && staff_id !== "all") {
      // ✅ Convert string to ObjectId nếu cần
      filter.staff_id = mongoose.Types.ObjectId.isValid(staff_id) 
        ? new mongoose.Types.ObjectId(staff_id) 
        : staff_id;
    }
    
    if (booking_id && booking_id !== "all") {
      filter.booking_id = mongoose.Types.ObjectId.isValid(booking_id)
        ? new mongoose.Types.ObjectId(booking_id)
        : booking_id;
    }
    
    if (status && status !== "all") {
      filter.status = status;
    }

    console.log("Query filter:", filter);

    const tasks = await Task.find(filter)
      .populate("staff_id", "full_name email phone department role avatar_url")
      .populate("booking_id", "customer_name event_type event_date")
      .populate("evaluation.evaluated_by", "full_name")
      .sort({ deadline: 1 });

    console.log("Found tasks:", tasks.length);

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (err) {
    console.error("❌ GET /tasks error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [POST] TẠO MỚI TASK ======
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.category) {
      return NextResponse.json(
        { success: false, message: "category là bắt buộc" },
        { status: 400 }
      );
    }

    // Set default status nếu chưa có
    if (!body.status) body.status = "pending";

    const task = await Task.create(body);

    const populatedTask = await Task.findById(task._id)
      .populate("staff_id", "full_name email phone avatar_url")
      .populate("booking_id", "customer_name event_type event_date");

    return NextResponse.json(
      {
        success: true,
        data: populatedTask,
        message: "✅ Tạo task thành công",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ POST /tasks error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PATCH] CẬP NHẬT TASK ======
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { task_id, ...updateData } = body;

    if (!task_id) {
      return NextResponse.json(
        { success: false, message: "task_id là bắt buộc" },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndUpdate(
      task_id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("staff_id", "full_name email phone avatar_url")
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
    console.error("❌ PATCH /tasks error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [DELETE] XÓA TASK ======
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const task_id = searchParams.get("task_id");

    if (!task_id) {
      return NextResponse.json(
        { success: false, message: "task_id là bắt buộc" },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndDelete(task_id);

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
    console.error("❌ DELETE /tasks error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}