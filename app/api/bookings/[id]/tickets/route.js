// ===== FILE 1: /app/api/bookings/[bookingId]/tickets/route.js =====
import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { bookingId } = params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: booking._id,
        event_type: booking.event_type,
        ticket_sale: booking.ticket_sale,
        tickets: booking.tickets || [],
        customer_name: booking.customer_name,
        event_date: booking.event_date,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ===== Cập nhật số lượng vé =====
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { bookingId } = params;
    const { ticketId, newQuantity } = await req.json();

    if (!ticketId || newQuantity === undefined) {
      return NextResponse.json(
        { success: false, message: "ticketId and newQuantity required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    const ticketIndex = booking.tickets.findIndex(
      (t) => t._id.toString() === ticketId
    );

    if (ticketIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    booking.tickets[ticketIndex].quantity = newQuantity;
    await booking.save();

    return NextResponse.json({
      success: true,
      data: booking.tickets[ticketIndex],
      message: "✅ Cập nhật số lượng vé thành công",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ===== FILE 2: /app/dashboard/ticket-management/page.js =====
// (Paste code từ artifact phía dưới)