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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    minPrice: "",
    maxPrice: "",
    unit: "",
    type: "Hội nghị",
    images: [], // Kept for compatibility if needed, but handled by imageFiles primarily
  });

  const [imageFiles, setImageFiles] = useState([]); // { file, preview, isExisting }

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
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));

    setImageFiles(prev => [...prev, ...newImages]);
    
    // Reset inputs value to allow selecting same file again if needed
    e.target.value = "";
  }
  
  function handleRemoveImage(index) {
     setImageFiles(prev => prev.filter((_, i) => i !== index));
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
    formData.append("type", form.type);

    // Ảnh cũ còn lại (chỉ lấy những ảnh có isExisting = true)
    const remainingImages = imageFiles
      .filter(img => img.isExisting)
      .map(img => img.preview);
    
    formData.append("remainingImages", JSON.stringify(remainingImages));

    // Ảnh mới upload (những ảnh có file)
    const newFiles = imageFiles
      .filter(img => !img.isExisting && img.file)
      .map(img => img.file);

    newFiles.forEach((file) => formData.append("images", file));

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
        type: "Hội nghị",
        images: [],
      });
      setImageFiles([]);
      fetchServices();
    } else {
      toast.error("Thao tác thất bại!");
    }
  }

  async function handleDelete(service) {
    setServiceToDelete(service);
  }

  async function confirmDelete() {
    if (!serviceToDelete) return;
    const res = await fetch(`/api/services/${serviceToDelete._id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa dịch vụ!");
      fetchServices();
      setServiceToDelete(null);
    } else {
      toast.error("Xóa thất bại!");
    }
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
      type: "Hội nghị",
      images: [],
    });
    setImageFiles([]); // Reset
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
      type: service.type || "Hội nghị",
      images: [],
    });
    
    // Initialize existing images
    const existingIds = (service.images || []).map(url => ({
      file: null,
      preview: url,
      isExisting: true
    }));
    setImageFiles(existingIds);
    
    setShowModal(true);
  }

  function openImagesModal(images) {
    setCurrentImages(images);
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

  const filteredServices = services.filter((s) => {
    const matchCategory =
      selectedCategory === "all" || s.category_id?._id === selectedCategory;
    const matchType = selectedType === "all" || s.type === selectedType;
    return matchCategory && matchType;
  });

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <PageHeader
        title="📋 Danh sách dịch vụ"
        description="Quản lý các dịch vụ sự kiện của bạn"
      >
        <div className="flex gap-3 items-center flex-wrap">
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
            <SelectTrigger className="w-48 bg-white/80 border-white/50">
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

          <Select
            value={selectedType}
            onValueChange={(val) => setSelectedType(val)}
          >
            <SelectTrigger className="w-48 bg-white/80 border-white/50">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="Hội nghị">Hội nghị</SelectItem>
              <SelectItem value="Sự kiện đại chúng">Sự kiện đại chúng</SelectItem>
              <SelectItem value="Sự kiện công ty">Sự kiện công ty</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={openAddModal} variant="glass" size="lg">
            ➕ Thêm dịch vụ
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
        {filteredServices.map((s) => (
          <div
            key={s._id}
            className="group flex flex-col rounded-xl border border-indigo-100 bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
          >
            {s.images && s.images.length > 0 ? (
              <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                <img
                  src={s.images[0]}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-300">
                <span className="text-sm font-medium">Không có ảnh</span>
              </div>
            )}

            <div className="flex-1 p-4">
              <h2 className="font-bold text-lg line-clamp-1 text-gradient-indigo mb-2" title={s.name}>
                {s.name}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3 h-10">
                {s.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-500">Giá:</span>
                  <span className="text-lg font-bold text-gradient-primary">
                    {s.minPrice?.toLocaleString()}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-lg font-bold text-gradient-primary">
                    {s.maxPrice?.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">({s.unit})</span>
                </div>
                <p className="text-xs text-gray-500">
                  Danh mục: <span className="font-medium text-indigo-600">{s.category_id?.name || "Chưa có"}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Loại: <span className="font-medium text-indigo-600">{s.type}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-4 pt-0 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => openImagesModal(s.images)}
              >
                📷 Xem ảnh
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => openEditModal(s)}
              >
                ✏️ Sửa
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(s)}
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 border rounded-lg border-dashed">
            Không có dịch vụ nào trong danh mục này.
          </div>
        )}
      </div>

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

            <Label>Loại dịch vụ</Label>
            <Select
              value={form.type}
              onValueChange={(val) => setForm({ ...form, type: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hội nghị">Hội nghị</SelectItem>
                <SelectItem value="Sự kiện đại chúng">
                  Sự kiện đại chúng
                </SelectItem>
                <SelectItem value="Sự kiện công ty">Sự kiện công ty</SelectItem>
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

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {imageFiles.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
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

      {/* Alert Dialog xóa dịch vụ */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Dịch vụ "{serviceToDelete?.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
