import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    // Tài khoản hệ thống
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Thông tin cá nhân
    full_name: { type: String, required: true },
    dob: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    citizen_id: { type: String },
    citizen_issue_date: { type: Date },
    citizen_issue_place: { type: String },

    address: { type: String },
    permanent_address: { type: String },

    // Công việc
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },

    position: { type: String }, 

    start_date: { type: Date },
    end_date: { type: Date },

    contract_type: {
      type: String,
      enum: ["fulltime", "parttime", "probation"],
      default: "fulltime",
    },

    // Lương
    salary_base: { type: Number },
    salary_allowance: { type: Number },
    bank_name: { type: String },
    bank_account: { type: String },

    // Hồ sơ
    avatar_url: { type: String , default: "" },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],

    // Ghi chú
    note: { type: String },
  },
  { timestamps: true }
);


export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
