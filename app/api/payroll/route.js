import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Payroll from "@/models/Payroll";
import Staff from "@/models/Staff";
import Task from "@/models/Task";
import mongoose from "mongoose";

// ====== [GET] LẤY DANH SÁCH PAYROLL ======
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
    const staff_id = searchParams.get("staff_id");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Build filter
    const filter = { month, year };
    
    if (staff_id && staff_id !== "all") {
      filter.staff_id = new mongoose.Types.ObjectId(staff_id);
    }
    
    if (status && status !== "all") {
      filter.status = status;
    }

    let payrolls = await Payroll.find(filter)
      .populate({
        path: "staff_id",
        select: "full_name position department_id salary_base salary_allowance",
        populate: {
          path: "department_id",
          select: "name",
        },
      })
      .sort({ "staff_id.full_name": 1 });

    // Filter by search
    if (search) {
      payrolls = payrolls.filter((p) =>
        p.staff_id?.full_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: payrolls,
      count: payrolls.length,
    });
  } catch (err) {
    console.error("❌ GET /payroll error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [POST] TÍNH LƯƠNG TỰ ĐỘNG ======
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { month, year, staff_id } = body;

    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: "month và year là bắt buộc" },
        { status: 400 }
      );
    }

    // Lấy danh sách staff cần tính lương
    const staffFilter = staff_id ? { _id: staff_id } : {};
    const staffList = await Staff.find(staffFilter).select(
      "full_name salary_base salary_allowance"
    );

    if (staffList.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy nhân sự" },
        { status: 404 }
      );
    }

    const results = [];

    for (const staff of staffList) {
      // Tính ngày bắt đầu và kết thúc của tháng hiện tại
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Tính ngày bắt đầu và kết thúc của tháng trước
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
      const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59);

      // Đếm task completed trong tháng hiện tại
      const currentMonthTasks = await Task.countDocuments({
        staff_id: staff._id,
        status: "completed",
        updatedAt: { $gte: startDate, $lte: endDate },
      });

      // Đếm task completed tháng trước
      const previousMonthTasks = await Task.countDocuments({
        staff_id: staff._id,
        status: "completed",
        updatedAt: { $gte: prevStartDate, $lte: prevEndDate },
      });

      // Tính KPI
      let kpi_percentage = 0;
      let kpi_bonus = 0;

      const growthRate = previousMonthTasks > 0 
        ? ((currentMonthTasks - previousMonthTasks) / previousMonthTasks) * 100 
        : 0;

      if (growthRate >= 10) {
        // Đạt tăng trưởng 10% → 100% KPI
        kpi_percentage = 100;
        kpi_bonus = staff.salary_allowance || 0;
      } else if (currentMonthTasks >= 30) {
        // Không đạt tăng trưởng nhưng đạt 30 task → 50% KPI
        kpi_percentage = 50;
        kpi_bonus = (staff.salary_allowance || 0) * 0.5;
      } else {
        // Không đạt cả hai → 0% KPI
        kpi_percentage = 0;
        kpi_bonus = 0;
      }

      const total_salary = (staff.salary_base || 0) + (staff.salary_allowance || 0) + kpi_bonus;

      // Tạo hoặc cập nhật payroll
      const payrollData = {
        staff_id: staff._id,
        month,
        year,
        base_salary: staff.salary_base || 0,
        allowance: staff.salary_allowance || 0,
        kpi_bonus,
        total_tasks: currentMonthTasks,
        previous_month_tasks: previousMonthTasks,
        kpi_percentage,
        total_salary,
        status: "draft",
      };

      const payroll = await Payroll.findOneAndUpdate(
        { staff_id: staff._id, month, year },
        payrollData,
        { upsert: true, new: true }
      ).populate({
        path: "staff_id",
        select: "full_name position",
      });

      results.push(payroll);
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `✅ Đã tính lương cho ${results.length} nhân sự`,
    });
  } catch (err) {
    console.error("❌ POST /payroll error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PATCH] CẬP NHẬT PAYROLL ======
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { payroll_id, ...updateData } = body;

    if (!payroll_id) {
      return NextResponse.json(
        { success: false, message: "payroll_id là bắt buộc" },
        { status: 400 }
      );
    }

    const payroll = await Payroll.findByIdAndUpdate(
      payroll_id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: "staff_id",
      select: "full_name position",
    });

    if (!payroll) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy payroll" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payroll,
      message: "✅ Cập nhật payroll thành công",
    });
  } catch (err) {
    console.error("❌ PATCH /payroll error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [DELETE] XÓA PAYROLL ======
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const payroll_id = searchParams.get("payroll_id");

    if (!payroll_id) {
      return NextResponse.json(
        { success: false, message: "payroll_id là bắt buộc" },
        { status: 400 }
      );
    }

    const payroll = await Payroll.findByIdAndDelete(payroll_id);

    if (!payroll) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy payroll" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ Xóa payroll thành công",
    });
  } catch (err) {
    console.error("❌ DELETE /payroll error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
