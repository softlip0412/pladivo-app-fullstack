"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TimelineItem } from "@/components/ui/timeline-item";
import { CalendarDays, ListTodo, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TimelinePage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Fetch all bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch tasks when booking is selected
  useEffect(() => {
    if (selectedBookingId) {
      fetchTasks(selectedBookingId);
    }
  }, [selectedBookingId]);

  async function fetchBookings() {
    try {
      setBookingsLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success && data.bookings?.length > 0) {
        setBookings(data.bookings);
        // Auto-select first booking
        setSelectedBookingId(data.bookings[0]._id);
      } else {
        setBookings([]);
        toast.info("Chưa có booking nào trong hệ thống");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách booking");
    } finally {
      setBookingsLoading(false);
    }
  }

  async function fetchTasks(bookingId) {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?booking_id=${bookingId}`);
      const data = await res.json();

      if (data.success) {
        setTasks(data.data || []);
      } else {
        setTasks([]);
        toast.error("Không thể tải danh sách công việc");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Đã xảy ra lỗi khi tải công việc");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    if (selectedBookingId) {
      fetchTasks(selectedBookingId);
      toast.success("Đã làm mới dữ liệu");
    }
  }

  const selectedBooking = bookings.find((b) => b._id === selectedBookingId);

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    cancelled: tasks.filter((t) => t.status === "cancelled").length,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <PageHeader
        title="⏱️ Timeline Công Việc"
        description="Theo dõi tiến độ và trạng thái hoàn thành công việc của từng booking"
      >
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleRefresh}
            variant="glass"
            size="sm"
            disabled={!selectedBookingId || loading}
          >
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Làm mới
          </Button>
        </div>
      </PageHeader>

      {/* Booking Filter */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Chọn Booking</h2>
          </div>

          <Select
            value={selectedBookingId}
            onValueChange={setSelectedBookingId}
            disabled={bookingsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn một booking..." />
            </SelectTrigger>
            <SelectContent>
              {bookings.map((booking) => (
                <SelectItem key={booking._id} value={booking._id}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {booking.customer_name} - {booking.event_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {booking.event_date
                        ? new Date(booking.event_date).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Chưa có ngày"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selected Booking Info */}
          {selectedBooking && (
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Khách hàng:</span>{" "}
                  <span className="font-semibold">{selectedBooking.customer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Loại sự kiện:</span>{" "}
                  <span className="font-semibold">{selectedBooking.event_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Điện thoại:</span>{" "}
                  <span className="font-semibold">{selectedBooking.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày tổ chức:</span>{" "}
                  <span className="font-semibold">
                    {selectedBooking.event_date
                      ? new Date(selectedBooking.event_date).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics Cards */}
      {selectedBookingId && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Tổng công việc</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-muted-foreground mt-1">Đã hoàn thành</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground mt-1">Đang tiến hành</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground mt-1">Chờ thực hiện</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">Tỷ lệ hoàn thành</div>
            </div>
          </Card>
        </div>
      )}

      {/* Timeline Content */}
      {selectedBookingId && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ListTodo className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Timeline Công Việc</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Booking này chưa có công việc nào
              </p>
            </div>
          ) : (
            <div className="mt-6">
              {tasks.map((task, index) => (
                <TimelineItem
                  key={task._id}
                  task={task}
                  isLast={index === tasks.length - 1}
                  index={index}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* No Booking Selected */}
      {!selectedBookingId && !bookingsLoading && (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chọn một booking để xem timeline</h3>
            <p className="text-sm text-muted-foreground">
              Vui lòng chọn booking từ danh sách phía trên để xem các công việc
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
