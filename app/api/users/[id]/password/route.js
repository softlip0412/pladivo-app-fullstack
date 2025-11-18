import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authenticateToken } from "@/app/api/common/auth";

export async function PUT(request, { params }) {
  const { id } = params;
  await connectDB();

  try {
    // Xác thực user từ token
    const currentUser = authenticateToken(request);
    if (!currentUser || currentUser.user_id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Vui lòng điền đủ thông tin" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });
    }

    // Kiểm tra mật khẩu cũ (dùng password_hash)
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Mật khẩu cũ không đúng" }, { status: 400 });
    }

    // Hash mật khẩu mới và lưu vào password_hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
