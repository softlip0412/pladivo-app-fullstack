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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";

export default function TicketReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBooking, setSelectedBooking] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = "/api/ticket-sales/reports";
      const params = new URLSearchParams();

      if (selectedBooking && selectedBooking !== "all") params.append("booking_id", selectedBooking);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      if (params.toString()) url += "?" + params.toString();

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setReportData(data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData?.details) return;

    const csvContent = [
      [
        "Mã đơn",
        "Khách hàng",
        "SĐT",
        "Loại vé",
        "Số lượng",
        "Giá",
        "Thành tiền",
        "Trạng thái",
        "Ngày tạo",
      ],
      ...reportData.details.map((sale) => [
        sale.order_id,
        sale.customer_name,
        sale.customer_phone,
        sale.ticket_type,
        sale.quantity,
        sale.unit_price,
        sale.total_price,
        sale.payment_status,
        new Date(sale.createdAt).toLocaleString("vi-VN"),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-report-${new Date().getTime()}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    alert("🔄 Tính năng export PDF sẽ được cập nhật trong phiên bản tiếp theo");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedBooking, startDate, endDate]);

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const summary = reportData?.summary || {};
  const byTicketType = reportData?.byTicketType || [];
  const details = reportData?.details || [];

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">📊 Báo Cáo Doanh Thu Vé</h1>
        <p className="text-gray-600">
          Phân tích doanh thu bán vé sự kiện
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedBooking} onValueChange={setSelectedBooking}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn sự kiện (tất cả nếu để trống)" />
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

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Từ ngày"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Đến ngày"
            />

            <Button onClick={fetchReport} className="whitespace-nowrap">
              <TrendingUp className="w-4 h-4 mr-2" />
              Tải báo cáo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {summary.totalSales || 0}
            </p>
            <p className="text-gray-600 text-sm mt-1">Tổng đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {summary.paidSales || 0}
            </p>
            <p className="text-gray-600 text-sm mt-1">Đã thanh toán</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {(summary.totalQuantity || 0).toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm mt-1">Tổng vé</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {((summary.totalRevenue || 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-gray-600 text-sm mt-1">Doanh thu</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu theo loại vé */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo loại vé</CardTitle>
          </CardHeader>
          <CardContent>
            {byTicketType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byTicketType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ticket_type" angle={-45} height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="paid_revenue" fill="#10b981" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có dữ liệu
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tỷ lệ loại vé */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ loại vé đã bán</CardTitle>
          </CardHeader>
          <CardContent>
            {byTicketType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byTicketType}
                    dataKey="quantity"
                    nameKey="ticket_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {byTicketType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có dữ liệu
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết bán vé */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Chi tiết bán vé ({details.length})</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Mã đơn</th>
                  <th className="text-left p-3 font-semibold">Khách hàng</th>
                  <th className="text-left p-3 font-semibold">Loại vé</th>
                  <th className="text-center p-3 font-semibold">SL</th>
                  <th className="text-right p-3 font-semibold">Giá</th>
                  <th className="text-right p-3 font-semibold">Thành tiền</th>
                  <th className="text-center p-3 font-semibold">Trạng thái</th>
                  <th className="text-left p-3 font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-6 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  details.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">
                        {sale.order_id}
                      </td>
                      <td className="p-3">{sale.customer_name}</td>
                      <td className="p-3">{sale.ticket_type}</td>
                      <td className="p-3 text-center">{sale.quantity}</td>
                      <td className="p-3 text-right">
                        {(sale.unit_price / 1000).toFixed(0)}K
                      </td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        {(sale.total_price / 1000000).toFixed(2)}M
                      </td>
                      <td className="p-3 text-center">
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
                            ? "Đã TT"
                            : sale.payment_status === "pending"
                            ? "Chờ TT"
                            : "Hủy"}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">
                        {new Date(sale.createdAt).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}