"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomersPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchStaff = async (userId) => {
    try {
      const res = await fetch(`/api/staff/by-user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const fetchMessages = async (bookingId) => {
    try {
      setLoadingChat(true);
      const res = await fetch(`/api/messages?booking_id=${bookingId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    if (!staff?._id) {
      alert("Chưa tải thông tin nhân viên");
      return;
    }

    try {
      setSendingMessage(true);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: selectedBooking._id,
          sender_id: staff._id,
          content: messageInput,
          message_type: "text",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages([...messages, data.data]);
        setMessageInput("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Lỗi gửi tin nhắn: " + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const openChat = (booking) => {
    setSelectedBooking(booking);
    setIsChatOpen(true);
    fetchMessages(booking._id);
  };

  useEffect(() => {
    fetchBookings();
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      fetchStaff(user.user_id);
    }
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🤝 Quản Lý Khách Hàng & Hợp Đồng</h1>

      {/* Search Bar */}
      <div>
        <Input
          placeholder="🔍 Tìm theo tên / email / số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings
          .filter((b) => {
            const s = search.toLowerCase();
            return (
              b.customer_name?.toLowerCase().includes(s) ||
              b.phone?.toLowerCase().includes(s) ||
              b.email?.toLowerCase().includes(s)
            );
          })
          .map((b) => (
            <Card key={b._id} className="relative">
              {/* ✅ Nút Chat góc phải */}
              <Button
                size="icon"
                variant="outline"
                className="absolute top-3 right-3"
                onClick={() => openChat(b)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>

              <CardHeader>
                <CardTitle>{b.customer_name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                <p>
                  <b>Loại sự kiện:</b> {b.event_type}
                </p>
                <p>
                  <b>Ngày:</b> {formatDate(b.event_date)}
                </p>
                <p>
                  <b>Điện thoại:</b> {b.phone}
                </p>
                <p>
                  <b>Email:</b> {b.email}
                </p>

                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={
                      b.booking_status === "confirmed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    Booking: {b.booking_status}
                  </Badge>

                  <Badge
                    variant={
                      b.payment_status === "paid" ? "default" : "destructive"
                    }
                  >
                    Thanh toán: {b.payment_status}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() =>
                    alert("📄 Mở trang chi tiết hợp đồng / invoice")
                  }
                >
                  📄 Xem hợp đồng
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              💬 Chat với {selectedBooking?.customer_name}
            </DialogTitle>
          </DialogHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded space-y-3 min-h-[400px]">
            {loadingChat ? (
              <p className="text-center text-gray-500">Đang tải tin nhắn...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">
                Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender_id?._id === staff?._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id?._id === staff?._id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">
                      <b>
                        {msg.sender_id?.full_name ||
                          msg.sender_id?.username ||
                          "Unknown"}
                      </b>
                    </p>
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 mt-4">
            <Textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              rows={2}
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageInput.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4 mr-1" />
              {sendingMessage ? "Gửi..." : "Gửi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}