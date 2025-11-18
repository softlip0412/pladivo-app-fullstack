import { connectDB } from "@/lib/mongodb";
import { User, PasswordResetToken } from "@/models";
import crypto from "crypto";

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email là bắt buộc" }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return Response.json(
      { message: "Nếu email tồn tại, hướng dẫn đã được gửi." }, 
      { status: 200 }
    );
  }

  await PasswordResetToken.deleteMany({ user_id: user.user_id });

  const token = crypto.randomBytes(32).toString("hex");
  await PasswordResetToken.create({
    user_id: user.user_id,
    token,
    expires_at: new Date(Date.now() + 60 * 60 * 1000), 
  });

  return Response.json(
    { message: "Nếu email tồn tại, link reset đã được gửi." },
    { status: 200 }
  );
}
