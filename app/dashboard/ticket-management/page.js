"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { Ticket, Edit2, Save, X } from "lucide-react";

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
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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

  const fetchTicketData = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/tickets`);
      const data = await res.json();

      if (data.success) {
        setTicketData(data.data);
      }
    } catch (err) {
      console.error("Error fetching ticket data:", err);
    }
  };

  const handleOpenModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    fetchTicketData(booking._id);
  };

  const handleUpdateQuantity = async (ticketId, newQuantity) => {
    if (!newQuantity || newQuantity < 0) {
      alert("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    try {
      setUpdatingId(ticketId);
      const res = await fetch(
        `/api/bookings/${selectedBooking._id}/tickets`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId,
            newQuantity: parseInt(newQuantity),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // Update local state
        setTicketData({
          ...ticketData,
          tickets: ticketData.tickets.map((t) =>
            t._id === ticketId ? { ...t, quantity: newQuantity } : t
          ),
        });

        // Update bookings list
        setBookings(
          bookings.map((b) =>
            b._id === selectedBooking._id
              ? {
                  ...b,
                  tickets: b.tickets.map((t) =>
                    t._id === ticketId ? { ...t, quantity: newQuantity } : t
                  ),
                }
              : b
          )
        );

        setEditingTicketId(null);
        setEditingQuantity("");
        alert("✅ Cập nhật số lượng vé thành công!");
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
      alert("❌ Lỗi cập nhật vé");
    } finally {
      setUpdatingId(null);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">🎫 Quản Lý Bán Vé Sự Kiện</h1>
        <p className="text-gray-600">
          Quản lý số lượng và bán vé cho các sự kiện đại chúng
        </p>
      </div>

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
                    Quản lý vé
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Ticket Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              🎫 Quản lý vé - {ticketData?.customer_name}
            </DialogTitle>
          </DialogHeader>

          {ticketData && (
            <div className="space-y-4">
              {/* Event Info */}
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Sự kiện</p>
                      <p className="font-semibold">
                        {ticketData.event_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày diễn ra</p>
                      <p className="font-semibold">
                        {formatDate(ticketData.event_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Management */}
              <div className="space-y-3">
                {ticketData.tickets?.map((ticket) => (
                  <Card key={ticket._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">{ticket.type}</p>
                          <p className="text-sm text-gray-600">
                            Số lượng hiện tại:{" "}
                            <span className="font-bold text-blue-600">
                              {ticket.quantity.toLocaleString()}
                            </span>
                          </p>
                        </div>

                        {editingTicketId === ticket._id ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={editingQuantity}
                              onChange={(e) =>
                                setEditingQuantity(e.target.value)
                              }
                              placeholder="Nhập số lượng"
                              className="w-32"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(
                                  ticket._id,
                                  editingQuantity
                                )
                              }
                              disabled={updatingId === ticket._id}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTicketId(null)}
                              disabled={updatingId === ticket._id}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTicketId(ticket._id);
                              setEditingQuantity(ticket.quantity);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <Card className="bg-green-50">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold">
                    Tổng cộng:{" "}
                    <span className="text-green-600">
                      {ticketData.tickets
                        ?.reduce((sum, t) => sum + t.quantity, 0)
                        .toLocaleString()}{" "}
                      vé
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}