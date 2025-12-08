"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send, CheckCircle, Clock, XCircle, Calendar, Users, Tag, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

const getEventPlanStatusInfo = (status) => {
  switch (status) {
    case "not_created":
      return { label: "Chưa tạo KH", color: "bg-gray-400" };
    case "draft":
      return { label: "Nháp", color: "bg-gray-400" };
    case "pending_manager":
      return { label: "Chờ QL duyệt", color: "bg-yellow-500" };
    case "pending_manager_demo":
      return { label: "Chờ duyệt thử nghiệm", color: "bg-yellow-500" };
    case "manager_approved":
      return { label: "QL đã duyệt", color: "bg-blue-500" };
    case "manager_approved_demo":
      return { label: "Đã duyệt thử nghiệm", color: "bg-blue-500" };
    case "pending_customer":
      return { label: "Chờ khách duyệt", color: "bg-orange-500" };
    case "pending_customer_demo":
      return { label: "Chờ khách duyệt thử nghiệm", color: "bg-orange-500" };
    case "customer_approved":
      return { label: "Khách đã duyệt", color: "bg-green-500" };
    case "customer_approved_demo":
      return { label: "Khách đã duyệt thử nghiệm", color: "bg-green-500" };
    case "in_progress":
      return { label: "Đang thực hiện", color: "bg-purple-500" };
    case "completed":
      return { label: "Hoàn thành", color: "bg-green-600" };
    case "cancelled":
      return { label: "Đã hủy", color: "bg-red-500" };
    default:
      return { label: "Không xác định", color: "bg-gray-400" };
  }
};

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

  // Contract states
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [selectedEventPlan, setSelectedEventPlan] = useState(null);
  const [contractData, setContractData] = useState({
    contract_number: "",
    signing_date: new Date().toISOString().split("T")[0],
    signing_location: "Hà Nội",
    party_a: {
      name: "",
      address: "",
      phone: "",
      email: "",
      representative: "",
      position: "",
    },
    party_b: {
      name: "CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO",
      address: "Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      representative: "Nguyễn Văn A",
      position: "Giám đốc",
      phone: "0987654321",
      email: "contact@pladivo.com",
    },
    event_content: {
      time: "",
      location: "",
      scale: "",
    },
    work_items: "",
    total_cost: 0,
    payment_schedule: [],
    party_a_responsibilities: "",
    party_b_responsibilities: "",
    general_terms: "",
  });
  const [loadingContract, setLoadingContract] = useState(false);
  const [isSavingContract, setIsSavingContract] = useState(false); // NEW: loading state for saving
  const [isResendingEmail, setIsResendingEmail] = useState(false); // NEW: loading state for resending email

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
      toast.error("Chưa tải thông tin nhân viên");
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
      toast.error("Lỗi gửi tin nhắn: " + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const openChat = (booking) => {
    setSelectedBooking(booking);
    setIsChatOpen(true);
    fetchMessages(booking._id);
  };

  // --- CONTRACT LOGIC ---
  const openContractDialog = async (booking) => {
    setSelectedBooking(booking);
    setIsContractOpen(true);
    setLoadingContract(true);

    try {
      const res = await fetch(`/api/event-contracts?booking_id=${booking._id}`);
      const data = await res.json();

      if (data.success) {
        if (data.exists) {
          // Đã có hợp đồng -> Load data
          setContractData(data.data);
          setSelectedEventPlan(data.data.eventPlan);
        } else {
          // Chưa có -> Fill data từ Booking & EventPlan
          const { booking: b, eventPlan: ep } = data.data;
          setSelectedEventPlan(ep);
          
          // Format work items from EventPlan (Step 3)
          let workItemsText = "";
          if (ep?.step3) {
            workItemsText += `Chủ đề: ${ep.step3.theme || ""}\n`;
            workItemsText += `Màu chủ đạo: ${ep.step3.mainColor || ""}\n`;
            workItemsText += `Phong cách: ${ep.step3.style || ""}\n`;
            if (ep.step3.keyActivities?.length > 0) {
                workItemsText += `\nHoạt động chính:\n`;
                ep.step3.keyActivities.forEach((act, idx) => {
                    workItemsText += `- ${act.activity}\n`;
                });
            }
          }

          // Calculate total cost from Step 3.5 (Step 4 UI) if available, otherwise Step 2 Budget
          const totalCost = ep?.step3_5?.totalEstimatedCost || ep?.step2?.budget?.reduce(
            (sum, item) => sum + (item.cost * item.quantity), 
            0
          ) || 0;

          // Payment schedule from Step 3.5 (Step 4 UI) paymentPlan
          let paymentSchedule = ep?.step3_5?.paymentPlan?.map(p => ({
            description: p.description,
            amount: p.amount,
            deadline: p.dueDate // Map dueDate to deadline
          })) || [];

          // Fallback: If no payment schedule exists, generate a default one
          if (paymentSchedule.length === 0 && totalCost > 0) {
              const auditDate = new Date();
              const eventDate = new Date(b.event_date);
              
              // Đợt 1: Đặt cọc 50% ngay khi ký
              paymentSchedule.push({
                  description: "Đặt cọc lần 1 (50% giá trị hợp đồng)",
                  amount: totalCost * 0.5,
                  deadline: auditDate.toISOString().split('T')[0]
              });

              // Đợt 2: Thanh toán 50% còn lại trước sự kiện 1 ngày
              const finalPaymentDate = new Date(eventDate);
              finalPaymentDate.setDate(finalPaymentDate.getDate() - 1);
              
              paymentSchedule.push({
                  description: "Thanh toán lần 2 (50% còn lại)",
                  amount: totalCost * 0.5,
                  deadline: finalPaymentDate.toISOString().split('T')[0]
              });
          }

          setContractData({
            contract_number: `${new Date().getMonth() + 1}/${new Date().getFullYear()}/HĐ-SK`,
            signing_date: new Date().toISOString().split("T")[0],
            signing_location: "Hà Nội",
            party_a: {
              name: b.customer_name,
              address: b.address,
              phone: b.phone,
              email: b.email,
              representative: "", // User to fill
              position: "", // User to fill
            },
            party_b: {
              name: "CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO",
              address: "Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
              representative: "Nguyễn Văn A",
              position: "Giám đốc",
              phone: "0987654321",
              email: "contact@pladivo.com",
            },
            event_content: {
              time: `${b.event_time || ""} - ${b.event_end_time || ""} ngày ${new Date(b.event_date).toLocaleDateString("vi-VN")}`,
              location: b.address, // Or specific venue if available
              scale: `${b.scale || 0} khách`,
            },
            work_items: workItemsText,
            total_cost: totalCost,
            payment_schedule: paymentSchedule,
            party_a_responsibilities: "Thanh toán đúng hạn và cung cấp thông tin cần thiết.",
            party_b_responsibilities: "Đảm bảo tổ chức sự kiện đúng kế hoạch và chất lượng cam kết.",
            general_terms: "Hai bên cam kết thực hiện đúng các điều khoản trong hợp đồng.",
            booking_id: b._id,
            event_plan_id: ep?._id
          });
        }
      } else {
          toast.error("Không tìm thấy thông tin Booking hoặc EventPlan để tạo hợp đồng.");
          setIsContractOpen(false);
      }
    } catch (err) {
      console.error("Error fetching contract info:", err);
      toast.error("Lỗi tải thông tin hợp đồng");
    } finally {
      setLoadingContract(false);
    }
  };

  const handleSaveContract = async () => {
    try {
      setIsSavingContract(true); // START LOADING
      const res = await fetch("/api/event-contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...contractData,
            booking_id: selectedBooking._id
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lưu hợp đồng thành công!");
        setIsContractOpen(false);
        fetchBookings(); // Refresh list to update status
      } else {
        toast.error("Lỗi lưu hợp đồng: " + data.message);
      }
    } catch (err) {
      console.error("Error saving contract:", err);
      toast.error("Lỗi lưu hợp đồng");
    } finally {
      setIsSavingContract(false); // END LOADING
    }
  };

  const handleResendEmail = async () => {
    if (!contractData._id) return;
    try {
      setIsResendingEmail(true); // START LOADING
      const res = await fetch("/api/event-contracts/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_id: contractData._id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gửi lại email hợp đồng thành công!");
      } else {
        toast.error("Lỗi gửi email: " + data.message);
      }
    } catch (err) {
      console.error("Error resending email:", err);
      toast.error("Lỗi gửi email");
    } finally {
      setIsResendingEmail(false); // END LOADING
    }
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

  const getContractStatusBadge = (status) => {
    const config = {
      draft: { label: "📝 HĐ Nháp", color: "bg-gray-100 text-gray-700", icon: Clock },
      sent: { label: "⏳ Đã gửi HĐ", color: "bg-yellow-100 text-yellow-700", icon: Clock },
      signed: { label: "✅ Đã ký HĐ", color: "bg-green-100 text-green-700", icon: CheckCircle },
      cancelled: { label: "❌ Hủy HĐ", color: "bg-red-100 text-red-700", icon: XCircle },
      completed: { label: "🏁 Hoàn tất", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    };
    const item = config[status] || { label: "Chưa có HĐ", color: "bg-gray-50 text-gray-500", icon: XCircle };
    const Icon = item.icon;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${item.color}`}>
        <Icon className="w-3 h-3" />
        {item.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="🤝 Quản Lý Khách Hàng & Hợp Đồng"
        description="Quản lý thông tin khách hàng và hợp đồng sự kiện"
      />

      {/* Search Bar */}
      <div>
        <Input
          placeholder="🔍 Tìm theo tên / email / số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
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

            <Card key={b._id} className="relative shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
               {/* Move Chat button slightly to not overlap */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-gray-400 hover:text-blue-600"
                onClick={() => openChat(b)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <CardTitle className="text-lg font-bold text-blue-900">
                      {b.customer_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="w-3 h-3" />
                      {b.phone}
                    </div>
                  </div>
                </div>
                 <div className="mt-2">
                    {getContractStatusBadge(b.event_contract_status)}
                 </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                 <div className="border-t my-2"></div>
                
                 <div className="grid gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-700">Loại:</span> {b.event_type}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-700">Thời gian:</span> {formatDate(b.event_date)}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                         <span className="font-semibold text-gray-700">Email:</span> {b.email}
                      </div>
                    </div>
                 </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={b.booking_status === "confirmed" ? "default" : "secondary"} className="text-xs">
                    {b.booking_status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                  <Badge variant={b.payment_status === "paid" ? "default" : "destructive"} className="text-xs">
                    {b.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                   <Badge className={`${getEventPlanStatusInfo(b.event_plan_status).color} text-white hover:opacity-80 text-xs`}>
                    Plan: {getEventPlanStatusInfo(b.event_plan_status).label}
                  </Badge>
                </div>

                {(b.event_plan_status === "customer_approved_demo" || (b.event_contract_status && b.event_contract_status !== "not_created")) && (
                  <Button
                    variant="default"
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => openContractDialog(b)}
                  >
                    {!b.event_contract_status || b.event_contract_status === "draft" ? "📄 Tạo hợp đồng" : ""}
                    {b.event_contract_status === "sent" ? "📄 Xem/sửa hợp đồng" : ""}
                    {["signed", "cancelled", "completed"].includes(b.event_contract_status) ? "📄 Xem hợp đồng" : ""}
                  </Button>
                )}
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

      {/* Contract Dialog */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>HỢP ĐỒNG DỊCH VỤ TỔ CHỨC SỰ KIỆN</DialogTitle>
          </DialogHeader>

          {loadingContract ? (
              <p>Đang tải thông tin...</p>
          ) : (
              <div className="space-y-6 text-sm">
                  <fieldset disabled={["signed", "cancelled", "completed"].includes(contractData.status)} className="space-y-6 border-none p-0 m-0 min-w-0">
                  {/* Header */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="font-bold">Số Hợp Đồng:</label>
                          <Input 
                            value={contractData.contract_number} 
                            onChange={(e) => setContractData({...contractData, contract_number: e.target.value})}
                          />
                      </div>
                      <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="font-bold">Ngày ký:</label>
                            <Input 
                                type="date"
                                value={contractData.signing_date ? new Date(contractData.signing_date).toISOString().split('T')[0] : ''} 
                                onChange={(e) => setContractData({...contractData, signing_date: e.target.value})}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="font-bold">Tại:</label>
                            <Input 
                                value={contractData.signing_location} 
                                onChange={(e) => setContractData({...contractData, signing_location: e.target.value})}
                            />
                          </div>
                      </div>
                  </div>

                  {/* 1. Thông tin các bên */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">1. THÔNG TIN CÁC BÊN</h3>
                      
                      <div className="mb-4 p-4 border rounded bg-gray-50">
                          <h4 className="font-bold mb-2">BÊN A – BÊN THUÊ TỔ CHỨC SỰ KIỆN (KHÁCH HÀNG)</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-semibold">Tên khách hàng:</label>
                                  <Input value={contractData.party_a.name} readOnly className="bg-gray-100"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold">Điện thoại:</label>
                                  <Input value={contractData.party_a.phone} readOnly className="bg-gray-100"/>
                              </div>
                              <div className="col-span-2">
                                  <label className="block text-xs font-semibold">Địa chỉ:</label>
                                  <Input value={contractData.party_a.address} readOnly className="bg-gray-100"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold">Email:</label>
                                  <Input value={contractData.party_a.email} readOnly className="bg-gray-100"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold">Đại diện (nếu có):</label>
                                  <Input 
                                    value={contractData.party_a.representative} 
                                    onChange={(e) => setContractData({...contractData, party_a: {...contractData.party_a, representative: e.target.value}})}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="p-4 border rounded bg-gray-50">
                          <h4 className="font-bold mb-2">BÊN B – ĐƠN VỊ TỔ CHỨC SỰ KIỆN</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                  <label className="block text-xs font-semibold">Tên đơn vị:</label>
                                  <Input value={contractData.party_b.name} readOnly className="bg-gray-100"/>
                              </div>
                              <div className="col-span-2">
                                  <label className="block text-xs font-semibold">Địa chỉ:</label>
                                  <Input value={contractData.party_b.address} readOnly className="bg-gray-100"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold">Đại diện:</label>
                                  <Input value={contractData.party_b.representative} readOnly className="bg-gray-100"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold">Điện thoại:</label>
                                  <Input value={contractData.party_b.phone} readOnly className="bg-gray-100"/>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* 2. Nội dung sự kiện */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">2. NỘI DUNG SỰ KIỆN</h3>
                      <div className="grid grid-cols-3 gap-4">
                          <div>
                              <label className="block text-xs font-semibold">Thời gian:</label>
                              <Input value={contractData.event_content.time} readOnly className="bg-gray-100"/>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold">Địa điểm:</label>
                              <Input value={contractData.event_content.location} readOnly className="bg-gray-100"/>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold">Quy mô:</label>
                              <Input value={contractData.event_content.scale} readOnly className="bg-gray-100"/>
                          </div>
                      </div>
                  </div>

                  {/* 3. Hạng mục công việc */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">3. HẠNG MỤC CÔNG VIỆC BÊN B CUNG CẤP</h3>
                      
                      {/* Hiển thị thông tin từ Step 2 & Step 3 dưới dạng bảng */}
                      {/* Hiển thị thông tin từ Step 1, 2, 3, 4 dưới dạng bảng */}
                      {selectedEventPlan && (
                        <div className="mb-4 space-y-4">
                            {/* Step 1: Mục tiêu & Đối tượng */}
                            {selectedEventPlan.step1 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Mục Tiêu & Đối Tượng (Step 1)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold w-1/4">Mục tiêu</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step1.goal}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold">Đối tượng</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step1.audience}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold">Loại hình</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step1.eventCategory}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                             {/* Step 2: Timeline Events */}
                             {selectedEventPlan.step2?.eventTimeline?.length > 0 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Timeline Sự Kiện (Step 2)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border border-gray-300 p-2 text-left w-1/4">Thời gian</th>
                                                <th className="border border-gray-300 p-2 text-left">Hoạt động</th>
                                                <th className="border border-gray-300 p-2 text-left">Phụ trách</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedEventPlan.step2.eventTimeline.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-300 p-2">
                                                        {item.time ? new Date(item.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                                                    </td>
                                                    <td className="border border-gray-300 p-2">{item.activity}</td>
                                                    <td className="border border-gray-300 p-2">{item.manager?.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                             {/* Step 2: Prep Timeline */}
                             {selectedEventPlan.step2?.prepTimeline?.length > 0 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Timeline Chuẩn Bị (Step 2)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border border-gray-300 p-2 text-left w-1/4">Thời gian</th>
                                                <th className="border border-gray-300 p-2 text-left">Nhiệm vụ</th>
                                                <th className="border border-gray-300 p-2 text-left">Phụ trách</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedEventPlan.step2.prepTimeline.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-300 p-2">
                                                        {item.time ? new Date(item.time).toLocaleDateString('vi-VN') : ''}
                                                    </td>
                                                    <td className="border border-gray-300 p-2">{item.task}</td>
                                                    <td className="border border-gray-300 p-2">{item.manager?.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Step 3: Concept */}
                            {selectedEventPlan.step3 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Ý Tưởng & Chủ Đề (Step 3)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold w-1/4">Chủ đề</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step3.theme}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold">Màu chủ đạo</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step3.mainColor}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold">Phong cách</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step3.style}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 p-2 font-semibold">Thông điệp</td>
                                                <td className="border border-gray-300 p-2">{selectedEventPlan.step3.message}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Key Activities */}
                            {selectedEventPlan.step3?.keyActivities?.length > 0 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Hoạt Động Chính (Key Activities)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border border-gray-300 p-2 text-left">Hoạt động</th>
                                                <th className="border border-gray-300 p-2 text-left">Ý nghĩa / Tầm quan trọng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedEventPlan.step3.keyActivities.map((act, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-300 p-2">{act.activity}</td>
                                                    <td className="border border-gray-300 p-2">{act.importance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Program Script */}
                            {selectedEventPlan.step3?.programScript?.length > 0 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Kịch Bản Chương Trình (Script)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border border-gray-300 p-2 text-left w-1/4">Thời gian</th>
                                                <th className="border border-gray-300 p-2 text-left">Nội dung</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedEventPlan.step3.programScript.map((script, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-300 p-2">
                                                        {script.time ? new Date(script.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                                                    </td>
                                                    <td className="border border-gray-300 p-2">{script.content}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Event Timeline (Step 2) */}
                            {selectedEventPlan.step2?.eventTimeline?.length > 0 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Timeline Sự Kiện (Step 2)</h4>
                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border border-gray-300 p-2 text-left w-1/4">Thời gian</th>
                                                <th className="border border-gray-300 p-2 text-left">Hoạt động</th>
                                                <th className="border border-gray-300 p-2 text-left">Phụ trách</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedEventPlan.step2.eventTimeline.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-300 p-2">
                                                        {item.time ? new Date(item.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                                                    </td>
                                                    <td className="border border-gray-300 p-2">{item.activity}</td>
                                                    <td className="border border-gray-300 p-2">{item.manager?.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Step 4: Cost & Payment Plan */}
                            {selectedEventPlan.step3_5 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h4 className="font-bold mb-2 text-blue-600">Chi Phí & Thanh Toán (Step 4)</h4>
                                    
                                    {/* Partner Costs */}
                                    {selectedEventPlan.step3_5.partnerCosts?.length > 0 && (
                                        <div className="mb-3">
                                            <p className="font-semibold text-xs mb-1">Chi phí đối tác:</p>
                                            <ul className="list-disc pl-5">
                                                {selectedEventPlan.step3_5.partnerCosts.map((p, i) => (
                                                    <li key={i}>{p.partnerName} ({p.description}): {p.amount?.toLocaleString()} đ</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mt-2 border-t pt-2">
                                        <div>
                                            <p className="font-bold">Tổng chi phí dự kiến:</p>
                                            <p className="text-lg text-blue-700">{selectedEventPlan.step3_5.totalEstimatedCost?.toLocaleString()} VNĐ</p>
                                        </div>
                                        <div>
                                            <p className="font-bold">Tổng thanh toán (theo kế hoạch):</p>
                                            <p className="text-lg text-green-700">{selectedEventPlan.step3_5.totalPayment?.toLocaleString()} VNĐ</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                      )}

                      <label className="block text-xs font-semibold mb-1">Ghi chú thêm / Hạng mục khác:</label>
                      <Textarea 
                        value={contractData.work_items} 
                        onChange={(e) => setContractData({...contractData, work_items: e.target.value})}
                        rows={5}
                      />
                  </div>

                  {/* 4. Chi phí tổng */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">4. CHI PHÍ TỔNG</h3>
                      <div className="flex items-center gap-2">
                          <label>Tổng giá trị hợp đồng (dự kiến):</label>
                          <Input 
                            type="number" 
                            value={contractData.total_cost} 
                            onChange={(e) => setContractData({...contractData, total_cost: Number(e.target.value)})}
                            className="w-48 font-bold"
                          />
                          <span>VNĐ</span>
                      </div>
                  </div>

                  {/* 5. Tiến độ thanh toán */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">5. TIẾN ĐỘ THANH TOÁN</h3>
                      <div className="border rounded p-2">
                          {contractData.payment_schedule.length === 0 ? (
                              <p className="text-gray-500 italic">Chưa có kế hoạch đặt cọc.</p>
                          ) : (
                              <table className="w-full text-left">
                                  <thead>
                                      <tr className="border-b">
                                          <th className="p-2">Nội dung</th>
                                          <th className="p-2">Số tiền (VNĐ)</th>
                                          <th className="p-2">Hạn thanh toán</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {contractData.payment_schedule.map((item, idx) => (
                                          <tr key={idx} className="border-b last:border-0">
                                              <td className="p-2">{item.description}</td>
                                              <td className="p-2">{item.amount?.toLocaleString()}</td>
                                              <td className="p-2">{item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : ''}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          )}
                      </div>
                  </div>

                  {/* 6. Trách nhiệm bên A */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">6. TRÁCH NHIỆM CỦA BÊN A</h3>
                      <Textarea 
                        value={contractData.party_a_responsibilities} 
                        onChange={(e) => setContractData({...contractData, party_a_responsibilities: e.target.value})}
                        rows={3}
                      />
                  </div>

                  {/* 7. Trách nhiệm bên B */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">7. TRÁCH NHIỆM CỦA BÊN B</h3>
                      <Textarea 
                        value={contractData.party_b_responsibilities} 
                        onChange={(e) => setContractData({...contractData, party_b_responsibilities: e.target.value})}
                        rows={3}
                      />
                  </div>

                  {/* 8. Điều khoản chung */}
                  <div>
                      <h3 className="font-bold text-lg mb-2">8. ĐIỀU KHOẢN CHUNG</h3>
                      <Textarea 
                        value={contractData.general_terms} 
                        onChange={(e) => setContractData({...contractData, general_terms: e.target.value})}
                        rows={3}
                      />
                  </div>
                  </fieldset>

                  <div className="flex justify-end gap-2 pt-4">
                      {["sent", "signed", "cancelled", "completed"].includes(contractData.status) && (
                        <Button 
                          variant="outline" 
                          className="bg-blue-50 text-blue-600 border-blue-200" 
                          onClick={handleResendEmail}
                          disabled={isResendingEmail}
                        >
                           {isResendingEmail ? "Đang gửi..." : "📧 Gửi lại hợp đồng"}
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setIsContractOpen(false)}>
                        {["signed", "cancelled", "completed"].includes(contractData.status) ? "Thoát" : "Hủy"}
                      </Button>
                      
                      {!["signed", "cancelled", "completed"].includes(contractData.status) && (
                        <Button onClick={handleSaveContract} disabled={isSavingContract}>
                          {isSavingContract ? "Đang lưu..." : "Lưu Hợp Đồng"}
                        </Button>
                      )}
                  </div>
              </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
