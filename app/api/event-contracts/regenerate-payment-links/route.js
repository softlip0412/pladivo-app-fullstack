import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import { createPaymentData } from "@/lib/sepay";

// POST: Regenerate payment links for an existing contract
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

    // Get contract
    const contract = await EventContract.findById(contract_id);

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    // Regenerate payment links for all payment schedule items
    if (contract.payment_schedule && contract.payment_schedule.length > 0) {
      for (let i = 0; i < contract.payment_schedule.length; i++) {
        // Always regenerate to ensure latest data
        const paymentData = createPaymentData(contract.toObject(), i);
        contract.payment_schedule[i].payment_code = paymentData.payment_code;
        contract.payment_schedule[i].payment_link = paymentData.payment_link;
        contract.payment_schedule[i].qr_code = paymentData.qr_code;
      }
      
      // Save updated contract
      await contract.save();
      
      return NextResponse.json({
        success: true,
        message: "Payment links regenerated successfully",
        data: contract,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "No payment schedule found in contract" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error regenerating payment links:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
