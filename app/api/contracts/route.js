import { NextResponse } from "next/server";
import { connectDB } from "../common/db";
import { ObjectId } from "mongodb";

// 🧩 Lấy danh sách hợp đồng
export async function GET() {
  try {
    const db = await connectDB();
    if (!db) throw new Error("Không thể kết nối MongoDB");

    const contracts = await db.collection("contracts").find().toArray();
    return NextResponse.json({ success: true, data: contracts });
  } catch (err) {
    console.error("Error fetching contracts:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 🧩 Tạo hợp đồng mới
export async function POST(request) {
  try {
    const db = await connectDB();
    const body = await request.json();

    const { contract_code, start_date, end_date, value, description } = body;

    if (!contract_code) {
      return NextResponse.json({ success: false, message: "Thiếu mã hợp đồng" }, { status: 400 });
    }

    const result = await db.collection("contracts").insertOne({
      contract_code,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      value,
      description,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Error creating contract:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 🧩 Xóa hợp đồng
export async function DELETE(request) {
  try {
    const db = await connectDB();
    const { id } = await request.json();

    const result = await db.collection("contracts").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Không tìm thấy hợp đồng" }, { status: 404 });
    }
  } catch (err) {
    console.error("Error deleting contract:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
