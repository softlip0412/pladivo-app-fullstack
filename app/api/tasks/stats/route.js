import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Task from "@/models/Task";

export const dynamic = 'force-dynamic';

// ====== [GET] THỐNG KÊ TASKS ======
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const staff_id = searchParams.get("staff_id");

    const filter = staff_id ? { staff_id } : {};

    // Đếm theo status
    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Tổng số tasks
    const total = await Task.countDocuments(filter);

    // Tasks quá hạn
    const overdue = await Task.countDocuments({
      ...filter,
      deadline: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    // Tasks sắp tới hạn (trong 7 ngày)
    const upcoming = await Task.countDocuments({
      ...filter,
      deadline: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      status: { $ne: "completed" },
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        overdue,
        upcoming,
        byStatus: stats,
      },
    });
  } catch (err) {
    console.error("❌ GET /tasks/stats error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}