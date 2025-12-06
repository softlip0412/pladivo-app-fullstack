"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import eventTemplates from "../data/event-templates";

export default function EventPlanDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdFromUrl = searchParams.get("booking_id");

  const [bookingsList, setBookingsList] = useState([]);
  const [plansMap, setPlansMap] = useState({});
  const [contractsMap, setContractsMap] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [open, setOpen] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [step, setStep] = useState(5); // Start from step 5 (Step 4 is now in Event Plans)
  
  const [staff, setStaff] = useState([]);
  const [partnerOptions, setPartnerOptions] = useState([]);

  // Step 4 (step3_5) moved to Event Plans page


  // Step 5 (step4 in model) - Chuẩn bị chi tiết
  const [prepChecklist, setPrepChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 6 (step5 in model) - Marketing
  const [marketingChecklist, setMarketingChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 7 (step6 in model) - Event Day
  const [eventDayChecklist, setEventDayChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 8 (step7 in model) - Post Event
  const [postEventRows, setPostEventRows] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 9 - Ticket Sales
  const [ticketSaleStart, setTicketSaleStart] = useState("");
  const [ticketSaleEnd, setTicketSaleEnd] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [ticketLimitPerPerson, setTicketLimitPerPerson] = useState(0);
  const [ticketSalePricing, setTicketSalePricing] = useState([]);

  // Custom owner states
  const [customStep4Owner, setCustomStep4Owner] = useState({});
  const [customStep5Owner, setCustomStep5Owner] = useState({});
  const [customStep6Owner, setCustomStep6Owner] = useState({});
  const [customStep7Owner, setCustomStep7Owner] = useState({});

  // Fetch functions
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        const filtered = (data.bookings || [])
          .filter((b) => b.booking_status === "confirmed")
          .map((b) => ({
            _id: b._id,
            customer_name: b.customer_name,
            event_date: b.event_date,
            event_type: b.event_type,
            address: b.address,
            phone: b.phone,
            email: b.email,
            services: b.services || [],
          }));

        setBookingsList(filtered);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setBookingsList([]);
    }
  };

  const fetchPlans = async () => {
    try {
      const plans = {};
      for (const b of bookingsList) {
        const res = await fetch(`/api/event-plans?booking_id=${b._id}`);
        const json = await res.json();
        if (json.success && json.data) {
          // Store all plans found
          plans[b._id] = json.data;
        }
      }
      setPlansMap(plans);
    } catch (err) {
      console.error("❌ Lỗi khi tải kế hoạch:", err);
    }
  };

  const fetchContracts = async () => {
    try {
      const contracts = {};
      // Fetch contracts in parallel usually better, but keeping simple loop for now matching existing style
      for (const b of bookingsList) {
        try {
            const res = await fetch(`/api/event-contracts?booking_id=${b._id}`);
            const json = await res.json();
            if (json.success && json.exists) {
                contracts[b._id] = json.data;
            }
        } catch (e) {
            console.error(`Error fetching contract for ${b._id}`, e);
        }
      }
      setContractsMap(contracts);
    } catch (err) {
      console.error("❌ Lỗi khi tải hợp đồng:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStaff(json.data);
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.error("Fetch staff error:", err);
      setStaff([]);
    }
  };

  const fetchPartnerOptions = async () => {
    try {
      const res = await fetch("/api/partners");
      const json = await res.json();
      if (json.data) {
        setPartnerOptions(json.data);
      }
    } catch (err) {
      console.error("Fetch partner error:", err);
    }
  };

  const fetchBookingDetail = async (id) => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();

      if (data.success) {
        setBookingInfo(data.data);
      }
    } catch (err) {
      console.error("Fetch booking detail error:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchPartnerOptions();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (bookingsList.length > 0) {
      fetchPlans();
      fetchContracts();
    }
  }, [bookingsList]);

  // Auto-open dialog if booking_id in URL
  useEffect(() => {
    if (bookingIdFromUrl && plansMap[bookingIdFromUrl]) {
      handleOpenDialog(bookingIdFromUrl);
    }
  }, [bookingIdFromUrl, plansMap]);

  const handleOpenDialog = async (bookingId) => {
    const res = await fetch(`/api/event-plans?booking_id=${bookingId}`);
    const json = await res.json();

    if (json.success && json.data) {
      setEditingPlan(json.data);
      setSelectedBookingId(bookingId);
      await fetchBookingDetail(bookingId);
      
      // Load existing data
      loadPlanData(json.data);
      
      setStep(5);
      
      // Get booking info directly from list to avoid state race condition
      const booking = bookingsList.find(b => b._id === bookingId);
      
      // Check if we should suggest a template (if Step 4 is empty)
      if (!json.data.step4?.checklist?.length && booking?.event_type) {
        setShowTemplateDialog(true);
      } else {
        setOpen(true);
      }
    } else {
      toast.error("❌ Không thể tải kế hoạch!");
    }
  };

  const loadPlanData = (plan) => {
    // Step 3.5 (Cost Plan) moved to Event Plans, no need to load here


    // Load Step 5 data (step4)
    setPrepChecklist(
      plan.step4?.checklist?.map(item => ({
        ...item,
        deadline: formatDateTimeForInput(item.deadline),
        owner: getManagerValue(item.owner)
      })) || []
    );

    // Load Step 6 data (step5)
    setMarketingChecklist(
      plan.step5?.marketingChecklist?.map(item => ({
        ...item,
        deadline: formatDateTimeForInput(item.deadline),
        owner: getManagerValue(item.owner)
      })) || []
    );

    // Load Step 7 data (step6)
    setEventDayChecklist(
      plan.step6?.eventDayChecklist?.map(item => ({
        ...item,
        deadline: formatDateTimeForInput(item.deadline),
        owner: getManagerValue(item.owner)
      })) || []
    );

    // Load Step 8 data (step7)
    setPostEventRows(
      plan.step7?.postEvent?.map(item => ({
        ...item,
        deadline: formatDateTimeForInput(item.deadline),
        owner: getManagerValue(item.owner)
      })) || []
    );

    // Load Step 9 data
    setTicketSaleStart(formatDateTimeForInput(plan.step9?.saleStartDate));
    setTicketSaleEnd(formatDateTimeForInput(plan.step9?.saleEndDate));
    setRefundPolicy(plan.step9?.refundPolicy || "");
    setTicketLimitPerPerson(plan.step9?.limitPerPerson || 0);
    setTicketSalePricing(plan.step9?.ticketPricing || []);
  };

  const loadTemplate = (eventType) => {
    const template = eventTemplates[eventType];
    if (!template) {
      toast.error("❌ Không tìm thấy mẫu cho loại sự kiện này!");
      return;
    }

    // Load Step 4 (UI Step 5 in template)
    setPrepChecklist(template.step4?.checklist || []);

    // Load Step 5 (UI Step 6 in template)
    setMarketingChecklist(template.step5?.marketingChecklist || []);

    // Load Step 6 (UI Step 7 in template)
    setEventDayChecklist(template.step6?.eventDayChecklist || []);

    // Load Step 7 (UI Step 8 in template)
    setPostEventRows(template.step7?.postEvent || []);

    toast.success("✅ Đã tải dữ liệu mẫu thành công!");
    setOpen(true);
  };

  // Helper functions
  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getManagerValue = (managerObj) => {
    if (!managerObj) return "";
    if (typeof managerObj === "string") return managerObj;
    return managerObj.id || managerObj.name || "";
  };

  const formatManagerData = (value) => {
    if (!value) return { name: "", id: null };
    
    const staffMember = staff.find(s => s._id === value);
    if (staffMember) {
      return { name: staffMember.full_name, id: staffMember._id };
    }
    
    return { name: value, id: null };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // Staff Select Component
  const StaffSelect = ({ value, onChange, placeholder = "Chọn nhân sự" }) => {
    const displayName =
      staff.find((s) => s._id === value)?.full_name || placeholder;

    return (
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full">
          <SelectValue>{displayName}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {staff.map((s) => (
            <SelectItem key={s._id} value={s._id}>
              {s.full_name}
              {s.department ? ` — ${s.department.name}` : ""}
              {s.role ? ` — ${s.role.name}` : ""}
            </SelectItem>
          ))}

          <SelectItem value="__custom__">✏️ Khác (tự nhập)</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  // Save function
  const handleCompletePlan = async () => {
    try {
      const payload = {
        booking_id: selectedBookingId,
        status: "pending_manager",

        step4: { 
          checklist: prepChecklist.map((item) => ({
            ...item,
            owner: formatManagerData(item.owner),
          })),
        },
        step5: { 
          marketingChecklist: marketingChecklist.map((item) => ({
            ...item,
            owner: formatManagerData(item.owner),
          })),
        },
        step6: { 
          eventDayChecklist: eventDayChecklist.map(item => ({
            ...item,
            owner: formatManagerData(item.owner)
          }))
        },
        step7: { 
          postEvent: postEventRows.map(item => ({
            ...item,
            owner: formatManagerData(item.owner)
          }))
        },
      };

      // Only add step9 if event type is "Sự kiện đại chúng"
      if (bookingInfo?.event_type === "Sự kiện đại chúng") {
        payload.step9 = {
          saleStartDate: ticketSaleStart,
          saleEndDate: ticketSaleEnd,
          refundPolicy,
          limitPerPerson: ticketLimitPerPerson,
          ticketPricing: ticketSalePricing,
        };
      }

      const res = await fetch("/api/event-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(`✅ Hoàn tất kế hoạch và gửi phê duyệt thành công!`);
        setOpen(false);
        fetchBookings();
        router.push("/dashboard/event-plans");
      } else {
        toast.error("❌ Lỗi: " + json.message);
      }
    } catch (err) {
      console.error("Lỗi khi lưu kế hoạch:", err);
      toast.error("❌ Đã xảy ra lỗi");
    }
  };

  // Update functions (simplified - add more as needed)


  const updateChecklist = (index, field, value) => {
    setPrepChecklist((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const updateMarketingChecklist = (index, field, value) => {
    setMarketingChecklist((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const updateEventDayChecklist = (index, field, value) => {
    setEventDayChecklist((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const updatePostEvent = (index, field, value) => {
    setPostEventRows((prev) => {
      const rows = [...prev];
      rows[index][field] = value;
      return rows;
    });
  };

  const updateTicketSalePricing = (index, field, value) => {
    setTicketSalePricing((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Filter bookings that have completed Step 1-3
  const filteredBookings = bookingsList.filter((b) => {
    const plan = plansMap[b._id];
    const contract = contractsMap[b._id];
    
    // Debug logging
    console.log(`Booking: ${b.customer_name} (${b._id})`);
    console.log(`- Plan:`, plan ? plan.status : 'None');
    console.log(`- Contract:`, contract ? contract.status : 'None');
    
    // Must have plan
    if (!plan) return false;
    
    // Must have signed contract
    if (!contract || contract.status !== 'signed') {
        console.log(`-> Filtered out: Contract not signed (Status: ${contract?.status})`);
        return false;
    }

    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      b.customer_name?.toLowerCase().includes(s) ||
      b.phone?.toLowerCase().includes(s) ||
      b.email?.toLowerCase().includes(s);

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "draft" && plan.status === "draft") ||
      (filterStatus === "pending" && plan.status.includes("pending")) ||
      (filterStatus === "approved" && plan.status.includes("approved"));

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/event-plans")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold">📋 Quản lý Kế hoạch Chi tiết</h1>
      </div>

      <p className="text-gray-600">
        Trang này hiển thị các booking đã được <strong>phê duyệt kế hoạch demo</strong> (Step 1-3). 
        Click vào booking để tiếp tục lập kế hoạch chi tiết (Step 4-9).
      </p>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="🔍 Tìm theo tên, số điện thoại hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Đang soạn thảo</SelectItem>
            <SelectItem value="pending">Chờ phê duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* BOOKINGS LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-gray-500">
              <p>Không có booking nào đủ điều kiện (Plan được duyệt demo & Hợp đồng đã ký)</p>
              <p className="text-sm mt-2">
                Vui lòng hoàn thành Step 1-3 và đảm bảo hợp đồng đã được ký kết.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((b) => {
            const plan = plansMap[b._id];
            
            return (
              <Card key={b._id}>
                <CardHeader>
                  <CardTitle>{b.customer_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <b>Ngày tổ chức:</b> {formatDate(b.event_date)}
                  </p>
                  <p>
                    <b>Loại sự kiện:</b> {b.event_type}
                  </p>
                  <p>
                    <b>Địa điểm:</b> {b.address}
                  </p>

                  <div className="mt-3">
                    <span className={`px-3 py-1 rounded inline-flex items-center gap-1 text-sm ${
                      plan.status === "draft"
                        ? "bg-gray-100 text-gray-700"
                        : plan.status.includes("pending")
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {plan.status === "draft" && "📝 Đang soạn thảo"}
                      {plan.status.includes("pending") && "⏳ Chờ phê duyệt"}
                      {plan.status.includes("approved") && "✅ Đã duyệt"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <Button
                      className="w-full"
                      onClick={() => handleOpenDialog(b._id)}
                    >
                      📋 Lập kế hoạch chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* TEMPLATE SELECTION DIALOG */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bạn có muốn dùng mẫu có sẵn?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-2">
              Hệ thống phát hiện loại sự kiện: <strong>{bookingInfo?.event_type}</strong>
            </p>
            <p className="text-sm text-blue-700">
              Dữ liệu mẫu (Checklist, Marketing, Hậu sự kiện...) sẽ được tự động điền.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowTemplateDialog(false);
                setOpen(true);
              }}
            >
              Tự nhập liệu
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                if (bookingInfo?.event_type) {
                  loadTemplate(bookingInfo.event_type);
                }
                setShowTemplateDialog(false);
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Dùng mẫu này
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG - This will contain Step 4-9 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>
              📋 Lập kế hoạch chi tiết - {bookingInfo?.customer_name}
            </DialogTitle>
            
            {/* Template Button */}
            {step >= 4 && (
              <Button
                variant="outline"
                size="sm"
                className="mr-8 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => setShowTemplateDialog(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Dùng mẫu gợi ý
              </Button>
            )}
          </DialogHeader>
          {/* Show Step 1-3 info (read-only) */}
          {editingPlan && (
            <Card className="p-4 bg-blue-50 mb-4">
              <h3 className="font-semibold mb-2">📌 Thông tin kế hoạch cơ bản (Step 1-3)</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p><b>Mục tiêu:</b> {editingPlan.step1?.goal}</p>
                  <p><b>Đối tượng:</b> {editingPlan.step1?.audience}</p>
                </div>
                <div>
                  <p><b>Chủ đề:</b> {editingPlan.step3?.theme}</p>
                  <p><b>Phong cách:</b> {editingPlan.step3?.style}</p>
                </div>
              </div>
            </Card>
          )}


          {/* STEP 5 - CHUẨN BỊ CHI TIẾT */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                5. Chuẩn bị chi tiết (Pre-event)
              </h2>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Checklist chuẩn bị</h3>

                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Hạng mục</th>
                      <th className="border p-1">Mô tả</th>
                      <th className="border p-1">Phụ trách</th>
                      <th className="border p-1">Deadline (Ngày & Giờ)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prepChecklist.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Input
                            value={row.category}
                            onChange={(e) =>
                              updateChecklist(i, "category", e.target.value)
                            }
                          />
                        </td>

                        <td className="border p-1">
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              updateChecklist(i, "description", e.target.value)
                            }
                            placeholder="Mô tả công việc..."
                          />
                        </td>

                        <td className="border p-1">
                          {customStep4Owner[i] ? (
                            <Input
                              value={row.owner}
                              onChange={(e) =>
                                updateChecklist(i, "owner", e.target.value)
                              }
                              onBlur={() =>
                                setCustomStep4Owner((prev) => ({
                                  ...prev,
                                  [i]: false,
                                }))
                              }
                            />
                          ) : (
                            <StaffSelect
                              value={row.owner}
                              onChange={(v) => {
                                if (v === "__custom__") {
                                  setCustomStep4Owner((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }));
                                  updateChecklist(i, "owner", "");
                                } else {
                                  updateChecklist(i, "owner", v);
                                }
                              }}
                            />
                          )}
                        </td>

                        <td className="border p-1">
                          <Input
                            type="datetime-local"
                            value={row.deadline}
                            onChange={(e) =>
                              updateChecklist(i, "deadline", e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Button
                  className="mt-2"
                  onClick={() =>
                    setPrepChecklist([
                      ...prepChecklist,
                      {
                        category: "",
                        description: "",
                        owner: "",
                        deadline: "",
                      },
                    ])
                  }
                >
                  + Thêm dòng
                </Button>
              </Card>
            </div>
          )}
          {/* STEP 6 - TRUYỀN THÔNG & MARKETING */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                6. Truyền thông & Marketing
              </h2>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Checklist Marketing</h3>

                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Hạng mục</th>
                      <th className="border p-1">Mô tả</th>
                      <th className="border p-1">Phụ trách</th>
                      <th className="border p-1">Deadline (Ngày & Giờ)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marketingChecklist.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Input
                            value={row.category}
                            onChange={(e) =>
                              updateMarketingChecklist(
                                i,
                                "category",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td className="border p-1">
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              updateMarketingChecklist(
                                i,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td className="border p-1">
                          {customStep5Owner[i] ? (
                            <Input
                              value={row.owner}
                              onChange={(e) =>
                                updateMarketingChecklist(
                                  i,
                                  "owner",
                                  e.target.value
                                )
                              }
                              onBlur={() =>
                                setCustomStep5Owner((prev) => ({
                                  ...prev,
                                  [i]: false,
                                }))
                              }
                            />
                          ) : (
                            <StaffSelect
                              value={row.owner}
                              onChange={(v) => {
                                if (v === "__custom__") {
                                  setCustomStep5Owner((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }));
                                  updateMarketingChecklist(i, "owner", "");
                                } else {
                                  updateMarketingChecklist(i, "owner", v);
                                }
                              }}
                            />
                          )}
                        </td>

                        <td className="border p-1">
                          <Input
                            type="datetime-local"
                            value={row.deadline}
                            onChange={(e) =>
                              updateMarketingChecklist(
                                i,
                                "deadline",
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Button
                  className="mt-2"
                  onClick={() =>
                    setMarketingChecklist([
                      ...marketingChecklist,
                      {
                        category: "",
                        description: "",
                        owner: "",
                        deadline: "",
                      },
                    ])
                  }
                >
                  + Thêm dòng
                </Button>
              </Card>
            </div>
          )}
          {/* STEP 7 - TRIỂN KHAI NGÀY SỰ KIỆN */}
          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                7. Triển khai ngày sự kiện (Event Day)
              </h2>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Checklist ngày diễn ra</h3>

                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Hạng mục</th>
                      <th className="border p-1">Mô tả</th>
                      <th className="border p-1">Phụ trách</th>
                      <th className="border p-1">Deadline (Ngày & Giờ)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {eventDayChecklist.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Input
                            value={row.category}
                            onChange={(e) =>
                              updateEventDayChecklist(
                                i,
                                "category",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td className="border p-1">
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              updateEventDayChecklist(
                                i,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td className="border p-1">
                          {customStep6Owner[i] ? (
                            <Input
                              value={row.owner}
                              onChange={(e) =>
                                updateEventDayChecklist(
                                  i,
                                  "owner",
                                  e.target.value
                                )
                              }
                              onBlur={() =>
                                setCustomStep6Owner((prev) => ({
                                  ...prev,
                                  [i]: false,
                                }))
                              }
                            />
                          ) : (
                            <StaffSelect
                              value={row.owner}
                              onChange={(v) => {
                                if (v === "__custom__") {
                                  setCustomStep6Owner((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }));
                                  updateEventDayChecklist(i, "owner", "");
                                } else {
                                  updateEventDayChecklist(i, "owner", v);
                                }
                              }}
                            />
                          )}
                        </td>

                        <td className="border p-1">
                          <Input
                            type="datetime-local"
                            value={row.deadline}
                            onChange={(e) =>
                              updateEventDayChecklist(
                                i,
                                "deadline",
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Button
                  className="mt-2"
                  onClick={() =>
                    setEventDayChecklist([
                      ...eventDayChecklist,
                      {
                        category: "",
                        description: "",
                        owner: "",
                        deadline: "",
                      },
                    ])
                  }
                >
                  + Thêm dòng
                </Button>
              </Card>
            </div>
          )}
          {/* STEP 8 - HẬU SỰ KIỆN */}
          {step === 8 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                8. Hậu sự kiện (Post-event)
              </h2>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Checklist sau sự kiện</h3>

                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Hạng mục</th>
                      <th className="border p-1">Mô tả</th>
                      <th className="border p-1">Phụ trách</th>
                      <th className="border p-1">Deadline (Ngày & Giờ)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {postEventRows.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Input
                            value={row.category}
                            onChange={(e) =>
                              updatePostEvent(i, "category", e.target.value)
                            }
                          />
                        </td>

                        <td className="border p-1">
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              updatePostEvent(i, "description", e.target.value)
                            }
                          />
                        </td>

                        <td className="border p-1">
                          {customStep7Owner[i] ? (
                            <Input
                              value={row.owner}
                              onChange={(e) =>
                                updatePostEvent(i, "owner", e.target.value)
                              }
                              onBlur={() =>
                                setCustomStep7Owner((prev) => ({
                                  ...prev,
                                  [i]: false,
                                }))
                              }
                            />
                          ) : (
                            <StaffSelect
                              value={row.owner}
                              onChange={(v) => {
                                if (v === "__custom__") {
                                  setCustomStep7Owner((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }));
                                  updatePostEvent(i, "owner", "");
                                } else {
                                  updatePostEvent(i, "owner", v);
                                }
                              }}
                            />
                          )}
                        </td>

                        <td className="border p-1">
                          <Input
                            type="datetime-local"
                            value={row.deadline}
                            onChange={(e) =>
                              updatePostEvent(i, "deadline", e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Button
                  className="mt-2"
                  onClick={() =>
                    setPostEventRows([
                      ...postEventRows,
                      {
                        category: "",
                        description: "",
                        owner: "",
                        deadline: "",
                      },
                    ])
                  }
                >
                  + Thêm dòng
                </Button>
              </Card>
            </div>
          )}
          {/* STEP 9 - KẾ HOẠCH BÁN VÉ (chỉ cho Sự kiện đại chúng) */}
          {step === 9 && bookingInfo?.event_type === "Sự kiện đại chúng" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                9. Kế hoạch bán vé
              </h2>

              {bookingInfo && (
                <Card className="p-4 bg-blue-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    🎫 Thông tin vé từ booking
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {bookingInfo.tickets?.map((ticket, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded border"
                      >
                        <p className="text-xs text-gray-600">
                          {ticket.type}
                        </p>
                        <p className="font-bold">{ticket.quantity} vé</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Thời gian mở bán */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Thời gian bán vé</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ngày mở bán</Label>
                    <Input
                      type="datetime-local"
                      value={ticketSaleStart}
                      onChange={(e) => setTicketSaleStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Ngày đóng bán</Label>
                    <Input
                      type="datetime-local"
                      value={ticketSaleEnd}
                      onChange={(e) => setTicketSaleEnd(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Bảng giá chi tiết */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">
                  Bảng giá chi tiết cho từng loại vé
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Phân loại vé theo mức giá và timeline
                </p>

                <div className="space-y-4">
                  {ticketSalePricing.map((ticket, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="text-sm text-gray-600">Loại vé</p>
                          <p className="font-bold text-lg">{ticket.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Số lượng</p>
                          <p className="font-semibold text-blue-600">
                            {ticket.quantity} vé
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">
                            💰 Giá Early Bird (VNĐ)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Giá sớm"
                            value={ticket.earlyBirdPrice || ""}
                            onChange={(e) =>
                              updateTicketSalePricing(
                                idx,
                                "earlyBirdPrice",
                                +e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            💵 Giá thường (VNĐ)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Giá thường"
                            value={ticket.regularPrice || ""}
                            onChange={(e) =>
                              updateTicketSalePricing(
                                idx,
                                "regularPrice",
                                +e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            💸 Giá muộn (VNĐ)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Giá muộn"
                            value={ticket.latePrice || ""}
                            onChange={(e) =>
                              updateTicketSalePricing(
                                idx,
                                "latePrice",
                                +e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Chính sách và giới hạn */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">
                  Chính sách và giới hạn
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Giới hạn số vé mỗi người</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="VD: 5 vé/người"
                      value={ticketLimitPerPerson || ""}
                      onChange={(e) =>
                        setTicketLimitPerPerson(+e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Chính sách hoàn/đổi vé</Label>
                    <Textarea
                      placeholder="VD: Hoàn vé 100% trước 7 ngày, 50% trước 3 ngày, không hoàn sau đó..."
                      value={refundPolicy}
                      onChange={(e) => setRefundPolicy(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation */}
<div className="flex justify-between mt-6">
  <Button 
    disabled={step === 5} 
    onClick={() => setStep(step - 1)}
  >

    ← Quay lại
  </Button>
  {/* Next button - check event type for step 9 */}
  {((step < 9 && bookingInfo?.event_type === "Sự kiện đại chúng") ||
    (step < 8 && bookingInfo?.event_type !== "Sự kiện đại chúng")) && (
    <Button onClick={() => setStep(step + 1)}>
      Tiếp tục →
    </Button>
  )}
  {/* Complete button - step 9 for public events, step 8 for others */}
  {((step === 9 && bookingInfo?.event_type === "Sự kiện đại chúng") ||
    (step === 8 && bookingInfo?.event_type !== "Sự kiện đại chúng")) && (
    <Button
      className="bg-green-600 text-white"
      onClick={handleCompletePlan}
    >
      ✅ Hoàn tất kế hoạch
    </Button>
  )}
</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
