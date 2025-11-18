import { cookies } from "next/headers"
import { verifyRefreshToken, signAccessToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models"

export async function POST() {
  await connectDB()
  const cookieStore = cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (!refreshToken) {
    return Response.json({ error: "Refresh token required" }, { status: 401 })
  }

  try {
    // Xác thực refresh token
    const decoded = verifyRefreshToken(refreshToken)

    // Check user còn tồn tại không
    const user = await User.findById(decoded.user_id)
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    // Tạo access token mới
    const newAccessToken = signAccessToken({
      user_id: user._id,
      email: user.email,
      role: user.role,
    })

    // Set lại access token cookie
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15, // 15 phút
    })

    return Response.json(
      { message: "Access token refreshed successfully" },
      { status: 200 }
    )
  } catch (err) {
    console.error("Refresh error:", err)
    return Response.json({ error: "Invalid or expired refresh token" }, { status: 401 })
  }
}
