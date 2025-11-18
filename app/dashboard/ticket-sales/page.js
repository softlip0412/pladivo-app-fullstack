"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { ShoppingCart, Plus, Check, X } from "lucide-react";

export default function TicketSalesPage() {
  const [bookings, setBookings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState("");

  // New Sale Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    booking_id: "",
    ticket_type: "",
    quantity: "",
    unit_price: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    payment_method: "cash",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        const ticketBookings = (data.bookings || []).filter(
          (b) => b.ticket_sale === true
        );
        setBookings(ticketBookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ticket-sales");
      const data = await res.json();
      if (data.success) {
        setSales(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.booking_id || !formData.ticket_type || !formData.quantity) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/ticket-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          unit_price: parseFloat(formData.unit_price),
          total_price:
            parseInt(formData.quantity) * parseFloat(formData.unit_price),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Tạo đơn bán vé thành công!");
        setSales([data.data, ...sales]);
        setIsFormOpen(false);
        setFormData({
          booking_id: "",
          ticket_type: "",
          quantity: "",
          unit_price: "",
          customer_name: "",
          customer_phone: "",
          customer_email: "",
          payment_method: "cash",
          notes: "",
        });
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (saleId, newStatus) => {
    try {
      const res = await fetch(`/api/ticket-sales/${saleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setSales(sales.map((s) => (s._id === saleId ? data.data : s)));
        alert("✅ Cập nhật trạng thái thành công!");
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const getSelectedBookingTickets = () => {
    if (!formData.booking_id) return [];
    const booking = bookings.find((b) => b._id === formData.booking_id);
    return booking?.tickets || [];
  };

  const filteredSales = sales.filter((sale) => {
    const matchSearch =
      sale.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_phone?.includes(search) ||
      sale.order_id?.includes(search);

    const matchStatus =
      filterStatus === "all" || sale.payment_status === filterStatus;

    const matchBooking =
      !selectedBooking || sale.booking_id?._id === selectedBooking;

    return matchSearch && matchStatus && matchBooking;
  });

  useEffect(() => {
    fetchBookings();
    fetchSales();
  }, []);

  const totalRevenue = sales
    .filter((s) => s.payment_status === "paid")
    .reduce((sum, s) => sum + s.total_price, 0);

  const totalOrders = sales.length;
  const paidOrders = sales.filter((s) => s.payment_status === "paid").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">🎫 Bán Vé Online</h1>
          <p className="text-gray-600">
            Quản lý bán vé cho khách hàng vãng lai
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn bán vé
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
            <p className="text-gray-600 text-sm mt-1">Tổng đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{paidOrders}</p>
            <p className="text-gray-600 text-sm mt-1">Đã thanh toán</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {(totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-gray-600 text-sm mt-1">Doanh thu</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {sales.filter((s) => s.payment_status === "pending").length}
            </p>
            <p className="text-gray-600 text-sm mt-1">Chờ thanh toán</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="🔍 Tìm theo tên, SĐT, mã đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ TT</SelectItem>
                <SelectItem value="paid">Đã TT</SelectItem>
                <SelectItem value="cancelled">Hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBooking} onValueChange={setSelectedBooking}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sự kiện</SelectItem>
                {bookings.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.event_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="space-y-3">
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Không tìm thấy đơn hàng nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => (
            <Card key={sale._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{sale.customer_name}</h3>
                      <Badge
                        variant={
                          sale.payment_status === "paid"
                            ? "default"
                            : sale.payment_status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {sale.payment_status === "paid"
                          ? "Đã thanh toán"
                          : sale.payment_status === "pending"
                          ? "Chờ thanh toán"
                          : "Hủy"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Mã đơn</p>
                        <p className="font-mono font-semibold">
                          {sale.order_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Loại vé</p>
                        <p className="font-semibold">{sale.ticket_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Số lượng</p>
                        <p className="font-semibold">{sale.quantity} vé</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Thành tiền</p>
                        <p className="font-semibold text-green-600">
                          {(sale.total_price / 1000000).toFixed(2)}M đ
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      📱 {sale.customer_phone} | ✉️ {sale.customer_email}
                    </div>
                  </div>

                  {sale.payment_status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(sale._id, "paid")
                        }
                        className="bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Xác nhận TT
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleUpdateStatus(sale._id, "cancelled")
                        }
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Sale Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>➕ Tạo đơn bán vé mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* Select Event */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Chọn sự kiện *
              </label>
              <Select
                value={formData.booking_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, booking_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.event_type} - {b.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Ticket Type */}
            {getSelectedBookingTickets().length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Loại vé *
                </label>
                <Select
                  value={formData.ticket_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ticket_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại vé" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedBookingTickets().map((t) => (
                      <SelectItem key={t._id} value={t.type}>
                        {t.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Số lượng vé *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="Nhập số lượng"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Giá mỗi vé (đ) *
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({ ...formData, unit_price: e.target.value })
                }
                placeholder="Nhập giá"
              />
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>

              <Input
                placeholder="Tên khách hàng"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_name: e.target.value,
                  })
                }
                className="mb-2"
              />

              <Input
                placeholder="Số điện thoại"
                value={formData.customer_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_phone: e.target.value,
                  })
                }
                className="mb-2"
              />

              <Input
                placeholder="Email"
                type="email"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_email: e.target.value,
                  })
                }
                className="mb-2"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Phương thức thanh toán
              </label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="card">Thẻ</SelectItem>
                  <SelectItem value="wallet">Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Ghi chú
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>

            {/* Summary */}
            {formData.quantity && formData.unit_price && (
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Thành tiền:{" "}
                    <span className="font-bold text-blue-600">
                      {(
                        parseInt(formData.quantity || 0) *
                        parseFloat(formData.unit_price || 0)
                      ).toLocaleString()}{" "}
                      đ
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-600"
              >
                {submitting ? "Đang lưu..." : "Tạo đơn"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}