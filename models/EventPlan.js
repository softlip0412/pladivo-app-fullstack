import mongoose from "mongoose";

const EventPlanSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // ======= TRẠNG THÁI =======
    status: {
      type: String,
      enum: ["pending", "confirmed", "csconfirmed", "cancelled", "completed"],
      default: "pending",
    },

    // ======= STEP 1 =======
    step1: {
      goal: String,
      audience: String,
      eventCategory: String,
    },

    // ======= STEP 2 =======
    step2: {
      startDate: String,
      endDate: String,
      selectedPartner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },

      // Budget table
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
          time: String,
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
          time: String,
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
          time: String,
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

    // ======= STEP 4 =======
    step4: {
      checklist: [
        {
          category: String,
          description: String,
          owner: String,
          deadline: String,
        },
      ],
    },

    // ======= STEP 5 =======
    step5: {
      marketingChecklist: [
        {
          category: String,
          description: String,
          owner: String,
          deadline: String,
        },
      ],
    },

    // ======= STEP 6 =======
    step6: {
      eventDayChecklist: [
        {
          category: String,
          description: String,
          owner: String,
          deadline: String,
        },
      ],
    },

    // ======= STEP 7 =======
    step7: {
      postEvent: [
        {
          category: String,
          description: String,
          owner: String,
          deadline: String,
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.EventPlan ||
  mongoose.model("EventPlan", EventPlanSchema);
