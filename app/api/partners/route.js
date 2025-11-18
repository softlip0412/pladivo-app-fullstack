import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Partner from "@/models/Partner"
import Service from "@/models/Service"; // nếu cần join

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const region = searchParams.get("region");

  const filter = {};
  if (type) filter.partner_type = type;
  if (region) filter.region = region;

  // populate service
  const partners = await Partner.find(filter).populate("service", "name");
  return NextResponse.json({ success: true, data: partners });
}

export async function POST(request) {
  await connectDB();
  const data = await request.json();

  if (!data.company_name || !data.partner_type || !data.region) {
    return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const partner = await Partner.create(data);
  return NextResponse.json({ success: true, data: partner, message: "Thêm đối tác thành công" });
}

export async function PATCH(request) {
  await connectDB();
  const { id, updates } = await request.json();

  const partner = await Partner.findByIdAndUpdate(id, updates, { new: true });
  if (!partner) return NextResponse.json({ success: false, message: "Không tìm thấy đối tác" }, { status: 404 });

  return NextResponse.json({ success: true, data: partner, message: "Cập nhật thành công" });
}

export async function DELETE(request) {
  await connectDB();
  const { id } = await request.json();

  const partner = await Partner.findByIdAndDelete(id);
  if (!partner) return NextResponse.json({ success: false, message: "Không tìm thấy đối tác" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Đã xóa đối tác" });
}
