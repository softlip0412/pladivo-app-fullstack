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
  async function handleApproval(status) {
    if (!selectedPlan?._id) return;
    try {
      const res = await fetch(`/api/event-plans/${selectedPlan._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        alert(
          status === "confirmed"
            ? "✅ Kế hoạch đã được phê duyệt!"
            : "🚫 Kế hoạch đã bị từ chối!"
        );
        setOpen(false);
        fetchPlans();
      } else alert("❌ " + json.message);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái.");
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
                        <TableCell>{t.manager?.name}</TableCell>
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
                        <TableCell>{s.manager?.name}</TableCell>
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
                        <TableCell>{e.manager?.name}</TableCell>
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
                    <TableRow><TableCell>Theme</TableCell><TableCell>{selectedPlan.step3?.theme}</TableCell></TableRow>
                    <TableRow><TableCell>Main Color</TableCell><TableCell>{selectedPlan.step3?.mainColor}</TableCell></TableRow>
                    <TableRow><TableCell>Style</TableCell><TableCell>{selectedPlan.step3?.style}</TableCell></TableRow>
                    <TableRow><TableCell>Message</TableCell><TableCell>{selectedPlan.step3?.message}</TableCell></TableRow>
                    <TableRow><TableCell>Decoration</TableCell><TableCell>{selectedPlan.step3?.decoration}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </section>

              {/* STEP 4-7: checklist */}
              {["step4", "step5", "step6", "step7"].map((step, idx) => {
                const stepTitles = [
                  "📋 Step 4: Checklist Chuẩn bị",
                  "📣 Step 5: Checklist Marketing",
                  "🎤 Step 6: Checklist Ngày diễn ra",
                  "✅ Step 7: Hậu sự kiện",
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
                            <TableCell>{item.owner}</TableCell>
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
                  onClick={() => handleApproval("confirmed")}
                >
                  ✅ Chấp nhận kế hoạch
                </Button>
                <Button variant="destructive" onClick={() => handleApproval("cancelled")}>
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
