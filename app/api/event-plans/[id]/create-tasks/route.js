import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";
import Task from "@/models/Task";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { staffId } = await req.json();

    const plan = await EventPlan.findById(id);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái
    if (plan.status !== "customer_approved") {
      return NextResponse.json(
        { success: false, message: "Kế hoạch chưa được khách hàng phê duyệt" },
        { status: 400 }
      );
    }

    // Kiểm tra đã tạo tasks chưa
    if (plan.tasksCreated) {
      return NextResponse.json(
        { success: false, message: "Đã tạo tasks cho kế hoạch này rồi" },
        { status: 400 }
      );
    }

    const createdTasks = [];

    // Tạo tasks từ Step 4 - Chuẩn bị
    if (plan.step4?.checklist) {
      for (const item of plan.step4.checklist) {
        if (item.owner) {
          const task = await Task.create({
            category: `[Pre-event] ${item.category}`,
            description: item.description,
            deadline: item.deadline,
            status: "pending",
            staff_id: item.owner,
            event_plan_id: plan._id,
          });
          createdTasks.push(task._id);
        }
      }
    }

    // Tạo tasks từ Step 5 - Marketing
    if (plan.step5?.marketingChecklist) {
      for (const item of plan.step5.marketingChecklist) {
        if (item.owner) {
          const task = await Task.create({
            category: `[Marketing] ${item.category}`,
            description: item.description,
            deadline: item.deadline,
            status: "pending",
            staff_id: item.owner,
            event_plan_id: plan._id,
          });
          createdTasks.push(task._id);
        }
      }
    }

    // Tạo tasks từ Step 6 - Event Day
    if (plan.step6?.eventDayChecklist) {
      for (const item of plan.step6.eventDayChecklist) {
        if (item.owner) {
          const task = await Task.create({
            category: `[Event Day] ${item.category}`,
            description: item.description,
            deadline: item.deadline,
            status: "pending",
            staff_id: item.owner,
            event_plan_id: plan._id,
          });
          createdTasks.push(task._id);
        }
      }
    }

    // Tạo tasks từ Step 7 - Post Event
    if (plan.step7?.postEvent) {
      for (const item of plan.step7.postEvent) {
        if (item.owner) {
          const task = await Task.create({
            category: `[Post-event] ${item.category}`,
            description: item.description,
            deadline: item.deadline,
            status: "pending",
            staff_id: item.owner,
            event_plan_id: plan._id,
          });
          createdTasks.push(task._id);
        }
      }
    }

    // Cập nhật event plan
    plan.tasksCreated = true;
    plan.tasksCreatedAt = new Date();
    plan.tasksCreatedBy = staffId;
    plan.status = "in_progress";
    await plan.save();

    return NextResponse.json({
      success: true,
      message: `✅ Đã tạo ${createdTasks.length} tasks thành công`,
      data: { taskIds: createdTasks, plan },
    });
  } catch (err) {
    console.error("❌ Create tasks error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}