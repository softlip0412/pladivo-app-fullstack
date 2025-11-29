import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventPlan from "@/models/EventPlan";
import Task from "@/models/Task";
import mongoose from "mongoose";

// ✅ Helper function để kiểm tra ObjectId hợp lệ
function isValidObjectId(id) {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id);
}

// ====== [POST] TẠO MỚI KẾ HOẠCH ======
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // DEBUG: Check allowed enum values
    console.log("Allowed status values:", EventPlan.schema.path('status').enumValues);

    if (!body.status) body.status = "draft";

    const eventPlan = await EventPlan.create(body);

    const allTasks = [];

    // Step 4: Chuẩn bị chi tiết
    if (body.step4?.checklist?.length > 0) {
      allTasks.push(
        ...body.step4.checklist.map((item) => ({
          booking_id: body.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    // Step 5: Marketing
    if (body.step5?.marketingChecklist?.length > 0) {
      allTasks.push(
        ...body.step5.marketingChecklist.map((item) => ({
          booking_id: body.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    // Step 6: Event Day
    if (body.step6?.eventDayChecklist?.length > 0) {
      allTasks.push(
        ...body.step6.eventDayChecklist.map((item) => ({
          booking_id: body.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    // Step 7: Post-event
    if (body.step7?.postEvent?.length > 0) {
      allTasks.push(
        ...body.step7.postEvent.map((item) => ({
          booking_id: body.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    if (allTasks.length > 0) {
      await Task.insertMany(allTasks);
    }

    return NextResponse.json({
      success: true,
      data: eventPlan,
      message: "✅ Lưu kế hoạch sự kiện thành công",
    });
  } catch (err) {
    console.error("❌ POST /event-plans error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [GET] LẤY KẾ HOẠCH THEO BOOKING ======
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const booking_id = searchParams.get("booking_id");

    const plan = await EventPlan.findOne({ booking_id });

    return NextResponse.json({ success: true, data: plan });
  } catch (err) {
    console.error("❌ GET /event-plans error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ====== [PATCH] CẬP NHẬT KẾ HOẠCH ======
export async function PATCH(req) {
  try {
    await connectDB();
    const data = await req.json();

    const plan = await EventPlan.findOneAndUpdate(
      { booking_id: data.booking_id },
      { $set: data },
      { new: true, upsert: true }
    );

    // Xóa task cũ
    await Task.deleteMany({ booking_id: data.booking_id });

    const allTasks = [];

    // Step 4
    if (data.step4?.checklist?.length > 0) {
      allTasks.push(
        ...data.step4.checklist.map((item) => ({
          booking_id: data.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    // Step 5
    if (data.step5?.marketingChecklist?.length > 0) {
      allTasks.push(
        ...data.step5.marketingChecklist.map((item) => ({
          booking_id: data.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    // Step 6
    if (data.step6?.eventDayChecklist?.length > 0) {
      allTasks.push(
        ...data.step6.eventDayChecklist.map((item) => ({
          booking_id: data.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    // Step 7
    if (data.step7?.postEvent?.length > 0) {
      allTasks.push(
        ...data.step7.postEvent.map((item) => ({
          booking_id: data.booking_id,
          staff_id: isValidObjectId(item.owner) ? item.owner : null,
          custom_owner: !isValidObjectId(item.owner) && item.owner ? item.owner : null,
          category: item.category,
          description: item.description,
          deadline: item.deadline,
          status: "pending",
        }))
      );
    }

    if (allTasks.length > 0) {
      await Task.insertMany(allTasks);
    }

    return NextResponse.json({
      success: true,
      data: plan,
      message: "✅ Cập nhật kế hoạch sự kiện thành công",
    });
  } catch (err) {
    console.error("❌ PATCH /event-plans error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}