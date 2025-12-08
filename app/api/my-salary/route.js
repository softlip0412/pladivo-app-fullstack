import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Payroll from "@/models/Payroll";
import Staff from "@/models/Staff";
import User from "@/models/User";
import Department from "@/models/Department";
import mongoose from "mongoose";

// ====== [GET] LẤY LƯƠNG CỦA USER HIỆN TẠI ======
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    // Lấy user_id từ query hoặc session
    const user_id = searchParams.get("user_id");
    
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "user_id là bắt buộc" },
        { status: 400 }
      );
    }

    // Tìm staff từ user_id
    const staff = await Staff.findOne({ user_id: new mongoose.Types.ObjectId(user_id) })
      .populate("department_id", "name")
      .populate("role_id", "name");

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thông tin nhân sự" },
        { status: 404 }
      );
    }

    // Lấy lịch sử lương (6 tháng gần nhất)
    const payrolls = await Payroll.find({ staff_id: staff._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    // Lấy lương tháng hiện tại
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentPayroll = await Payroll.findOne({
      staff_id: staff._id,
      month: currentMonth,
      year: currentYear,
    });

    return NextResponse.json({
      success: true,
      data: {
        staff: {
          full_name: staff.full_name,
          role: staff.role_id?.name || "N/A",
          department: staff.department_id?.name || "N/A",
          base_salary: staff.salary_base,
          allowance: staff.salary_allowance,
        },
        current_payroll: currentPayroll,
        history: payrolls,
      },
    });
  } catch (err) {
    console.error("❌ GET /my-salary error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
