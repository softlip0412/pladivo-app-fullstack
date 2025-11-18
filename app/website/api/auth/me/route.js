import { connectDB } from "@/lib/mongodb";
import { User, UserProfile } from "@/models";
import { authenticateToken } from "@/lib/auth";

export async function GET() {
  await connectDB();

  let userData;
  try {
    userData = authenticateToken();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const user = await User.findById(userData.user_id).select("-password_hash");
  if (!user) {
    return Response.json({ error: "Người dùng không tồn tại" }, { status: 404 });
  }

  const profile = await UserProfile.findOne({ user_id: user._id });

  return Response.json(
    {
      user: {
        user_id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profile: profile || null,
      },
    },
    { status: 200 }
  );
}
