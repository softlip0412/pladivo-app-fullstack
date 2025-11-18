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
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [services, setServices] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    partner_type: "",
    address: "",
    region: "",
    description: "",
    service: "",
  });

  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);

  // 🔹 Fetch danh sách đối tác
  async function fetchPartners() {
    const query = new URLSearchParams();
    if (filterType) query.append("type", filterType);
    if (filterRegion) query.append("region", filterRegion);

    const res = await fetch(`/api/partners?${query.toString()}`);
    const data = await res.json();
    if (data.success) {
      setPartners(data.data);

      // Lấy danh sách loại và khu vực có trong data
      const types = Array.from(new Set(data.data.map((p) => p.partner_type).filter(Boolean)));
      const regions = Array.from(new Set(data.data.map((p) => p.region).filter(Boolean)));
      setAvailableTypes(types);
      setAvailableRegions(regions);
    }
  }

  // 🔹 Fetch danh sách services
  async function fetchServices() {
    const res = await fetch("/api/services");
    const data = await res.json();
    if (data.success) {
      setServices(data.data);
    }
  }

  useEffect(() => {
    fetchPartners();
    fetchServices();
  }, [filterType, filterRegion]);

  // 🔹 Thêm hoặc cập nhật
  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingPartner ? "PATCH" : "POST";
    const body = editingPartner
      ? { id: editingPartner._id, updates: form }
      : form;

    const res = await fetch("/api/partners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editingPartner ? "Cập nhật thành công!" : "Thêm đối tác thành công!");
      setShowModal(false);
      setEditingPartner(null);
      setForm({
        company_name: "",
        partner_type: "",
        address: "",
        region: "",
        description: "",
        service: "",
      });
      fetchPartners();
    } else {
      toast.error("Thao tác thất bại!");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bạn có chắc muốn xóa đối tác này?")) return;
    const res = await fetch("/api/partners", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Đã xóa đối tác!");
      fetchPartners();
    } else {
      toast.error("Xóa thất bại!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🤝 Quản lý Đối tác</h1>
        <Button onClick={() => setShowModal(true)}>➕ Thêm đối tác</Button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-4 items-center">
        <Select
          value={filterType || "all"}
          onValueChange={(val) => setFilterType(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại đối tác" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterRegion || "all"}
          onValueChange={(val) => setFilterRegion(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Khu vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {availableRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bảng đối tác */}
      <div className="border rounded-lg mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Công ty</th>
              <th className="p-2 text-left">Loại</th>
              <th className="p-2 text-left">Khu vực</th>
              <th className="p-2 text-left">Mô tả</th>
              <th className="p-2 text-left">Dịch vụ</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2">{p.company_name}</td>
                <td className="p-2">{p.partner_type}</td>
                <td className="p-2">{p.region}</td>
                <td className="p-2">{p.description || "—"}</td>
                <td className="p-2">{p.service ? p.service.name : "—"}</td>
                <td className="p-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPartner(p);
                      setForm({
                        company_name: p.company_name,
                        partner_type: p.partner_type,
                        address: p.address,
                        region: p.region,
                        description: p.description,
                        service: p.service?._id || "",
                      });
                      setShowModal(true);
                    }}
                  >
                    ✏️ Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(p._id)}
                  >
                    🗑️ Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Không có đối tác nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? "Cập nhật đối tác" : "Thêm đối tác mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <Label>Tên công ty</Label>
            <Input
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
            />

            <Label>Loại đối tác</Label>
            <Input
              value={form.partner_type}
              onChange={(e) =>
                setForm({ ...form, partner_type: e.target.value })
              }
            />

            <Label>Địa chỉ</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <Label>Khu vực</Label>
            <Input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />

            <Label>Mô tả</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <Label>Dịch vụ</Label>
            <Select
              value={form.service || "none"}
              onValueChange={(val) =>
                setForm({ ...form, service: val === "none" ? "" : val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Chưa chọn</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button type="submit" className="w-full">
                {editingPartner ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
