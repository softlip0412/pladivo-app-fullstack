"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Ticket, Edit2, Save, X, Calendar, DollarSign, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export default function TicketManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  
  // Config states
  const [configLoading, setConfigLoading] = useState(false);
  const [ticketConfigs, setTicketConfigs] = useState({}); // { ticketType: { price, seating_areas: [{area_name, seat_count}], sale_start_date, sale_end_date } }

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        // Lọc chỉ booking có ticket_sale = true
        const ticketBookings = (data.bookings || []).filter(
          (b) => b.ticket_sale === true
        );
        setBookings(ticketBookings);
        filterBookings(ticketBookings, search, filterStatus);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (list, searchTerm, status) => {
    let filtered = list;

    // Filter by search
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer_name?.toLowerCase().includes(s) ||
          b.event_type?.toLowerCase().includes(s) ||
          b.phone?.includes(s)
      );
    }

    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter((b) => b.booking_status === status);
    }

    setFilteredBookings(filtered);
  };

  const fetchTicketConfig = async (bookingId) => {
    try {
      setConfigLoading(true);
      const res = await fetch(`/api/ticket-sale-config?booking_id=${bookingId}`);
      const data = await res.json();

      if (data.success && data.data) {
        // Populate existing config
        const config = data.data;
        const configs = {};
        config.ticket_types.forEach(t => {
          configs[t.type] = {
            price: t.price || "",
            seating_areas: t.seating_areas || [],
            sale_start_date: t.sale_start_date ? t.sale_start_date.split('T')[0] : "",
            sale_end_date: t.sale_end_date ? t.sale_end_date.split('T')[0] : ""
          };
        });
        setTicketConfigs(configs);
      } else {
        // Reset if no config exists
        setTicketConfigs({});
      }
    } catch (err) {
      console.error("Error fetching ticket config:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleOpenModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    setTicketData(booking); // Use booking data directly for ticket types
    fetchTicketConfig(booking._id);
  };

  const handleTicketConfigChange = (type, field, value) => {
    setTicketConfigs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleAddSeatingArea = (ticketType) => {
    setTicketConfigs(prev => ({
      ...prev,
      [ticketType]: {
        ...prev[ticketType],
        seating_areas: [...(prev[ticketType]?.seating_areas || []), { area_name: "", seat_count: 0 }]
      }
    }));
  };

  const handleRemoveSeatingArea = (ticketType, index) => {
    setTicketConfigs(prev => ({
      ...prev,
      [ticketType]: {
        ...prev[ticketType],
        seating_areas: prev[ticketType].seating_areas.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSeatingAreaChange = (ticketType, index, field, value) => {
    setTicketConfigs(prev => ({
      ...prev,
      [ticketType]: {
        ...prev[ticketType],
        seating_areas: prev[ticketType].seating_areas.map((area, i) => 
          i === index ? { ...area, [field]: value } : area
        )
      }
    }));
  };

  const handleSaveConfig = async () => {
    // Validate all ticket types have required fields
    const ticketTypes = (ticketData?.tickets || []).map(t => {
      const config = ticketConfigs[t.type] || {};
      return {
        type: t.type,
        quantity: t.quantity,
        price: config.price || 0,
        seating_areas: config.seating_areas || [],
        sale_start_date: config.sale_start_date || "",
        sale_end_date: config.sale_end_date || ""
      };
    });

    // Validate each ticket type
    for (const ticket of ticketTypes) {
      if (!ticket.price || ticket.price <= 0) {
        toast.error(`Vui lòng nhập giá vé hợp lệ cho loại vé "${ticket.type}"`);
        return;
      }
      if (!ticket.sale_start_date || !ticket.sale_end_date) {
        toast.error(`Vui lòng nhập thời gian bán vé cho loại vé "${ticket.type}"`);
        return;
      }
      // Validate seating areas
      for (const area of ticket.seating_areas) {
        if (!area.area_name || !area.seat_count || area.seat_count <= 0) {
          toast.error(`Vui lòng nhập đầy đủ thông tin khu vực ghế cho loại vé "${ticket.type}"`);
          return;
        }
      }
    }

    try {
      const res = await fetch("/api/ticket-sale-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: selectedBooking._id,
          ticket_types: ticketTypes
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Lưu cấu hình bán vé thành công!");
        setIsModalOpen(false);
      } else {
        toast.error(data.message || "Lỗi khi lưu cấu hình");
      }
    } catch (err) {
      console.error("Error saving config:", err);
      toast.error("Lỗi hệ thống khi lưu cấu hình");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings(bookings, search, filterStatus);
  }, [search, filterStatus, bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const totalTicketsAvailable = bookings.reduce(
    (sum, b) =>
      sum +
      (b.tickets || []).reduce((ticketSum, t) => ticketSum + t.quantity, 0),
    0
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="🎫 Quản Lý Bán Vé Sự Kiện"
        description="Quản lý số lượng và bán vé cho các sự kiện đại chúng"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {bookings.length}
              </p>
              <p className="text-gray-600 mt-1">Sự kiện bán vé</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {totalTicketsAvailable.toLocaleString()}
              </p>
              <p className="text-gray-600 mt-1">Tổng vé còn lại</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {bookings.filter((b) => b.booking_status === "pending").length}
              </p>
              <p className="text-gray-600 mt-1">Chờ xác nhận</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="🔍 Tìm sự kiện, khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="grid gap-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Không tìm thấy sự kiện nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => {
            const totalTickets = (booking.tickets || []).reduce(
              (sum, t) => sum + t.quantity,
              0
            );

            return (
              <Card key={booking._id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{booking.customer_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.event_type}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.booking_status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {booking.booking_status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Ngày sự kiện</p>
                      <p className="font-semibold">
                        {formatDate(booking.event_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Khách hàng</p>
                      <p className="font-semibold">{booking.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tổng vé</p>
                      <p className="font-semibold text-blue-600">
                        {totalTickets.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Loại vé</p>
                      <p className="font-semibold">
                        {booking.tickets?.length} loại
                      </p>
                    </div>
                  </div>

                  {/* Ticket Types Preview */}
                  <div className="bg-gray-50 p-3 rounded space-y-1">
                    {(booking.tickets || []).map((ticket) => (
                      <div
                        key={ticket._id}
                        className="flex justify-between text-sm"
                      >
                        <span>{ticket.type}</span>
                        <Badge variant="outline">
                          {ticket.quantity.toLocaleString()} vé
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleOpenModal(booking)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Cấu hình bán vé
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Ticket Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              🎫 Cấu hình bán vé - {ticketData?.customer_name}
            </DialogTitle>
          </DialogHeader>

          {ticketData && (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Sự kiện</p>
                    <p className="font-semibold">{ticketData.event_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày diễn ra</p>
                    <p className="font-semibold">
                      {formatDate(ticketData.event_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> Cấu hình từng loại vé
                </h3>
                <div className="space-y-4">
                  {(ticketData.tickets || []).map((ticket) => {
                    const config = ticketConfigs[ticket.type] || {};
                    return (
                      <div key={ticket._id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-lg">{ticket.type}</h4>
                            <p className="text-sm text-gray-600">
                              Số lượng: <Badge variant="secondary">{ticket.quantity.toLocaleString()}</Badge>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Price */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Giá vé (VNĐ)
                            </Label>
                            <Input
                              type="number"
                              placeholder="Nhập giá vé"
                              value={config.price || ""}
                              onChange={(e) => handleTicketConfigChange(ticket.type, 'price', e.target.value)}
                            />
                          </div>

                          {/* Sale Start Date */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Ngày bắt đầu bán
                            </Label>
                            <Input
                              type="date"
                              value={config.sale_start_date || ""}
                              onChange={(e) => handleTicketConfigChange(ticket.type, 'sale_start_date', e.target.value)}
                            />
                          </div>

                          {/* Sale End Date */}
                          <div className="space-y-2 md:col-span-2">
                            <Label className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Ngày kết thúc bán
                            </Label>
                            <Input
                              type="date"
                              value={config.sale_end_date || ""}
                              onChange={(e) => handleTicketConfigChange(ticket.type, 'sale_end_date', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Seating Areas Section */}
                        <div className="space-y-3 border-t pt-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center gap-1 text-base">
                              <MapPin className="w-4 h-4" /> Khu vực ghế ngồi
                            </Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddSeatingArea(ticket.type)}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Thêm khu vực
                            </Button>
                          </div>

                          {(config.seating_areas || []).length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              Chưa có khu vực nào. Click "Thêm khu vực" để thêm.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(config.seating_areas || []).map((area, index) => (
                                <div key={index} className="flex gap-2 items-start bg-white p-3 rounded border">
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Tên khu vực</Label>
                                      <Input
                                        type="text"
                                        placeholder="VD: Khu A, Hàng 1-5"
                                        value={area.area_name || ""}
                                        onChange={(e) => handleSeatingAreaChange(ticket.type, index, 'area_name', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Số ghế</Label>
                                      <Input
                                        type="number"
                                        placeholder="Số ghế"
                                        value={area.seat_count || ""}
                                        onChange={(e) => handleSeatingAreaChange(ticket.type, index, 'seat_count', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-5"
                                    onClick={() => handleRemoveSeatingArea(ticket.type, index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button onClick={handleSaveConfig} disabled={configLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu cấu hình
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}