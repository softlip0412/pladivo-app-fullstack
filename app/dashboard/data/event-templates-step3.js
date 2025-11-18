export const EVENT_TEMPLATES_STEP3 = {
  wedding: {
    theme: "Romantic Garden",
    mainColor: "Trắng – Hồng pastel – Xanh lá nhạt",
    style: "Lãng mạn, tự nhiên, châu Âu",
    message: "Mãi bên nhau, trọn đời yêu thương",
    decoration: "Hoa tươi, đèn fairy light, bàn gallery, backdrop cổng hoa",
    program: [
      { time: "17:00", content: "Đón khách – nhạc nền acoustic" },
      { time: "18:00", content: "Chiếu video pre-wedding – mở màn" },
      { time: "18:10", content: "Cô dâu & chú rể bước vào lễ đường" },
      { time: "18:20", content: "Phát biểu – rót rượu – cắt bánh" },
      { time: "19:00", content: "Dùng tiệc, minigame, chụp ảnh" },
      { time: "21:00", content: "Cảm ơn khách & kết thúc" },
    ],
    activities: [
      { activity: "Trình chiếu video tình yêu", importance: "Cao" },
      { activity: "Tiết mục mở màn múa ánh sáng", importance: "Cao" },
      { activity: "MC giao lưu + minigame", importance: "Trung bình" },
      { activity: "Chụp ảnh photobooth", importance: "Trung bình" },
    ],
  },

  conference: {
    theme: "Together We Grow",
    mainColor: "Xanh navy – Bạc – Trắng",
    style: "Trang trọng, hiện đại",
    message: "Kết nối – Hợp tác – Phát triển bền vững",
    decoration: "Backdrop LED, logo, bàn tiếp đón",
    program: [
      { time: "07:30", content: "Check-in & đón khách" },
      { time: "08:00", content: "Khai mạc – phát biểu" },
      { time: "08:30", content: "Diễn giả chủ đề 1" },
      { time: "09:15", content: "Diễn giả chủ đề 2" },
      { time: "10:00", content: "Tea break – networking" },
      { time: "10:30", content: "Thảo luận nhóm / hỏi đáp" },
      { time: "11:30", content: "Tổng kết – chụp ảnh" },
    ],
    activities: [
      { activity: "Phát biểu của CEO", importance: "Cao" },
      { activity: "Giới thiệu sản phẩm mới", importance: "Cao" },
      { activity: "Panel discussion", importance: "Trung bình" },
      { activity: "Networking", importance: "Trung bình" },
    ],
  },

  birthday: {
    theme: "Sweet Memories",
    mainColor: "Hồng pastel – Trắng – Kem",
    style: "Ấm cúng, vui vẻ",
    message: "Cảm ơn vì đã đến bên nhau",
    decoration: "Bong bóng, hoa, photobooth",
    program: [
      { time: "17:30", content: "Đón khách, nhạc chill" },
      { time: "18:00", content: "Cắt bánh – thổi nến" },
      { time: "18:15", content: "Chụp ảnh – trò chuyện" },
      { time: "18:45", content: "Dùng tiệc" },
      { time: "19:30", content: "Minigame vui nhộn" },
      { time: "21:00", content: "Kết thúc" },
    ],
    activities: [
      { activity: "Cắt bánh – thổi nến", importance: "Cao" },
      { activity: "Minigame", importance: "Trung bình" },
      { activity: "Chụp ảnh photobooth", importance: "Trung bình" },
    ],
  },

  company: {
    theme: "Shine Together",
    mainColor: "Vàng kim – Xanh đậm – Trắng",
    style: "Sang trọng, hiện đại",
    message: "Tỏa sáng cùng nhau – Thành công rực rỡ",
    decoration: "Sân khấu LED, logo công ty",
    program: [
      { time: "17:30", content: "Check-in" },
      { time: "18:30", content: "Tiết mục mở màn" },
      { time: "18:45", content: "Phát biểu BGĐ" },
      { time: "19:00", content: "Dùng tiệc – giao lưu" },
      { time: "20:00", content: "Trao giải thưởng" },
      { time: "21:00", content: "Lucky draw – kết thúc" },
    ],
    activities: [
      { activity: "Vinh danh nhân viên", importance: "Cao" },
      { activity: "Tiết mục nội bộ", importance: "Trung bình" },
      { activity: "Lucky draw", importance: "Cao" },
    ],
  },

  public: {
    theme: "Summer Vibes 2025",
    mainColor: "Cam – Vàng – Xanh biển",
    style: "Năng động, trẻ trung",
    message: "Feel the Beat – Live the Moment",
    decoration: "Sân khấu lớn, ánh sáng, check-in rực rỡ",
    program: [
      { time: "16:00", content: "Warm-up DJ" },
      { time: "17:00", content: "Dance show mở màn" },
      { time: "18:00", content: "Nghệ sĩ biểu diễn" },
      { time: "19:30", content: "Minigame tương tác" },
      { time: "20:00", content: "Headliner" },
      { time: "21:30", content: "Pháo sáng – outro" },
    ],
    activities: [
      { activity: "DJ Warm-up", importance: "Cao" },
      { activity: "Biểu diễn nghệ sĩ", importance: "Cao" },
      { activity: "Check-in / giveaway", importance: "Trung bình" },
    ],
  },
};
