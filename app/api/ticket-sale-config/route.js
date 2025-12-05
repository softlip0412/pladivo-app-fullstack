import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketSaleConfig from "@/models/TicketSaleConfig";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

// GET: Lấy cấu hình bán vé theo booking_id
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("booking_id");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Missing booking_id" },
        { status: 400 }
      );
    }

    const config = await TicketSaleConfig.findOne({ booking_id: bookingId });

    return NextResponse.json({ success: true, data: config });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc cập nhật cấu hình bán vé
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { booking_id, ticket_types } = body;

    if (!booking_id || !ticket_types || !Array.isArray(ticket_types) || ticket_types.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate each ticket type has required fields
    for (const ticket of ticket_types) {
      if (!ticket.type || !ticket.price || !ticket.quantity || !ticket.sale_start_date || !ticket.sale_end_date) {
        return NextResponse.json(
          { success: false, message: "Each ticket type must have type, price, quantity, sale_start_date, and sale_end_date" },
          { status: 400 }
        );
      }
      
      // Validate seating areas if provided
      if (ticket.seating_areas && Array.isArray(ticket.seating_areas)) {
        for (const area of ticket.seating_areas) {
          if (!area.area_name || !area.seat_count || area.seat_count <= 0) {
            return NextResponse.json(
              { success: false, message: `Invalid seating area for ticket type "${ticket.type}". Each area must have area_name and seat_count > 0` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Kiểm tra booking tồn tại
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Tìm và cập nhật hoặc tạo mới
    let config = await TicketSaleConfig.findOne({ booking_id });

    if (config) {
      // Update existing - giữ nguyên sold count nếu có
      const newTicketTypes = ticket_types.map(newType => {
        const existingType = config.ticket_types.find(t => t.type === newType.type);
        return {
          type: newType.type,
          price: newType.price,
          quantity: newType.quantity,
          seating_areas: newType.seating_areas || [],
          sale_start_date: newType.sale_start_date,
          sale_end_date: newType.sale_end_date,
          sold: existingType ? existingType.sold : 0
        };
      });
      
      config.ticket_types = newTicketTypes;
      config.status = "active";
      await config.save();
    } else {
      // Create new
      config = await TicketSaleConfig.create({
        booking_id,
        ticket_types: ticket_types.map(t => ({
          type: t.type,
          price: t.price,
          quantity: t.quantity,
          seating_areas: t.seating_areas || [],
          sale_start_date: t.sale_start_date,
          sale_end_date: t.sale_end_date,
          sold: 0
        })),
        status: "active",
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: "✅ Cấu hình bán vé thành công",
    });
  } catch (err) {
    console.error("Error saving ticket config:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
