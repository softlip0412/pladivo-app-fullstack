"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Plus, Trash2, Check } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { EVENT_TEMPLATES } from "@/app/dashboard/data/event-templates";
import { EVENT_TEMPLATES_STEP3 } from "@/app/dashboard/data/event-templates-step3";
import { EVENT_TEMPLATES_STEP6 } from "@/app/dashboard/data/event-templates-step6";
import { EVENT_TEMPLATES_STEP7 } from "@/app/dashboard/data/event-templates-step7";

export default function EventPlansPage() {
  const [plans, setPlans] = useState([]);
  const [partners, setPartners] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  const [setupDate, setSetupDate] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [newTime, setNewTime] = useState("");
  const [newContent, setNewContent] = useState("");
  const [partnerSelections, setPartnerSelections] = useState({});
  const [setupStaff, setSetupStaff] = useState([]);
  const [trialStaff, setTrialStaff] = useState([]);
  const [eventStaff, setEventStaff] = useState([]);
  const [cleanupStaff, setCleanupStaff] = useState([]);

  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [bookingInfo, setBookingInfo] = useState(null);

  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [eventCategory, setEventCategory] = useState("");

  const [customPrepOwner, setCustomPrepOwner] = useState({});
  const [customStaffAssignOwner, setCustomStaffAssignOwner] = useState({});
  const [customEventTimelineOwner, setCustomEventTimelineOwner] = useState({});
  const [customMarketingOwner, setCustomMarketingOwner] = useState({});
  const [customEventDayOwner, setCustomEventDayOwner] = useState({});
  const [customPostOwner, setCustomPostOwner] = useState({});

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [plansMap, setPlansMap] = useState({});
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchStaff = async () => {
    const res = await fetch("/api/staff");
    const json = await res.json();
    if (Array.isArray(json.staff)) setStaff(json.staff);
    else setStaff([]);
  };

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
              {s.department ? ` – ${s.department.name}` : ""}
              {s.role ? ` – ${s.role.name}` : ""}
            </SelectItem>
          ))}

          <SelectItem value="__custom__">✏️ Khác (tự nhập)</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  // ---- STEP 2 STATES ----

  // Ngày tổ chức
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Partner (nhà hàng / khách sạn)
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");

  // Dịch vụ của booking
  const [bookingServices, setBookingServices] = useState([]);

  // Dự trù ngân sách
  const [budgetRows, setBudgetRows] = useState([
    { category: "", description: "", unit: "", quantity: 1, cost: 0, note: "" },
  ]);

  // Timeline chuẩn bị
  const [prepTimeline, setPrepTimeline] = useState([
    { time: "", task: "", manager: "" },
  ]);

  // Phân công nhân sự
  const [staffAssign, setStaffAssign] = useState([
    { department: "", duty: "", manager: "", note: "" },
  ]);

  // Timeline ngày diễn ra
  const [eventTimeline, setEventTimeline] = useState([
    { time: "", activity: "", manager: "" },
  ]);

  async function handleCompletePlan() {
    try {
      const payload = {
        booking_id: selectedBookingId,
        step1: { goal, audience, eventCategory },
        step2: {
          startDate,
          endDate,
          selectedPartner,
          budget: budgetRows,
          prepTimeline,
          staffAssign,
          eventTimeline,
        },
        step3: {
          theme,
          mainColor,
          style,
          message,
          decoration,
          programScript,
          keyActivities,
        },
        step4: { checklist: prepChecklist },
        step5: { marketingChecklist },
        step6: { eventDayChecklist },
        step7: { postEvent: postEventRows },
      };

      // 🔍 Kiểm tra xem kế hoạch cho booking này đã có chưa
      const checkRes = await fetch(
        `/api/event-plans?booking_id=${selectedBookingId}`
      );
      const checkJson = await checkRes.json();

      // Nếu chưa có thì tạo mới (POST), nếu có thì cập nhật (PATCH)
      const method = checkJson?.data ? "PATCH" : "POST";

      const res = await fetch("/api/event-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        alert(
          `✅ ${
            method === "POST" ? "Tạo mới" : "Cập nhật"
          } kế hoạch thành công!`
        );
        setOpen(false);
      } else {
        alert("❌ Lỗi: " + json.message);
      }
    } catch (err) {
      console.error("Lỗi khi lưu kế hoạch:", err);
      alert("❌ Đã xảy ra lỗi, vui lòng thử lại.");
    }
  }

  // --- MultiSelect component ---
  const MultiSelect = ({ label, options, selected, setSelected }) => {
    const [open, setOpen] = useState(false);
    const toggleSelect = (value) => {
      if (selected.includes(value))
        setSelected(selected.filter((v) => v !== value));
      else setSelected([...selected, value]);
    };
    return (
      <div>
        <Label>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between mt-1">
              {selected.length > 0 ? selected.join(", ") : "Chọn..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => toggleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // --- Timeline handlers ---
  // const handleAddTimeline = () => {
  //   if (!newTime || !newContent.trim()) return;
  //   setTimeline([...timeline, { time: newTime, content: newContent }]);
  //   setNewTime("");
  //   setNewContent("");
  // };

  // const handleRemoveTimeline = (index) =>
  //   setTimeline(timeline.filter((_, i) => i !== index));

  // --- Fetch data ---
  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/event-plans");
      const data = await res.json();
      setPlans(data || []);
    } catch (error) {
      console.error("Fetch plans error:", error);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      const json = await res.json();
      if (Array.isArray(json.data))
        setPartners(json.data.map((p) => p.company_name));
      else setPartners([]);
    } catch (error) {
      console.error("Fetch partners error:", error);
      setPartners([]);
    }
  };

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

  const fetchServiceDetails = async (booking) => {
    try {
      if (!booking?.services?.length) {
        setBookingServices([]);
        return;
      }

      const res = await fetch("/api/services");
      const { success, data } = await res.json();

      if (!success) return;

      const merged = booking.services.map((item) => {
        const detail = data.find((d) => d._id === item.service_id);
        return {
          ...item,
          name: detail?.name || "Không xác định",
          minPrice: detail?.minPrice ?? 0,
          maxPrice: detail?.maxPrice ?? 0,
          unit: detail?.unit || "—",
        };
      });

      setBookingServices(merged);
    } catch (err) {
      console.error("fetchServiceDetails error:", err);
    }
  };

  const fetchPartnersForStep2 = async () => {
    try {
      const res = await fetch("/api/partners");
      const json = await res.json();

      if (json.data) {
        const filtered = json.data.filter(
          (p) =>
            p.partner_type?.toLowerCase().includes("nhà hàng") ||
            p.partner_type?.toLowerCase().includes("khách sạn")
        );

        setPartnerOptions(filtered);
      }
    } catch (err) {
      console.error("Fetch partner error:", err);
    }
  };

  // --- STEP 3 STATES ---
  const [theme, setTheme] = useState("");
  const [mainColor, setMainColor] = useState("");
  const [style, setStyle] = useState("");
  const [message, setMessage] = useState("");
  const [decoration, setDecoration] = useState("");

  // Kịch bản chương trình
  const [programScript, setProgramScript] = useState([
    { time: "", content: "" },
  ]);

  // Hoạt động chính
  const [keyActivities, setKeyActivities] = useState([
    { activity: "", importance: "" },
  ]);
  const updateProgram = (index, field, value) => {
    setProgramScript((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const updateKeyActivities = (index, field, value) => {
    setKeyActivities((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const loadStep3Template = (type) => {
    console.log("Template requested:", type);
    console.log("Keys available:", Object.keys(EVENT_TEMPLATES_STEP3));

    const t = EVENT_TEMPLATES_STEP3[type];
    console.log("Loaded template:", t);

    if (!t) return;

    setTheme(t.theme);
    setMainColor(t.mainColor);
    setStyle(t.style);
    setMessage(t.message);
    setDecoration(t.decoration);

    setProgramScript(t.program);
    setKeyActivities(t.activities);
  };
  // --- STEP 4 STATES ---
  const [prepChecklist, setPrepChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);
  // --- STEP 5 STATES ---
  const [marketingChecklist, setMarketingChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);
  // --- STEP 6 STATES ---
  const [eventDayChecklist, setEventDayChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);
  // --- STEP 7 STATE ---
  const [postEventRows, setPostEventRows] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  const loadStep7Template = (type) => {
    const t = EVENT_TEMPLATES_STEP7[type];
    if (!t) return;
    setPostEventRows(t);
  };

  useEffect(() => {
    if (step === 2) {
      fetchPartnersForStep2();
    }
  }, [step]);

  useEffect(() => {
    async function loadAll() {
      await fetchPartners();
      await fetchStaff();
      await fetchBookings();
    }

    loadAll();
  }, []);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const plans = {};
        for (const b of bookingsList) {
          const res = await fetch(`/api/event-plans?booking_id=${b._id}`);
          const json = await res.json();
          if (json.success && json.data) {
            plans[b._id] = json.data;
          }
        }
        setPlansMap(plans);
      } catch (err) {
        console.error("❌ Lỗi khi tải kế hoạch:", err);
      }
    }

    if (bookingsList.length > 0) {
      fetchPlans();
    }
  }, [bookingsList]);

  useEffect(() => {
    if (editingPlan) {
      setGoal(editingPlan.step1?.goal || "");
      setAudience(editingPlan.step1?.audience || "");
      setEventCategory(editingPlan.step1?.eventCategory || "");
      setStartDate(editingPlan.step2?.startDate || "");
      setEndDate(editingPlan.step2?.endDate || "");
      setSelectedPartner(editingPlan.step2?.selectedPartner || "");
      setBudgetRows(editingPlan.step2?.budget || []);
      setPrepTimeline(editingPlan.step2?.prepTimeline || []);
      setStaffAssign(editingPlan.step2?.staffAssign || []);
      setEventTimeline(editingPlan.step2?.eventTimeline || []);
      setTheme(editingPlan.step3?.theme || "");
      setMainColor(editingPlan.step3?.mainColor || "");
      setStyle(editingPlan.step3?.style || "");
      setMessage(editingPlan.step3?.message || "");
      setDecoration(editingPlan.step3?.decoration || "");
      setProgramScript(editingPlan.step3?.programScript || []);
      setKeyActivities(editingPlan.step3?.keyActivities || []);
      setPrepChecklist(editingPlan.step4?.checklist || []);
      setMarketingChecklist(editingPlan.step5?.marketingChecklist || []);
      setEventDayChecklist(editingPlan.step6?.eventDayChecklist || []);
      setPostEventRows(editingPlan.step7?.postEvent || []);
    } else {
      // Reset form khi tạo mới
      setGoal("");
      setAudience("");
      setEventCategory("");
      setStartDate("");
      setEndDate("");
      setSelectedPartner("");
      setBudgetRows([]);
      setPrepTimeline([]);
      setStaffAssign([]);
      setEventTimeline([]);
      setTheme("");
      setMainColor("");
      setStyle("");
      setMessage("");
      setDecoration("");
      setProgramScript([]);
      setKeyActivities([]);
      setPrepChecklist([]);
      setMarketingChecklist([]);
      setEventDayChecklist([]);
      setPostEventRows([]);
    }
  }, [editingPlan]);

  // --- Utils ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const fetchBookingDetail = async (id) => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();

      if (data.success) {
        setBookingInfo(data.data);
        fetchServiceDetails(data.data);
      }
    } catch (err) {
      console.error("Fetch booking detail error:", err);
    }
  };
  const updateBudget = (i, field, value) => {
    const updated = [...budgetRows];
    updated[i][field] = value;
    setBudgetRows(updated);
  };
  const updatePrep = (index, field, value) => {
    setPrepTimeline((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const updateStaff = (index, field, value) => {
    setStaffAssign((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const applyTemplate = (type) => {
    const template = EVENT_TEMPLATES[type];
    if (!template) return;

    setBudgetRows(template.budget);
    setPrepTimeline(template.prepTimeline);
    setStaffAssign(template.staffAssign);
    setEventTimeline(template.eventTimeline);
  };

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

  const updateEvent = (index, field, value) => {
    setEventTimeline((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📅 Quản lý Kế hoạch</h1>
      <div className="flex justify-between items-center">
        {/* DIALOG LÊN KẾ HOẠCH SỰ KIỆN */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan
                  ? "✏️ Chỉnh sửa kế hoạch sự kiện"
                  : "📝 Lên kế hoạch sự kiện"}
              </DialogTitle>
            </DialogHeader>

            {/* Multi-step state */}
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium">Bước {step}/7</p>
            </div>

            {/* ================== STEP CONTENT ================== */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  1. Xác định mục tiêu & loại sự kiện
                </h2>

                {/* ✅ Hiển thị thông tin Booking */}
                {bookingInfo ? (
                  <Card className="p-4 bg-muted">
                    <p>
                      <strong>Loại sự kiện:</strong> {bookingInfo.event_type}
                    </p>
                    <p>
                      <strong>Khách hàng:</strong> {bookingInfo.customer_name}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {bookingInfo.address}
                    </p>
                    <p>
                      <strong>Điện thoại:</strong> {bookingInfo.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {bookingInfo.email}
                    </p>
                  </Card>
                ) : (
                  <p className="text-sm text-gray-500">
                    Đang tải thông tin booking...
                  </p>
                )}

                {/* ✅ Các input của bước 1 */}
                <div className="space-y-2">
                  <Label>Mục tiêu sự kiện</Label>
                  <Input
                    placeholder="Ví dụ: quảng bá thương hiệu, tri ân khách hàng..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đối tượng tham dự</Label>
                  <Input
                    placeholder="Ví dụ: nhân viên công ty, đối tác, khách VIP..."
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loại hình sự kiện</Label>
                  <Input
                    placeholder="Ví dụ: Gala Dinner, Workshop, Concert..."
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  2. Lập kế hoạch tổng thể (Master Plan)
                </h2>

                {/* ✅ THÔNG TIN BOOKING */}
                {bookingInfo && (
                  <Card className="p-4 bg-muted">
                    <h3 className="font-semibold mb-2">Thông tin booking</h3>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <b>Ngày:</b> {formatDate(bookingInfo.event_date)}
                      </p>
                      <p>
                        <b>Giờ:</b> {bookingInfo.event_time || "—"}
                      </p>

                      <p>
                        <b>Khu vực:</b>
                        {bookingInfo.region?.province},
                        {bookingInfo.region?.district},
                        {bookingInfo.region?.ward}
                      </p>

                      {bookingInfo.custom_location && (
                        <p>
                          <b>Địa điểm:</b> {bookingInfo.custom_location}
                        </p>
                      )}

                      <p>
                        <b>Quy mô:</b> {bookingInfo.scale} khách
                      </p>
                    </div>
                  </Card>
                )}

                {/* ✅ NGÀY BẮT ĐẦU - KẾT THÚC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* ✅ CHỌN PARTNER */}
                <div>
                  <Label>Địa điểm đối tác (Nhà hàng / Khách sạn)</Label>
                  <Select
                    value={selectedPartner}
                    onValueChange={setSelectedPartner}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đối tác" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnerOptions.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.company_name} – {p.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ✅ DỊCH VỤ KHÁCH ĐÃ CHỌN */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Dịch vụ khách đã chọn</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Dịch vụ</th>
                        <th className="border p-1">Khoảng giá</th>
                        <th className="border p-1">Đơn vị</th>
                        <th className="border p-1">SL</th>
                      </tr>
                    </thead>

                    <tbody>
                      {bookingServices.map((s, i) => (
                        <tr key={i}>
                          <td className="border p-1">{s.name}</td>
                          <td className="border p-1">
                            {s.minPrice.toLocaleString()} –{" "}
                            {s.maxPrice.toLocaleString()}
                          </td>
                          <td className="border p-1">{s.unit}</td>
                          <td className="border p-1">{s.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {bookingServices.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Không có dịch vụ
                    </p>
                  )}
                </Card>
                <div className="flex gap-2 items-center">
                  <Label>Tải dữ liệu mẫu:</Label>
                  <Select onValueChange={applyTemplate}>
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Chọn mẫu sự kiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">💍 Đám cưới</SelectItem>
                      <SelectItem value="conference">🏢 Hội nghị</SelectItem>
                      <SelectItem value="birthday">🎂 Sinh nhật</SelectItem>
                      <SelectItem value="company_event">
                        🏢 Sự kiện công ty
                      </SelectItem>
                      <SelectItem value="public_event">
                        🎤 Sự kiện đại chúng
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ✅ DỰ TRÙ NGÂN SÁCH */}
                <div>
                  <h3 className="font-semibold mb-2">Dự trù ngân sách</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th>Hạng mục</th>
                        <th>Mô tả</th>
                        <th>Đơn vị</th>
                        <th>SL</th>
                        <th>Chi phí</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>

                    <tbody>
                      {budgetRows.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <Input
                              value={row.category}
                              onChange={(e) =>
                                updateBudget(i, "category", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              value={row.description}
                              onChange={(e) =>
                                updateBudget(i, "description", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              value={row.unit}
                              onChange={(e) =>
                                updateBudget(i, "unit", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              value={row.quantity}
                              onChange={(e) =>
                                updateBudget(i, "quantity", +e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              value={row.cost}
                              onChange={(e) =>
                                updateBudget(i, "cost", +e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              value={row.note}
                              onChange={(e) =>
                                updateBudget(i, "note", e.target.value)
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
                      setBudgetRows([
                        ...budgetRows,
                        {
                          category: "",
                          description: "",
                          unit: "",
                          quantity: 1,
                          cost: 0,
                          note: "",
                        },
                      ])
                    }
                  >
                    + Thêm hạng mục
                  </Button>

                  <div className="text-right font-bold mt-3">
                    Tổng cộng:{" "}
                    {budgetRows
                      .reduce((sum, r) => sum + r.cost * r.quantity, 0)
                      .toLocaleString()}{" "}
                    ₫
                  </div>
                </div>

                {/* ✅ TIMELINE CHUẨN BỊ */}
                <div>
                  <h3 className="font-semibold mb-2">Timeline chuẩn bị</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th>Thời gian</th>
                        <th>Công việc</th>
                        <th>Phụ trách</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepTimeline.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <Input
                              value={row.time}
                              onChange={(e) =>
                                updatePrep(i, "time", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              value={row.task}
                              onChange={(e) =>
                                updatePrep(i, "task", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-1">
                            {customPrepOwner[i] ? (
                              <Input
                                value={row.manager}
                                onChange={(e) =>
                                  updatePrep(i, "manager", e.target.value)
                                }
                                onBlur={() =>
                                  setCustomPrepOwner((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }))
                                }
                              />
                            ) : (
                              <StaffSelect
                                value={row.manager}
                                onChange={(v) => {
                                  if (v === "__custom__") {
                                    setCustomPrepOwner((prev) => ({
                                      ...prev,
                                      [i]: true,
                                    }));
                                    updatePrep(i, "manager", "");
                                  } else {
                                    updatePrep(i, "manager", v);
                                  }
                                }}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Button
                    className="mt-2"
                    onClick={() =>
                      setPrepTimeline([
                        ...prepTimeline,
                        { time: "", task: "", manager: "" },
                      ])
                    }
                  >
                    + Thêm dòng
                  </Button>
                </div>

                {/* ✅ PHÂN CÔNG NHÂN SỰ */}
                <div>
                  <h3 className="font-semibold mb-2">Phân công nhân sự</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th>Bộ phận</th>
                        <th>Trách nhiệm</th>
                        <th>Phụ trách</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>

                    <tbody>
                      {staffAssign.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <Input
                              value={row.department}
                              onChange={(e) =>
                                updateStaff(i, "department", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              value={row.duty}
                              onChange={(e) =>
                                updateStaff(i, "duty", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-1">
                            {customEventTimelineOwner[i] ? (
                              <Input
                                value={row.manager}
                                onChange={(e) =>
                                  updateEvent(i, "manager", e.target.value)
                                }
                                onBlur={() =>
                                  setCustomEventTimelineOwner((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }))
                                }
                              />
                            ) : (
                              <StaffSelect
                                value={row.manager}
                                onChange={(v) => {
                                  if (v === "__custom__") {
                                    setCustomEventTimelineOwner((prev) => ({
                                      ...prev,
                                      [i]: true,
                                    }));
                                    updateEvent(i, "manager", "");
                                  } else {
                                    updateEvent(i, "manager", v);
                                  }
                                }}
                              />
                            )}
                          </td>
                          <td>
                            <Input
                              value={row.note}
                              onChange={(e) =>
                                updateStaff(i, "note", e.target.value)
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
                      setStaffAssign([
                        ...staffAssign,
                        { department: "", duty: "", manager: "", note: "" },
                      ])
                    }
                  >
                    + Thêm dòng
                  </Button>
                </div>

                {/* ✅ TIMELINE NGÀY DIỄN RA */}
                <div>
                  <h3 className="font-semibold mb-2">Timeline ngày diễn ra</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th>Thời gian</th>
                        <th>Hoạt động</th>
                        <th>Phụ trách</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventTimeline.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <Input
                              value={row.time}
                              onChange={(e) =>
                                updateEvent(i, "time", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              value={row.activity}
                              onChange={(e) =>
                                updateEvent(i, "activity", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-1">
                            {customPrepOwner[i] ? (
                              <Input
                                value={row.manager}
                                onChange={(e) =>
                                  updatePrep(i, "manager", e.target.value)
                                }
                                onBlur={() =>
                                  setCustomPrepOwner((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }))
                                }
                              />
                            ) : (
                              <StaffSelect
                                value={row.manager}
                                onChange={(v) => {
                                  if (v === "__custom__") {
                                    setCustomPrepOwner((prev) => ({
                                      ...prev,
                                      [i]: true,
                                    }));
                                    updatePrep(i, "manager", "");
                                  } else {
                                    updatePrep(i, "manager", v);
                                  }
                                }}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Button
                    className="mt-2"
                    onClick={() =>
                      setEventTimeline([
                        ...eventTimeline,
                        { time: "", activity: "", manager: "" },
                      ])
                    }
                  >
                    + Thêm dòng
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  3. Xây dựng ý tưởng & Concept
                </h2>
                <div className="space-y-3">
                  <Label>Chọn mẫu Template (tự động điền):</Label>

                  <Select onValueChange={loadStep3Template}>
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Chọn mẫu..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">
                        💍 Đám cưới (Wedding)
                      </SelectItem>
                      <SelectItem value="conference">🎓 Hội nghị</SelectItem>
                      <SelectItem value="birthday">🎂 Sinh nhật</SelectItem>
                      <SelectItem value="company">
                        🏢 Sự kiện công ty
                      </SelectItem>
                      <SelectItem value="public">
                        🎤 Sự kiện đại chúng
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ✅ INPUT CHỦ ĐỀ */}
                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold">Chủ đề sự kiện</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Chủ đề</Label>
                      <Input
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Màu sắc chủ đạo</Label>
                      <Input
                        value={mainColor}
                        onChange={(e) => setMainColor(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Phong cách</Label>
                      <Input
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Thông điệp</Label>
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Trang trí</Label>
                      <Input
                        value={decoration}
                        onChange={(e) => setDecoration(e.target.value)}
                        placeholder="Backdrop, hoa tươi, hiệu ứng ánh sáng…"
                      />
                    </div>
                  </div>
                </Card>

                {/* ✅ KỊCH BẢN CHƯƠNG TRÌNH */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Kịch bản chương trình</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Thời gian</th>
                        <th className="border p-1">Nội dung</th>
                      </tr>
                    </thead>

                    <tbody>
                      {programScript.map((row, i) => (
                        <tr key={i}>
                          <td className="border p-1">
                            <Input
                              value={row.time}
                              onChange={(e) =>
                                updateProgram(i, "time", e.target.value)
                              }
                            />
                          </td>

                          <td className="border p-1">
                            <Input
                              value={row.content}
                              onChange={(e) =>
                                updateProgram(i, "content", e.target.value)
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
                      setProgramScript([
                        ...programScript,
                        { time: "", content: "" },
                      ])
                    }
                  >
                    + Thêm dòng
                  </Button>
                </Card>

                {/* ✅ HOẠT ĐỘNG CHÍNH */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Hoạt động chính</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Hoạt động</th>
                        <th className="border p-1">Mức độ quan trọng</th>
                      </tr>
                    </thead>

                    <tbody>
                      {keyActivities.map((row, i) => (
                        <tr key={i}>
                          <td className="border p-1">
                            <Input
                              value={row.activity}
                              onChange={(e) =>
                                updateKeyActivities(
                                  i,
                                  "activity",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td className="border p-1">
                            <Select
                              value={row.importance}
                              onValueChange={(v) =>
                                updateKeyActivities(i, "importance", v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mức độ" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cao">Cao</SelectItem>
                                <SelectItem value="Trung bình">
                                  Trung bình
                                </SelectItem>
                                <SelectItem value="Thấp">Thấp</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Button
                    className="mt-2"
                    onClick={() =>
                      setKeyActivities([
                        ...keyActivities,
                        { activity: "", importance: "" },
                      ])
                    }
                  >
                    + Thêm hoạt động
                  </Button>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  4. Chuẩn bị chi tiết (Pre-event)
                </h2>

                {/* CHECKLIST TABLE */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Checklist chuẩn bị</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Hạng mục</th>
                        <th className="border p-1">Mô tả</th>
                        <th className="border p-1">Phụ trách</th>
                        <th className="border p-1">Deadline</th>
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
                                updateChecklist(
                                  i,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Mô tả công việc..."
                            />
                          </td>

                          <td className="border p-1">
                            {customPrepOwner[i] ? (
                              <Input
                                value={row.owner}
                                onChange={(e) =>
                                  updateChecklist(i, "owner", e.target.value)
                                }
                                onBlur={() =>
                                  setCustomPrepOwner((prev) => ({
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
                                    setCustomPrepOwner((prev) => ({
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
                              type="date"
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

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  5. Truyền thông & Marketing
                </h2>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Checklist Marketing</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Hạng mục</th>
                        <th className="border p-1">Mô tả</th>
                        <th className="border p-1">Phụ trách</th>
                        <th className="border p-1">Deadline</th>
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
                            <td className="border p-1">
                              {customMarketingOwner[i] ? (
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
                                    setCustomMarketingOwner((prev) => ({
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
                                      setCustomMarketingOwner((prev) => ({
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
                          </td>

                          <td className="border p-1">
                            <Input
                              type="date"
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

            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  6. Triển khai ngày sự kiện (Event Day Checklist)
                </h2>
                <Select
                  onValueChange={(type) =>
                    setEventDayChecklist(EVENT_TEMPLATES_STEP6[type])
                  }
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Chọn mẫu checklist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">💍 Đám cưới</SelectItem>
                    <SelectItem value="conference">🏢 Hội nghị</SelectItem>
                    <SelectItem value="birthday">🎂 Sinh nhật</SelectItem>
                    <SelectItem value="company_event">
                      🏙️ Sự kiện công ty
                    </SelectItem>
                    <SelectItem value="public_event">
                      🎤 Sự kiện đại chúng
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Checklist ngày diễn ra</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Hạng mục</th>
                        <th className="border p-1">Mô tả</th>
                        <th className="border p-1">Phụ trách</th>
                        <th className="border p-1">Deadline</th>
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
                            <td className="border p-1">
                              {customEventDayOwner[i] ? (
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
                                    setCustomEventDayOwner((prev) => ({
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
                                      setCustomEventDayOwner((prev) => ({
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
                          </td>

                          <td className="border p-1">
                            <Input
                              type="date"
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

            {step === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  7. Hậu sự kiện (Post-event)
                </h2>

                {/* Nút tải template */}
                <div className="flex gap-2 items-center">
                  <Label>Tải dữ liệu mẫu:</Label>
                  <Select onValueChange={loadStep7Template}>
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Chọn mẫu sự kiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">💍 Đám cưới</SelectItem>
                      <SelectItem value="conference">🏢 Hội nghị</SelectItem>
                      <SelectItem value="birthday">🎂 Sinh nhật</SelectItem>
                      <SelectItem value="company_event">
                        🏙️ Sự kiện công ty
                      </SelectItem>
                      <SelectItem value="public_event">
                        🎤 Sự kiện đại chúng
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Hậu sự kiện</h3>

                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Hạng mục</th>
                        <th className="border p-1">Mô tả</th>
                        <th className="border p-1">Phụ trách</th>
                        <th className="border p-1">Deadline</th>
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
                                updatePostEvent(
                                  i,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td className="border p-1">
                            {customPostOwner[i] ? (
                              <Input
                                value={row.owner}
                                onChange={(e) =>
                                  updatePostEvent(i, "owner", e.target.value)
                                }
                                onBlur={() =>
                                  setCustomPostOwner((prev) => ({
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
                                    setCustomPostOwner((prev) => ({
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
                              type="date"
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

                  {/* Add row */}
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
            {/* ================== NAVIGATION BUTTONS ================== */}
            <div className="flex justify-between mt-6">
              <Button disabled={step === 1} onClick={() => setStep(step - 1)}>
                ← Quay lại
              </Button>

              {step < 7 ? (
                <Button onClick={() => setStep(step + 1)}>Tiếp tục →</Button>
              ) : (
                <Button
                  className="bg-green-600 text-white"
                  onClick={handleCompletePlan}
                >
                  ✅ Hoàn tất kế hoạch sự kiện
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Danh sách booking confirmed */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Ô tìm kiếm theo phone/email */}
        <div className="flex-1">
          <Input
            placeholder="🔍 Tìm theo số điện thoại hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Bộ lọc theo loại sự kiện */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Lọc theo loại sự kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại sự kiện</SelectItem>
            <SelectItem value="Tiệc cưới">🍽️ Tiệc cưới</SelectItem>
            <SelectItem value="Hội nghị">🏢 Hội nghị</SelectItem>
            <SelectItem value="Sinh nhật">🎂 Sinh nhật</SelectItem>
            <SelectItem value="Sự kiện công ty">🏙️ Sự kiện công ty</SelectItem>
            <SelectItem value="Sự kiện đại chúng">
              🎤 Sự kiện đại chúng
            </SelectItem>
            <SelectItem value="Khác">✨ Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookingsList
          .filter((b) => {
            const s = search.toLowerCase();
            const matchSearch =
              !s ||
              b.phone?.toLowerCase().includes(s) ||
              b.email?.toLowerCase().includes(s);
            const matchType =
              filterType === "all" || b.event_type === filterType;
            return matchSearch && matchType;
          })
          .map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>{b.customer_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <b>Ngày tổ chức:</b> {formatDate(b.event_date)}
                </p>
                <p>
                  <b>Loại sự kiện:</b> {b.event_type}
                </p>
                <p>
                  <b>Địa điểm:</b> {b.address}
                </p>
                {(() => {
                  const plan = plansMap[b._id];
                  const status = plan?.status;

                  // Nếu đã có trạng thái final thì chỉ hiển thị badge
                  if (
                    ["csconfirmed", "cancelled", "completed"].includes(status)
                  ) {
                    return (
                      <div className="mt-3">
                        {status === "csconfirmed" && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                            Đã xác nhận
                          </span>
                        )}
                        {status === "cancelled" && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded">
                            Đã hủy
                          </span>
                        )}
                        {status === "completed" && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                    );
                  }

                  // Nếu KHÔNG có plan → hiển thị nút tạo mới
                  if (!plan) {
                    return (
                      <Button
                        onClick={async () => {
                          setEditingPlan(null);
                          setSelectedBookingId(b._id);
                          await fetchBookingDetail(b._id);
                          setOpen(true);
                        }}
                      >
                        📝 Lên kế hoạch sự kiện
                      </Button>
                    );
                  }

                  // Nếu có plan nhưng chưa có status → hiển thị nút sửa
                  return (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/event-plans?booking_id=${b._id}`
                        );
                        const json = await res.json();

                        if (json.success && json.data) {
                          setEditingPlan(json.data);
                          setSelectedBookingId(b._id);
                          await fetchBookingDetail(b._id);
                          setOpen(true);
                        } else {
                          alert("❌ Không thể tải kế hoạch!");
                        }
                      }}
                    >
                      ✏️ Xem / Sửa kế hoạch
                    </Button>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
