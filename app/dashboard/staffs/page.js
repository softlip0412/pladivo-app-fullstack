"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function StaffPage() {
  const [staffs, setStaffs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterDept, setFilterDept] = useState("all");

  // Form thêm department/role
  const [openAddType, setOpenAddType] = useState(false);
  const [addType, setAddType] = useState("department"); // "department" | "role"
  const [newName, setNewName] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  async function openView(staff) {
    const staffId = staff._id;
    if (!staffId) {
      toast.error("ID nhân sự không hợp lệ");
      return;
    }

    try {
      console.log("Fetching staff ID:", staffId); // debug
      const res = await fetch(`/api/staff/${staffId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không lấy được thông tin nhân sự");
      }

      // API trả về object trong data
      setSelectedStaff(data.data);
      setOpenViewDialog(true);
    } catch (err) {
      toast.error(err?.message || "Lỗi khi tải thông tin nhân sự");
      console.error(err);
    }
  }

  function handleStartEdit() {
    setOpenViewDialog(false);
    setIsEditing(true);
    setOpenDialog(true);
  }

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    full_name: "",
    dob: "",
    gender: "other",
    citizen_id: "",
    citizen_issue_date: "",
    citizen_issue_place: "",
    address: "",
    permanent_address: "",
    department_id: "",
    role_id: "",
    position: "",
    start_date: "",
    end_date: "",
    contract_type: "fulltime",
    salary_base: "",
    salary_allowance: "",
    bank_name: "",
    bank_account: "",
    avatar_url: "",
    attachments: [],
    note: "",
  });

  useEffect(() => {
    fetchList();
    fetchDepartments();
    fetchRoles();
  }, [filterRole, filterDept]);

  async function fetchList() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRole !== "all") params.set("role_id", filterRole);
      if (filterDept !== "all") params.set("department_id", filterDept);

      const url = `/api/staff${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();
      console.log("staff data", data); // debug

      if (!res.ok) throw new Error(data.error || "Lỗi tải danh sách nhân sự");

      // ⚡ Sửa thành data.data
      setStaffs(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Lỗi khi tải danh sách nhân sự");
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) setDepartments(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) setRoles(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteType(type, id) {
    if (!confirm("Bạn có chắc muốn xoá mục này?")) return;
    const url =
      type === "department" ? `/api/departments/${id}` : `/api/roles/${id}`;
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Xoá thất bại");

      toast.success("Đã xoá thành công");
      type === "department" ? fetchDepartments() : fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Lỗi khi xoá");
    }
  }

  async function handleAddType(e) {
    e.preventDefault();

    const url = addType === "department" ? "/api/departments" : "/api/roles";

    // Nếu đang thêm vai trò mà chưa chọn bộ phận → báo lỗi
    if (addType === "role" && !selectedDepartment) {
      toast.error("Vui lòng chọn bộ phận");
      return;
    }

    const payload =
      addType === "department"
        ? { name: newName }
        : { name: newName, department_id: selectedDepartment };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thêm thất bại");

      toast.success("Đã thêm thành công");
      setOpenAddType(false);
      setNewName("");
      setSelectedDepartment("");
      addType === "department" ? fetchDepartments() : fetchRoles();
    } catch (err) {
      toast.error(err?.message || "Lỗi khi thêm mới");
    }
  }

  const handleSave = async () => {
    try {
      if (!selectedStaff?._id) return;

      const formData = new FormData();

      // Thêm tất cả field (trừ avatar_url vì xử lý riêng)
      for (const key in form) {
        if (key === "attachments") {
          formData.append("attachments", JSON.stringify([]));
        } else if (
          key !== "avatar_url" &&
          key !== "newAttachmentName" &&
          key !== "newAttachmentUrl"
        ) {
          formData.append(key, form[key] ?? "");
        }
      }

      // Xử lý avatar
      if (avatarFile) {
        // Có avatar mới → upload file
        formData.append("avatar", avatarFile);
      } else if (form.avatar_url && !form.avatar_url.startsWith("blob:")) {
        // Không có avatar mới → dùng avatar_url cũ nếu có
        formData.append("avatar_url", form.avatar_url);
      }
      // Nếu avatar_url rỗng → không gửi → API giữ nguyên avatar cũ

      const res = await fetch(`/api/staff/${selectedStaff._id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Cập nhật thất bại");

      toast.success("Cập nhật thành công");
      setOpenDialog(false);
      fetchList();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Lỗi khi lưu thay đổi");
    }
  };

  // Staff CRUD ------------------------------------------------------

  function openAdd() {
    setIsEditing(false);
    setSelectedStaff(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      gender: "other",
      avatarUrl: "",
      role: "",
      status: "active",
      note: "",
      password: "",
      department: "",
    });
    setOpenDialog(true);
  }

  async function openEdit(st) {
    const staffId = st._id;
    if (!staffId) {
      toast.error("ID nhân sự không hợp lệ");
      return;
    }

    setIsEditing(true);
    setSelectedStaff(st);
    setAvatarPreview(st.avatar_url || "");
    setAvatarFile(null);

    try {
      const res = await fetch(`/api/staff/${staffId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không lấy được thông tin nhân sự");
      }

      const staff = data.data; // API trả về object

      // Map dữ liệu API về form
      setForm({
        username: staff.user_id?.username || "",
        email: staff.user_id?.email || "",
        phone: staff.user_id?.phone || "",
        role_id: staff.role_id?._id || "",
        status: staff.user_id?.status || "active",
        full_name: staff.full_name || "",
        dob: staff.dob ? staff.dob.slice(0, 10) : "",
        gender: staff.gender || "other",
        citizen_id: staff.citizen_id || "",
        citizen_issue_date: staff.citizen_issue_date
          ? staff.citizen_issue_date.slice(0, 10)
          : "",
        citizen_issue_place: staff.citizen_issue_place || "",
        address: staff.address || "",
        permanent_address: staff.permanent_address || "",
        department_id: staff.department_id?._id || "",
        position: staff.position || "",
        start_date: staff.start_date ? staff.start_date.slice(0, 10) : "",
        end_date: staff.end_date ? staff.end_date.slice(0, 10) : "",
        contract_type: staff.contract_type || "fulltime",
        salary_base: staff.salary_base || "",
        salary_allowance: staff.salary_allowance || "",
        bank_name: staff.bank_name || "",
        bank_account: staff.bank_account || "",
        avatar_url: staff.avatar_url || "",
        attachments: staff.attachments || [],
        note: staff.note || "",
        newAttachmentName: "",
        newAttachmentUrl: "",
      });

      setOpenDialog(true);
    } catch (err) {
      toast.error(err?.message || "Lỗi khi mở chỉnh sửa");
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = isEditing
        ? `/api/staff/${selectedStaff._id || selectedStaff.id}`
        : `/api/staff`;
      const method = isEditing ? "PUT" : "POST";

      const payload = { ...form };
      if (isEditing && (!payload.password || payload.password.length === 0))
        delete payload.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thao tác thất bại");

      toast.success(isEditing ? "Cập nhật thành công" : "Tạo thành công");
      setOpenDialog(false);
      fetchList();
    } catch (err) {
      toast.error(err?.message || "Lỗi khi lưu");
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xoá thất bại");

      toast.success("Đã xoá nhân sự");
      fetchList();
    } catch (err) {
      toast.error(err?.message || "Lỗi khi xoá");
    }
  }
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // UI ------------------------------------------------------

  return (
    <div className="p-6 space-y-6">
      <Toaster />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Quản lý Nhân sự</h1>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 🟣 Bộ lọc theo Bộ phận */}
          <Select onValueChange={setFilterDept} value={filterDept}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo bộ phận" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bộ phận</SelectItem>
              {departments.map((d) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between px-2"
                >
                  <SelectItem value={d._id}>{d.name}</SelectItem>
                  <button
                    className="text-red-500 ml-2 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteType("department", d._id);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setAddType("department");
                  setOpenAddType(true);
                }}
              >
                ➕ Thêm bộ phận
              </Button>
            </SelectContent>
          </Select>

          {/* 🟣 Bộ lọc theo Vai trò */}
          <Select onValueChange={setFilterRole} value={filterRole}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {roles.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between px-2"
                >
                  <SelectItem value={r._id}>{r.name}</SelectItem>
                  <button
                    className="text-red-500 ml-2 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteType("role", r._id);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setAddType("role");
                  setOpenAddType(true);
                }}
              >
                ➕ Thêm vai trò
              </Button>
            </SelectContent>
          </Select>

          <Button onClick={openAdd} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Thêm nhân sự
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border rounded-2xl">
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : staffs.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Chưa có nhân sự
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bộ phận</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.full_name} />
                          ) : (
                            <span>{s.full_name?.charAt(0) || "?"}</span>
                          )}
                        </div>
                      </Avatar>
                      <div>
                        <span className="font-medium">{s.full_name}</span>
                        <p className="text-sm text-muted-foreground">
                          {s.phone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{s.email || "—"}</TableCell>
                    <TableCell>{s.department?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.role?.name || "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "active" ? "default" : "secondary"
                        }
                      >
                        {s.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openView(s)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xoá nhân sự{" "}
                              <strong>{s.full_name}</strong>? Hành động này
                              không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(s.id || s._id)}
                            >
                              Xoá
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm nhân sự */}
      <Dialog open={openDialog && !isEditing} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm nhân sự mới</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                required
                value={form.phone}
                onChange={(e) => {
                  const p = e.target.value;
                  setForm({ ...form, phone: p, password: p });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Mật khẩu sẽ được đặt giống số điện thoại
              </p>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Huỷ
              </Button>
              <Button type="submit">Tạo mới</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openAddType} onOpenChange={setOpenAddType}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {addType === "department" ? "Thêm bộ phận" : "Thêm vai trò"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddType} className="space-y-4 mt-3">
            {/* NAME INPUT */}
            <Label>
              Tên {addType === "department" ? "bộ phận" : "vai trò"}
            </Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nhập tên..."
              required
            />

            {/* SELECT DEPARTMENT WHEN ADD ROLE */}
            {addType === "role" && (
              <div className="space-y-2">
                <Label>Thuộc bộ phận</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger>
                    <span>
                      {selectedDepartment
                        ? departments.find((d) => d._id === selectedDepartment)
                            ?.name
                        : "Chọn bộ phận"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAddType(false)}
              >
                Huỷ
              </Button>
              <Button type="submit">Thêm</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="  z-10 p-4 border-b ">
            <DialogTitle>Thông tin nhân sự</DialogTitle>
            <Button
              size="sm"
              className="absolute top-5 right-12"
              onClick={() => {
                setOpenViewDialog(false);
                openEdit(selectedStaff);
              }}
            >
              Sửa thông tin
            </Button>
          </DialogHeader>

          {selectedStaff && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {/* ----------------- Tài khoản hệ thống ----------------- */}
              <div className="md:col-span-2 font-semibold border-b pb-2">
                Tài khoản hệ thống
              </div>
              <div>
                <strong>Username:</strong> {selectedStaff.user?.username || "—"}
              </div>
              <div>
                <strong>Email:</strong> {selectedStaff.user?.email || "—"}
              </div>
              <div>
                <strong>Số điện thoại:</strong>{" "}
                {selectedStaff.user?.phone || "—"}
              </div>
              <div>
                <strong>Vai trò:</strong> {selectedStaff.role?.name || "—"}
              </div>
              <div>
                <strong>Trạng thái:</strong> {selectedStaff.user?.status || "—"}
              </div>

              {/* ----------------- Thông tin cá nhân ----------------- */}
              <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
                Thông tin cá nhân
              </div>
              <div>
                <strong>Họ và tên:</strong> {selectedStaff.full_name || "—"}
              </div>
              <div>
                <strong>Ngày sinh:</strong>{" "}
                {selectedStaff.dob
                  ? new Date(selectedStaff.dob).toLocaleDateString()
                  : "—"}
              </div>
              <div>
                <strong>Giới tính:</strong> {selectedStaff.gender || "—"}
              </div>
              <div>
                <strong>CMND/CCCD:</strong> {selectedStaff.citizen_id || "—"}
              </div>
              <div>
                <strong>Ngày cấp:</strong>{" "}
                {selectedStaff.citizen_issue_date
                  ? new Date(
                      selectedStaff.citizen_issue_date
                    ).toLocaleDateString()
                  : "—"}
              </div>
              <div>
                <strong>Nơi cấp:</strong>{" "}
                {selectedStaff.citizen_issue_place || "—"}
              </div>
              <div>
                <strong>Địa chỉ hiện tại:</strong>{" "}
                {selectedStaff.address || "—"}
              </div>
              <div>
                <strong>Địa chỉ thường trú:</strong>{" "}
                {selectedStaff.permanent_address || "—"}
              </div>

              {/* ----------------- Công việc ----------------- */}
              <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
                Công việc
              </div>
              <div>
                <strong>Bộ phận:</strong>{" "}
                {selectedStaff.department?.name || "—"}
              </div>
              <div>
                <strong>Vị trí:</strong> {selectedStaff.position || "—"}
              </div>
              <div>
                <strong>Ngày bắt đầu:</strong>{" "}
                {selectedStaff.start_date
                  ? new Date(selectedStaff.start_date).toLocaleDateString()
                  : "—"}
              </div>
              <div>
                <strong>Ngày kết thúc:</strong>{" "}
                {selectedStaff.end_date
                  ? new Date(selectedStaff.end_date).toLocaleDateString()
                  : "—"}
              </div>
              <div>
                <strong>Loại hợp đồng:</strong>{" "}
                {selectedStaff.contract_type || "—"}
              </div>

              {/* ----------------- Lương ----------------- */}
              <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
                Lương
              </div>
              <div>
                <strong>Lương cơ bản:</strong>{" "}
                {selectedStaff.salary_base || "—"}
              </div>
              <div>
                <strong>Phụ cấp:</strong>{" "}
                {selectedStaff.salary_allowance || "—"}
              </div>
              <div>
                <strong>Ngân hàng:</strong> {selectedStaff.bank_name || "—"}
              </div>
              <div>
                <strong>Số tài khoản:</strong>{" "}
                {selectedStaff.bank_account || "—"}
              </div>

              {/* ----------------- Hồ sơ ----------------- */}
              <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
                Hồ sơ
              </div>
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <strong>Avatar:</strong>
                  {selectedStaff.avatar_url ? (
                    <img
                      src={selectedStaff.avatar_url}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    "—"
                  )}
                </div>

                {selectedStaff.attachments &&
                selectedStaff.attachments.length > 0 ? (
                  <div>
                    <strong>Attachments:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      {selectedStaff.attachments.map((att, idx) => (
                        <li key={idx}>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {att.name || att.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <strong>Attachments:</strong> —
                  </div>
                )}
              </div>

              {/* ----------------- Ghi chú ----------------- */}
              <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
                Ghi chú
              </div>
              <div className="md:col-span-2">{selectedStaff.note || "—"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog chỉnh sửa nhân sự */}
      <Dialog open={openDialog && isEditing} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className=" top-0 z-10 p-4 border-b flex justify-between items-center">
            <DialogTitle>Chỉnh sửa thông tin nhân sự</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* ----------------- Tài khoản hệ thống ----------------- */}
            <div className="md:col-span-2 font-semibold border-b pb-2">
              Tài khoản hệ thống
            </div>
            <div>
              <Label>Username</Label>
              <Input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* ----------------- Thông tin cá nhân ----------------- */}
            <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
              Thông tin cá nhân
            </div>
            <div>
              <Label>Họ và tên</Label>
              <Input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Ngày sinh</Label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>
            <div>
              <Label>Giới tính</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>CMND/CCCD</Label>
              <Input
                value={form.citizen_id}
                onChange={(e) =>
                  setForm({ ...form, citizen_id: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Ngày cấp</Label>
              <Input
                type="date"
                value={form.citizen_issue_date}
                onChange={(e) =>
                  setForm({ ...form, citizen_issue_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Nơi cấp</Label>
              <Input
                value={form.citizen_issue_place}
                onChange={(e) =>
                  setForm({ ...form, citizen_issue_place: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Địa chỉ hiện tại</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Địa chỉ thường trú</Label>
              <Input
                value={form.permanent_address}
                onChange={(e) =>
                  setForm({ ...form, permanent_address: e.target.value })
                }
              />
            </div>

            {/* ----------------- Công việc ----------------- */}
            <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
              Công việc
            </div>
            <div>
              <Label>Bộ phận</Label>
              <Select
                value={form.department_id}
                onValueChange={(v) => setForm({ ...form, department_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bộ phận" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vai trò</Label>
              <Select
                value={form.role_id}
                onValueChange={(v) => setForm({ ...form, role_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vị trí</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div>
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Loại hợp đồng</Label>
              <Select
                value={form.contract_type}
                onValueChange={(v) => setForm({ ...form, contract_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hợp đồng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Fulltime</SelectItem>
                  <SelectItem value="parttime">Parttime</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ----------------- Lương ----------------- */}
            <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
              Lương
            </div>
            <div>
              <Label>Lương cơ bản</Label>
              <Input
                type="number"
                value={form.salary_base}
                onChange={(e) =>
                  setForm({ ...form, salary_base: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phụ cấp</Label>
              <Input
                type="number"
                value={form.salary_allowance}
                onChange={(e) =>
                  setForm({ ...form, salary_allowance: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Ngân hàng</Label>
              <Input
                value={form.bank_name}
                onChange={(e) =>
                  setForm({ ...form, bank_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Số tài khoản</Label>
              <Input
                value={form.bank_account}
                onChange={(e) =>
                  setForm({ ...form, bank_account: e.target.value })
                }
              />
            </div>

            {/* ----------------- Hồ sơ ----------------- */}
            <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
              Hồ sơ
            </div>

            {/* Avatar */}
            <div className="md:col-span-2 space-y-2">
              <Label>Avatar nhân sự</Label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }}
              />

              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover mt-2"
                />
              )}
            </div>

            {/* Attachments */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <Label>Attachments</Label>
              {form.attachments && form.attachments.length > 0 && (
                <ul className="list-disc ml-6">
                  {form.attachments.map((att, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{att.name || att.url}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const newAttachments = [...form.attachments];
                          newAttachments.splice(idx, 1);
                          setForm({ ...form, attachments: newAttachments });
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Thêm mới attachment */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Tên file"
                  value={form.newAttachmentName || ""}
                  onChange={(e) =>
                    setForm({ ...form, newAttachmentName: e.target.value })
                  }
                />
                <Input
                  placeholder="URL"
                  value={form.newAttachmentUrl || ""}
                  onChange={(e) =>
                    setForm({ ...form, newAttachmentUrl: e.target.value })
                  }
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (!form.newAttachmentName || !form.newAttachmentUrl)
                      return;
                    const newAtt = {
                      name: form.newAttachmentName,
                      url: form.newAttachmentUrl,
                    };
                    setForm({
                      ...form,
                      attachments: [...(form.attachments || []), newAtt],
                      newAttachmentName: "",
                      newAttachmentUrl: "",
                    });
                  }}
                >
                  Thêm
                </Button>
              </div>
            </div>

            {/* ----------------- Ghi chú ----------------- */}
            <div className="md:col-span-2 font-semibold border-b pb-2 mt-4">
              Ghi chú
            </div>
            <div className="md:col-span-2">
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Huỷ
              </Button>
              <Button onClick={handleSave}>Lưu thay đổi</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
