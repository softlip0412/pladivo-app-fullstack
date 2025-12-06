import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import { sendContractEmail } from "@/lib/email";

// POST: Gửi lại email hợp đồng
export async function POST(request) {
  try {
    await connectDB();
    const { contract_id } = await request.json();

    if (!contract_id) {
      return NextResponse.json(
        { success: false, message: "Missing contract_id" },
        { status: 400 }
      );
    }

    // Lấy thông tin hợp đồng
    const contract = await EventContract.findById(contract_id);

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    // Kiểm tra email khách hàng
    if (!contract.party_a?.email) {
      return NextResponse.json(
        { success: false, message: "Customer email not found in contract" },
        { status: 400 }
      );
    }

    // Gửi email
    let emailResult = { success: false };
    try {
      emailResult = await sendContractEmail(contract.toObject(), contract.party_a.email);
      console.log('Resend email result:', emailResult);
    } catch (emailError) {
      console.error('Error resending contract email:', emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send email: " + emailError.message },
        { status: 500 }
      );
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Email đã được gửi thành công đến " + contract.party_a.email,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resending contract email:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
