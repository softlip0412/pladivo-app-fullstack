"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function DashboardHome() {
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Pagination states
  const [calendarPage, setCalendarPage] = useState(0);
  const [notebookPage, setNotebookPage] = useState(0);
  const [evaluationPage, setEvaluationPage] = useState(0);
  const ITEMS_PER_PAGE = 3;

  // States cho nộp báo cáo
  const [selectedTask, setSelectedTask] = useState(null);
  const [reportContent, setReportContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;

    async function fetchStaff() {
      try {
        const res = await fetch(`/api/staff/by-user/${user.user_id}`);
        if (!res.ok) throw new Error("Failed to fetch staff info");
        const data = await res.json();

        if (data.success) {
          setStaff(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchStaff();
  }, [user]);

  useEffect(() => {
    if (!staff?._id) return;

    async function fetchTasks() {
      try {
        const res = await fetch(`/api/tasks?staff_id=${staff._id}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();

        if (data.success) {
          setTasks(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    }

    fetchTasks();
  }, [staff]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Hoàn thành
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            Đang làm
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            <Clock className="w-3 h-3 mr-1" />
            Chưa làm
          </Badge>
        );
    }
  };

  // Lọc tasks theo tháng và năm
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getMonth() + 1 === parseInt(month) &&
        taskDate.getFullYear() === parseInt(year)
      );
    });
  };

  // Lấy tasks chưa hoàn thành
  const getPendingTasks = () => {
    return tasks.filter(
      (task) => task.status === "pending" || task.status === "in_progress"
    );
  };

  // ✅ Lấy tasks đã hoàn thành
  const getCompletedTasks = () => {
    return tasks.filter((task) => task.status === "completed");
  };

  // ✅ Render stars cho đánh giá
  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Pagination helper
  const paginate = (items, page) => {
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  const getTotalPages = (items) => {
    return Math.ceil(items.length / ITEMS_PER_PAGE);
  };

  // Upload ảnh
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        return data.data;
      });

      const results = await Promise.all(uploadPromises);
      setUploadedImages([...uploadedImages, ...results]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload thất bại: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (public_id) => {
    setUploadedImages(
      uploadedImages.filter((img) => img.public_id !== public_id)
    );
  };

  // Nộp báo cáo
  const handleSubmitReport = async () => {
    if (!reportContent.trim()) {
      alert("Vui lòng nhập nội dung báo cáo");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/tasks/${selectedTask._id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reportContent,
          images: uploadedImages,
          staff_id: staff._id,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      alert("✅ Nộp báo cáo thành công!");

      setReportContent("");
      setUploadedImages([]);
      setIsReportDialogOpen(false);

      const tasksRes = await fetch(`/api/tasks?staff_id=${staff._id}`);
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setTasks(tasksData.data || []);
      }
    } catch (err) {
      console.error("Submit report error:", err);
      alert("❌ Nộp báo cáo thất bại: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openReportDialog = (task) => {
    setSelectedTask(task);
    setReportContent(task.report?.content || "");
    setUploadedImages(task.report?.images || []);
    setIsReportDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground text-lg">
          Đang tải thông tin người dùng...
        </p>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();
  const pendingTasks = getPendingTasks();
  const completedTasks = getCompletedTasks();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p>Chào mừng bạn đến với Pladivo Admin Panel 🎉</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={staff?.avatar_url || "/avatar.png"}
                alt={user?.username || "U"}
              />
              <AvatarFallback>
                {user?.username ? user.username[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.username}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Thông tin cá nhân */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={staff?.avatar_url || "/avatar.png"}
                  alt={staff?.full_name || "U"}
                />
                <AvatarFallback>
                  {staff?.full_name ? staff.full_name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <p>
                  <strong>Họ và tên:</strong>{" "}
                  {staff?.full_name || user.username}
                </p>

                <p>
                  <strong>Email:</strong> {staff?.user_id?.email || "-"}
                </p>

                <p>
                  <strong>Số điện thoại:</strong> {staff?.user_id?.phone || "-"}
                </p>

                <p>
                  <strong>Bộ phận:</strong> {staff?.department_id?.name || "-"}
                </p>

                <p>
                  <strong>Chức vụ:</strong> {staff?.role_id?.name || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lịch làm việc với Pagination */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>
              Lịch làm việc ({filteredTasks.length} công việc)
            </CardTitle>
            <div className="flex gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      Tháng {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={`${y}`}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <>
                <div className="space-y-3">
                  {paginate(filteredTasks, calendarPage).map((task) => (
                    <div
                      key={task._id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {task.category}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {task.description || "Không có mô tả"}
                          </p>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          📅 Deadline:{" "}
                          <strong>{formatDate(task.deadline)}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {getTotalPages(filteredTasks) > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarPage(calendarPage - 1)}
                      disabled={calendarPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Trang {calendarPage + 1} / {getTotalPages(filteredTasks)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarPage(calendarPage + 1)}
                      disabled={
                        calendarPage >= getTotalPages(filteredTasks) - 1
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>
                  Không có công việc nào trong tháng {month}/{year}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Sổ tay công việc với Pagination */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              📝 Sổ tay công việc ({pendingTasks.length} việc cần làm)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginate(pendingTasks, notebookPage).map((task) => (
                    <div
                      key={task._id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm flex-1">
                          {task.category}
                        </h4>
                        {getStatusBadge(task.status)}
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {task.description || "Không có mô tả"}
                      </p>

                      <div className="text-xs text-gray-500 mb-2">
                        📅 Deadline:{" "}
                        <strong>{formatDate(task.deadline)}</strong>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openReportDialog(task)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Nộp báo cáo
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {getTotalPages(pendingTasks) > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNotebookPage(notebookPage - 1)}
                      disabled={notebookPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Trang {notebookPage + 1} / {getTotalPages(pendingTasks)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNotebookPage(notebookPage + 1)}
                      disabled={notebookPage >= getTotalPages(pendingTasks) - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Không có công việc nào cần làm 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Đánh giá công việc - ✅ MỚI CẬP NHẬT */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              ⭐ Đánh giá công việc ({completedTasks.length} đã hoàn thành)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedTasks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginate(completedTasks, evaluationPage).map((task) => (
                    <div
                      key={task._id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm flex-1">
                          {task.category}
                        </h4>
                        {getStatusBadge(task.status)}
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {task.description || "Không có mô tả"}
                      </p>

                      <div className="text-xs text-gray-500 mb-2">
                        📅 Hoàn thành:{" "}
                        <strong>{formatDate(task.report?.submitted_at)}</strong>
                      </div>

                      {/* Hiển thị đánh giá */}
                      {task.evaluation?.rating ? (
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            {renderStars(task.evaluation.rating)}
                            <span className="text-xs font-semibold">
                              {task.evaluation.rating}/5
                            </span>
                          </div>
                          {task.evaluation.comment && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {task.evaluation.comment}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-500">
                            Chưa có đánh giá
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {getTotalPages(completedTasks) > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEvaluationPage(evaluationPage - 1)}
                      disabled={evaluationPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Trang {evaluationPage + 1} /{" "}
                      {getTotalPages(completedTasks)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEvaluationPage(evaluationPage + 1)}
                      disabled={
                        evaluationPage >= getTotalPages(completedTasks) - 1
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có công việc nào hoàn thành</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 5: Nghỉ phép */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Nghỉ phép</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Ngày phép còn lại: <strong>5 ngày</strong>
            </p>
            <Button variant="outline" className="mt-2 w-full">
              Xin nghỉ phép
            </Button>
          </CardContent>
        </Card> */}

        {/* Card 6: Thông báo */}
        {/* <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tin nhắn thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>📢 Cuộc họp nội bộ lúc 14h hôm nay</li>
              <li>🎉 Sự kiện "Pladivo Connect 2025" sắp diễn ra</li>
              <li>🕐 Cập nhật chính sách nghỉ phép mới</li>
            </ul>
          </CardContent>
        </Card> */}
      </div>

      {/* Dialog Nộp Báo Cáo */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nộp báo cáo: {selectedTask?.category}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nội dung báo cáo *
              </label>
              <Textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Nhập nội dung báo cáo công việc..."
                rows={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Hình ảnh minh chứng
              </label>

              <div className="border-2 border-dashed rounded-lg p-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="mb-3"
                />

                {uploading && (
                  <p className="text-sm text-gray-500">Đang upload...</p>
                )}

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={img.url}
                          alt={`Upload ${idx + 1}`}
                          width={150}
                          height={150}
                          className="rounded object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(img.public_id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReportDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={submitting || !reportContent.trim()}
              >
                {submitting ? "Đang nộp..." : "Nộp báo cáo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
