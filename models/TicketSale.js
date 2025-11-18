// FILE: /models/TicketSale.js
import mongoose from "mongoose";

const TicketSaleSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    ticket_type: { type: String, required: true }, // "Vé Standard", "Vé VIP", etc
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true }, // Giá mỗi vé
    total_price: { type: Number, required: true }, // quantity * unit_price

    // Thông tin khách hàng mua vé
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_email: { type: String, required: true },

    // Hóa đơn
    order_id: { type: String, unique: true }, // Mã đơn hàng (tự động sinh)
    payment_status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    payment_method: {
      type: String,
      enum: ["cash", "bank_transfer", "card", "wallet"],
      default: "cash",
    },
    paid_at: { type: Date }, // Thời gian thanh toán

    // Ghi chú
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.TicketSale ||
  mongoose.model("TicketSale", TicketSaleSchema);

// FILE: /app/api/ticket-sales/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketSale from "@/models/TicketSale";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

// GET: Lấy danh sách bán vé
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("booking_id");
    const status = searchParams.get("status");

    const filter = {};
    if (bookingId) filter.booking_id = new mongoose.Types.ObjectId(bookingId);
    if (status) filter.payment_status = status;

    const sales = await TicketSale.find(filter)
      .populate("booking_id", "event_type event_date customer_name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: sales });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// POST: Tạo đơn bán vé mới
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate
    if (!body.booking_id || !body.ticket_type || !body.quantity) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order_id
    const orderId = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const ticketSale = await TicketSale.create({
      ...body,
      order_id: orderId,
    });

    const populated = await TicketSale.findById(ticketSale._id).populate(
      "booking_id"
    );

    return NextResponse.json(
      {
        success: true,
        data: populated,
        message: "✅ Tạo đơn bán vé thành công",
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// FILE: /app/api/ticket-sales/[saleId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketSale from "@/models/TicketSale";

// PATCH: Cập nhật trạng thái thanh toán
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { saleId } = params;
    const { payment_status, paid_at } = await req.json();

    const sale = await TicketSale.findByIdAndUpdate(
      saleId,
      {
        payment_status,
        paid_at: payment_status === "paid" ? new Date() : null,
      },
      { new: true }
    ).populate("booking_id");

    if (!sale) {
      return NextResponse.json(
        { success: false, message: "Sale not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
      message: "✅ Cập nhật trạng thái thành công",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// FILE: /app/api/ticket-sales/reports/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketSale from "@/models/TicketSale";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("booking_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const filter = {};
    if (bookingId) filter.booking_id = bookingId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)
        filter.createdAt.$lte = new Date(
          new Date(endDate).getTime() + 24 * 60 * 60 * 1000
        );
    }

    const sales = await TicketSale.find(filter).populate("booking_id");

    // Tính toán thống kê
    const totalSales = sales.length;
    const paidSales = sales.filter((s) => s.payment_status === "paid");
    const totalRevenue = paidSales.reduce((sum, s) => sum + s.total_price, 0);
    const pendingRevenue = sales
      .filter((s) => s.payment_status === "pending")
      .reduce((sum, s) => sum + s.total_price, 0);

    // Phân loại theo loại vé
    const byTicketType = {};
    sales.forEach((sale) => {
      if (!byTicketType[sale.ticket_type]) {
        byTicketType[sale.ticket_type] = {
          ticket_type: sale.ticket_type,
          quantity: 0,
          revenue: 0,
          paid_revenue: 0,
        };
      }
      byTicketType[sale.ticket_type].quantity += sale.quantity;
      byTicketType[sale.ticket_type].revenue += sale.total_price;
      if (sale.payment_status === "paid") {
        byTicketType[sale.ticket_type].paid_revenue += sale.total_price;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSales,
          paidSales: paidSales.length,
          totalRevenue,
          pendingRevenue,
          totalQuantity: sales.reduce((sum, s) => sum + s.quantity, 0),
        },
        byTicketType: Object.values(byTicketType),
        details: sales,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}