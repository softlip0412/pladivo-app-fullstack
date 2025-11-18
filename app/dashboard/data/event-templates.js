export const EVENT_TEMPLATES = {
  wedding: {
    budget: [
      { category: "Đặt sảnh tiệc", description: "Bao gồm trang trí cơ bản", unit: "gói", quantity: 1, cost: 60000000, note: "" },
      { category: "Trang trí & concept", description: "Hoa tươi, backdrop, bàn gallery, cổng hoa", unit: "gói", quantity: 1, cost: 25000000, note: "Concept “Romantic Garden”" },
      { category: "Trang phục cô dâu/chú rể", description: "Váy cưới + vest", unit: "bộ", quantity: 2, cost: 15000000, note: "Thuê" },
      { category: "Trang điểm & chụp ảnh", description: "Makeup, quay video, chụp hình cưới", unit: "gói", quantity: 1, cost: 20000000, note: "Có video pre-wedding" },
      { category: "Âm thanh – ánh sáng", description: "Dàn nhạc sống, MC, kỹ thuật viên", unit: "gói", quantity: 1, cost: 18000000, note: "" },
      { category: "Thực đơn tiệc", description: "1,000,000đ/suất x 250 khách", unit: "suất", quantity: 250, cost: 1000000, note: "Đã bao gồm đồ uống" },
      { category: "Thiệp mời & quà tặng", description: "In thiệp + quà nhỏ cho khách", unit: "bộ", quantity: 250, cost: 20000, note: "" },
    ],

    prepTimeline: [
      { time: "6 tháng trước", task: "Chọn ngày cưới, đặt địa điểm tổ chức", manager: "Cô dâu & chú rể" },
      { time: "5 tháng trước", task: "Chụp ảnh cưới, chọn concept trang trí", manager: "Cô dâu, wedding planner" },
      { time: "4 tháng trước", task: "Đặt váy cưới, vest, lên danh sách khách mời", manager: "Cặp đôi" },
      { time: "3 tháng trước", task: "Gửi thiệp mời sơ bộ, chọn MC, ban nhạc", manager: "Wedding planner" },
      { time: "2 tháng trước", task: "Chốt thực đơn, âm thanh – ánh sáng", manager: "Planner + nhà hàng" },
      { time: "1 tháng trước", task: "Gửi thiệp chính thức, kiểm tra trang phục", manager: "Cô dâu & chú rể" },
      { time: "2 tuần trước", task: "Tổng duyệt kịch bản, họp đội ngũ tổ chức", manager: "Planner" },
      { time: "1 ngày trước", task: "Setup sảnh, kiểm tra thiết bị, đón khách VIP", manager: "Kỹ thuật & lễ tân" },
      { time: "Ngày cưới", task: "Điều phối toàn bộ sự kiện", manager: "Trưởng nhóm wedding team" },
      { time: "1 ngày sau", task: "Hậu kiểm & thanh toán hợp đồng", manager: "Planner + cặp đôi" },
    ],

    staffAssign: [
      { department: "Wedding Planner", duty: "Lên kế hoạch tổng thể, điều phối", manager: "Công ty 'Sweet Day'", note: "Liên hệ chính" },
      { department: "MC & Ban nhạc", duty: "Dẫn chương trình, biểu diễn", manager: "Anh Minh MC / Moonlight Band", note: "" },
      { department: "Kỹ thuật", duty: "Âm thanh, ánh sáng, màn hình LED", manager: "Anh Hưng", note: "Kiểm tra trước 2h" },
      { department: "Trang trí & hoa", duty: "Thi công backdrop, bàn gallery", manager: "Team Decor", note: "Setup sáng sớm" },
      { department: "Lễ tân", duty: "Đón khách, check danh sách, hướng dẫn chỗ ngồi", manager: "4 người", note: "Mặc đồng phục" },
      { department: "An ninh & giữ xe", duty: "Giữ xe, đảm bảo trật tự", manager: "Dịch vụ ngoài", note: "" },
      { department: "Nhiếp ảnh & quay phim", duty: "Ghi hình toàn bộ chương trình", manager: "Studio LoveFilm", note: "" },
    ],

    eventTimeline: [
      { time: "14:00", activity: "Setup âm thanh, ánh sáng, hoa tươi", manager: "Kỹ thuật + Decor" },
      { time: "16:00", activity: "Makeup – chụp ảnh trước sảnh", manager: "Makeup team" },
      { time: "17:00", activity: "Đón khách, phát quà lưu niệm", manager: "Lễ tân" },
      { time: "18:00", activity: "Khai mạc, chiếu video pre-wedding", manager: "MC" },
      { time: "18:15", activity: "Cô dâu – chú rể bước vào lễ đường", manager: "Ban nhạc & ánh sáng" },
      { time: "18:30", activity: "Phát biểu – rót rượu – cắt bánh", manager: "MC + Planner" },
      { time: "19:00", activity: "Dùng tiệc, giao lưu văn nghệ", manager: "Ban nhạc" },
      { time: "21:00", activity: "Cảm ơn & kết thúc chương trình", manager: "MC" },
      { time: "21:30", activity: "Dọn dẹp, thu hồi thiết bị", manager: "Kỹ thuật & Decor" },
    ],
  },

  conference: {
    budget: [
      { category: "Thuê hội trường + set up", description: "", unit: "", quantity: 1, cost: 80000000, note: "Bao gồm âm thanh, ánh sáng" },
      { category: "Thiết kế backdrop, standee", description: "", unit: "", quantity: 1, cost: 15000000, note: "" },
      { category: "Truyền thông – thiết kế ấn phẩm", description: "Banner, thư mời", unit: "", quantity: 1, cost: 10000000, note: "" },
      { category: "MC & phiên dịch", description: "", unit: "", quantity: 1, cost: 8000000, note: "Song ngữ Việt – Anh" },
      { category: "Tea-break & ăn trưa", description: "300 khách", unit: "", quantity: 1, cost: 60000000, note: "" },
      { category: "Quà tặng khách mời", description: "", unit: "", quantity: 1, cost: 20000000, note: "" },
      { category: "Quay phim – chụp ảnh", description: "", unit: "", quantity: 1, cost: 12000000, note: "" },
    ],

    prepTimeline: [
      { time: "1 tháng trước", task: "Đặt địa điểm, xác nhận diễn giả", manager: "Ban tổ chức" },
      { time: "3 tuần trước", task: "Gửi thư mời khách hàng", manager: "PR team" },
      { time: "2 tuần trước", task: "Thiết kế backdrop, in tài liệu", manager: "Design team" },
      { time: "1 tuần trước", task: "Tổng duyệt chương trình", manager: "All team" },
      { time: "1 ngày trước", task: "Setup hội trường", manager: "Kỹ thuật" },
      { time: "Ngày diễn ra", task: "Điều phối – checkin khách", manager: "Tổ chức" },
    ],

    staffAssign: [
      { department: "MC", duty: "Dẫn chương trình", manager: "Anh Tuấn", note: "" },
      { department: "Kỹ thuật", duty: "Âm thanh – ánh sáng – slide", manager: "Anh Hưng", note: "" },
      { department: "Lễ tân", duty: "Đón khách, phát tài liệu", manager: "PR team", note: "" },
      { department: "Ban tổ chức", duty: "Điều phối chung", manager: "Trưởng phòng Marketing", note: "" },
    ],

    eventTimeline: [
      { time: "07:30", activity: "Đón khách & check-in", manager: "" },
      { time: "08:00", activity: "Khai mạc – phát biểu", manager: "" },
      { time: "09:00", activity: "Giới thiệu sản phẩm mới", manager: "" },
      { time: "10:00", activity: "Tea break", manager: "" },
      { time: "10:30", activity: "Thảo luận & hỏi đáp", manager: "" },
      { time: "11:30", activity: "Kết thúc – chụp ảnh lưu niệm", manager: "" },
    ],
  },

  birthday: {
    budget: [
      { category: "Đặt bàn tiệc", description: "", unit: "", quantity: 1, cost: 10000000, note: "" },
      { category: "Trang trí & bánh kem", description: "", unit: "", quantity: 1, cost: 5000000, note: "" },
      { category: "Quay chụp ảnh", description: "", unit: "", quantity: 1, cost: 3000000, note: "" },
      { category: "MC / DJ", description: "", unit: "", quantity: 1, cost: 2000000, note: "" },
      { category: "Quà lưu niệm & phụ kiện", description: "", unit: "", quantity: 1, cost: 1500000, note: "" },
    ],

    prepTimeline: [
      { time: "2 tuần trước", task: "Chọn địa điểm, đặt bàn", manager: "" },
      { time: "1 tuần trước", task: "Gửi lời mời, chọn concept", manager: "" },
      { time: "3 ngày trước", task: "Mua quà & đồ trang trí", manager: "" },
      { time: "1 ngày trước", task: "Setup không gian", manager: "" },
      { time: "Ngày sinh nhật", task: "Tổ chức & chụp ảnh", manager: "" },
    ],

    staffAssign: [
      { department: "Chủ tiệc", duty: "", manager: "Linh", note: "" },
      { department: "Trang trí", duty: "", manager: "Bạn Lan", note: "" },
      { department: "Quay phim", duty: "", manager: "Anh Hòa", note: "" },
      { department: "MC", duty: "", manager: "Bạn Dũng", note: "" },
    ],

    eventTimeline: [
      { time: "17:30", activity: "Đón khách", manager: "" },
      { time: "18:00", activity: "Cắt bánh – thổi nến", manager: "" },
      { time: "18:30", activity: "Dùng tiệc", manager: "" },
      { time: "19:30", activity: "Trò chơi & chụp ảnh", manager: "" },
      { time: "21:00", activity: "Kết thúc", manager: "" },
    ],
  },

  company_event: {
    budget: [
      { category: "Thuê sảnh + tiệc", cost: 250000000, description: "", unit: "", quantity: 1, note: "" },
      { category: "Âm thanh, ánh sáng, sân khấu", cost: 60000000, description: "", unit: "", quantity: 1, note: "" },
      { category: "MC, ca sĩ, biểu diễn", cost: 50000000, description: "", unit: "", quantity: 1, note: "" },
      { category: "Trang trí concept", cost: 30000000, description: "", unit: "", quantity: 1, note: "" },
      { category: "Quay phim – chụp ảnh", cost: 10000000, description: "", unit: "", quantity: 1, note: "" },
      { category: "Quà tặng, lucky draw", cost: 25000000, description: "", unit: "", quantity: 1, note: "" },
    ],

    prepTimeline: [
      { time: "2 tháng trước", task: "Lên ý tưởng & đặt địa điểm", manager: "HR Team" },
      { time: "1 tháng trước", task: "Tuyển chọn tiết mục nội bộ", manager: "HR & Văn nghệ" },
      { time: "2 tuần trước", task: "Chốt kịch bản & tổng duyệt", manager: "MC + Planner" },
      { time: "1 ngày trước", task: "Setup sân khấu", manager: "Kỹ thuật" },
      { time: "Ngày diễn ra", task: "Điều phối chương trình", manager: "Ban tổ chức" },
    ],

    staffAssign: [
      { department: "MC", duty: "Dẫn chương trình", manager: "MC Thanh Tâm", note: "" },
      { department: "Kỹ thuật", duty: "Âm thanh – ánh sáng", manager: "Team AV", note: "" },
      { department: "HR", duty: "Tổng hợp nhân sự", manager: "Chị Hương", note: "" },
      { department: "Truyền thông", duty: "Quay phim – live", manager: "Anh Long", note: "" },
    ],

    eventTimeline: [
      { time: "17:30", activity: "Đón khách – check-in chụp hình", manager: "" },
      { time: "18:30", activity: "Mở màn – phát biểu BGĐ", manager: "" },
      { time: "19:00", activity: "Dùng tiệc", manager: "" },
      { time: "20:00", activity: "Văn nghệ & trao giải", manager: "" },
      { time: "21:00", activity: "Lucky draw", manager: "" },
      { time: "21:30", activity: "Kết thúc & dọn dẹp", manager: "" },
    ],
  },

  public_event: {
    budget: [
      { category: "Thuê địa điểm", quantity: 1, unit: "", description: "", cost: 400000000, note: "" },
      { category: "Âm thanh – ánh sáng – LED", quantity: 1, unit: "", description: "", cost: 600000000, note: "" },
      { category: "Nghệ sĩ biểu diễn", quantity: 1, unit: "", description: "", cost: 500000000, note: "" },
      { category: "An ninh, bảo vệ, y tế", quantity: 1, unit: "", description: "", cost: 100000000, note: "" },
      { category: "Truyền thông – quảng cáo", quantity: 1, unit: "", description: "", cost: 150000000, note: "" },
      { category: "Nhân sự, vé, hậu cần", quantity: 1, unit: "", description: "", cost: 150000000, note: "" },
    ],

    prepTimeline: [
      { time: "3 tháng trước", task: "Xin phép tổ chức, ký hợp đồng nghệ sĩ", manager: "" },
      { time: "2 tháng trước", task: "Thiết kế concept, truyền thông pre-event", manager: "" },
      { time: "1 tháng trước", task: "Mở bán vé, chạy quảng cáo", manager: "" },
      { time: "1 tuần trước", task: "Tổng duyệt & thử âm thanh", manager: "" },
      { time: "Ngày diễn ra", task: "Setup – kiểm soát an ninh", manager: "" },
    ],

    staffAssign: [
      { department: "Ban tổ chức", duty: "Quản lý tổng thể", manager: "Trưởng ban", note: "" },
      { department: "Kỹ thuật", duty: "Setup sân khấu, ánh sáng", manager: "Team AV", note: "" },
      { department: "Nghệ sĩ & quản lý", duty: "Biểu diễn", manager: "Team Artist", note: "" },
      { department: "An ninh & y tế", duty: "Kiểm soát khu vực", manager: "Dịch vụ ngoài", note: "" },
      { department: "Media", duty: "Livestream, quay video", manager: "Team Media", note: "" },
    ],

    eventTimeline: [
      { time: "14:00", activity: "Mở cửa check-in", manager: "" },
      { time: "16:00", activity: "Warm-up DJ", manager: "" },
      { time: "18:00", activity: "Biểu diễn chính", manager: "" },
      { time: "21:00", activity: "Nghệ sĩ chính – phần cao trào", manager: "" },
      { time: "22:00", activity: "Kết thúc, thu dọn", manager: "" },
    ],
  },
};
