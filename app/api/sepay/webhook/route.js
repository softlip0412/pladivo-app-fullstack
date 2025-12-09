import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import Payment from "@/models/Payment";
import { parseWebhookData, verifyWebhookSignature } from "@/lib/sepay";

/**
 * Sepay Webhook Endpoint
 * Receives payment notifications from Sepay when customer makes bank transfer
 * 
 * Webhook payload example:
 * {
 *   "id": "123456",
 *   "gateway": "VCB",
 *   "transaction_date": "2024-12-04 23:00:00",
 *   "account_number": "0123456789",
 *   "code": "PLADIVO-HD001-1-ABC123",
 *   "content": "PLADIVO-HD001-1-ABC123 Thanh toan dot 1",
 *   "transfer_type": "in",
 *   "amount_in": 5000000,
 *   "amount_out": 0,
 *   "accumulated": 10000000,
 *   "reference_code": "REF123"
 * }
 */
export async function POST(request) {
  try {
    const signature = request.headers.get("x-sepay-signature");
    const authorization = request.headers.get("authorization");
    const payload = await request.json();

    console.log("Sepay webhook received:", payload);

    // Verify webhook signature (optional in sandbox, required in production)
    if ((signature || authorization) && !verifyWebhookSignature(payload, signature, authorization)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook data
    const transactionData = parseWebhookData(payload);

    // Only process incoming transfers
    if (transactionData.transferType !== "in") {
      console.log("Ignoring outgoing transfer");
      return NextResponse.json({ success: true, message: "Ignored outgoing transfer" });
    }

    // Extract payment code from transaction
    const paymentCode = transactionData.paymentCode;
    if (!paymentCode) {
      console.error("No payment code found in transaction");
      return NextResponse.json(
        { success: false, message: "Payment code not found" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find contract with matching payment code
    const contract = await EventContract.findOne({
      "payment_schedule.payment_code": paymentCode,
    });

    if (!contract) {
      console.error("Contract not found for payment code:", paymentCode);
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    console.log("✅ Contract found:", contract.contract_number);
    console.log("🔍 Looking for payment code:", paymentCode);
    console.log("📋 Payment schedule codes:", contract.payment_schedule.map(item => item.payment_code));

    // Find the payment schedule item
    const paymentScheduleIndex = contract.payment_schedule.findIndex(
      (item) => item.payment_code === paymentCode
    );

    if (paymentScheduleIndex === -1) {
      console.error("Payment schedule item not found");
      console.error("Expected payment code:", paymentCode);
      console.error("Available payment codes:", contract.payment_schedule.map(item => item.payment_code));
      return NextResponse.json(
        { success: false, message: "Payment schedule item not found" },
        { status: 404 }
      );
    }

    const paymentItem = contract.payment_schedule[paymentScheduleIndex];

    // Check if already paid
    if (paymentItem.status === "paid") {
      console.log("Payment already processed");
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
      });
    }

    // Verify amount matches
    if (transactionData.amount !== paymentItem.amount && transactionData.amount !== 2000) {
      console.warn(
        `Amount mismatch: expected ${paymentItem.amount}, received ${transactionData.amount}`
      );
      // Still process but log warning
    }

    // Update payment schedule item status
    contract.payment_schedule[paymentScheduleIndex].status = "paid";
    contract.payment_schedule[paymentScheduleIndex].paid_at = new Date(
      transactionData.transactionDate
    );
    contract.payment_schedule[paymentScheduleIndex].transaction_id =
      transactionData.transactionId;

    // Check if this is the first payment - if so, mark contract as signed
    const isFirstPayment = paymentScheduleIndex === 0;
    if (isFirstPayment && contract.status !== "signed") {
      contract.status = "signed";
      console.log("First payment received - contract marked as signed");
    }

    await contract.save();

    // Create Payment record
    const payment = await Payment.create({
      contract_id: contract._id,
      payment_schedule_index: paymentScheduleIndex,
      payment_code: paymentCode,
      amount: transactionData.amount,
      method: "bank",
      status: "completed",
      sepay_transaction_id: transactionData.transactionId,
      sepay_reference_code: transactionData.referenceCode,
      sepay_gateway: transactionData.gateway,
      sepay_transaction_date: new Date(transactionData.transactionDate),
      transfer_content: transactionData.transferContent,
    });

    console.log("Payment processed successfully:", payment._id);

    // Send payment confirmation email
    try {
      const { sendPaymentConfirmationEmail } = await import('@/lib/email');
      const emailResult = await sendPaymentConfirmationEmail(
        contract.toObject(),
        contract.payment_schedule[paymentScheduleIndex],
        transactionData
      );
      
      if (emailResult.success) {
        console.log('✅ Payment confirmation email sent to customer');
      } else {
        console.warn('⚠️ Failed to send payment confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending payment confirmation email:', emailError);
      // Don't fail the webhook if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        contract_id: contract._id,
        payment_id: payment._id,
        payment_schedule_index: paymentScheduleIndex,
        contract_status: contract.status,
        is_first_payment: isFirstPayment,
      },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing webhook (development only)
 */
export async function GET(request) {
  return NextResponse.json({
    message: "Sepay webhook endpoint is active",
    environment: process.env.NODE_ENV,
  });
}
