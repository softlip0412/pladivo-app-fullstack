import { connectDB } from "@/app/api/common/db";
import Staff from "@/models/Staff";
import User from "@/models/User";
import mongoose from "mongoose";
import Department from "@/models/Department";
import Role from "@/models/Role";

// GET: Lấy chi tiết 1 staff theo staffId
export async function GET(req, { params }) {
  await connectDB();

  try {
    const staffId = params.id;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid staff ID",
        }),
        { status: 400 }
      );
    }

    const staff = await Staff.findById(staffId)
      .populate("user_id", "phone email status username")
      .populate("department_id", "name")
      .populate("role_id", "name");

    if (!staff) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Staff not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: staff,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

// PUT: Cập nhật staff
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const form = await req.formData();
    let updates = {};

    form.forEach((v, k) => {
      if (k === "attachments") {
        try {
          updates.attachments = JSON.parse(v);
        } catch {
          updates.attachments = [];
        }
      } else {
        updates[k] = v;
      }
    });

    const staff = await Staff.findByIdAndUpdate(params.id, updates, {
      new: true,
      runValidators: true,
    });

    return Response.json({ success: true, data: staff });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa staff
export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const staffId = params.id;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid staff ID",
        }),
        { status: 400 }
      );
    }

    const staff = await Staff.findByIdAndDelete(staffId);

    if (!staff) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Staff not found",
        }),
        { status: 404 }
      );
    }

    // Optionally delete associated user
    if (staff.user_id) {
      await User.findByIdAndDelete(staff.user_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Staff deleted successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      { status: 500 }
    );
  }
}
