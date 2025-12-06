"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function EventApprovalPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [open, setOpen] = useState(false);

  // 🟢 Lấy danh sách kế hoạch (kèm Booking)
  async function fetchPlans() {
    try {
      const res = await fetch("/api/event-approvals");
      const json = await res.json();

      if (json.success) {
        const enrichedPlans = await Promise.all(
          json.data.map(async (p) => {
            const bookingRes = await fetch(`/api/bookings/${p.booking_id}`);
            const bookingJson = await bookingRes.json();
            return { ...p, booking: bookingJson.data || null };
          })
        );
        setPlans(enrichedPlans);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải kế hoạch:", err);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  // 🟠 Phê duyệt / từ chối
  async function handleApproval(action) {
    if (!selectedPlan?._id) return;
    
    let newStatus;
    if (action === "approve") {
      // Tự động chọn status phê duyệt dựa trên status hiện tại
      if (selectedPlan.status === "pending_manager") {
        newStatus = "manager_approved";
      } else if (selectedPlan.status === "pending_manager_demo") {
        newStatus = "manager_approved_demo";
      } else {
        toast.error("❌ Trạng thái kế hoạch không hợp lệ để phê duyệt!");
        return;
      }
    } else if (action === "reject") {
      newStatus = "rejected";
    }
    
    try {
      const res = await fetch(`/api/event-plans/${selectedPlan._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          action === "approve"
            ? "✅ Kế hoạch đã được phê duyệt!"
            : "🚫 Kế hoạch đã bị từ chối!"
        );
        setOpen(false);
        fetchPlans();
      } else {
        toast.error("❌ " + json.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi cập nhật trạng thái.");
    }
  }

  // 🧱 Giao diện chính
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📋 Phê duyệt kế hoạch sự kiện</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p._id} className="shadow-sm border">
            <CardHeader>
              <CardTitle>{p.booking?.customer_name || "Không rõ khách hàng"}</CardTitle>
              <Badge
                variant={
                  p.status === "pending"
                    ? "outline"
                    : p.status === "confirmed"
                    ? "default"
                    : p.status === "cancelled"
                    ? "destructive"
                    : "secondary"
                }
              >
                {p.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p><strong>Loại sự kiện:</strong> {p.step1?.eventCategory || "Không rõ"}</p>
              <p><strong>Thời gian:</strong> {p.step2?.startDate} → {p.step2?.endDate}</p>
              <Separator className="my-2" />
              <Button variant="outline" onClick={() => { setSelectedPlan(p); setOpen(true); }}>
                👁️ Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* ========== DIALOG HIỂN THỊ CHI TIẾT 7 STEP ========== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              ✏️ Kế hoạch: {selectedPlan?.booking?.customer_name || "Không rõ khách hàng"}
            </DialogTitle>
            <div className="mt-2">
              {selectedPlan?.status === "pending_manager_demo" && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Phê duyệt Giai đoạn 1 (Demo)
                </Badge>
              )}
              {selectedPlan?.status === "pending_manager" && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Phê duyệt Giai đoạn 2 (Chi tiết)
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedPlan ? (
            <div className="space-y-6">
              {/* STEP 1 */}
              <section>
                <h3 className="font-semibold text-lg">🎯 Step 1: Mục tiêu & Thông tin chung</h3>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>Goal</TableCell><TableCell>{selectedPlan.step1?.goal}</TableCell></TableRow>
                    <TableRow><TableCell>Audience</TableCell><TableCell>{selectedPlan.step1?.audience}</TableCell></TableRow>
                    <TableRow><TableCell>Thể loại</TableCell><TableCell>{selectedPlan.step1?.eventCategory}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </section>

              {/* STEP 2 */}
              <section>
                <h3 className="font-semibold text-lg">📅 Step 2: Thời gian & Nhân sự</h3>
                <p><strong>Thời gian:</strong> {selectedPlan.step2?.startDate} → {selectedPlan.step2?.endDate}</p>
                <Separator className="my-2" />

                <h4 className="font-medium">📋 Budget</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Danh mục</TableHead><TableHead>Mô tả</TableHead><TableHead>Số lượng</TableHead><TableHead>Chi phí</TableHead><TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step2?.budget?.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>{b.category}</TableCell>
                        <TableCell>{b.description}</TableCell>
                        <TableCell>{b.quantity}</TableCell>
                        <TableCell>{b.cost}</TableCell>
                        <TableCell>{b.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <h4 className="font-medium mt-4">🕒 Timeline Chuẩn bị</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead><TableHead>Nhiệm vụ</TableHead><TableHead>Phụ trách</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step2?.prepTimeline?.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{t.time}</TableCell>
                        <TableCell>{t.task}</TableCell>
                        <TableCell>{typeof t.manager === 'object' ? t.manager?.name : t.manager}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <h4 className="font-medium mt-4">👥 Phân công nhân sự</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phòng ban</TableHead><TableHead>Nhiệm vụ</TableHead><TableHead>Phụ trách</TableHead><TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step2?.staffAssign?.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{s.department}</TableCell>
                        <TableCell>{s.duty}</TableCell>
                        <TableCell>{typeof s.manager === 'object' ? s.manager?.name : s.manager}</TableCell>
                        <TableCell>{s.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <h4 className="font-medium mt-4">📆 Timeline Sự kiện</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead><TableHead>Hoạt động</TableHead><TableHead>Phụ trách</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step2?.eventTimeline?.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell>{e.time}</TableCell>
                        <TableCell>{e.activity}</TableCell>
                        <TableCell>{typeof e.manager === 'object' ? e.manager?.name : e.manager}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>

              {/* STEP 3 */}
              <section>
                <h3 className="font-semibold text-lg">🎨 Step 3: Chủ đề & Trang trí</h3>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Theme</TableCell><TableCell>{selectedPlan.step3?.theme}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Main Color</TableCell><TableCell>{selectedPlan.step3?.mainColor}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Style</TableCell><TableCell>{selectedPlan.step3?.style}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Message</TableCell><TableCell>{selectedPlan.step3?.message}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Decoration</TableCell><TableCell>{selectedPlan.step3?.decoration}</TableCell></TableRow>
                  </TableBody>
                </Table>

                {/* Program Script */}
                <h4 className="font-medium mt-4">📜 Kịch bản chương trình</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Nội dung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step3?.programScript?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(item.time)}</TableCell>
                        <TableCell>{item.content}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedPlan.step3?.programScript || selectedPlan.step3.programScript.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500">Chưa có kịch bản</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Key Activities */}
                <h4 className="font-medium mt-4">⭐ Hoạt động chính</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead>Mức độ quan trọng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step3?.keyActivities?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.activity}</TableCell>
                        <TableCell>{item.importance}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedPlan.step3?.keyActivities || selectedPlan.step3.keyActivities.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500">Chưa có hoạt động chính</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </section>

              {/* STEP 4: CHI PHÍ & THANH TOÁN */}
              <section>
                <h3 className="font-semibold text-lg">💰 Step 4: Kế hoạch Chi phí & Thanh toán</h3>
                
                {/* 4.1 Dự trù ngân sách (Budget) */}
                <h4 className="font-medium mt-2">1. Dự trù ngân sách</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Danh mục</TableHead><TableHead>Mô tả</TableHead><TableHead>Số lượng</TableHead><TableHead>Chi phí</TableHead><TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step2?.budget?.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>{b.category}</TableCell>
                        <TableCell>{b.description}</TableCell>
                        <TableCell>{b.quantity}</TableCell>
                        <TableCell>{b.cost?.toLocaleString()} đ</TableCell>
                        <TableCell>{b.note}</TableCell>
                      </TableRow>
                    ))}
                     <TableRow className="bg-gray-100 font-bold">
                        <TableCell colSpan={3} className="text-right">Tổng ngân sách:</TableCell>
                        <TableCell colSpan={2}>
                            {selectedPlan.step2?.budget?.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 1)), 0).toLocaleString()} đ
                        </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* 4.2 Chi phí đối tác */}
                {selectedPlan.step3_5?.partnerCosts?.length > 0 && (
                    <>
                        <h4 className="font-medium mt-4">2. Chi phí đối tác</h4>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Đối tác</TableHead><TableHead>Mô tả</TableHead><TableHead>Chi phí</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedPlan.step3_5.partnerCosts.map((p, i) => (
                            <TableRow key={i}>
                                <TableCell>{p.partnerName}</TableCell>
                                <TableCell>{p.description}</TableCell>
                                <TableCell>{p.amount?.toLocaleString()} đ</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </>
                )}

                 {/* 4.3 Kế hoạch thanh toán */}
                 <h4 className="font-medium mt-4">3. Kế hoạch thanh toán (Payment Plan)</h4>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mô tả</TableHead><TableHead>Số tiền</TableHead><TableHead>Hạn thanh toán</TableHead><TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlan.step3_5?.paymentPlan?.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.description}</TableCell>
                        <TableCell>{p.amount?.toLocaleString()} đ</TableCell>
                        <TableCell>{formatDate(p.dueDate)}</TableCell>
                        <TableCell>{p.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 4.4 Tổng hợp */}
                <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                    <div>
                        <p className="font-semibold text-gray-600">Tổng chi phí dự kiến:</p>
                        <p className="text-xl font-bold text-blue-600">
                            {selectedPlan.step3_5?.totalEstimatedCost?.toLocaleString() || 0} đ
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600">Tổng thanh toán dự kiến:</p>
                        <p className="text-xl font-bold text-green-600">
                            {selectedPlan.step3_5?.totalPayment?.toLocaleString() || 0} đ
                        </p>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-600">Còn lại:</p>
                        <p className="text-xl font-bold text-red-600">
                            {selectedPlan.step3_5?.totalRemaining?.toLocaleString() || 0} đ
                        </p>
                    </div>
                </div>
              </section>

              {/* STEP 5-8: checklist */}
              {["step4", "step5", "step6", "step7"].map((step, idx) => {
                const stepTitles = [
                  "📋 Step 5: Checklist Chuẩn bị",
                  "📣 Step 6: Checklist Marketing",
                  "🎤 Step 7: Checklist Ngày diễn ra",
                  "✅ Step 8: Hậu sự kiện",
                ];
                const field = Object.values(selectedPlan[step] || {})[0] || [];
                return (
                  <section key={step}>
                    <h3 className="font-semibold text-lg">{stepTitles[idx]}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Danh mục</TableHead><TableHead>Mô tả</TableHead><TableHead>Phụ trách</TableHead><TableHead>Hạn chót</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {field.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{typeof item.owner === 'object' ? item.owner?.name : item.owner}</TableCell>
                            <TableCell>{item.deadline}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                );
              })}

              {/* Nút phê duyệt */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApproval("approve")}
                >
                  ✅ Chấp nhận kế hoạch
                </Button>
                <Button variant="destructive" onClick={() => handleApproval("reject")}>
                  ❌ Từ chối kế hoạch
                </Button>
              </div>
            </div>
          ) : (
            <p>Đang tải dữ liệu kế hoạch...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
