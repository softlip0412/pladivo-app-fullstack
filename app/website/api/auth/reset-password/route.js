import { connectDB } from "@/lib/mongodb";
import { User, PasswordResetToken } from "@/models";
import bcrypt from "bcryptjs";

export async function POST(request) {
  await connectDB();
  const { token, newPassword } = await request.json();

  if (!token || !newPassword) {
    return Response.json({ error: "Thiếu token hoặc mật khẩu mới" }, { status: 400 });
  }

  const resetToken = await PasswordResetToken.findOne({ token });
  if (!resetToken) {
    return Response.json({ error: "Token không hợp lệ" }, { status: 400 });
  }


  if (resetToken.expires_at < new Date()) {
    return Response.json({ error: "Token đã hết hạn" }, { status: 400 });
  }


  const user = await User.findOne({ user_id: resetToken.user_id });
  if (!user) {
    return Response.json({ error: "User không tồn tại" }, { status: 404 });
  }


  const hashedPassword = await bcrypt.hash(newPassword, 10);


  user.password_hash = hashedPassword;
  user.updated_at = new Date();
  await user.save();


  await PasswordResetToken.deleteMany({ user_id: user.user_id });

  return Response.json(
    { message: "Đặt lại mật khẩu thành công" },
    { status: 200 }
  );
}
