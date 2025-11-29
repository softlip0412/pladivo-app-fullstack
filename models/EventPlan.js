import mongoose from "mongoose";

const EventPlanSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // ======= TRẠNG THÁI TỔNG QUAN =======
    status: {
      type: String,
      enum: [
        "draft",
        "pending_manager", 
        "pending_manager_demo", 
        "manager_approved", 
        "manager_approved_demo", 
        "pending_customer",
        "pending_customer_demo",
        "customer_approved",
        "customer_approved_demo",
        "in_progress", 
        "completed", 
        "cancelled", 
      ],
      default: "draft",
    },

    // ======= QUẢN LÝ PHÊ DUYỆT =======
    approvals: {
      manager: {
        approved: { type: Boolean, default: false },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
        approvedAt: Date,
        comment: String,
      },
      customer: {
        approved: { type: Boolean, default: false },
        approvedAt: Date,
        comment: String,
      },
    },

    // ======= STEP 1 =======
    step1: {
      goal: String,
      audience: String,
      eventCategory: String,
    },

    // ======= STEP 2 =======
    step2: {
      startDate: Date, 
      endDate: Date, 
      selectedPartner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },

      budget: [
        {
          category: String,
          description: String,
          unit: String,
          quantity: Number,
          cost: Number,
          note: String,
        },
      ],

      prepTimeline: [
        {
          time: Date, 
          task: String,
          manager: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
        },
      ],

      staffAssign: [
        {
          department: String,
          duty: String,
          manager: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
          note: String,
        },
      ],

      eventTimeline: [
        {
          time: Date,
          activity: String,
          manager: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
        },
      ],
    },

    // ======= STEP 3 =======
    step3: {
      theme: String,
      mainColor: String,
      style: String,
      message: String,
      decoration: String,

      programScript: [
        {
          time: Date,
          content: String,
        },
      ],

      keyActivities: [
        {
          activity: String,
          importance: String,
        },
      ],
    },

    // ======= STEP 3.5: KẾ HOẠCH CHI PHÍ =======
    step3_5: {
      partnerCosts: [
        {
          partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
          partnerName: String,
          description: String,
          amount: Number,
          note: String,
        },
      ],

      deposits: [
        {
          description: String,
          amount: Number,
          dueDate: Date,
          status: {
            type: String,
            enum: ["pending", "paid", "overdue"],
            default: "pending",
          },
          paidAt: Date,
          note: String,
        },
      ],

      totalEstimatedCost: Number,
      totalDeposit: Number,
      totalRemaining: Number,
    },

    // ======= STEP 4: CHUẨN BỊ CHI TIẾT =======
    step4: {
      checklist: [
        {
          category: String,
          description: String,
          owner: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
          deadline: Date,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
          },
          completedAt: Date,
        },
      ],
    },

    // ======= STEP 5: TRUYỀN THÔNG & MARKETING =======
    step5: {
      marketingChecklist: [
        {
          category: String,
          description: String,
          owner: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
          deadline: Date,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
          },
          completedAt: Date,
        },
      ],
    },

    // ======= STEP 6: TRIỂN KHAI NGÀY SỰ KIỆN =======
    step6: {
      eventDayChecklist: [
        {
          category: String,
          description: String,
          owner: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
          deadline: Date,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
          },
          completedAt: Date,
        },
      ],
    },

    // ======= STEP 7: HẬU SỰ KIỆN =======
    step7: {
      postEvent: [
        {
          category: String,
          description: String,
          owner: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
          },
          deadline: Date,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
          },
          completedAt: Date,
        },
      ],
    },

    // ======= TRACKING TẠO TASK =======
    tasksCreated: {
      type: Boolean,
      default: false,
    },
    tasksCreatedAt: Date,
    tasksCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

// Export with consistent name
export default mongoose.models.EventPlan ||
  mongoose.model("EventPlan", EventPlanSchema);