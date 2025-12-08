"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [servicesList, setServicesList] = useState([]);
  const [partners, setPartners] = useState([]);

  const [eventType, setEventType] = useState("");
  const [customEventType, setCustomEventType] = useState("");

  const [hasTicketSale, setHasTicketSale] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);

  const [dayBookingsList, setDayBookingsList] = useState([]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const ticketOptions = [
    "Vé Standard (Phổ thông)",
    "Vé VIP (Ưu tiên)",
    "Vé VVIP / Platinum",
    "Vé Early Bird (Mua sớm)",
    "Vé Group / Doanh nghiệp",
    "Vé Workshop / Hội thảo chuyên đề",
    "Vé Festival / Lễ hội âm nhạc",
    "Vé Premium Booth Access (Triển lãm)",
    "Vé Online / Livestream",
    "Vé Press / Media / Sponsor",
  ];

  const [newBooking, setNewBooking] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    scale: 1,
    event_date: "",
    event_time: "",
    event_end_time: "",
    city: "",
    district: "",
    ward: "",
    custom_location: "",
    services: [{ service_id: "", quantity: 1, price: 0, subtotal: 0 }],
    total_amount: 0,
    notes: "",
  });

  // 🔹 Lấy danh sách booking
  useEffect(() => {
    fetchBookings();
  }, [selectedMonth, selectedYear]);

  async function fetchBookings() {
    try {
      const res = await fetch(
        `/api/bookings?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
      else setBookings([]);
    } catch {
      setBookings([]);
    }
  }

  // 🔹 Lấy danh sách dịch vụ
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServicesList(data.data);
      });

    fetch("/api/partners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPartners(data.data);
      });
  }, []);

  const groupedBookings = bookings.reduce((acc, b) => {
    if (!b?.event_date) return acc;
    const day = new Date(b.event_date).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(b);
    return acc;
  }, {});

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ✅ Gửi booking — có Authorization header
  async function handleAddBooking(e) {
    e.preventDefault();

    if (!newBooking.event_date)
      return toast.error("Vui lòng chọn ngày tổ chức!");
    if (!eventType) return toast.error("Vui lòng chọn loại sự kiện!");

    const payload = {
      customer_name: newBooking.customer_name,
      phone: newBooking.phone,
      email: newBooking.email,
      address: newBooking.address,
      scale: newBooking.scale,
      event_date: newBooking.event_date,
      event_time: newBooking.event_time,
      event_end_time: newBooking.event_end_time,
      event_type: eventType === "Khác" ? customEventType : eventType,
      ticket_sale: hasTicketSale,
      tickets: ticketTypes,
      region: {
        province: newBooking.city,
        district: newBooking.district,
        ward: newBooking.ward,
      },
      custom_location: newBooking.custom_location,
      services: newBooking.services.filter((s) => s.service_id),
      notes: newBooking.notes,
    };

    try {
      // 🔹 Ưu tiên accessToken, fallback token (phòng khi login lưu khác key)
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        toast.error("Không tìm thấy token — vui lòng đăng nhập lại!");
        return;
      }

      console.log("📦 Sending booking with token:", token.slice(0, 30) + "...");

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Chuẩn Bearer token
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Thêm booking thành công!");
        setShowAddModal(false);
        resetForm();
        fetchBookings();
      } else {
        toast.error(data.message || "Thêm booking thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi thêm booking!");
    }
  }

  function resetForm() {
    setNewBooking({
      customer_name: "",
      phone: "",
      email: "",
      address: "",
      scale: 1,
      event_date: "",
      event_time: "",
      event_end_time: "",
      city: "",
      district: "",
      ward: "",
      custom_location: "",
      services: [{ service_id: "", quantity: 1 }],
      notes: "",
    });
    setEventType("");
    setCustomEventType("");
    setHasTicketSale(false);
    setTicketTypes([]);
  }

  async function handleUpdateStatus(id, status) {
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(
        `Đơn đã ${status === "confirmed" ? "chấp nhận" : "từ chối"}!`
      );
      fetchBookings();
    } else toast.error("Cập nhật thất bại!");
  }

  function handleServiceChange(index, field, value) {
    setNewBooking((prev) => {
      const updated = [...prev.services];
      updated[index][field] = field === "quantity" ? Number(value) : value;
      return { ...prev, services: updated };
    });
  }

  function addServiceRow() {
    setNewBooking((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { service_id: "", quantity: 1, price: 0, subtotal: 0 },
      ],
    }));
  }

  function removeServiceRow(index) {
    setNewBooking((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }

  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  async function handleDeleteBooking(id) {
    if (!confirm("Bạn chắc chắn muốn xóa đơn này?")) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa đơn!");
        fetchBookings();
        setShowModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Lỗi khi xóa đơn!");
    }
  }
  function handleViewBooking(bk) {
    setSelectedBooking(bk);
    setShowViewModal(true);
  }
  function handleEditBooking(bk) {
    setNewBooking({
      _id: bk._id,
      customer_name: bk.customer_name,
      phone: bk.phone,
      email: bk.email,
      address: bk.address,
      scale: bk.scale,
      event_date: bk.event_date?.slice(0, 10),
      event_time: bk.event_time,
      event_end_time: bk.event_end_time || "",
      city: bk.region?.province || "",
      district: bk.region?.district || "",
      ward: bk.region?.ward || "",
      custom_location: bk.custom_location || "",
      notes: bk.notes || "",
      services: bk.services || [],
    });
    setEventType(bk.event_type);
    setShowModal(false);
    setShowAddModal(true);
    setIsEditing(true);
  }

  async function handleUpdateBooking(e) {
    e.preventDefault();

    const id = newBooking._id;
    if (!id) return toast.error("Không tìm thấy ID Booking!");

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    const res = await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newBooking),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Cập nhật thành công!");
      setShowAddModal(false);
      fetchBookings();
    } else {
      toast.error(data.message);
    }
  }

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <PageHeader
        title="📅 Quản lý Booking"
        description="Quản lý và theo dõi các đơn đặt sự kiện"
      >
        <Button onClick={() => setShowAddModal(true)} variant="glass" size="lg">
          ➕ Thêm Booking
        </Button>
      </PageHeader>

      {/* Bộ chọn tháng/năm */}
      <div className="flex gap-4">
        <Select
          value={selectedMonth.toString()}
          onValueChange={(v) => setSelectedMonth(Number(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tháng" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                Tháng {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                Năm {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lưới lịch */}
      <div className="grid grid-cols-7 text-center font-semibold mt-4 text-sm text-muted-foreground">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysArray.map((day) => {
          const dayBookings = groupedBookings[day];
          const pendingCount = dayBookings?.filter(
            (b) => b.booking_status === "pending"
          ).length;
          const hasConfirmed = dayBookings?.some(
            (b) => b.booking_status === "confirmed"
          );

          return (
            <Card
              key={day}
              className={cn(
                "h-24 p-2 cursor-pointer flex flex-col justify-between border-2 transition-all duration-300 relative overflow-hidden",
                !dayBookings && "hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200",
                dayBookings && !hasConfirmed && "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg hover:-translate-y-1",
                hasConfirmed && "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg hover:-translate-y-1"
              )}
              onClick={() => {
                if (dayBookings) {
                  setSelectedDate(day);
                  setDayBookingsList(dayBookings);
                  setShowModal(true);
                }
              }}
            >
              <div className="flex justify-between items-start">
                 {/* 🔴 Badge số lượng đơn mới */}
                {pendingCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] text-white font-bold shadow-lg animate-pulse-glow">
                    {pendingCount}
                  </span>
                )}
                <div className="text-right text-xs text-muted-foreground ml-auto">
                  {day}
                </div>
              </div>
              
              {dayBookings && (
                <Badge 
                  variant={hasConfirmed ? "success" : "warning"}
                  className="self-start shadow-sm"
                >
                  {dayBookings.length} đơn
                </Badge>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dialog thêm booking */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "✏️ Chỉnh sửa Booking" : "➕ Thêm Booking"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto pr-2 max-h-[70vh]">
            <form
              onSubmit={isEditing ? handleUpdateBooking : handleAddBooking}
              className="space-y-4 mt-2"
            >
              {/* 🟩 Loại sự kiện */}
              <div>
                <Label>Loại sự kiện</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sự kiện" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hội nghị">Hội nghị</SelectItem>
                    <SelectItem value="Sự kiện công ty">
                      Sự kiện công ty
                    </SelectItem>
                    <SelectItem value="Sự kiện đại chúng">
                      Sự kiện đại chúng
                    </SelectItem>
                    {eventType === "Sự kiện đại chúng" && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasTicketSale}
                          onChange={(e) => setHasTicketSale(e.target.checked)}
                        />
                        <Label>Có bán vé?</Label>
                      </div>
                    )}

                    {eventType === "Sự kiện đại chúng" && hasTicketSale && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ticketOptions.map((t) => {
                          const exists = ticketTypes.find((x) => x.type === t);

                          return (
                            <div
                              key={t}
                              className="border p-2 rounded-md bg-white flex flex-col gap-2"
                            >
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={!!exists}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTicketTypes([
                                        ...ticketTypes,
                                        { type: t, quantity: 0 },
                                      ]);
                                    } else {
                                      setTicketTypes(
                                        ticketTypes.filter((x) => x.type !== t)
                                      );
                                    }
                                  }}
                                />
                                {t}
                              </label>

                              {/* Hiện phần số lượng nếu đã chọn vé */}
                              {exists && (
                                <div className="ml-6">
                                  <Label>Số lượng vé</Label>
                                  <input
                                    type="number"
                                    min={0}
                                    className="mt-1 border rounded p-1 w-full"
                                    value={exists.quantity}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      setTicketTypes((prev) =>
                                        prev.map((item) =>
                                          item.type === t
                                            ? { ...item, quantity: value }
                                            : item
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 🟩 Thông tin khách */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Họ tên</Label>
                  <Input
                    value={newBooking.customer_name}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        customer_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Địa chỉ</Label>
                  <Input
                    value={newBooking.address}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Điện thoại</Label>
                  <Input
                    type="tel"
                    value={newBooking.phone}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newBooking.email}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Ngày tổ chức</Label>
                  <Input
                    type="date"
                    value={newBooking.event_date}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        event_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Giờ bắt đầu</Label>
                  <Input
                    type="time"
                    value={newBooking.event_time}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        event_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Giờ kết thúc</Label>
                  <Input
                    type="time"
                    value={newBooking.event_end_time}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        event_end_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Quy mô</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newBooking.scale}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        scale: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* 🟩 Chọn đối tác (Nhà hàng / Khách sạn) */}
              <div>
                <Label>Chọn Nhà hàng / Khách sạn</Label>
                <Select
                  value={newBooking.custom_location}
                  onValueChange={(val) => {
                    const partner = partners.find((p) => p.company_name === val);
                    if (partner) {
                      setNewBooking({
                        ...newBooking,
                        custom_location: partner.company_name,
                        address: partner.address, // Auto-fill address
                        city: partner.region || "", // Assuming region stores city/province for now or we map it
                        // If region is just a string, we might need to parse it or just store it.
                        // The previous code had city/district/ward.
                        // If partner.region is a string like "Hà Nội", we can put it in city.
                      });
                    } else {
                       setNewBooking({
                        ...newBooking,
                        custom_location: val,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm tổ chức..." />
                  </SelectTrigger>
                  <SelectContent>
                    {partners
                      .filter(
                        (p) =>
                          p.partner_type?.toLowerCase().includes("nhà hàng") ||
                          p.partner_type?.toLowerCase().includes("khách sạn")
                      )
                      .map((p) => (
                        <SelectItem key={p._id} value={p.company_name}>
                          {p.company_name} ({p.partner_type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 🟩 Dịch vụ */}
              <div className="space-y-2">
                <Label>Dịch vụ</Label>
                {newBooking.services.map((svc, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-2 items-center border p-2 rounded-lg bg-muted/30"
                  >
                    <Select
                      value={svc.service_id}
                      onValueChange={(val) =>
                        handleServiceChange(idx, "service_id", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesList.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={svc.quantity}
                      onChange={(e) =>
                        handleServiceChange(idx, "quantity", e.target.value)
                      }
                    />
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const s = servicesList.find(
                          (x) => x._id === svc.service_id
                        );
                        if (!s) return "—";

                        return `${s.minPrice?.toLocaleString()} – ${s.maxPrice?.toLocaleString()}  ${
                          s.unit
                        }`;
                      })()}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeServiceRow(idx)}
                    >
                      ❌
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceRow}
                >
                  ➕ Thêm dịch vụ
                </Button>
              </div>

              <div>
                <Label>Ghi chú</Label>
                <Input
                  value={newBooking.notes}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, notes: e.target.value })
                  }
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">
                  Lưu Booking
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Danh sách đơn ngày {selectedDate}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {dayBookingsList.map((bk) => (
              <div 
                key={bk._id} 
                className={cn(
                  "border p-3 rounded-lg",
                  bk.booking_status === "confirmed" ? "bg-green-50 border-green-200" : 
                  bk.booking_status === "cancelled" ? "bg-red-50 border-red-200" :
                  "bg-muted/40"
                )}
              >
                <div className="flex justify-between">
                  <div className="font-semibold">
                    {bk.customer_name} — {bk.phone}
                  </div>
                  <Badge variant={bk.booking_status === "confirmed" ? "success" : "outline"}>
                    {bk.booking_status === "confirmed" ? "Đã duyệt" : 
                     bk.booking_status === "cancelled" ? "Đã hủy" : "Chờ duyệt"}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">
                  Loại sự kiện: {bk.event_type}
                </div>
                <div className="text-sm text-gray-600">
                  Địa điểm: {bk.address}
                </div>

                <div className="flex gap-2 mt-2">
                  {/* ✅ Xem chi tiết */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewBooking(bk)}
                  >
                    👁 Xem
                  </Button>

                  {/* ✅ Sửa */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBooking(bk)}
                  >
                    ✏️ Sửa
                  </Button>
                </div>
              </div>
            ))}

            {dayBookingsList.length === 0 && (
              <p className="text-center text-gray-500">Không có đơn nào!</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📄 Chi tiết Booking</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-lg">Thông tin khách hàng</h3>
                <p>
                  <b>Họ tên:</b> {selectedBooking.customer_name}
                </p>
                <p>
                  <b>Số điện thoại:</b> {selectedBooking.phone}
                </p>
                <p>
                  <b>Email:</b> {selectedBooking.email}
                </p>
                <p>
                  <b>Địa chỉ:</b> {selectedBooking.address}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Sự kiện</h3>
                <p>
                  <b>Loại sự kiện:</b> {selectedBooking.event_type}
                </p>
                <p>
                  <b>Ngày tổ chức:</b>{" "}
                  {new Date(selectedBooking.event_date).toLocaleDateString()}
                </p>
                <p>
                  <b>Giờ:</b> {selectedBooking.event_time || "—"}
                </p>
                <p>
                  <b>Quy mô:</b> {selectedBooking.scale}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Khu vực tổ chức</h3>
                <p>
                  <b>Tỉnh:</b> {selectedBooking.region?.province}
                </p>
                <p>
                  <b>Huyện:</b> {selectedBooking.region?.district}
                </p>
                <p>
                  <b>Xã:</b> {selectedBooking.region?.ward}
                </p>
                <p>
                  <b>Địa điểm cụ thể:</b> {selectedBooking.custom_location}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Dịch vụ yêu cầu</h3>
                {selectedBooking.services?.length > 0 ? (
                  selectedBooking.services.map((svc, i) => {
                    const serviceName =
                      servicesList.find((s) => s._id === svc.service_id)
                        ?.name || "Dịch vụ đã xóa";
                    return (
                      <div key={i} className="border p-2 rounded mt-1">
                        <p>
                          <b>Dịch vụ:</b> {serviceName}
                        </p>
                        <p>
                          <b>Số lượng:</b> {svc.quantity}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p>Không có dịch vụ</p>
                )}
              </div>

              {selectedBooking.ticket_sale && (
                <div>
                  <h3 className="font-semibold text-lg">Vé bán</h3>
                  {selectedBooking.tickets?.map((t) => (
                    <p key={t.type}>
                      ✅ {t.type}: <b>{t.quantity}</b> vé
                    </p>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg">Ghi chú</h3>
                <p>{selectedBooking.notes || "Không có"}</p>
              </div>

              <DialogFooter className="flex justify-between gap-3 mt-4">
                <Button
                  className="bg-green-600 text-white flex-1"
                  onClick={() =>
                    handleUpdateStatus(selectedBooking._id, "confirmed")
                  }
                >
                  ✅ Chấp nhận
                </Button>

                <Button
                  className="bg-red-600 text-white flex-1"
                  onClick={() =>
                    handleUpdateStatus(selectedBooking._id, "cancelled")
                  }
                >
                  ❌ Từ chối
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
