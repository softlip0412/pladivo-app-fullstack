"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function BookingDialog() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [userId, setUserId] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [eventType, setEventType] = useState("");
  const [otherEventType, setOtherEventType] = useState("");
  const [ticketSales, setTicketSales] = useState(false);
  const [tickets, setTickets] = useState({});

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [scale, setScale] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [notes, setNotes] = useState("");

  const ticketTypes = [
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

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const [serviceRes, meRes] = await Promise.all([
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/auth/me").then((r) => r.json()),
        ]);

        if (serviceRes.success) setServices(serviceRes.data);
        if (meRes.success) setUserId(meRes.data._id);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleAddService = (serviceId) => {
    const service = services.find((s) => s._id === serviceId);
    if (!service) return;
    const exists = selectedServices.find((s) => s.service_id === serviceId);
    if (exists) {
      setSelectedServices(
        selectedServices.map((s) =>
          s.service_id === serviceId
            ? { ...s, quantity: s.quantity + 1, subtotal: (s.quantity + 1) * s.minPrice }
            : s
        )
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          service_id: service._id,
          name: service.name,
          price: service.minPrice,
          minPrice: service.minPrice,
          maxPrice: service.maxPrice,
          unit: service.unit,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => s.service_id !== serviceId));
  };

  const handleTicketChange = (type, value) => {
    setTickets((prev) => ({ ...prev, [type]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          event_type: eventType === "Khác" ? otherEventType : eventType,
          customer_name: customerName,
          address,
          phone,
          email,
          scale: Number(scale),
          services: selectedServices.map((s) => ({
            service_id: s.service_id,
          })),
          booking_status: "confirmed",
          payment_status: "pending",
          notes,
          event_date: eventDate,
          event_time: eventTime,
          region: { province, district, ward },
          custom_location: customLocation,
          tickets: ticketSales ? tickets : [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đặt booking thành công!");
        setOpen(false);
      } else {
        alert(data.error || "Lỗi khi đặt booking");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tạo Booking</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Booking</DialogTitle>
          <DialogDescription>
            Điền thông tin sự kiện và dịch vụ tại đây
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          {/* Event Type */}
          <div>
            <Label>Chọn loại sự kiện</Label>
            <Select onValueChange={(val) => setEventType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tiệc cưới">Tiệc cưới</SelectItem>
                <SelectItem value="Hội nghị">Hội nghị</SelectItem>
                <SelectItem value="Sinh nhật">Sinh nhật</SelectItem>
                <SelectItem value="Sự kiện công ty">Sự kiện công ty</SelectItem>
                <SelectItem value="Sự kiện đại chúng">Sự kiện đại chúng</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {eventType === "Khác" && (
            <div>
              <Label>Nhập loại sự kiện</Label>
              <Input value={otherEventType} onChange={(e) => setOtherEventType(e.target.value)} />
            </div>
          )}

          {eventType === "Sự kiện đại chúng" && (
            <div>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={ticketSales}
                  onCheckedChange={(checked) => setTicketSales(checked)}
                />
                <span>Có bán vé không?</span>
              </Label>
              {ticketSales && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                  {ticketTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        checked={tickets[type] > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) handleTicketChange(type, 0);
                          else handleTicketChange(type, 1);
                        }}
                      />
                      <span className="flex-1">{type}</span>
                      {tickets[type] > 0 && (
                        <Input
                          type="number"
                          min={1}
                          value={tickets[type]}
                          onChange={(e) => handleTicketChange(type, e.target.value)}
                          className="w-20"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Tên khách hàng" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Input placeholder="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Số lượng khách" value={scale} onChange={(e) => setScale(e.target.value)} />
            <Input type="date" placeholder="Ngày sự kiện" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="time" placeholder="Giờ sự kiện" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Tỉnh/Thành" value={province} onChange={(e) => setProvince(e.target.value)} />
              <Input placeholder="Quận/Huyện" value={district} onChange={(e) => setDistrict(e.target.value)} />
              <Input placeholder="Phường/Xã" value={ward} onChange={(e) => setWard(e.target.value)} />
            </div>
          </div>
          <Input placeholder="Địa điểm tùy chỉnh" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} />

          {/* Select Services */}
          <div>
            <Label>Chọn dịch vụ</Label>
            <Select onValueChange={(val) => handleAddService(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {services.map((sv) => (
                  <SelectItem key={sv._id} value={sv._id}>
                    {sv.name} - {sv.minPrice} ~ {sv.maxPrice} / {sv.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedServices.map((s) => (
                <div key={s.service_id} className="p-2 flex justify-between items-center bg-gray-50 border rounded">
                  <span>
                    {s.name} x {s.quantity} ({s.minPrice} ~ {s.maxPrice} / {s.unit})
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveService(s.service_id)}>
                    ✖
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Textarea placeholder="Ghi chú" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white">
            Đặt Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
