import { connectDB } from "@/lib/mongodb";
import { User, EmailVerificationToken } from "@/models";
import crypto from "crypto";

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email là bắt buộc" }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return Response.json({ error: "User không tồn tại" }, { status: 404 });
  }

  if (user.status === "active") {
    return Response.json(
      { message: "Tài khoản đã được xác minh, không cần gửi lại." },
      { status: 200 }
    );
  }

  await EmailVerificationToken.deleteMany({ user_id: user._id });

  const token = crypto.randomBytes(32).toString("hex");
  await EmailVerificationToken.create({
    user_id: user._id,
    token,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  return Response.json(
    {
      message: "Đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư.",
      token,
    },
    { status: 200 }
  );
}
