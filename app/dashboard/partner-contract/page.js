"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Calendar as CalendarIcon, Pencil, Ban } from "lucide-react";
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function PartnerContractPage() {
  const [contracts, setContracts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    partner_id: "",
    title: "",
    start_date: "",
    end_date: "",
    total_value: "",
    status: "draft",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // File state
  const [selectedFile, setSelectedFile] = useState(null);

  const [eventContracts, setEventContracts] = useState([]);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  
  // Cancel dialog state
  const [cancelId, setCancelId] = useState(null);

  const resetForm = () => {
    setFormData({
        partner_id: "",
        event_contract_id: "",
        title: "",
        start_date: "",
        end_date: "",
        total_value: "",
        status: "draft",
        notes: ""
    });
    setSelectedFile(null);
    setEditingId(null);
  }

  const handleEdit = (contract) => {
      setEditingId(contract._id);
      setFormData({
          partner_id: contract.partner_id?._id || "",
          event_contract_id: contract.event_contract_id?._id || "",
          title: contract.title,
          start_date: contract.start_date ? contract.start_date.split('T')[0] : "",
          end_date: contract.end_date ? contract.end_date.split('T')[0] : "",
          total_value: contract.total_value,
          status: contract.status,
          notes: contract.notes || ""
      });
      setIsDialogOpen(true);
  };

  const handleCancelContract = async () => {
      if (!cancelId) return;
      try {
          const res = await fetch("/api/partner-contracts", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ _id: cancelId, status: "terminated" })
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Đã hủy hợp đồng");
              fetchData();
          } else {
              toast.error(data.message);
          }
      } catch (err) {
          toast.error("Lỗi khi hủy hợp đồng");
      } finally {
          setCancelId(null);
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, partnersRes, eventContractsRes] = await Promise.all([
        fetch("/api/partner-contracts"),
        fetch("/api/partners"),
        fetch("/api/event-contracts")
      ]);
      
      const contractsData = await contractsRes.json();
      const partnersData = await partnersRes.json();
      const eventContractsData = await eventContractsRes.json();

      if (contractsData.success) setContracts(contractsData.data || []);
      if (partnersData.success) setPartners(partnersData.data || []); 
      if (eventContractsData.success) setEventContracts(eventContractsData.data || []);
      
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => 
    c.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.partner_id?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partner_id || !formData.title || !formData.start_date || !formData.end_date) {
      toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);
      let fileUrl = "";

      // 1. Upload file if exists
      if (selectedFile) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", selectedFile);
          
          const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
              fileUrl = uploadData.data.url;
          } else {
              toast.error("Lỗi upload file: " + uploadData.message);
              setSubmitting(false);
              return;
          }
      }

      // 2. Create or Update Contract
      const payload = { ...formData };
      if (fileUrl) payload.contract_file_url = fileUrl;
      if (editingId) payload._id = editingId;

      const method = editingId ? "PATCH" : "POST";

      const res = await fetch("/api/partner-contracts", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Cập nhật thành công" : "Tạo hợp đồng thành công");
        setIsDialogOpen(false);
        fetchData(); 
        resetForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Quản lý Hợp đồng Đối tác"
        description="Theo dõi và quản lý các hợp đồng với nhà cung cấp"
      >
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} variant="glass" size="lg">
          <Plus className="w-4 h-4" />
          Tạo hợp đồng
        </Button>
      </PageHeader>


      <Card variant="premium" className="animate-slide-up">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Tìm kiếm mã HĐ, tiêu đề, đối tác..."
                className="pl-10 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Đối tác</TableHead>
                <TableHead>HĐ Khách Hàng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={8} className="text-center h-24">Đang tải...</TableCell>
                 </TableRow>
              ) : filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-gray-500">Chưa có hợp đồng nào</TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow key={contract._id}>
                    <TableCell className="font-medium font-mono">{contract.contract_number}</TableCell>
                    <TableCell>
                        <div className="font-medium">{contract.title}</div>
                        {contract.contract_file_url && <a href={contract.contract_file_url} target="_blank" className="text-xs text-blue-500 hover:underline">Xem file</a>}
                    </TableCell>
                    <TableCell>{contract.partner_id?.company_name || 'N/A'}</TableCell>
                    <TableCell>
                        {contract.event_contract_id ? (
                            <Badge variant="outline" className="font-mono text-xs">
                                {contract.event_contract_id.contract_number}
                            </Badge>
                        ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                        <div className="flex flex-col">
                            <span>{format(new Date(contract.start_date), 'dd/MM/yyyy')}</span>
                            <span className="text-gray-400 text-xs">đến {format(new Date(contract.end_date), 'dd/MM/yyyy')}</span>
                        </div>
                    </TableCell>
                    <TableCell>{contract.total_value ? Number(contract.total_value).toLocaleString('vi-VN') + ' đ' : '-'}</TableCell>
                    <TableCell>
                        <Badge variant={
                      contract.status === 'active' ? 'success' : 
                      contract.status === 'expired' ? 'destructive' : 
                      contract.status === 'draft' ? 'warning' : 'secondary'
                    }>
                            {contract.status === 'active' ? '✓ Đang hiệu lực' : 
                             contract.status === 'expired' ? '✕ Hết hạn' : 
                             contract.status === 'draft' ? '○ Nháp' : '⊗ Đã hủy'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">{format(new Date(contract.createdAt), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                             <Button variant="outline" size="sm" onClick={() => handleEdit(contract)}>
                                <Pencil className="w-3 h-3" />
                                Sửa
                            </Button>
                            {contract.status !== 'terminated' && (
                                <Button variant="destructive" size="sm" onClick={() => setCancelId(contract._id)}>
                                    <Ban className="w-3 h-3" />
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Cập Nhật Hợp Đồng" : "Tạo Hợp Đồng Mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Hợp đồng khách hàng (Tùy chọn)</label>
                <Select 
                    value={formData.event_contract_id} 
                    onValueChange={(val) => setFormData({...formData, event_contract_id: val})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn hợp đồng sự kiện liên quan" />
                    </SelectTrigger>
                    <SelectContent>
                        {eventContracts.map(ec => (
                            <SelectItem key={ec._id} value={ec._id}>
                             {ec.contract_number} - {ec.party_a?.name || "Khách hành"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Đối tác</label>
                <Select 
                    value={formData.partner_id} 
                    onValueChange={(val) => setFormData({...formData, partner_id: val})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn đối tác" />
                    </SelectTrigger>
                    <SelectContent>
                        {partners.map(p => (
                            <SelectItem key={p._id} value={p._id}>{p.company_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề hợp đồng</label>
                <Input 
                    placeholder="VD: Hợp đồng cung cấp âm thanh" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày bắt đầu</label>
                    <Input 
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày kết thúc</label>
                    <Input 
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Giá trị HĐ (VNĐ)</label>
                    <Input 
                        type="number"
                        placeholder="0"
                        value={formData.total_value}
                        onChange={(e) => setFormData({...formData, total_value: e.target.value})}
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select 
                        value={formData.status} 
                        onValueChange={(val) => setFormData({...formData, status: val})}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Nháp</SelectItem>
                            <SelectItem value="active">Hiệu lực</SelectItem>
                            <SelectItem value="expired">Hết hạn</SelectItem>
                            <SelectItem value="terminated">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="space-y-2">
                <label className="text-sm font-medium">File hợp đồng (PDF, Word, Image)</label>
                <Input 
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <Textarea 
                    placeholder="Ghi chú thêm..." 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo hợp đồng')}
                </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
