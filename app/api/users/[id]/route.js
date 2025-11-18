import { connectDB } from "@/app/api/common/db";
import { User } from "@/models";
import mongoose from "mongoose";

/**
 * Cập nhật người dùng
 */
export async function PUT(request, { params }) {
  await connectDB();
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "ID không hợp lệ" }), {
      status: 400,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON không hợp lệ" }), {
      status: 400,
    });
  }

  const { email, username, password, role } = body;

  try {
    const user = await User.findById(id);
    if (!user)
      return new Response(
        JSON.stringify({ error: "Người dùng không tồn tại" }),
        { status: 404 }
      );

    if (email) user.email = email;
    if (username) user.username = username;
    if (password) user.password = password; // nếu có hook hash, ok
    if (role) user.role = role;

    await user.save();
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

/**
 * Xóa người dùng
 */
export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID không hợp lệ" }), {
        status: 400,
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user)
      return new Response(
        JSON.stringify({ error: "Người dùng không tồn tại" }),
        { status: 404 }
      );

    return new Response(JSON.stringify({ message: "Xóa thành công" }), {
      status: 200,
    });
  } catch (err) {
    console.error("DELETE /api/users/:id error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET(request, { params }) {
  await connectDB();
  const { id } = params;

  // Kiểm tra ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "ID không hợp lệ" }), {
      status: 400,
    });
  }

  try {
    const user = await User.findById(id).select(
      "username email phone role status"
    );
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Người dùng không tồn tại" }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
