import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import { handleCORS } from "@/app/api/common/cors";
import { signAccessToken, verifyPassword } from "@/app/api/common/auth";
import User from "@/models/User";
import Staff from "@/models/Staff";
import Department from "@/models/Department";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Email và mật khẩu là bắt buộc" },
          { status: 400 }
        )
      );
    }

    // Tìm user
    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Email hoặc mật khẩu không đúng" },
          { status: 401 }
        )
      );
    }

    // Lấy thông tin department nếu user là staff/employee
    let departmentName = null;
    if (user.role === "staff" || user.role === "employee") {
      const staff = await Staff.findOne({ user_id: user._id }).populate("department_id");
      if (staff && staff.department_id) {
        departmentName = staff.department_id.name;
      }
    }

    const accessToken = signAccessToken({
      user_id: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        status: user.status,
        department: departmentName,
      },
    });

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, 
      sameSite: "lax", 
      maxAge: 60 * 60 * 24 * 5, 
    });

    return handleCORS(response);
  } catch (err) {
    console.error("Login error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: "Lỗi máy chủ" },
        { status: 500 }
      )
    );
  }
}
