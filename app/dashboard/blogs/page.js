"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import CreateDialog from "./create-dialog";
import EditDialog from "./edit-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminBlogsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBlogs(Array.isArray(data?.data) ? data?.data : []);
    } catch (err) {
      console.error(err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    if (!q) return blogs;
    const s = q.toLowerCase();
    return blogs.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(s) ||
        (b.category || "").toLowerCase().includes(s)
    );
  }, [q, blogs]);

  async function handleDelete(id) {
    if (!confirm("Xóa bài viết này?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa");
    }
  }

  async function togglePublish(blog) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !blog.published }),
      });
      if (res.ok) {
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blog.id ? { ...b, published: !b.published } : b
          )
        );
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật");
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Quản lý bài viết"
        description="Quản lý nội dung blog và bài viết"
      >
        <div className="flex gap-3 items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc chuyên mục"
            className="w-64 border-white/50 bg-white/80"
          />
          <Button
            onClick={() => {
              setOpenDialog(true);
            }}
            variant="glass"
            size="lg"
          >
            Tạo mới
          </Button>
          <CreateDialog
            open={openDialog}
            setOpen={setOpenDialog}
            onSuccess={fetchList}
          />
        </div>
      </PageHeader>

      <Card className="shadow-sm border rounded-2xl">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredData?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Không có bài viết.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Đoạn trích</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((b) => (
                  <TableRow key={b?._id || b?.id}>
                    <TableCell>{b?.title}</TableCell>
                    <TableCell>{b.category}</TableCell>
                    <TableCell>{b?.excerpt || ""}</TableCell>
                    <TableCell>{b?.published ? "Công khai" : "Nháp"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOpenEdit(true)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <EditDialog
                        open={openEdit}
                        setOpen={setOpenEdit}
                        blog={b}
                        onSuccess={fetchList}
                      />

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
                              Bạn có chắc muốn xoá bài viết này không? Hành động
                              này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(b?._id || b?.id)}
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
      {/* 
      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : filtered().length === 0 ? (
        <div className="text-gray-600">Không có bài viết.</div>
      ) : (
        <div className="grid gap-3">
          {filtered().map((b) => (
            <div
              key={b.id}
              className="p-3 border rounded-lg bg-white flex items-start justify-between"
            >
              <div>
                <h2 className="font-semibold">{b.title}</h2>
                <p className="text-sm text-gray-600">
                  {b.category} • {b.author || "—"}
                </p>
                <p className="text-sm mt-1 text-gray-700">{b.excerpt || ""}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/blogs/${b.id}/edit`)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Xóa
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <label className="text-gray-600">Đã đăng</label>
                  <button
                    onClick={() => togglePublish(b)}
                    className={`px-2 py-1 rounded text-sm ${
                      b.published ? "bg-green-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    {b.published ? "Bật" : "Tắt"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
