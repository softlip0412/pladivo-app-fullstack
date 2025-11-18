import { NextResponse } from "next/server";
import { handleCORS } from "@/app/api/common/cors";

export async function POST(request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Đăng xuất thành công",
    });

    // ✅ Xóa cookie khi logout
    response.cookies.delete("accessToken");

    return handleCORS(response);
  } catch (err) {
    console.error("Logout error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: "Lỗi máy chủ" },
        { status: 500 }
      )
    );
  }
}