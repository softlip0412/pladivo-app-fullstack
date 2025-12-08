import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateToken } from "@/app/api/common/auth";
import { handleCORS } from "@/app/api/common/cors";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 🟢 Ưu tiên đọc token trong cookie
    const cookieToken = cookies().get("accessToken")?.value;

    // 🟢 Nếu không có, đọc ở header Authorization
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");

    const token = cookieToken || headerToken;

    if (!token) {
      throw new Error("NoToken");
    }

    // 🟢 Truyền token vào authenticateToken
    const user = authenticateToken(token);

    return handleCORS(
      NextResponse.json({
        success: true,
        user,
      })
    );
  } catch (error) {
    console.error("❌ Lỗi xác thực:", error);

    if (error.message === "TokenExpiredError") {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Token đã hết hạn, vui lòng đăng nhập lại" },
          { status: 401 }
        )
      );
    }

    return handleCORS(
      NextResponse.json(
        { success: false, message: "Access token không hợp lệ hoặc thiếu" },
        { status: 401 }
      )
    );
  }
}
