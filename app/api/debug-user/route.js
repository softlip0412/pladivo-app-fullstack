import { connectDB } from "@/app/api/common/db";
import User from "@/models/User";
import Staff from "@/models/Staff";
import Department from "@/models/Department";

export async function GET() {
  await connectDB();
  try {
    const email = "ns.a@gmail.com";
    const user = await User.findOne({ email });
    if (!user) return Response.json({ error: "User not found" });

    const staff = await Staff.findOne({ user_id: user._id }).populate("department_id");
    
    return Response.json({
      user: user.email,
      role: user.role,
      staff_name: staff?.full_name,
      department_name: staff?.department_id?.name,
      department_code: staff?.department_id?.code // Check this!
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
}
