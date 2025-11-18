import { connectDB } from "@/app/api/common/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

/**
 * Lấy danh sách người dùng
 */
export async function GET() {
  await connectDB();
  try {
    const users = await User.find({});
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

/**
 * Tạo người dùng mới
 */
export async function POST(request) {
  await connectDB();
  try {
    const { email, username, password, role } = await request.json();

    // Validate required fields
    if (!email || !username || !password) {
      return new Response(
        JSON.stringify({ error: "Email, username, password là bắt buộc" }),
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["employee", "manager", "admin", "system_admin"];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Vai trò không hợp lệ. Phải là một trong: ${validRoles.join(", ")}` }),
        { status: 400 }
      );
    }

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email đã tồn tại" }), { status: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      role,
      password_hash
    });

    await newUser.save();

    // Không trả về password_hash
    const { password_hash: _, ...userWithoutPassword } = newUser.toObject();

    return new Response(JSON.stringify(userWithoutPassword), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
