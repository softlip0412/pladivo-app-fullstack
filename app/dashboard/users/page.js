"use client";

import { useEffect, useState } from "react";
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
  DialogFooter,
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
import { Toaster, toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "employee",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await fetch("/api/users", {
        method: "GET",
        credentials: "include", // ✅ gửi cookie accessToken
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Lỗi tải người dùng");

      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Fetch users failed:", err);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setIsEditing(false);
    setSelectedUser(null);
    setForm({ email: "", username: "", password: "", role: "employee" });
    setOpenDialog(true);
  }

  function openEditDialog(user) {
    setIsEditing(true);
    setSelectedUser(user);
    setForm({
      email: user.email || "",
      username: user.username || "",
      password: "",
      role: user.role || "employee",
    });
    setOpenDialog(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = isEditing
        ? `/api/users/${selectedUser._id || selectedUser.id}`
        : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include", // ✅ gửi cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Thao tác thất bại");

      toast.success(
        isEditing ? "Cập nhật thành công ✅" : "Tạo người dùng thành công 🎉"
      );

      setForm({ email: "", username: "", password: "", role: "employee" });
      setSelectedUser(null);
      setIsEditing(false);
      setOpenDialog(false);

      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  }

  async function handleDeleteUser(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include", // ✅ gửi cookie
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xoá người dùng thất bại");

      toast.success("Đã xoá người dùng 🗑️");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Toaster />

      <PageHeader
        title="Danh sách người dùng"
        description="Quản lý tài khoản người dùng hệ thống"
      >
        <Button onClick={openAddDialog} variant="glass" size="lg">
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </PageHeader>

      <Card className="shadow-sm border rounded-2xl">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Không có người dùng nào.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tên người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id || u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.status === "active" ? "default" : "secondary"
                        }
                      >
                        {u.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(u)}
                      >
                        <Pencil className="w-4 h-4" />
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
                              Bạn có chắc muốn xoá người dùng này không? Hành
                              động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(u._id || u.id)}
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

      {/* Dialog Thêm/Sửa người dùng */}
      <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tên người dùng</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mật khẩu (để trống nếu không đổi)</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Nhập mật khẩu mới nếu muốn đổi"
              />
            </div>

            <div className="space-y-2">
              <Label>Vai trò</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border rounded-md px-2 py-1"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="system_admin">System Admin</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">
                {isEditing ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
