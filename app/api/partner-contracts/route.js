import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import PartnerContract from "@/models/PartnerContract";
import Partner from "@/models/Partner";
import EventContract from "@/models/EventContract";

export async function GET(req) {
  try {
    await connectDB();
    const contracts = await PartnerContract.find()
      .populate("partner_id", "company_name")
      .populate({ path: "event_contract_id", model: EventContract, select: "contract_number title" })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    console.error("❌ API Error /api/partner-contracts:", error); // Log lỗi chi tiết
    return NextResponse.json({ success: false, message: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Generate simple contract number if not provided
    if (!body.contract_number) {
        body.contract_number = `HĐDT-${Date.now().toString().slice(-6)}`;
    }

    const newContract = await PartnerContract.create(body);
    
    return NextResponse.json({ success: true, data: newContract }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { _id, ...updates } = await req.json();

    if (!_id) {
        return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const updatedContract = await PartnerContract.findByIdAndUpdate(_id, updates, { new: true });
    
    if (!updatedContract) {
       return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedContract });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
