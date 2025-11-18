import { connectDB } from "@/lib/mongodb";
import { User } from "@/models";
import { verifyAccessToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  await connectDB();

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json({ error: "Access token required" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await request.json();
  if (!oldPassword || !newPassword) {
    return Response.json({ error: "Thiếu mật khẩu cũ hoặc mới" }, { status: 400 });
  }

  // Tìm user
  const user = await User.findOne({ user_id: payload.user_id });
  if (!user) {
    return Response.json({ error: "User không tồn tại" }, { status: 404 });
  }

  // Kiểm tra mật khẩu cũ
  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) {
    return Response.json({ error: "Mật khẩu cũ không chính xác" }, { status: 400 });
  }

  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password_hash = hashedPassword;
  user.updated_at = new Date();
  await user.save();

  return Response.json({ message: "Đổi mật khẩu thành công" }, { status: 200 });
}
