import mongoose from "mongoose";

const EventContractSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    event_plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventPlan",
      required: true,
    },
    contract_number: { type: String, required: true },
    signing_date: { type: Date, default: Date.now },
    signing_location: { type: String, default: "Hà Nội" },

    // BÊN A - KHÁCH HÀNG
    party_a: {
      name: String,
      address: String,
      phone: String,
      email: String,
      representative: String,
      position: String,
    },

    // BÊN B - ĐƠN VỊ TỔ CHỨC
    party_b: {
      name: { type: String, default: "CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO" },
      address: { type: String, default: "Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội" },
      representative: { type: String, default: "Nguyễn Văn A" },
      position: { type: String, default: "Giám đốc" },
      phone: { type: String, default: "0987654321" },
      email: { type: String, default: "contact@pladivo.com" },
    },

    // NỘI DUNG SỰ KIỆN
    event_content: {
      time: String,
      location: String,
      scale: String,
    },

    // HẠNG MỤC CÔNG VIỆC
    work_items: String, // Có thể là HTML hoặc text mô tả các hạng mục từ EventPlan

    // CHI PHÍ
    total_cost: Number,
    
    // TIẾN ĐỘ THANH TOÁN
    payment_schedule: [
      {
        description: String,
        amount: Number,
        deadline: Date,
        status: String,
      },
    ],

    // TRÁCH NHIỆM
    party_a_responsibilities: String,
    party_b_responsibilities: String,

    // ĐIỀU KHOẢN CHUNG
    general_terms: String,

    status: {
      type: String,
      enum: ["draft", "sent", "signed", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.EventContract ||
  mongoose.model("EventContract", EventContractSchema);
