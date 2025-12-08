"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Star,
  AlertCircle,
  Lightbulb,
  ThumbsUp,
  HelpCircle,
  RefreshCcw,
  Send,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const feedbackTypeConfig = {
  complaint: {
    label: "Khiếu nại",
    icon: AlertCircle,
    color: "bg-red-100 text-red-700 border-red-300",
    badge: "destructive",
  },
  suggestion: {
    label: "Đề xuất",
    icon: Lightbulb,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    badge: "default",
  },
  praise: {
    label: "Khen ngợi",
    icon: ThumbsUp,
    color: "bg-green-100 text-green-700 border-green-300",
    badge: "success",
  },
  question: {
    label: "Câu hỏi",
    icon: HelpCircle,
    color: "bg-purple-100 text-purple-700 border-purple-300",
    badge: "secondary",
  },
};

const statusConfig = {
  new: {
    label: "Mới",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    badge: "warning",
  },
  in_progress: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    badge: "default",
  },
  resolved: {
    label: "Đã giải quyết",
    color: "bg-green-100 text-green-700 border-green-300",
    badge: "success",
  },
  closed: {
    label: "Đã đóng",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    badge: "secondary",
  },
};

const priorityConfig = {
  low: {
    label: "Thấp",
    color: "text-gray-600",
  },
  medium: {
    label: "Trung bình",
    color: "text-yellow-600",
  },
  high: {
    label: "Cao",
    color: "text-red-600",
  },
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, priorityFilter, typeFilter]);

  async function fetchFeedback() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (typeFilter !== "all") params.append("feedback_type", typeFilter);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setFeedback(data.data || []);
      } else {
        toast.error("Không thể tải danh sách phản hồi");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Đã xảy ra lỗi khi tải phản hồi");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenResponse(item) {
    setSelectedFeedback(item);
    setResponse(item.staff_response || "");
    setResponseStatus(item.status);
    setShowResponseDialog(true);
  }

  async function handleSubmitResponse() {
    if (!response.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      setSubmitting(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: selectedFeedback._id,
          staff_response: response,
          status: responseStatus,
          staff_id: user.staff_id || user._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("✅ Đã gửi phản hồi thành công");
        setShowResponseDialog(false);
        setSelectedFeedback(null);
        setResponse("");
        fetchFeedback();
      } else {
        toast.error(data.message || "Gửi phản hồi thất bại");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Đã xảy ra lỗi khi gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate statistics
  const stats = {
    total: feedback.length,
    new: feedback.filter((f) => f.status === "new").length,
    inProgress: feedback.filter((f) => f.status === "in_progress").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
    high: feedback.filter((f) => f.priority === "high").length,
  };

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <PageHeader
        title="💬 Phản Hồi Khách Hàng"
        description="Quản lý và trả lời phản hồi, báo cáo từ khách hàng về booking"
      >
        <Button
          onClick={fetchFeedback}
          variant="glass"
          size="sm"
          disabled={loading}
        >
          <RefreshCcw
            className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
          />
          Làm mới
        </Button>
      </PageHeader>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.total}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Tổng phản hồi
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.new}</div>
            <div className="text-xs text-muted-foreground mt-1">Mới</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Đang xử lý
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Đã giải quyết
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Ưu tiên cao
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Trạng thái</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="new">Mới</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Độ ưu tiên</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Loại</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="complaint">Khiếu nại</SelectItem>
                <SelectItem value="suggestion">Đề xuất</SelectItem>
                <SelectItem value="praise">Khen ngợi</SelectItem>
                <SelectItem value="question">Câu hỏi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      ) : feedback.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Chưa có phản hồi nào
            </h3>
            <p className="text-sm text-muted-foreground">
              Các phản hồi từ khách hàng sẽ xuất hiện ở đây
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {feedback.map((item, index) => {
            const typeConfig = feedbackTypeConfig[item.feedback_type];
            const statConfig = statusConfig[item.status];
            const TypeIcon = typeConfig.icon;

            return (
              <Card
                key={item._id}
                className={cn(
                  "p-6 hover:shadow-lg transition-all duration-300 animate-fade-in",
                  item.priority === "high" && "border-l-4 border-l-red-500"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          typeConfig.color
                        )}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {item.customer_name}
                          </h3>
                          <Badge variant={typeConfig.badge}>
                            {typeConfig.label}
                          </Badge>
                          <Badge variant={statConfig.badge}>
                            {statConfig.label}
                          </Badge>
                          {item.priority === "high" && (
                            <Badge variant="destructive">Ưu tiên cao</Badge>
                          )}
                        </div>
                        {item.booking_id && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Booking: {item.booking_id.customer_name} -{" "}
                            {item.booking_id.event_type}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < item.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {item.customer_email}
                    </div>
                    {item.customer_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {item.customer_phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                  </div>

                  {/* Staff Response */}
                  {item.staff_response && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          Phản hồi từ{" "}
                          {item.responded_by?.full_name || "Nhân viên"}
                        </span>
                        {item.responded_at && (
                          <span className="text-xs text-muted-foreground">
                            •{" "}
                            {format(
                              new Date(item.responded_at),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {item.staff_response}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleOpenResponse(item)}
                      variant={item.staff_response ? "outline" : "default"}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {item.staff_response ? "Cập nhật phản hồi" : "Trả lời"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trả lời phản hồi</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedFeedback && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {selectedFeedback.customer_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFeedback.message}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Nội dung trả lời
              </label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Nhập nội dung trả lời cho khách hàng..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cập nhật trạng thái
              </label>
              <Select value={responseStatus} onValueChange={setResponseStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResponseDialog(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={submitting || !response.trim()}
            >
              {submitting ? "Đang gửi..." : "Gửi phản hồi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
