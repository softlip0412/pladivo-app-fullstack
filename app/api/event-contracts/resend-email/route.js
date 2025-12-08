import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import { sendContractEmail } from "@/lib/email";
import { createPaymentData } from "@/lib/sepay";

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

    // Tự động làm mới thông tin thanh toán cho các đợt chưa thanh toán
    try {
      let hasUpdates = false;

      // Create a completely new array to ensure Mongoose detects the change
      const newPaymentSchedule = contract.payment_schedule.map((item, index) => {
        // Mongoose subdocuments match via _id, so we can convert to object or keep properties
        // It is safer to modify the object if we want to keep _id
        
        if (item.status !== 'paid') {
          const newData = createPaymentData(contract, index);
          
          hasUpdates = true;
          
          return {
            ...item.toObject ? item.toObject() : item, // Ensure it's a plain object
            payment_code: newData.payment_code,
            payment_link: newData.payment_link,
            qr_code: newData.qr_code,
            description: newData.transfer_content
          };
        }
        return item;
      });

      if (hasUpdates) {
        // Direct assignment helps Mongoose detect changes
        contract.payment_schedule = newPaymentSchedule;
        contract.markModified('payment_schedule');
        
        await contract.save();
        console.log("🔄 Regenerated payment info for resending contract:", contract.contract_number);
      }
    } catch (err) {
      console.error("Error regenerating payment data:", err);
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
