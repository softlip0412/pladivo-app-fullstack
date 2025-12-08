import { connectDB } from "@/app/api/common/db";
import Department from "@/models/Department";

export async function GET() {
  await connectDB();

  try {
    const mappings = {
      "Admin": "ADMIN",
      "Nhân viên tổ chức sự kiện": "EVENT_ORGANIZER",
      "Nhân viên thực hiện": "EXECUTION_STAFF",
      "Nhân viên quản lý": "MANAGER",
      "Nhân viên marketing": "MARKETING"
    };

    const results = [];

    for (const [name, code] of Object.entries(mappings)) {
      // Tìm department theo tên (case insensitive)
      const dept = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") }
      });

      if (dept) {
        dept.code = code;
        await dept.save();
        results.push({ name: dept.name, code: dept.code, status: "updated" });
      } else {
        results.push({ name, code, status: "not_found" });
      }
    }

    return Response.json({ success: true, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
