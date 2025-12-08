"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  CheckCircle2,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";

export default function TaskEvaluationPage() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [selectedTask, setSelectedTask] = useState(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isEvaluateDialogOpen, setIsEvaluateDialogOpen] = useState(false);

  // Evaluation states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      fetchStaff();
    }
  }, [user]);

  useEffect(() => {
    if (staff?._id) {
      fetchTasks();
    }
  }, [staff]);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter, searchQuery]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      console.log("🔄 Fetching staff for user:", user.user_id);
      const res = await fetch(`/api/staff/by-user/${user.user_id}`);
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();

      console.log("📦 Staff response:", data);

      if (data.success && data.data) {
        console.log("✅ Staff data:", data.data);
        setStaff(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch staff");
      }
    } catch (err) {
      console.error("❌ Error fetching staff:", err);
      setError("Lỗi tải thông tin nhân viên: " + err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/tasks?staff_id=${staff._id}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data.success) {
        // ✅ Chỉ lấy tasks đã nộp báo cáo (có report.submitted_at)
        const completedTasks = (data.data || []).filter(
          (task) => task.report?.submitted_at
        );

        console.log("✅ Tasks với report:", completedTasks.length);
        setTasks(completedTasks);
      } else {
        throw new Error(data.message || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("❌ Error fetching tasks:", err);
      setError("Lỗi tải danh sách công việc: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("👀 Staff changed:", staff);
    if (staff?._id) {
      console.log("🚀 Calling fetchTasks...");
      fetchTasks();
    } else {
      console.log("⏳ Waiting for staff...");
    }
  }, [staff]);

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filter by evaluation status
    if (statusFilter === "evaluated") {
      filtered = filtered.filter((task) => task.evaluation?.rating);
    } else if (statusFilter === "not_evaluated") {
      filtered = filtered.filter((task) => !task.evaluation?.rating);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.category?.toLowerCase().includes(query) ||
          task.staff_id?.full_name?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const openReportDialog = (task) => {
    setSelectedTask(task);
    setIsReportDialogOpen(true);
  };

  const openEvaluateDialog = (task) => {
    setSelectedTask(task);
    setRating(task.evaluation?.rating || 0);
    setComment(task.evaluation?.comment || "");
    setIsEvaluateDialogOpen(true);
  };

  const handleSubmitEvaluation = async () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/tasks/${selectedTask._id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          evaluated_by: staff._id,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      alert("✅ Đánh giá thành công!");

      // Reset form
      setRating(0);
      setComment("");
      setIsEvaluateDialogOpen(false);

      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error("Submit evaluation error:", err);
      alert("❌ Đánh giá thất bại: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= (interactive ? hoverRating || rating : currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="⭐ Đánh giá công việc"
        description="Quản lý và đánh giá báo cáo công việc của nhân viên"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="🔍 Tìm kiếm theo tên công việc, nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="not_evaluated">Chưa đánh giá</SelectItem>
                <SelectItem value="evaluated">Đã đánh giá</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-sm text-gray-600">Tổng báo cáo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.evaluation?.rating).length}
              </p>
              <p className="text-sm text-gray-600">Đã đánh giá</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {tasks.filter((t) => !t.evaluation?.rating).length}
              </p>
              <p className="text-sm text-gray-600">Chưa đánh giá</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="hover:shadow-lg transition">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{task.category}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{task.staff_id?.full_name || "N/A"}</span>
                  </div>
                </div>
                {task.evaluation?.rating ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Đã đánh giá
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-700">
                    Chưa đánh giá
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description || "Không có mô tả"}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Nộp: {formatDate(task.report?.submitted_at)}</span>
              </div>

              {/* Hiển thị đánh giá nếu có */}
              {task.evaluation?.rating && (
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(task.evaluation.rating)}
                    <span className="text-sm font-semibold">
                      {task.evaluation.rating}/5
                    </span>
                  </div>
                  {task.evaluation.comment && (
                    <p className="text-xs text-gray-600 mt-2">
                      {task.evaluation.comment}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openReportDialog(task)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Xem báo cáo
                </Button>

                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => openEvaluateDialog(task)}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {task.evaluation?.rating ? "Sửa" : "Đánh giá"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Không tìm thấy báo cáo nào</p>
        </div>
      )}

      {/* Dialog Xem Báo Cáo */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📄 Chi tiết báo cáo</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              {/* Thông tin task */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Công việc:</p>
                      <p className="font-semibold">{selectedTask.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Nhân viên:</p>
                      <p className="font-semibold">
                        {selectedTask.staff_id?.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deadline:</p>
                      <p className="font-semibold">
                        {formatDate(selectedTask.deadline)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày nộp:</p>
                      <p className="font-semibold">
                        {formatDate(selectedTask.report?.submitted_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nội dung báo cáo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nội dung báo cáo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTask.report?.content || "Không có nội dung"}
                  </p>
                </CardContent>
              </Card>

              {/* Hình ảnh */}
              {selectedTask.report?.images?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Hình ảnh minh chứng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedTask.report.images.map((img, idx) => (
                        <Image
                          key={idx}
                          src={img.url}
                          alt={`Report ${idx + 1}`}
                          width={300}
                          height={300}
                          className="rounded object-cover w-full h-48"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Đánh giá hiện tại */}
              {selectedTask.evaluation?.rating && (
                <Card className="bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Đánh giá</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {renderStars(selectedTask.evaluation.rating)}
                        <span className="font-semibold">
                          {selectedTask.evaluation.rating}/5
                        </span>
                      </div>
                      {selectedTask.evaluation.comment && (
                        <p className="text-sm text-gray-700">
                          {selectedTask.evaluation.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Đánh giá bởi:{" "}
                        {selectedTask.evaluation.evaluated_by?.full_name ||
                          "N/A"}{" "}
                        - {formatDate(selectedTask.evaluation.evaluated_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Đánh Giá */}
      <Dialog
        open={isEvaluateDialogOpen}
        onOpenChange={setIsEvaluateDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>⭐ Đánh giá công việc</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Công việc:</p>
                <p className="font-semibold">{selectedTask.category}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Nhân viên:</p>
                <p className="font-semibold">
                  {selectedTask.staff_id?.full_name || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Số sao *
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(rating, true)}
                  <span className="text-sm text-gray-600">
                    ({rating > 0 ? rating : 0}/5)
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nhận xét
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét về công việc..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEvaluateDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
                  disabled={submitting || rating === 0}
                >
                  {submitting ? "Đang lưu..." : "Lưu đánh giá"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
