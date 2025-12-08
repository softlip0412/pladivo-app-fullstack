import { connectDB } from "@/app/api/common/db";
import Department from "@/models/Department";

export async function GET() {
  await connectDB();
  try {
    const departments = await Department.find({});
    const results = [];

    for (const dept of departments) {
      let code = null;
      const name = dept.name.trim().toLowerCase();

      if (name.includes("quản lý")) code = "MANAGER";
      else if (name.includes("marketing")) code = "MARKETING";
      else if (name.includes("tổ chức sự kiện")) code = "EVENT_ORGANIZER";
      else if (name.includes("thực hiện")) code = "EXECUTION_STAFF";
      else if (name.includes("admin")) code = "ADMIN";

      if (code) {
        dept.code = code;
        await dept.save();
        results.push({ name: dept.name, code, status: "updated" });
      } else {
        results.push({ name: dept.name, status: "skipped" });
      }
    }

    return Response.json({ success: true, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
