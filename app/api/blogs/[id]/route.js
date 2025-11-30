import { NextResponse } from "next/server";
import { connectDB } from "../../common/db";
import { handleCORS } from "../../common/cors";
import Blog from "../../../../models/Blog";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "ID không hợp lệ" },
          { status: 400 }
        )
      );
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Bài viết không tìm thấy" },
          { status: 404 }
        )
      );
    }

    return handleCORS(NextResponse.json({ success: true, data: blog }));
  } catch (err) {
    console.error("GET /api/blogs/[id] error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: err?.message || "Server error" },
        { status: 500 }
      )
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "ID không hợp lệ" },
          { status: 400 }
        )
      );
    }

    const blog = await Blog.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Bài viết không tìm thấy" },
          { status: 404 }
        )
      );
    }

    return handleCORS(NextResponse.json({ success: true, data: blog }));
  } catch (err) {
    console.error("PATCH /api/blogs/[id] error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: err?.message || "Server error" },
        { status: 500 }
      )
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "ID không hợp lệ" },
          { status: 400 }
        )
      );
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Bài viết không tìm thấy" },
          { status: 404 }
        )
      );
    }

    return handleCORS(
      NextResponse.json({
        success: true,
        message: "Xóa bài viết thành công",
        data: blog,
      })
    );
  } catch (err) {
    console.error("DELETE /api/blogs/[id] error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: err?.message || "Server error" },
        { status: 500 }
      )
    );
  }
}
