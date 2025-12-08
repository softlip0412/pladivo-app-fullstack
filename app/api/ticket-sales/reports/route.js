import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import TicketOrder from "@/models/TicketOrder";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const booking_id = searchParams.get("booking_id");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    console.log("Fetching Ticket Report", { booking_id, start_date, end_date });

    const matchQuery = {};

    if (booking_id && booking_id !== "all") {
        matchQuery.booking_id = new mongoose.Types.ObjectId(booking_id);
    }

    if (start_date || end_date) {
      matchQuery.createdAt = {};
      if (start_date) matchQuery.createdAt.$gte = new Date(start_date);
      if (end_date) {
          const end = new Date(end_date);
          end.setHours(23, 59, 59, 999);
          matchQuery.createdAt.$lte = end;
      }
    }

    // 1. Details (All matching orders)
    const details = await TicketOrder.find(matchQuery)
        .sort({ createdAt: -1 })
        .lean();

    // 2. Aggregation for Summary & Charts
    // We can compute summary from details in JS to save DB calls if dataset is small, 
    // but aggregation is more robust. Let's use aggregation.

    // Summary Aggregation
    const summaryAggr = await TicketOrder.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 }, // Total count of orders
                paidSales: { 
                    $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] } 
                },
                totalQuantity: {
                     $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$quantity", 0] } 
                },
                totalRevenue: { 
                    $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$total_price", 0] } 
                }
            }
        }
    ]);

    const summary = summaryAggr[0] || { totalSales: 0, paidSales: 0, totalQuantity: 0, totalRevenue: 0 };

    // Group by Ticket Type (only PAID usually matters for revenue analysis)
    const byTicketType = await TicketOrder.aggregate([
        { $match: { ...matchQuery, payment_status: "paid" } },
        {
            $group: {
                _id: "$ticket_type",
                quantity: { $sum: "$quantity" },
                paid_revenue: { $sum: "$total_price" }
            }
        },
        {
            $project: {
                ticket_type: "$_id",
                quantity: 1,
                paid_revenue: 1,
                _id: 0
            }
        }
    ]);

    return NextResponse.json({
      success: true,
      data: {
          summary,
          byTicketType,
          details: details.map(d => ({
              ...d,
              order_id: d.order_code || d._id.toString()
          }))
      }
    });

  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
