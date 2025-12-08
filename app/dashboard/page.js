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
  const [notebookPage, setNotebookPage] = useState(0);
  const [evaluationPage, setEvaluationPage] = useState(0);
  const ITEMS_PER_PAGE = 3;

  // States cho lịch tuần
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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

  // Initialize week start
  useEffect(() => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn thành
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="info" className="gap-1">
            <Clock className="w-3 h-3" />
            Đang làm
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3 h-3" />
            Chưa làm
          </Badge>
        );
    }
  };

  // ✅ Helper functions cho lịch tuần
  const getWeekDays = (startDate) => {
    const days = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as start
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const getTimeSlot = (date) => {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "evening";
  };

  const getTasksForDayAndSlot = (date, slot) => {
    return tasks.filter((task) => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      
      const isSameDay =
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear();
      
      if (!isSameDay) return false;
      
      const taskSlot = getTimeSlot(taskDate);
      return taskSlot === slot;
    });
  };

  const formatWeekRange = () => {
    const weekDays = getWeekDays(currentWeekStart);
    const start = weekDays[0];
    const end = weekDays[6];
    
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  const openTaskDetail = (task) => {
    setSelectedTaskDetail(task);
    setIsDetailDialogOpen(true);
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

  const pendingTasks = getPendingTasks();
  const completedTasks = getCompletedTasks();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-gradient bg-[length:200%_auto]" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 animate-fade-in">Dashboard</h1>
            <p className="text-white/90 animate-slide-up">Chào mừng bạn đến với Pladivo Admin Panel 🎉</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="glass" size="icon" className="bg-white/20 hover:bg-white/30">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Avatar className="h-10 w-10 ring-2 ring-white/50">
                <AvatarImage
                  src={staff?.avatar_url || "/avatar.png"}
                  alt={user?.username || "U"}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{user.username}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Thông tin cá nhân */}
        <Card variant="premium" className="animate-slide-up">
          <CardHeader>
            <CardTitle gradient>Thông tin cá nhân</CardTitle>
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

        {/* Card 2: Lịch làm việc dạng tuần */}
        <Card variant="premium" className="lg:col-span-2 animate-slide-up" style={{animationDelay: "0.1s"}}>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Lịch làm việc tuần</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeWeek(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {formatWeekRange()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeWeek(1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header - Days of week */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="text-xs font-semibold p-2"></div>
                {getWeekDays(currentWeekStart).map((day, idx) => {
                  const isToday =
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={idx}
                      className={`text-center p-2 rounded-lg ${
                        isToday ? "bg-blue-100 font-bold" : "bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-semibold">
                        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][idx]}
                      </div>
                      <div className="text-sm">
                        {day.getDate()}/{day.getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              {[
                { label: "🌅 Sáng", slot: "morning" },
                { label: "☀️ Chiều", slot: "afternoon" },
                { label: "🌙 Tối", slot: "evening" },
              ].map((timeSlot) => (
                <div key={timeSlot.slot} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="text-xs font-semibold p-2 flex items-center justify-center bg-gray-50 rounded-lg">
                    {timeSlot.label}
                  </div>

                  {getWeekDays(currentWeekStart).map((day, idx) => {
                    const tasksInSlot = getTasksForDayAndSlot(day, timeSlot.slot);

                    return (
                      <div
                        key={idx}
                        className="min-h-[80px] border rounded-lg p-1 bg-white hover:bg-gray-50 transition"
                      >
                        {tasksInSlot.length > 0 ? (
                          <div className="space-y-1">
                            {tasksInSlot.map((task) => (
                              <div
                                key={task._id}
                                onClick={() => openTaskDetail(task)}
                                className="text-xs p-1.5 rounded cursor-pointer hover:shadow-sm transition bg-blue-50 border border-blue-200"
                              >
                                <div className="font-semibold line-clamp-1 text-blue-900">
                                  {task.category}
                                </div>
                                <div className="text-[10px] text-blue-700">
                                  {new Date(task.deadline).getHours()}:
                                  {String(new Date(task.deadline).getMinutes()).padStart(2, "0")}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-300">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Sổ tay công việc với Pagination */}
        <Card variant="premium" className="lg:col-span-3 animate-slide-up" style={{animationDelay: "0.2s"}}>
          <CardHeader>
            <CardTitle gradient>
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

        {/* Card 4: Đánh giá công việc */}
        <Card variant="premium" className="lg:col-span-3 animate-slide-up" style={{animationDelay: "0.3s"}}>
          <CardHeader>
            <CardTitle gradient>
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
      </div>

      {/* Dialog Xem Chi Tiết Công Việc */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết công việc</DialogTitle>
          </DialogHeader>

          {selectedTaskDetail && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Tên công việc
                </label>
                <p className="text-base mt-1">{selectedTaskDetail.category}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Mô tả
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTaskDetail.description || "Không có mô tả"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Deadline
                  </label>
                  <p className="text-sm mt-1">
                    📅 {formatDate(selectedTaskDetail.deadline)}
                    <br />
                    🕐{" "}
                    {new Date(selectedTaskDetail.deadline).getHours()}:
                    {String(
                      new Date(selectedTaskDetail.deadline).getMinutes()
                    ).padStart(2, "0")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Trạng thái
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedTaskDetail.status)}</div>
                </div>
              </div>

              {selectedTaskDetail.report && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Báo cáo đã nộp
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg mt-1">
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedTaskDetail.report.content}
                    </p>
                    {selectedTaskDetail.report.images?.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {selectedTaskDetail.report.images.map((img, idx) => (
                          <Image
                            key={idx}
                            src={img.url}
                            alt={`Report ${idx + 1}`}
                            width={100}
                            height={100}
                            className="rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTaskDetail.evaluation?.rating && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Đánh giá
                  </label>
                  <div className="bg-yellow-50 p-3 rounded-lg mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(selectedTaskDetail.evaluation.rating)}
                      <span className="text-sm font-semibold">
                        {selectedTaskDetail.evaluation.rating}/5
                      </span>
                    </div>
                    {selectedTaskDetail.evaluation.comment && (
                      <p className="text-sm text-gray-600">
                        {selectedTaskDetail.evaluation.comment}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Đóng
                </Button>
                {(selectedTaskDetail.status === "pending" ||
                  selectedTaskDetail.status === "in_progress") && (
                  <Button
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      openReportDialog(selectedTaskDetail);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Nộp báo cáo
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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