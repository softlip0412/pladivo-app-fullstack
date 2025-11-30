import { NextResponse } from "next/server";
import { connectDB } from "../common/db";
import { handleCORS } from "../common/cors";
import Blog from "@/models/Blog";

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find({ published: true })
      .select("-comments")
      .sort({ publishedAt: -1 })
      .lean();
    return handleCORS(NextResponse.json({ success: true, data: blogs }));
  } catch (err) {
    console.error("GET /api/blogs error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: err?.message || "Server error" },
        { status: 500 }
      )
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // basic validation
    const title = (body.title || "").toString().trim();
    const content = (body.content || "").toString().trim();
    const category = (body.category || "").toString().trim();
    const excerpt = (body.excerpt || "").toString().trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((t) => (t || "").toString().trim()).filter(Boolean)
      : [];
    const published = Boolean(body.published);
    const author = body.author || null;

    if (!title) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Tiêu đề là bắt buộc" },
          { status: 400 }
        )
      );
    }
    if (!content) {
      return handleCORS(
        NextResponse.json(
          { success: false, message: "Nội dung là bắt buộc" },
          { status: 400 }
        )
      );
    }

    // create new blog document
    const newBlog = new Blog({
      title,
      content,
      category: category || null,
      excerpt: excerpt || null,
      tags,
      published,
      author,
      coverImage: {
        url: body.coverImage?.url || null,
        alt: body.coverImage?.alt || null,
      },
      meta: {
        title: body.meta?.title || null,
        description: body.meta?.description || null,
      },
    });

    const result = await newBlog.save();

    return handleCORS(
      NextResponse.json(
        {
          success: true,
          id: result._id.toString(),
          data: result.toObject(),
        },
        { status: 201 }
      )
    );
  } catch (err) {
    console.error("POST /api/blogs error:", err);
    return handleCORS(
      NextResponse.json(
        { success: false, message: err?.message || "Server error" },
        { status: 500 }
      )
    );
  }
}
