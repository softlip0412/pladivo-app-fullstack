import { connectDB } from "@/app/api/common/db";
import User from "@/models/User";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";
import Department from "@/models/Department";
import Role from "@/models/Role";
import mongoose from "mongoose";

// POST: Tạo staff mới
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { username, email, phone, full_name, department_id, role_id } = body;

    if (!username || !email || !phone) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "username, email và phone là bắt buộc" 
        }),
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Username hoặc email đã tồn tại" 
        }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(phone, 10);

    const newUser = await User.create({
      username,
      email,
      phone,
      password_hash: hashedPassword,
      role: "staff",
      status: "active",
    });

    const staffData = {
      user_id: newUser._id,
      full_name: full_name || username,
      gender: "other",
    };

    if (department_id) staffData.department_id = department_id;
    if (role_id) staffData.role_id = role_id;

    const newStaff = await Staff.create(staffData);

    const populatedStaff = await Staff.findById(newStaff._id)
      .populate("user_id", "phone email status username")
      .populate("department_id", "name")
      .populate("role_id", "name");

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: populatedStaff 
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: err.message 
      }),
      { status: 500 }
    );
  }
}

// GET: Lấy danh sách staff (có filter theo role_id, department_id)
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const role_id = searchParams.get("role_id");
    const department_id = searchParams.get("department_id");

    const filter = {};

    if (role_id && role_id !== "all") {
      filter.role_id = new mongoose.Types.ObjectId(role_id);
    }

    if (department_id && department_id !== "all") {
      filter.department_id = new mongoose.Types.ObjectId(department_id);
    }

    const staffList = await Staff.find(filter)
      .populate("user_id", "phone email status username")
      .populate("department_id", "name")
      .populate("role_id", "name")
      .sort({ createdAt: -1 });

    const formattedStaff = staffList.map((staff) => ({
      _id: staff._id,
      avatar_url: staff.avatar_url || "",
      full_name: staff.full_name || "",
      username: staff.user_id?.username || "",
      email: staff.user_id?.email || "",
      phone: staff.user_id?.phone || "",
      status: staff.user_id?.status || "",
      department: staff.department_id
        ? { _id: staff.department_id._id, name: staff.department_id.name }
        : null,
      role: staff.role_id
        ? { _id: staff.role_id._id, name: staff.role_id.name }
        : null,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: formattedStaff 
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: err.message 
      }),
      { status: 500 }
    );
  }
}