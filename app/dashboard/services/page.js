"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [removedImages, setRemovedImages] = useState([]);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    minPrice: "",
    maxPrice: "",
    unit: "",
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);

  async function fetchServices() {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(Array.isArray(data.data) ? data.data : []);
  }

  async function fetchCategories() {
    const res = await fetch("/api/service-categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // 🔹 Upload nhiều ảnh và xem trước
  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    setForm({ ...form, images: files });
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  }

  // 🔹 Thêm / sửa dịch vụ
  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingService ? "PATCH" : "POST";
    const url = editingService
      ? `/api/services/${editingService._id}`
      : "/api/services";

    const formData = new FormData();
    formData.append("category_id", form.category_id);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("minPrice", form.minPrice);
    formData.append("maxPrice", form.maxPrice);
    formData.append("unit", form.unit);

    // Ảnh cũ còn lại
    formData.append("remainingImages", JSON.stringify(previewImages));

    // Ảnh mới upload
    form.images.forEach((file) => formData.append("images", file));

    const res = await fetch(url, { method, body: formData });

    if (res.ok) {
      toast.success(
        editingService ? "Cập nhật thành công!" : "Thêm dịch vụ thành công!"
      );
      setShowModal(false);
      setEditingService(null);
      setForm({
        category_id: "",
        name: "",
        description: "",
        minPrice: "",
        maxPrice: "",
        unit: "",
        images: [],
      });
      setPreviewImages([]);
      fetchServices();
    } else {
      toast.error("Thao tác thất bại!");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa dịch vụ!");
      fetchServices();
    } else toast.error("Xóa thất bại!");
  }

  function openAddModal() {
    setEditingService(null);
    setForm({
      category_id: "",
      name: "",
      description: "",
      minPrice: "",
      maxPrice: "",
      unit: "",
      images: [],
    });
    setPreviewImages([]);
    setShowModal(true);
  }

  function openEditModal(service) {
    setEditingService(service);
    setForm({
      category_id: service.category_id?._id || "",
      name: service.name || "",
      description: service.description || "",
      minPrice: service.minPrice || "",
      maxPrice: service.maxPrice || "",
      unit: service.unit || "",
      images: [],
    });
    setPreviewImages(service.images || []);
    setShowModal(true);
  }

  function openImagesModal(images) {
    setCurrentImages(images);
    setRemovedImages([]);
    setShowImagesModal(true);
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }

    const res = await fetch("/api/service-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });

    if (res.ok) {
      toast.success("Thêm danh mục thành công!");
      setShowAddCategoryModal(false);
      setNewCategoryName("");
      await fetchCategories();
    } else {
      toast.error("Không thể thêm danh mục!");
    }
  }

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category_id?._id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📋 Danh sách dịch vụ</h1>

        <div className="flex gap-2 items-center">
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              if (val === "add") {
                setShowAddCategoryModal(true);
                return;
              }
              setSelectedCategory(val);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
              <SelectItem value="add">➕ Thêm danh mục mới</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={openAddModal}>➕ Thêm dịch vụ</Button>
        </div>
      </div>

      <ul className="space-y-4">
        {filteredServices.map((s) => (
          <li key={s._id} className="p-4 border rounded-lg bg-white shadow">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="text-gray-600">{s.description}</p>
            <p className="mt-1 font-medium">
              Giá: {s.minPrice?.toLocaleString()} -{" "}
              {s.maxPrice?.toLocaleString()} {s.unit}
            </p>
            <p className="text-gray-500">
              Danh mục: {s.category_id?.name || "Chưa có"}
            </p>

            {s.images && s.images.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => openImagesModal(s.images)}
              >
                📷 Xem ảnh
              </Button>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditModal(s)}
              >
                ✏️ Sửa
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(s._id)}
              >
                🗑️ Xóa
              </Button>
            </div>
          </li>
        ))}
        {filteredServices.length === 0 && (
          <li className="p-4 text-gray-500">
            Không có dịch vụ nào trong danh mục này.
          </li>
        )}
      </ul>

      {/* Modal Thêm / Sửa dịch vụ */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <Label>Danh mục</Label>
            <Select
              value={form.category_id}
              onValueChange={(val) => setForm({ ...form, category_id: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Tên dịch vụ</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Label>Mô tả</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Giá tối thiểu</Label>
                <Input
                  type="number"
                  value={form.minPrice}
                  onChange={(e) =>
                    setForm({ ...form, minPrice: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Giá tối đa</Label>
                <Input
                  type="number"
                  value={form.maxPrice}
                  onChange={(e) =>
                    setForm({ ...form, maxPrice: e.target.value })
                  }
                />
              </div>
            </div>

            <Label>Đơn vị</Label>
            <Input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />

            <Label>Ảnh dịch vụ</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...previewImages];
                        newImages.splice(idx, 1);
                        setPreviewImages(newImages);

                        const removed = [...removedImages, src];
                        setRemovedImages(removed);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 text-xs rounded opacity-80 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" className="w-full">
                {editingService ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal xem ảnh */}
      <Dialog open={showImagesModal} onOpenChange={setShowImagesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hình ảnh dịch vụ</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {currentImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Ảnh ${idx + 1}`}
                className="w-full h-40 object-cover rounded"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal thêm danh mục mới */}
      <Dialog
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Label>Tên danh mục</Label>
            <Input
              placeholder="Nhập tên danh mục..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <DialogFooter>
              <Button className="w-full" onClick={handleAddCategory}>
                Thêm
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
