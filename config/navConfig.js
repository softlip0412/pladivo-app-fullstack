import {
  Home,
  UserCircle,
  UserCog,
  Settings2,
  ClipboardList,
  CalendarRange,
  Stamp,
  Handshake,
  FileSignature,
  BadgeCheck,
  Ticket,
  TicketCheck,
  ChartBar,
  StickyNote,
  ClipboardCheck,
  FileText,
  DollarSign,
  Wallet,
  TrendingUp,
  Clock,
  MessageSquare,
} from "lucide-react";

// Danh sách tất cả menu items
export const ALL_MENU_ITEMS = [
  {
    id: "home",
    path: "/dashboard",
    icon: Home,
    label: "Trang chủ",
  },
  {
    id: "blogs",
    path: "/dashboard/blogs",
    icon: StickyNote,
    label: "Blogs",
  },
  {
    id: "users",
    path: "/dashboard/users",
    icon: UserCircle,
    label: "Người dùng",
  },
  {
    id: "staffs",
    path: "/dashboard/staffs",
    icon: UserCog,
    label: "Nhân sự",
  },
  {
    id: "services",
    path: "/dashboard/services",
    icon: Settings2,
    label: "Dịch vụ",
  },
  {
    id: "bookings",
    path: "/dashboard/bookings",
    icon: ClipboardList,
    label: "Đơn đặt",
  },
  {
    id: "event-plans",
    path: "/dashboard/event-plans",
    icon: CalendarRange,
    label: "Kế hoạch",
  },
  {
    id: "event-plan-details",
    path: "/dashboard/event-plan-details",
    icon: ClipboardCheck,
    label: "Kế hoạch chi tiết",
  },
  {
    id: "event-approvals",
    path: "/dashboard/event-approvals",
    icon: Stamp,
    label: "Phê duyệt Kế hoạch",
  },
  {
    id: "customers",
    path: "/dashboard/customers",
    icon: FileSignature,
    label: "Khách Hàng & Hợp Đồng",
  },
  {
    id: "partners",
    path: "/dashboard/partners",
    icon: Handshake,
    label: "Đối tác",
  },
  {
    id: "partner-contract",
    path: "/dashboard/partner-contract",
    icon: FileText,
    label: "Hợp đồng đối tác",
  },
  {
    id: "timeline",
    path: "/dashboard/timeline",
    icon: Clock,
    label: "Timeline công việc",
  },
  {
    id: "feedback",
    path: "/dashboard/feedback",
    icon: MessageSquare,
    label: "Phản hồi khách hàng",
  },
  {
    id: "task-evaluation",
    path: "/dashboard/task-evaluation",
    icon: BadgeCheck,
    label: "Đánh giá công việc",
  },
  {
    id: "ticket-management",
    path: "/dashboard/ticket-management",
    icon: Ticket,
    label: "Quản lý bán vé",
  },
  {
    id: "ticket-sales",
    path: "/dashboard/ticket-sales",
    icon: TicketCheck,
    label: "Bán vé",
  },
  {
    id: "ticket-reports",
    path: "/dashboard/ticket-reports",
    icon: ChartBar,
    label: "Thống kê bán vé",
  },
  {
    id: "payroll",
    path: "/dashboard/payroll",
    icon: DollarSign,
    label: "Tính lương",
  },
  {
    id: "revenue",
    path: "/dashboard/revenue",
    icon: TrendingUp,
    label: "Doanh thu",
  },
  {
    id: "my-salary",
    path: "/dashboard/my-salary",
    icon: Wallet,
    label: "Lương của tôi",
  },
];

// Phân quyền menu theo bộ phận
export const DEPARTMENT_PERMISSIONS = {
  // 1. Admin - Quyền cao nhất (toàn bộ menu)
  Admin: [
    "home",
    "blogs",
    "users",
    "staffs",
    "services",
    "bookings",
    "event-plans",
    "event-plan-details",
    "event-approvals",
    "customers",
    "partners",
    "partner-contract",
    "timeline",
    "feedback",
    "task-evaluation",
    "ticket-management",
    "ticket-sales",
    "ticket-reports",
    "payroll",
    "revenue",
    "my-salary",
  ],

  // 2. Nhân viên Tổ chức sự kiện (Event Team)
  // Làm việc với kế hoạch, tổ chức, sự kiện, khách hàng, hợp đồng
  "Nhân viên Tổ chức sự kiện": [
    "home",
    "staffs",
    "services",
    "bookings",
    "event-plans",
    "event-plan-details",
    "customers",
    "partners",
    "partner-contract",
    "timeline",
    "feedback",
    "task-evaluation",
    "ticket-management",
    "ticket-sales",
    "my-salary",
  ],

  // 3. Nhân viên thực hiện (Production / Execution)
  // Tập trung vào công việc được giao và báo cáo
  "Nhân viên thực hiện": [
    "home",
    "event-plans",
    "event-plan-details",
    "timeline",
    "my-salary",
  ],

  // 4. Nhân viên Quản lý (Team Leader / Manager)
  // Quản lý team, phê duyệt kế hoạch, theo dõi tiến độ
  "Nhân viên Quản lý": [
    "home",
    "blogs",
    "users",
    "staffs",
    "services",
    "bookings",
    "event-plans",
    "event-plan-details",
    "event-approvals",
    "customers",
    "partners",
    "partner-contract",
    "timeline",
    "feedback",
    "task-evaluation",
    "ticket-reports",
    "payroll",
    "revenue",
    "my-salary",
  ],

  // 5. Nhân viên Marketing
  // Tập trung vào content, quảng cáo, truyền thông, bán vé
  "Nhân viên Marketing": [
    "home",
    "blogs",
    "services",
    "bookings",
    "event-plans",
    "event-plan-details",
    "timeline",
    "task-evaluation",
    "ticket-management",
    "ticket-sales",
    "ticket-reports",
    "my-salary",
  ],
};

/**
 * Lấy danh sách menu items được phép dựa trên department
 * @param {string} department - Tên bộ phận
 * @param {string} role - Role của user (admin, staff, etc.)
 * @returns {Array} - Danh sách menu items được phép hiển thị
 */
export function getMenuItemsByDepartment(department, role) {
  // Nếu là admin hoặc system_admin → toàn quyền
  if (role === "admin" || role === "system_admin") {
    return ALL_MENU_ITEMS;
  }

  // Nếu không có department → chỉ hiển thị trang chủ
  if (!department) {
    return ALL_MENU_ITEMS.filter((item) => item.id === "home");
  }

  // Lấy danh sách menu IDs được phép cho department này
  const allowedMenuIds = DEPARTMENT_PERMISSIONS[department] || ["home"];

  // Filter menu items
  return ALL_MENU_ITEMS.filter((item) => allowedMenuIds.includes(item.id));
}
