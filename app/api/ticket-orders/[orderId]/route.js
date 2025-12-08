import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketOrder from "@/models/TicketOrder";
import QRCode from "qrcode";
import { sendEntryTicketEmail } from "@/lib/email";

// PATCH: Update ticket order status
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { orderId } = params;
    const body = await req.json();
    const { payment_status } = body;

    // Find existing order first
    let order = await TicketOrder.findById(orderId);
    if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const updates = { payment_status };
    
    // If status changing to 'paid' and no QR codes yet, generate them
    if (payment_status === 'paid' && order.payment_status !== 'paid') {
        updates.paid_at = new Date();
        updates.payment_status = 'paid';

        // Generate QR Codes
        const qrCodes = [];
        for (let i = 0; i < order.quantity; i++) {
            // Data for QR: JSON string with Order Code, Index, and validation secret if needed
            // For simplicity: OrderCode_Index
            const qrData = JSON.stringify({
                code: order.order_code,
                index: i + 1,
                type: order.ticket_type
            });
            const qrImage = await QRCode.toDataURL(qrData);
            qrCodes.push(qrImage);
        }
        updates.qr_codes = qrCodes;
        
        // Send Email
        // We do this asynchronously or await it? Await to ensure success roughly.
        // In robust systems, use a queue.
        try {
             await sendEntryTicketEmail({ ...order.toObject(), ...updates }, qrCodes, order.customer_email);
        } catch (emailErr) {
            console.error("Failed to send entry ticket email", emailErr);
        }
    }

    const updatedOrder = await TicketOrder.findByIdAndUpdate(
      orderId,
      updates,
      { new: true }
    );
     // .populate if needed, but the list view didn't seem to rely on deep population for just status update return
     // But let's keep it safe if frontend uses the return value

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "✅ Cập nhật trạng thái thành công"
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
