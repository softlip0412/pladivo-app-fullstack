"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ShoppingCart, Plus, Check, X, Search, AlertCircle, Calendar, MapPin, Filter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export default function TicketSalesPage() {
  const [sales, setSales] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ticketConfig, setTicketConfig] = useState(null);
  
  const [formData, setFormData] = useState({
    booking_id: "",
    ticket_type: "",
    ticket_area: "",
    quantity: "",
    unit_price: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBooking, setFilterBooking] = useState("all");

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    desc: "",
    action: null,
    variant: "default"
  });

  // Fetch Data
  useEffect(() => {
    fetchSales();
    fetchBookings();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, search, filterStatus, filterBooking]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ticket-orders");
      const data = await res.json();
      if (data.success) {
        setSales(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      toast.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        const activeEvents = (data.bookings || []).filter(b => b.ticket_sale === true);
        setBookings(activeEvents);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const filterSales = () => {
    let result = [...sales];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.order_code?.toLowerCase().includes(lowerSearch) ||
          s.customer_name?.toLowerCase().includes(lowerSearch) ||
          s.customer_phone?.includes(lowerSearch) ||
          s.booking_id?.event_type?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((s) => s.payment_status === filterStatus);
    }

    if (filterBooking !== "all") {
        result = result.filter((s) => s.booking_id?._id === filterBooking);
    }

    setFilteredSales(result);
  };

  // Handle Form Change (Config Fetching)
  useEffect(() => {
    if (!formData.booking_id) {
        setTicketConfig(null);
        return;
    }
    
    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/ticket-sale-config?booking_id=${formData.booking_id}`);
            const data = await res.json();
            if (data.success) {
                setTicketConfig(data.data);
            } else {
                setTicketConfig(null);
            }
        } catch (e) {
            console.error("Error fetching config", e);
        }
    };
    fetchConfig();
  }, [formData.booking_id]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, ticket_type: "", ticket_area: "", unit_price: "" }));
  }, [formData.booking_id]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, ticket_area: "" }));
     if(ticketConfig && formData.ticket_type) {
         const type = ticketConfig.ticket_types.find(t => t.type === formData.ticket_type);
         if(type) {
             setFormData(prev => ({ ...prev, unit_price: type.price }));
         }
     }
  }, [formData.ticket_type, ticketConfig]);


  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.booking_id || !formData.ticket_type || !formData.ticket_area || !formData.quantity || !formData.customer_name || !formData.customer_phone || !formData.customer_email) {
      toast.warning("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ticket-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Tạo đơn vé thành công! Email đã được gửi.");
        setSales([data.data, ...sales]);
        setIsFormOpen(false);
        setFormData({
            booking_id: "",
            ticket_type: "",
            ticket_area: "",
            quantity: "",
            unit_price: "",
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            notes: "",
        });
      } else {
        toast.error(data.message || "Lỗi tạo đơn hàng");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatusTrigger = (saleId, status) => {
      if (status === 'paid') {
          setConfirmDialog({
              open: true,
              title: "Xác nhận thu tiền",
              desc: "Bạn có chắc chắn muốn xác nhận đã thu tiền? Hệ thống sẽ gửi vé điện tử đến email khách hàng.",
              action: () => processUpdateStatus(saleId, status),
              variant: "default"
          });
      } else if (status === 'cancelled') {
           setConfirmDialog({
              open: true,
              title: "Xác nhận hủy đơn",
              desc: "Bạn có chắc chắn muốn hủy đơn vé này không?",
              action: () => processUpdateStatus(saleId, status),
              variant: "destructive"
          });
      }
  };

  const processUpdateStatus = async (saleId, newStatus) => {
    try {
      setLoading(true); // Can use clearer loading state if needed
      const res = await fetch(`/api/ticket-orders/${saleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setSales(sales.map((s) => (s._id === saleId ? data.data : s)));
        toast.success(newStatus === 'paid' ? "Đã xác nhận thanh toán & gửi vé!" : "Đã hủy đơn hàng");
      } else {
        toast.error(data.message || "Lỗi cập nhật trạng thái");
      }
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    } finally {
        setLoading(false);
        setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const getTicketTypes = () => ticketConfig?.ticket_types || [];
  const getAreas = () => {
      if(!formData.ticket_type || !ticketConfig) return [];
      const type = ticketConfig.ticket_types.find(t => t.type === formData.ticket_type);
      return type?.seating_areas || [];
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="🎫 Quản Lý Đơn Vé"
        description="Theo dõi bán vé và tạo đơn mới"
      >
        <Button onClick={() => setIsFormOpen(true)} variant="glass" size="lg">
          <Plus className="w-4 h-4" />
          Tạo đơn mới
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
              <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-green-600">
                      {(sales.reduce((acc, curr) => curr.payment_status === 'paid' ? acc + (curr.total_price || 0) : acc, 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </p>
              </CardContent>
          </Card>
           <Card>
              <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Vé đã bán</p>
                  <p className="text-2xl font-bold text-blue-600">
                      {sales.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}
                  </p>
              </CardContent>
          </Card>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
                placeholder="Tìm kiếm khách hàng, mã đơn..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        
        {/* Booking Filter */}
        <Select value={filterBooking} onValueChange={setFilterBooking}>
            <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Lọc theo sự kiện" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả sự kiện</SelectItem>
                {bookings.map(b => (
                     <SelectItem key={b._id} value={b._id}>
                        {b.event_type} ({format(new Date(b.event_date), 'dd/MM/yyyy')})
                     </SelectItem>
                ))}
            </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-4">
          {filteredSales.map((sale) => (
              <Card key={sale._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                      {sale.order_code || sale._id.slice(-6).toUpperCase()}
                                  </span>
                                  <Badge className={
                                      sale.payment_status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                      sale.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                      'bg-red-100 text-red-700 hover:bg-red-100'
                                  }>
                                      {sale.payment_status === 'paid' ? 'Đã thanh toán' : 
                                       sale.payment_status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                                  </Badge>
                              </div>
                              
                              {/* Event Info from Populated Booking */}
                              <h3 className="font-bold text-lg text-indigo-900">
                                  {sale.booking_id?.event_type || sale.event_name || "Sự kiện"}
                              </h3>
                              <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {sale.booking_id?.event_date ? format(new Date(sale.booking_id.event_date), 'dd/MM/yyyy HH:mm', { locale: vi }) : "N/A"}
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {sale.booking_id?.address || sale.event_location || "N/A"}
                                  </div>
                              </div>


                              <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  <div>
                                      <p className="text-gray-500 text-xs uppercase tracking-wide">Khách hàng</p>
                                      <p className="font-medium">{sale.customer_name}</p>
                                      <p className="text-xs text-gray-400">{sale.customer_phone}</p>
                                  </div>
                                  <div>
                                      <p className="text-gray-500 text-xs uppercase tracking-wide">Vé</p>
                                      <p className="font-medium">{sale.ticket_type} <span className="text-gray-400">({sale.ticket_area})</span></p>
                                      <p className="text-xs text-gray-400">SL: {sale.quantity}</p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex flex-col justify-between items-end">
                              <div className="text-right">
                                  <p className="text-sm text-gray-500">Tổng tiền</p>
                                  <p className="text-xl font-bold text-indigo-600">
                                      {(sale.total_price || 0).toLocaleString('vi-VN')} đ
                                  </p>
                              </div>
                              <div className="flex gap-2 mt-4">
                                  {sale.payment_status === 'pending' && (
                                     <>
                                      <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={() => handleUpdateStatusTrigger(sale._id, 'cancelled')}
                                      >
                                          Hủy đơn
                                      </Button>
                                      <Button 
                                          size="sm" 
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleUpdateStatusTrigger(sale._id, 'paid')}
                                      >
                                          Xác nhận đã thu tiền
                                      </Button>
                                     </>
                                  )}
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          ))}
          
          {filteredSales.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có đơn hàng nào</p>
              </div>
          )}
      </div>

      {/* Create Order Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Đơn Vé Mới</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitForm} className="space-y-4 pt-4">
              
              {/* 1. Select Event */}
              <div className="space-y-2">
                  <label className="text-sm font-medium">Chọn Sự kiện</label>
                  <Select 
                    value={formData.booking_id} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, booking_id: val }))}
                  >
                      <SelectTrigger>
                          <SelectValue placeholder="Chọn sự kiện đang bán vé..." />
                      </SelectTrigger>
                      <SelectContent>
                          {bookings.map(b => (
                              <SelectItem key={b._id} value={b._id}>
                                  {b.event_type} ({format(new Date(b.event_date), 'dd/MM/yyyy')})
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  {!formData.booking_id && bookings.length === 0 && (
                      <p className="text-xs text-red-500">Không có sự kiện nào đang mở bán vé.</p>
                  )}
              </div>

            {formData.booking_id && (
                <>
                  {!ticketConfig ? (
                       <div className="p-4 bg-yellow-50 text-yellow-700 rounded text-sm flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" />
                           Sự kiện này chưa được cấu hình bán vé (TicketSaleConfig).
                       </div>
                  ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                            {/* 2. Select Ticket Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Loại vé</label>
                                <Select 
                                    value={formData.ticket_type}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, ticket_type: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại vé" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getTicketTypes().map((t, idx) => (
                                            <SelectItem key={idx} value={t.type}>
                                                {t.type} - {t.price.toLocaleString()}đ (Còn: {t.quantity - t.sold})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 3. Select Area */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Khu vực</label>
                                <Select 
                                    value={formData.ticket_area} 
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, ticket_area: val }))}
                                    disabled={!formData.ticket_type}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khu vực" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAreas().map((area, idx) => (
                                            <SelectItem key={idx} value={area.area_name}>
                                                {area.area_name} ({area.seat_count} ghế)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 4. Quantity & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Số lượng</label>
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Đơn giá</label>
                                <Input 
                                    disabled 
                                    value={formData.unit_price ? Number(formData.unit_price).toLocaleString() : 0}
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* Total Preview */}
                        <div className="p-3 bg-indigo-50 rounded border border-indigo-100 text-right">
                            <span className="text-sm text-indigo-600 mr-2">Tổng tạm tính:</span>
                            <span className="text-xl font-bold text-indigo-700">
                                {((formData.quantity || 0) * (formData.unit_price || 0)).toLocaleString()} đ
                            </span>
                        </div>
                      </>
                  )}
                </>
            )}

            <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Thông tin khách hàng
                </h3>
                <div className="grid gap-3">
                    <Input 
                        placeholder="Họ tên khách hàng *" 
                        value={formData.customer_name}
                        onChange={e => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            placeholder="Số điện thoại *" 
                            value={formData.customer_phone}
                            onChange={e => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                        />
                         <Input 
                            placeholder="Email *" 
                            value={formData.customer_email}
                            onChange={e => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                    {submitting ? "Đang xử lý..." : "Xác nhận tạo đơn"}
                </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {confirmDialog.desc}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                  <AlertDialogAction 
                      onClick={confirmDialog.action} 
                      className={confirmDialog.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                      Xác nhận
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}