import mongoose from "mongoose";

const TicketSaleConfigSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    ticket_types: [
      {
        type: { type: String, required: true }, // Tên loại vé (Standard, VIP...)
        price: { type: Number, required: true, min: 0 }, // Giá vé
        quantity: { type: Number, required: true, min: 0 }, // Tổng số lượng vé bán ra
        sold: { type: Number, default: 0 }, // Số lượng đã bán
        seating_areas: [
          {
            area_name: { type: String, required: true }, // Tên khu vực (VD: "Khu A", "Hàng 1-5")
            seat_count: { type: Number, required: true, min: 0 }, // Số ghế trong khu vực này
          },
        ], // Danh sách các khu vực ghế ngồi
        sale_start_date: { type: Date, required: true }, // Thời gian bắt đầu bán cho loại vé này
        sale_end_date: { type: Date, required: true }, // Thời gian kết thúc bán cho loại vé này
      },
    ],
    status: {
      type: String,
      enum: ["active", "paused", "ended", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Xóa model cũ nếu tồn tại để đảm bảo schema mới được sử dụng
if (mongoose.models.TicketSaleConfig) {
  delete mongoose.models.TicketSaleConfig;
}

export default mongoose.model("TicketSaleConfig", TicketSaleConfigSchema);
