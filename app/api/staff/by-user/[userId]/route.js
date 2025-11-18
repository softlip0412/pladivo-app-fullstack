import { connectDB } from "@/app/api/common/db";
import Staff from "@/models/Staff";
import mongoose from "mongoose";
import Department from "@/models/Department";
import Role from "@/models/Role";

export async function GET(req, { params }) {
  await connectDB();

  try {
    const userId = params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid user ID" 
        }),
        { status: 400 }
      );
    }

    const staff = await Staff.findOne({
      user_id: new mongoose.Types.ObjectId(userId),
    })
      .populate("user_id", "phone email status username")
      .populate("department_id", "name")
      .populate("role_id", "name");

    if (!staff) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Staff not found for this user" 
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: staff 
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: err.message 
      }),
      { status: 500 }
    );
  }
}