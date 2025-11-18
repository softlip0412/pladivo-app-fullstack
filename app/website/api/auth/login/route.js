import { connectDB } from "@/lib/mongodb";
import { User } from "@/models";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  await connectDB();
  const { username, email, password } = await request.json();

  // Tìm user với email hoặc username
  const user = await User.findOne({
    $or: [{ email }, { username }],
    status: "active",
  });

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // So sánh mật khẩu
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Tạo token
  const accessToken = signAccessToken({
    user_id: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    user_id: user._id,
  });

  // Lưu token vào cookie
  const cookieStore = cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    path: "/",
    maxAge: 60 * 15, // 15 phút
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
  });

  // Trả response
  return Response.json(
    {
      message: "Login successful",
      user: {
        user_id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    },
    { status: 200 }
  );
}
