import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketOrder from "@/models/TicketOrder";
import TicketSaleConfig from "@/models/TicketSaleConfig";
import Booking from "@/models/Booking";
import { getSepayAccountInfo } from "@/lib/sepay";
import { sendTicketOrderEmail } from "@/lib/email";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { 
      booking_id, 
      ticket_type, 
      ticket_area, 
      quantity, 
      customer_name, 
      customer_email, 
      customer_phone,
      payment_method 
    } = body;

    // 1. Validation
    if (!booking_id || !ticket_type || !ticket_area || !quantity || !customer_name || !customer_email || !customer_phone) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ success: false, message: "Quantity must be greater than 0" }, { status: 400 });
    }

    // 2. Check Booking & Config
    const booking = await Booking.findById(booking_id);
    if (!booking) return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });

    const config = await TicketSaleConfig.findOne({ booking_id: booking_id });
    if (!config || config.status !== 'active') {
      return NextResponse.json({ success: false, message: "Ticket sales not active for this event" }, { status: 400 });
    }

    // 3. Find Ticket Type & Area
    const typeConfig = config.ticket_types.find(t => t.type === ticket_type);
    if (!typeConfig) return NextResponse.json({ success: false, message: "Invalid ticket type" }, { status: 400 });

    const areaConfig = typeConfig.seating_areas.find(a => a.area_name === ticket_area);
    if (!areaConfig) return NextResponse.json({ success: false, message: "Invalid seating area" }, { status: 400 });

    // 4. Check Availability
    // Calculate total sold for this type
    if (typeConfig.sold + Number(quantity) > typeConfig.quantity) {
       return NextResponse.json({ success: false, message: "Not enough tickets available for this type" }, { status: 400 });
    }
    
    // Optional: Check area capacity if tracking at area level is implemented. 
    // Currently schema structure suggests `seat_count` in area is the capacity.
    // However, `sold` is only tracked at `ticket_types` level in the example schema.
    // If exact seat tracking is needed, we would need to check existing orders for this area.
    // For now, we trust the Type Level limit as primary constraint or assume area capacity is just informational.
    // Let's implement a rudimentary check if we can, but we don't have 'sold' count per area in the passed schema.
    // We will stick to Type Level check.

    // 5. Calculate Price
    const unit_price = typeConfig.price;
    const total_price = unit_price * Number(quantity);

    // 6. Generate Order Code
    const order_code = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 7. Create Order
    const newOrder = await TicketOrder.create({
      order_code,
      booking_id,
      customer_name,
      customer_email,
      customer_phone,
      ticket_type,
      ticket_area,
      quantity: Number(quantity),
      unit_price,
      total_price,
      payment_method: payment_method || "bank_transfer",
      payment_status: "pending",
      event_name: booking.event_type || "Event",
      event_date: booking.event_date,
      event_location: booking.address
    });

    // 8. Update Sold Queue
    // We update the specific element in array
    await TicketSaleConfig.updateOne(
        { "ticket_types.type": ticket_type, booking_id: booking_id },
        { $inc: { "ticket_types.$.sold": Number(quantity) } }
    );

    // 9. Send Email
    try {
        const accountInfo = getSepayAccountInfo();
        const qrCodeUrl = `https://img.vietqr.io/image/${accountInfo.bankCode}-${accountInfo.accountNumber}-compact2.png?amount=${total_price}&addInfo=${encodeURIComponent(order_code)}&accountName=${encodeURIComponent(accountInfo.accountName)}`;

        const paymentInfo = {
            ...accountInfo,
            qrCode: qrCodeUrl
        };

        const eventData = {
          title: booking.event_type || "Sự kiện",
          start_datetime: booking.event_date,
          location: booking.address
        };

        const ticketData = {
          type: `${ticket_type} - ${ticket_area}`
        };
        
        // Pass order in format expected by template
        const orderForEmail = {
            order_id: order_code,
            customer_name: customer_name,
            quantity: Number(quantity),
            total_price: total_price
        };

        await sendTicketOrderEmail(orderForEmail, ticketData, eventData, paymentInfo, customer_email);
    } catch (e) {
        console.error("Email send failed", e);
    }

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Ticket Order creation failed:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const orders = await TicketOrder.find()
      .populate("booking_id", "event_type event_date")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
