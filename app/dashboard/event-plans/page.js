"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Check, CheckCircle, Clock, XCircle, Sparkles, Calendar, Users, Tag, Phone } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import eventTemplates from "../data/event-templates";
import { PageHeader } from "@/components/ui/page-header";

export default function EventPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [partners, setPartners] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  // Custom owner states
  const [customPrepOwner, setCustomPrepOwner] = useState({});
  const [customStaffAssignOwner, setCustomStaffAssignOwner] = useState({});
  const [customEventTimelineOwner, setCustomEventTimelineOwner] = useState({});
  const [customMarketingOwner, setCustomMarketingOwner] = useState({});
  const [customEventDayOwner, setCustomEventDayOwner] = useState({});
  const [customPostOwner, setCustomPostOwner] = useState({});
  const [customStep4Owner, setCustomStep4Owner] = useState({});
  const [customStep5Owner, setCustomStep5Owner] = useState({});
  const [customStep6Owner, setCustomStep6Owner] = useState({});
  const [customStep7Owner, setCustomStep7Owner] = useState({});

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [plansMap, setPlansMap] = useState({});

  // Step 1
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [eventCategory, setEventCategory] = useState("");

  // Step 2
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [bookingServices, setBookingServices] = useState([]);
  const [budgetRows, setBudgetRows] = useState([
    { category: "", description: "", unit: "", quantity: 1, cost: 0, note: "" },
  ]);
  const [prepTimeline, setPrepTimeline] = useState([
    { time: "", task: "", manager: "" },
  ]);
  const [staffAssign, setStaffAssign] = useState([
    { department: "", duty: "", manager: "", note: "" },
  ]);
  const [eventTimeline, setEventTimeline] = useState([
    { time: "", activity: "", manager: "" },
  ]);
  const [ticketPricing, setTicketPricing] = useState([]);

  // Step 3
  const [theme, setTheme] = useState("");
  const [mainColor, setMainColor] = useState("");
  const [style, setStyle] = useState("");
  const [message, setMessage] = useState("");
  const [decoration, setDecoration] = useState("");
  const [programScript, setProgramScript] = useState([
    { time: "", content: "" },
  ]);
  const [keyActivities, setKeyActivities] = useState([
    { activity: "", importance: "" },
  ]);

  // Step 3.5 - Kế hoạch chi phí
  const [partnerCosts, setPartnerCosts] = useState([
    { partnerId: "", partnerName: "", description: "", amount: 0, note: "" },
  ]);
  const [paymentPlan, setPaymentPlan] = useState([
    { description: "", amount: 0, dueDate: "", status: "pending", note: "" },
  ]);

  // Step 4
  const [prepChecklist, setPrepChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 5
  const [marketingChecklist, setMarketingChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 6
  const [eventDayChecklist, setEventDayChecklist] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 7
  const [postEventRows, setPostEventRows] = useState([
    { category: "", description: "", owner: "", deadline: "" },
  ]);

  // Step 9 - Kế hoạch bán vé
  const [ticketSaleStart, setTicketSaleStart] = useState("");
  const [ticketSaleEnd, setTicketSaleEnd] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [ticketLimitPerPerson, setTicketLimitPerPerson] = useState(0);
  const [ticketSalePricing, setTicketSalePricing] = useState([]);

  // ============ FETCH DATA ============
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) setCurrentUser(data.user);
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const json = await res.json();
      console.log("Staff API response:", json);
      
      if (json.success && Array.isArray(json.data)) {
        setStaff(json.data);
        console.log("Staff loaded:", json.data.length, "members");
      } else {
        console.warn("Staff data not in expected format:", json);
        setStaff([]);
      }
    } catch (err) {
      console.error("Fetch staff error:", err);
      setStaff([]);
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

  const fetchPartnerOptions = async () => {
    try {
      const res = await fetch("/api/partners");
      const json = await res.json();

      if (json.data) {
        let filtered = json.data;
        
        // Step 2: Filter for Restaurant/Hotel
        if (step === 2) {
          filtered = json.data.filter(
            (p) =>
              p.partner_type?.toLowerCase().includes("nhà hàng") ||
              p.partner_type?.toLowerCase().includes("khách sạn")
          );
        }
        // Step 4: Show all partners (no filter needed)
        
        setPartnerOptions(filtered);
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
        fetchServiceDetails(data.data);
      }
    } catch (err) {
      console.error("Fetch booking detail error:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPartners();
    fetchStaff();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (step === 2 || step === 4) {
      fetchPartnerOptions();
    }
  }, [step]);

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

  // ============ HELPERS FOR DATA TRANSFORMATION ============
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
    // If it's already a string (legacy data or error), return it
    if (typeof managerObj === "string") return managerObj;
    // Return ID if exists (linked to staff), otherwise return name (custom)
    return managerObj.id || managerObj.name || "";
  };

  const formatManagerData = (value) => {
    if (!value) return { name: "", id: null };
    
    // Check if it's a valid staff ID
    const staffMember = staff.find(s => s._id === value);
    if (staffMember) {
      return { name: staffMember.full_name, id: staffMember._id };
    }
    
    // Otherwise it's a custom name
    return { name: value, id: null };
  };

  useEffect(() => {
    if (editingPlan) {
      setGoal(editingPlan.step1?.goal || "");
      setAudience(editingPlan.step1?.audience || "");
      setEventCategory(editingPlan.step1?.eventCategory || "");
      
      // Date inputs
      setStartDate(formatDateForInput(editingPlan.step2?.startDate));
      setEndDate(formatDateForInput(editingPlan.step2?.endDate));
      
      setSelectedPartner(editingPlan.step2?.selectedPartner || "");
      setBudgetRows(editingPlan.step2?.budget || []);
      
      // Transform manager objects to strings for state AND format dates
      setPrepTimeline(
        editingPlan.step2?.prepTimeline?.map(item => ({
          ...item,
          time: formatDateTimeForInput(item.time),
          manager: getManagerValue(item.manager)
        })) || []
      );
      setStaffAssign(
        editingPlan.step2?.staffAssign?.map(item => ({
          ...item,
          manager: getManagerValue(item.manager)
        })) || []
      );
      setEventTimeline(
        editingPlan.step2?.eventTimeline?.map(item => ({
          ...item,
          time: formatDateTimeForInput(item.time),
          manager: getManagerValue(item.manager)
        })) || []
      );
      
      setTicketPricing(editingPlan.step2?.ticketPricing || []);
      setTheme(editingPlan.step3?.theme || "");
      setMainColor(editingPlan.step3?.mainColor || "");
      setStyle(editingPlan.step3?.style || "");
      setMessage(editingPlan.step3?.message || "");
      setDecoration(editingPlan.step3?.decoration || "");
      
      setProgramScript(
        editingPlan.step3?.programScript?.map(item => ({
          ...item,
          time: formatDateTimeForInput(item.time)
        })) || []
      );
      
      setKeyActivities(editingPlan.step3?.keyActivities || []);
      setPartnerCosts(editingPlan.step3_5?.partnerCosts || []);
      
      setPaymentPlan(
        editingPlan.step3_5?.paymentPlan?.map(item => ({
          ...item,
          dueDate: formatDateForInput(item.dueDate)
        })) || []
      );
      
      // Transform owner objects to strings for state AND format deadlines
      setPrepChecklist(
        editingPlan.step4?.checklist?.map(item => ({
          ...item,
          deadline: formatDateTimeForInput(item.deadline),
          owner: getManagerValue(item.owner)
        })) || []
      );
      setMarketingChecklist(
        editingPlan.step5?.marketingChecklist?.map(item => ({
          ...item,
          deadline: formatDateTimeForInput(item.deadline),
          owner: getManagerValue(item.owner)
        })) || []
      );
      setEventDayChecklist(
        editingPlan.step6?.eventDayChecklist?.map(item => ({
          ...item,
          deadline: formatDateTimeForInput(item.deadline),
          owner: getManagerValue(item.owner)
        })) || []
      );
      setPostEventRows(
        editingPlan.step7?.postEvent?.map(item => ({
          ...item,
          deadline: formatDateTimeForInput(item.deadline),
          owner: getManagerValue(item.owner)
        })) || []
      );
      
      setTicketSaleStart(formatDateTimeForInput(editingPlan.step9?.saleStartDate));
      setTicketSaleEnd(formatDateTimeForInput(editingPlan.step9?.saleEndDate));
      setRefundPolicy(editingPlan.step9?.refundPolicy || "");
      setTicketLimitPerPerson(editingPlan.step9?.limitPerPerson || 0);
      setTicketSalePricing(editingPlan.step9?.ticketPricing || []);
    } else {
      resetForm();
    }
  }, [editingPlan, staff]); // Added staff dependency to ensure getManagerValue works if needed, though mostly it uses ID/name directly

  // Initialize ticket pricing from bookingInfo
  useEffect(() => {
    if (bookingInfo?.ticket_sale && bookingInfo?.tickets?.length > 0) {
      // Only initialize if ticketPricing is empty (new plan)
      if (ticketPricing.length === 0 && !editingPlan) {
        const initialPricing = bookingInfo.tickets.map((ticket) => ({
          type: ticket.type,
          quantity: ticket.quantity,
          price: 0,
          totalRevenue: 0,
        }));
        setTicketPricing(initialPricing);
      }
      // Initialize ticketSalePricing for step 9
      if (ticketSalePricing.length === 0 && !editingPlan) {
        const initialSalePricing = bookingInfo.tickets.map((ticket) => ({
          type: ticket.type,
          quantity: ticket.quantity,
          price: 0,
          earlyBirdPrice: 0,
          regularPrice: 0,
          latePrice: 0,
        }));
        setTicketSalePricing(initialSalePricing);
      }
    }
  }, [bookingInfo, editingPlan]);

  // ============ UTILS ============
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const resetForm = () => {
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
    setTicketPricing([]);
    setTheme("");
    setMainColor("");
    setStyle("");
    setMessage("");
    setDecoration("");
    setProgramScript([]);
    setKeyActivities([]);
    setPartnerCosts([]);
    setPaymentPlan([]);
    setPrepChecklist([]);
    setMarketingChecklist([]);
    setEventDayChecklist([]);
    setPostEventRows([]);
    setTicketSaleStart("");
    setTicketSaleEnd("");
    setRefundPolicy("");
    setTicketLimitPerPerson(0);
    setTicketSalePricing([]);
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
              {s.department ? ` — ${s.department.name}` : ""}
              {s.role ? ` — ${s.role.name}` : ""}
            </SelectItem>
          ))}

          <SelectItem value="__custom__">✏️ Khác (tự nhập)</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  // ============ HANDLE SAVE ============
  const handleSaveStep123 = async () => {
    try {
      const totalTicketRevenue = ticketPricing.reduce(
        (sum, t) => sum + (t.totalRevenue || 0),
        0
      );

      const payload = {
        booking_id: selectedBookingId,
        status: "draft",
        step1: { goal, audience, eventCategory },
        step2: {
          startDate,
          endDate,
          selectedPartner,
          budget: budgetRows,
          prepTimeline: prepTimeline.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          staffAssign: staffAssign.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          eventTimeline: eventTimeline.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          ticketPricing,
          totalTicketRevenue,
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
        step3_5: {
          partnerCosts,
          paymentPlan,
          totalEstimatedCost: (partnerCosts || []).reduce((s, p) => s + (p.amount || 0), 0),
          totalPayment: (paymentPlan || []).reduce((s, d) => s + (d.amount || 0), 0),
        },
      };

      const checkRes = await fetch(
        `/api/event-plans?booking_id=${selectedBookingId}`
      );
      const checkJson = await checkRes.json();
      const method = checkJson?.data ? "PATCH" : "POST";

      const res = await fetch("/api/event-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(`✅ Lưu bước 1-4 thành công!`);
        return json.data;
      } else {
        toast.error("❌ Lỗi: " + json.message);
        return null;
      }
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      toast.error("❌ Đã xảy ra lỗi");
      return null;
    }
  };

  const handleSaveAndContinueToDetails = async () => {
    try {
      const savedData = await handleSaveStep123();
      if (savedData) {
        toast.success("✅ Đã lưu! Chuyển sang trang kế hoạch chi tiết...");
        setOpen(false);
        // Redirect to details page with booking_id
        router.push(`/dashboard/event-plan-details?booking_id=${selectedBookingId}`);
      }
    } catch (err) {
      console.error("Lỗi khi lưu và chuyển trang:", err);
      toast.error("❌ Đã xảy ra lỗi");
    }
  };


  const handleSubmitForManagerApproval = async () => {
    try {
      const totalTicketRevenue = ticketPricing.reduce(
        (sum, t) => sum + (t.totalRevenue || 0),
        0
      );

      const payload = {
        booking_id: selectedBookingId,
        status: "pending_manager_demo",
        step1: { goal, audience, eventCategory },
        step2: {
          startDate,
          endDate,
          selectedPartner,
          budget: budgetRows,
          prepTimeline: prepTimeline.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          staffAssign: staffAssign.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          eventTimeline: eventTimeline.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          ticketPricing,
          totalTicketRevenue,
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
        step3_5: {
          partnerCosts,
          paymentPlan,
          totalEstimatedCost: (partnerCosts || []).reduce((s, p) => s + (p.amount || 0), 0) + (budgetRows || []).reduce((s, b) => s + ((b.cost || 0) * (b.quantity || 1)), 0),
          totalPayment: (paymentPlan || []).reduce((s, d) => s + (d.amount || 0), 0),
        },
      };

      const checkRes = await fetch(
        `/api/event-plans?booking_id=${selectedBookingId}`
      );
      const checkJson = await checkRes.json();
      const method = checkJson?.data ? "PATCH" : "POST";

      const res = await fetch("/api/event-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("✅ Đã lưu và gửi kế hoạch demo thành công!");
        setOpen(false);
        fetchBookings();
      } else {
        toast.error("❌ Lỗi: " + json.message);
      }
    } catch (err) {
      console.error("Submit approval error:", err);
      toast.error("❌ Đã xảy ra lỗi");
    }
  };

  const handleCustomerApproval = async () => {
    try {
      const payload = {
        booking_id: selectedBookingId,
        status: "customer_approved_demo",
      };

      const res = await fetch("/api/event-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("✅ Đã cập nhật trạng thái: Khách hàng đồng ý!");
        setOpen(false);
        fetchBookings();
      } else {
        toast.error("❌ Lỗi: " + json.message);
      }
    } catch (err) {
      console.error("Customer approval error:", err);
      toast.error("❌ Đã xảy ra lỗi");
    }
  };

  const handleCompletePlan = async () => {
    try {
      const totalCost = partnerCosts.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      const totalPayment = paymentPlan.reduce(
        (sum, d) => sum + (d.amount || 0),
        0
      );
      const totalTicketRevenue = ticketPricing.reduce(
        (sum, t) => sum + (t.totalRevenue || 0),
        0
      );

      const payload = {
        booking_id: selectedBookingId,
        status: "pending_manager", // ✅ Tự động chuyển sang chờ quản lý duyệt
        step1: { goal, audience, eventCategory },
        step2: {
          startDate,
          endDate,
          selectedPartner,
          budget: budgetRows,
          prepTimeline: prepTimeline.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          staffAssign: staffAssign.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          eventTimeline: eventTimeline.map(item => ({
            ...item,
            manager: formatManagerData(item.manager)
          })),
          ticketPricing,
          totalTicketRevenue,
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
        step3_5: {
          partnerCosts,
          paymentPlan,
          totalEstimatedCost: totalCost,
          totalPayment,
          totalRemaining: totalCost - totalPayment,
        },
        step4: { 
          checklist: prepChecklist.map(item => ({
            ...item,
            owner: formatManagerData(item.owner)
          }))
        },
        step5: { 
          marketingChecklist: marketingChecklist.map(item => ({
            ...item,
            owner: formatManagerData(item.owner)
          }))
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

      // Chỉ thêm step9 nếu là Sự kiện đại chúng
      if (bookingInfo?.event_type === "Sự kiện đại chúng") {
        payload.step9 = {
          saleStartDate: ticketSaleStart,
          saleEndDate: ticketSaleEnd,
          refundPolicy,
          limitPerPerson: ticketLimitPerPerson,
          ticketPricing: ticketSalePricing,
        };
      }

      const checkRes = await fetch(
        `/api/event-plans?booking_id=${selectedBookingId}`
      );
      const checkJson = await checkRes.json();
      const method = checkJson?.data ? "PATCH" : "POST";

      const res = await fetch("/api/event-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(`✅ Hoàn tất kế hoạch và gửi phê duyệt thành công!`);
        setOpen(false);
        fetchBookings(); // Refresh the list
      } else {
        toast.error("❌ Lỗi: " + json.message);
      }
    } catch (err) {
      console.error("Lỗi khi lưu kế hoạch:", err);
      toast.error("❌ Đã xảy ra lỗi");
    }
  };

  // ============ UPDATE FUNCTIONS ============
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

  const updateEvent = (index, field, value) => {
    setEventTimeline((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

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

  const updatePartnerCost = (index, field, value) => {
    setPartnerCosts((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const updatePaymentPlan = (index, field, value) => {
    setPaymentPlan((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
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

  const updateTicketPricing = (index, field, value) => {
    setTicketPricing((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      
      // Auto-calculate totalRevenue when price or quantity changes
      if (field === 'price' || field === 'quantity') {
        const price = field === 'price' ? value : updated[index].price;
        const quantity = field === 'quantity' ? value : updated[index].quantity;
        updated[index].totalRevenue = (price || 0) * (quantity || 0);
      }
      
      return updated;
    });
  };

  const updateTicketSalePricing = (index, field, value) => {
    setTicketSalePricing((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // ============ LOAD TEMPLATE ============
  const loadTemplate = (eventType, startUiStep = 1) => {
    const template = eventTemplates[eventType];
    if (!template) {
      toast.error("❌ Không tìm thấy mẫu cho loại sự kiện này!");
      return;
    }

    // Load Step 1
    if (startUiStep <= 1) {
      setGoal(template.step1.goal);
      setAudience(template.step1.audience);
      setEventCategory(template.step1.eventCategory);
    }

    // Load Step 2
    if (startUiStep <= 2) {
      setStartDate(template.step2.startDate || "");
      setEndDate(template.step2.endDate || "");
      setBudgetRows(template.step2.budget || []);
      setPrepTimeline(template.step2.prepTimeline || []);
      setStaffAssign(template.step2.staffAssign || []);
      setEventTimeline(template.step2.eventTimeline || []);
      setTicketPricing(template.step2.ticketPricing || []);
    }

    // Load Step 3
    if (startUiStep <= 3) {
      setTheme(template.step3.theme);
      setMainColor(template.step3.mainColor);
      setStyle(template.step3.style);
      setMessage(template.step3.message);
      setDecoration(template.step3.decoration);
      setProgramScript(template.step3.programScript || []);
      setKeyActivities(template.step3.keyActivities || []);
    }

    // Load Step 3.5 (UI Step 4)
    if (startUiStep <= 4) {
      setPartnerCosts(template.step3_5.partnerCosts || []);
      setPaymentPlan(template.step3_5.paymentPlan || []);
    }

    // Load Step 4 (UI Step 5)
    if (startUiStep <= 5) {
      setPrepChecklist(template.step4.checklist || []);
    }

    // Load Step 5 (UI Step 6)
    if (startUiStep <= 6) {
      setMarketingChecklist(template.step5.marketingChecklist || []);
    }

    // Load Step 6 (UI Step 7)
    if (startUiStep <= 7) {
      setEventDayChecklist(template.step6.eventDayChecklist || []);
    }

    // Load Step 7 (UI Step 8)
    if (startUiStep <= 8) {
      setPostEventRows(template.step7.postEvent || []);
    }

    toast.success("✅ Đã tải dữ liệu mẫu thành công!");
  };

  // ============ HANDLE OPEN DIALOG ============
  const handleOpenPlanDialog = async (booking, mode, plan = null) => {
    try {
      if (mode === "create") {
        setEditingPlan(null);
        setSelectedBookingId(booking._id);
        
        // Ensure bookingInfo is fresh
        const bookingRes = await fetch(`/api/bookings/${booking._id}`);
        const bookingJson = await bookingRes.json();
        
        if (bookingJson.success) {
            setBookingInfo(bookingJson.data);
            fetchServiceDetails(bookingJson.data);
            
            // Only after setting bookingInfo, proceed
            setStep(1);
            setShowTemplateDialog(true);
        } else {
            toast.error("Không thể tải thông tin booking");
        }
      } else if (mode === "edit") {
        const planRes = await fetch(`/api/event-plans?booking_id=${booking._id}`);
        const planJson = await planRes.json();

        if (planJson.success && planJson.data) {
          setEditingPlan(planJson.data);
          setSelectedBookingId(booking._id);
          
          await fetchBookingDetail(booking._id);

          const status = planJson.data.status;
          
          if (status === "draft" || status === "pending_manager") {
            setStep(1);
            setOpen(true);
          } else if (status === "customer_approved") {
            setStep(4);
            setOpen(true);
          } else if (status === "customer_approved_demo") {
            setStep(4);
            setShowTemplateDialog(true);
          } else {
            setStep(1);
            setOpen(true);
          }
        } else {
          toast.error("❌ Không thể tải kế hoạch!");
        }
      }
    } catch (err) {
      console.error("Open dialog error:", err);
      toast.error("Đã xảy ra lỗi khi mở kế hoạch");
    }
  };

  // ============ STATUS BADGE ============
  const getStatusBadge = (status) => {
    const config = {
      draft: { label: "📝 Đang soạn", color: "bg-gray-100 text-gray-700", icon: Clock },
      pending_manager: { label: "⏳ Chờ duyệt (Chi tiết)", color: "bg-yellow-100 text-yellow-700", icon: Clock },
      pending_manager_demo: { label: "⏳ Chờ duyệt (Demo)", color: "bg-orange-100 text-orange-700", icon: Clock },
      manager_approved: { label: "✅ QL đã duyệt (Chi tiết)", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      manager_approved_demo: { label: "✅ QL đã duyệt (Demo)", color: "bg-blue-500 text-white", icon: CheckCircle },
      pending_customer: { label: "⏳ Chờ khách (Chi tiết)", color: "bg-purple-100 text-purple-700", icon: Clock },
      pending_customer_demo: { label: "⏳ Chờ khách (Demo)", color: "bg-purple-500 text-white", icon: Clock },
      customer_approved: { label: "🎉 Khách đã chốt", color: "bg-green-100 text-green-700", icon: CheckCircle },
      customer_approved_demo: { label: "🎉 Khách chốt Demo", color: "bg-green-500 text-white", icon: CheckCircle },
      in_progress: { label: "🚀 Đang triển khai", color: "bg-indigo-100 text-indigo-700", icon: Calendar },
      completed: { label: "🏁 Hoàn thành", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
      cancelled: { label: "❌ Đã hủy", color: "bg-red-100 text-red-700", icon: XCircle },
    };

    const item = config[status] || config.draft;
    const Icon = item.icon;

    if (!status && !config[status]) {
         return (
             <span className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit bg-gray-50 text-gray-400">
               <Clock className="w-3 h-3" />
               Chưa có
             </span>
         )
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${item.color}`}>
        <Icon className="w-3 h-3" />
        {item.label}
      </span>
    );
  };


  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="📅 Quản lý Kế hoạch"
        description="Tạo và quản lý kế hoạch sự kiện"
      />

      {/* TEMPLATE CONFIRMATION DIALOG */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Sử dụng dữ liệu mẫu?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Bạn có muốn điền dữ liệu mẫu để tham khảo không? Dữ liệu mẫu sẽ giúp bạn hiểu rõ hơn về cách lập kế hoạch sự kiện.
            </p>
            
            {bookingInfo && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Loại sự kiện: {bookingInfo.event_type}
                </p>
                <p className="text-xs text-blue-700">
                  Dữ liệu mẫu sẽ được điền tự động cho loại sự kiện này
                </p>
              </div>
            )}
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
              Không, tôi tự điền
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                if (bookingInfo?.event_type) {
                  loadTemplate(bookingInfo.event_type, step);
                }
                setShowTemplateDialog(false);
                setOpen(true);
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Có, dùng mẫu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan
                ? "✏️ Chỉnh sửa kế hoạch sự kiện"
                : "📋 Lên kế hoạch sự kiện"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4">
            {editingPlan && getStatusBadge(editingPlan.status)}
          </div>

          {editingPlan?.status === "manager_approved_demo" && (
            <div className="bg-green-50 p-4 rounded mb-4 border border-green-200">
              <p className="text-green-700 font-semibold flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                ✅ Kế hoạch demo đã được phê duyệt
              </p>
              <p className="text-sm text-green-600 mt-1 ml-7">
                Vui lòng vào trang <b>"Kế hoạch chi tiết"</b> để tiếp tục lập kế hoạch chi tiết (Step 4-9).
                Bạn không thể chỉnh sửa thông tin ở đây nữa.
              </p>
            </div>
          )}
          {/* STEP 1 */}
          {step === 1 && (
            <fieldset disabled={editingPlan?.status === "manager_approved_demo" || editingPlan?.status === "customer_approved_demo" || editingPlan?.status === "cancelled" || editingPlan?.status === "completed"} className="space-y-4 border-none p-0 m-0 min-w-0">
              <h2 className="text-xl font-semibold">
                1. Xác định mục tiêu & loại sự kiện
              </h2>

              {bookingInfo && (
                <Card className="p-4 bg-muted">
                  <h3 className="font-semibold mb-2">
                    📋 Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <p>
                        <b>👤 Khách hàng:</b> {bookingInfo.customer_name}
                      </p>
                      <p>
                        <b>📞 Điện thoại:</b> {bookingInfo.phone}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <b>📧 Email:</b> {bookingInfo.email}
                      </p>
                      <p>
                        <b>📍 Địa chỉ:</b> {bookingInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="border-t mt-3 pt-3">
                    <p>
                      <b>🎭 Loại sự kiện:</b> {bookingInfo.event_type}
                    </p>
                  </div>
                </Card>
              )}

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
            </fieldset>
          )}
          {/* STEP 2 */}
          {step === 2 && (
            <fieldset disabled={editingPlan?.status === "manager_approved_demo" || editingPlan?.status === "customer_approved_demo" || editingPlan?.status === "cancelled" || editingPlan?.status === "completed"} className="space-y-6 border-none p-0 m-0 min-w-0">
              <h2 className="text-xl font-semibold">
                2. Lập kế hoạch tổng thể (Master Plan)
              </h2>

              {bookingInfo && (
                <Card className="p-4 bg-muted">
                  <h3 className="font-semibold mb-3 text-lg">
                    📋 Thông tin booking
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Thông tin sự kiện */}
                    <div className="space-y-2">
                      <p>
                        <b>🎭 Loại sự kiện:</b> {bookingInfo.event_type}
                      </p>
                      <p>
                        <b>📅 Ngày tổ chức:</b>{" "}
                        {formatDate(bookingInfo.event_date)}
                      </p>
                      <p>
                        <b>🕐 Giờ bắt đầu:</b> {bookingInfo.event_time || "—"}
                      </p>
                      <p>
                        <b>🕐 Giờ kết thúc:</b>{" "}
                        {bookingInfo.event_end_time || "—"}
                      </p>
                      <p>
                        <b>👥 Quy mô:</b> {bookingInfo.scale} khách
                      </p>
                    </div>

                    {/* Bán vé */}
                    {bookingInfo.ticket_sale && (
                      <div className="col-span-full border-t pt-3 mt-2">
                        <p className="font-semibold mb-2">
                          🎫 Thông tin bán vé:
                        </p>
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
                      </div>
                    )}

                    {/* Kiểm toán */}
                    {bookingInfo.allow_auditing && (
                      <div className="col-span-full border-t pt-3 mt-2">
                        <p className="font-semibold mb-2">
                          🔍 Vị trí Thính giả:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {bookingInfo.auditing_areas?.map((area, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-2 rounded border"
                            >
                              <p className="text-xs text-gray-600">
                                {area.area_type}
                              </p>
                              <p className="font-bold">
                                {area.quantity} Vị trí
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trạng thái */}
                    <div className="col-span-full border-t pt-3 mt-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">
                            Trạng thái booking:
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              bookingInfo.booking_status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : bookingInfo.booking_status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : bookingInfo.booking_status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {bookingInfo.booking_status}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600">Thanh toán:</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              bookingInfo.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : bookingInfo.payment_status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : bookingInfo.payment_status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {bookingInfo.payment_status}
                          </span>
                        </div>

                        {bookingInfo.payment_method && (
                          <div>
                            <p className="text-xs text-gray-600">
                              Phương thức:
                            </p>
                            <p className="font-medium">
                              {bookingInfo.payment_method === "cash"
                                ? "💵 Tiền mặt"
                                : bookingInfo.payment_method === "bank_transfer"
                                ? "🏦 Chuyển khoản"
                                : bookingInfo.payment_method === "credit_card"
                                ? "💳 Thẻ tín dụng"
                                : "🌐 Online"}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-600">Ngày đặt:</p>
                          <p className="font-medium">
                            {formatDate(bookingInfo.booked_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú */}
                    {bookingInfo.notes && (
                      <div className="col-span-full border-t pt-3 mt-2">
                        <p className="text-xs text-gray-600 mb-1">
                          📝 Ghi chú:
                        </p>
                        <p className="text-sm italic">{bookingInfo.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Ngày bắt đầu - kết thúc */}
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

              {/* Chọn Partner */}
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
                        {p.company_name} — {p.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {bookingInfo?.event_type === "Sự kiện đại chúng" && (
                <Card className="p-4 bg-blue-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    🎫 Quản lý bán vé
                  </h3>

                  {bookingInfo.ticket_sale &&
                  bookingInfo.tickets?.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Nhập giá vé cho từng loại:
                      </p>
                      
                      <div className="space-y-3">
                        {ticketPricing.map((ticket, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-lg border border-blue-200 space-y-3"
                          >
                            <div className="flex items-center justify-between">
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label>Giá vé (VNĐ)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Nhập giá vé"
                                  value={ticket.price || ""}
                                  onChange={(e) =>
                                    updateTicketPricing(idx, "price", +e.target.value)
                                  }
                                />
                              </div>
                              
                              <div>
                                <Label>Doanh thu dự kiến</Label>
                                <div className="h-10 px-3 py-2 bg-gray-100 rounded-md flex items-center">
                                  <span className="font-semibold text-green-600">
                                    {(ticket.totalRevenue || 0).toLocaleString()} VNĐ
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {ticketPricing.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg">
                            <span className="font-semibold text-blue-900">
                              Tổng doanh thu dự kiến:
                            </span>
                            <span className="font-bold text-xl text-green-600">
                              {ticketPricing
                                .reduce((sum, t) => sum + (t.totalRevenue || 0), 0)
                                .toLocaleString()}{" "}
                              VNĐ
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        ⚠️ Chưa có thông tin bán vé
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Vui lòng cập nhật thông tin bán vé trong booking
                      </p>
                    </div>
                  )}

                  {bookingInfo.allow_auditing &&
                    bookingInfo.auditing_areas?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-sm text-gray-600 mb-2">
                          🔍 Khu vực kiểm toán:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {bookingInfo.auditing_areas.map((area, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded border border-blue-200"
                            >
                              <p className="text-sm text-gray-600">Khu vực</p>
                              <p className="font-bold">{area.area_type}</p>
                              <p className="text-sm mt-1">
                                <span className="text-gray-600">Số lượng:</span>{" "}
                                <span className="font-semibold">
                                  {area.quantity}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </Card>
              )}
              {/* Dịch vụ khách đã chọn */}
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
                          {s.minPrice.toLocaleString()} —{" "}
                          {s.maxPrice.toLocaleString()}
                        </td>
                        <td className="border p-1">{s.unit}</td>
                        <td className="border p-1">{s.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookingServices.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Không có dịch vụ</p>
                )}
              </Card>



              {/* Timeline chuẩn bị */}
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
                        <td className="border p-1">
                          <Input
                            type="datetime-local"
                            value={row.time}
                            onChange={(e) =>
                              updatePrep(i, "time", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
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

              {/* Phân công nhân sự */}
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
                        <td className="border p-1">
                          <Input
                            value={row.department}
                            onChange={(e) =>
                              updateStaff(i, "department", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.duty}
                            onChange={(e) =>
                              updateStaff(i, "duty", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          {customStaffAssignOwner[i] ? (
                            <Input
                              value={row.manager}
                              onChange={(e) =>
                                updateStaff(i, "manager", e.target.value)
                              }
                              onBlur={() =>
                                setCustomStaffAssignOwner((prev) => ({
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
                                  setCustomStaffAssignOwner((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }));
                                  updateStaff(i, "manager", "");
                                } else {
                                  updateStaff(i, "manager", v);
                                }
                              }}
                            />
                          )}
                        </td>
                        <td className="border p-1">
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

              {/* Timeline ngày diễn ra */}
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
                        <td className="border p-1">
                          <Input
                            type="datetime-local"
                            value={row.time}
                            onChange={(e) =>
                              updateEvent(i, "time", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.activity}
                            onChange={(e) =>
                              updateEvent(i, "activity", e.target.value)
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
            </fieldset>
          )}
          {/* STEP 3 */}
          {step === 3 && (
            <fieldset disabled={editingPlan?.status === "manager_approved_demo" || editingPlan?.status === "customer_approved_demo" || editingPlan?.status === "cancelled" || editingPlan?.status === "completed"} className="space-y-6 border-none p-0 m-0 min-w-0">
              <h2 className="text-xl font-semibold">
                3. Xây dựng ý tưởng & Concept
              </h2>

              {/* Input chủ đề */}
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold">Chủ đề sự kiện</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chủ đề</Label>
                    <Input
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="VD: Rustic Wedding, Tech Innovation..."
                    />
                  </div>
                  <div>
                    <Label>Màu sắc chủ đạo</Label>
                    <Input
                      value={mainColor}
                      onChange={(e) => setMainColor(e.target.value)}
                      placeholder="VD: Trắng - Hồng pastel"
                    />
                  </div>
                  <div>
                    <Label>Phong cách</Label>
                    <Input
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      placeholder="VD: Hiện đại, Cổ điển, Tối giản..."
                    />
                  </div>
                  <div>
                    <Label>Thông điệp</Label>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="VD: Together We Grow"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Trang trí</Label>
                    <Textarea
                      value={decoration}
                      onChange={(e) => setDecoration(e.target.value)}
                      placeholder="Backdrop, hoa tươi, hiệu ứng ánh sáng..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              {/* Kịch bản chương trình */}
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
                            type="datetime-local"
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
                            placeholder="VD: Khai mạc, Phát biểu chào mừng..."
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

              {/* Hoạt động chính */}
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
                              updateKeyActivities(i, "activity", e.target.value)
                            }
                            placeholder="VD: Lễ ký kết hợp đồng, Mini game..."
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
                              <SelectItem value="Cao">⭐⭐⭐ Cao</SelectItem>
                              <SelectItem value="Trung bình">
                                ⭐⭐ Trung bình
                              </SelectItem>
                              <SelectItem value="Thấp">⭐ Thấp</SelectItem>
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
            </fieldset>
          )}

          {/* STEP 4 - KẾ HOẠCH CHI PHÍ */}
          {step === 4 && (
            <fieldset disabled={editingPlan?.status === "manager_approved_demo" || editingPlan?.status === "customer_approved_demo" || editingPlan?.status === "cancelled" || editingPlan?.status === "completed"} className="space-y-6 border-none p-0 m-0 min-w-0">
              <h2 className="text-xl font-semibold">4. Kế hoạch chi phí</h2>

              {/* Dịch vụ khách đã chọn */}
              {bookingServices.length > 0 && (
                <Card className="p-4 bg-muted">
                  <h3 className="font-semibold mb-2">Dịch vụ khách đã chọn</h3>
                  <table className="w-full border text-sm bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Dịch vụ</th>
                        <th className="border p-2">Đơn vị</th>
                        <th className="border p-2">Số lượng</th>
                        <th className="border p-2">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingServices.map((s, idx) => (
                        <tr key={idx}>
                          <td className="border p-2">{s.name}</td>
                          <td className="border p-2">{s.unit}</td>
                          <td className="border p-2">{s.quantity}</td>
                          <td className="border p-2">{s.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}

              {/* Dự trù ngân sách */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Dự trù ngân sách</h3>
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Hạng mục</th>
                      <th className="border p-1">Mô tả</th>
                      <th className="border p-1">Đơn vị</th>
                      <th className="border p-1">SL</th>
                      <th className="border p-1">Chi phí</th>
                      <th className="border p-1">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetRows.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Input
                            value={row.category}
                            onChange={(e) =>
                              updateBudget(i, "category", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              updateBudget(i, "description", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.unit}
                            onChange={(e) =>
                              updateBudget(i, "unit", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            type="number"
                            value={row.quantity}
                            onChange={(e) =>
                              updateBudget(i, "quantity", +e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            type="number"
                            value={row.cost}
                            onChange={(e) =>
                              updateBudget(i, "cost", +e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
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
                  + Thêm dòng ngân sách
                </Button>
              </Card>

              {/* Chi phí đối tác */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">
                  Chi phí yêu cầu từ đối tác
                </h3>
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Đối tác</th>
                      <th className="border p-1">Mô tả</th>
                      <th className="border p-1">Số tiền</th>
                      <th className="border p-1">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerCosts.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Select
                            value={row.partnerId}
                            onValueChange={(v) => {
                              updatePartnerCost(i, "partnerId", v);
                              const partner = partnerOptions.find(
                                (p) => p._id === v
                              );
                              updatePartnerCost(
                                i,
                                "partnerName",
                                partner?.company_name || ""
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn đối tác" />
                            </SelectTrigger>
                            <SelectContent>
                              {partnerOptions.map((p) => (
                                <SelectItem key={p._id} value={p._id}>
                                  {p.company_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              updatePartnerCost(
                                i,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            type="number"
                            value={row.amount}
                            onChange={(e) =>
                              updatePartnerCost(i, "amount", +e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.note}
                            onChange={(e) =>
                              updatePartnerCost(i, "note", e.target.value)
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
                    setPartnerCosts([
                      ...partnerCosts,
                      {
                        partnerId: "",
                        partnerName: "",
                        description: "",
                        amount: 0,
                        note: "",
                      },
                    ])
                  }
                >
                  + Thêm đối tác
                </Button>
              </Card>

              {/* Đặt cọc */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Kế hoạch thanh toán (Theo giai đoạn)</h3>
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">Mô tả (Đợt 1, 2, 3...)</th>
                      <th className="border p-1">Số tiền</th>
                      <th className="border p-1">Hạn thanh toán</th>
                      <th className="border p-1">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentPlan.map((row, i) => (
                      <tr key={i}>
                        <td className="border p-1">
                          <Input
                            placeholder="Ví dụ: Đợt 1 - Cọc 30%"
                            value={row.description}
                            onChange={(e) =>
                              updatePaymentPlan(i, "description", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            type="number"
                            value={row.amount}
                            onChange={(e) =>
                              updatePaymentPlan(i, "amount", +e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            type="date"
                            value={row.dueDate}
                            onChange={(e) =>
                              updatePaymentPlan(i, "dueDate", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <Input
                            value={row.note}
                            onChange={(e) =>
                              updatePaymentPlan(i, "note", e.target.value)
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
                    setPaymentPlan([
                      ...paymentPlan,
                      {
                        description: "",
                        amount: 0,
                        dueDate: "",
                        status: "pending",
                        note: "",
                      },
                    ])
                  }
                >
                  + Thêm đợt thanh toán
                </Button>
              </Card>

              {/* Tổng hợp */}
              <Card className="p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">Tổng hợp chi phí</h3>
                <div className="space-y-1">
                  <p>
                      <strong>Dự trù ngân sách:</strong>{" "}
                      {budgetRows
                        .reduce((sum, b) => sum + ((b.cost || 0) * (b.quantity || 1)), 0)
                        .toLocaleString()}{" "}
                      ₫
                  </p>
                  <p>
                    <strong>Tổng chi phí đối tác:</strong>{" "}
                    {partnerCosts
                      .reduce((sum, p) => sum + (p.amount || 0), 0)
                      .toLocaleString()}{" "}
                    ₫
                  </p>
                  <p>
                    <strong>Tổng chi phí dự kiến (Ngân sách + Đối tác):</strong>{" "}
                    {(
                      budgetRows.reduce((sum, b) => sum + ((b.cost || 0) * (b.quantity || 1)), 0) +
                      partnerCosts.reduce((sum, p) => sum + (p.amount || 0), 0)
                    ).toLocaleString()}{" "}
                    ₫
                  </p>
                  <p>
                    <strong>Tổng thanh toán dự kiến:</strong>{" "}
                    {paymentPlan
                      .reduce((sum, d) => sum + (d.amount || 0), 0)
                      .toLocaleString()}{" "}
                    ₫
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    <strong>Còn lại (Chưa lên kế hoạch):</strong>{" "}
                    {(
                      budgetRows.reduce((sum, b) => sum + ((b.cost || 0) * (b.quantity || 1)), 0) +
                      partnerCosts.reduce(
                        (sum, p) => sum + (p.amount || 0),
                        0
                      ) - paymentPlan.reduce((sum, d) => sum + (d.amount || 0), 0)
                    ).toLocaleString()}{" "}
                    ₫
                  </p>
                </div>
              </Card>
            </fieldset>
          )}
          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between mt-6">
            <Button disabled={step === 1} onClick={() => setStep(step - 1)}>
              ← Quay lại
            </Button>

            {step === 4 && (
              !["manager_approved_demo", "customer_approved_demo", "cancelled", "completed"].includes(editingPlan?.status) ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveStep123}>
                    💾 Lưu nháp
                  </Button>
                  <Button
                    className="bg-purple-600"
                    onClick={handleSaveAndContinueToDetails}
                  >
                    📋 Lưu & Tiếp tục chi tiết
                  </Button>
                  <Button
                    className="bg-blue-600"
                    onClick={handleSubmitForManagerApproval}
                  >
                    Sửa kế hoạch
                  </Button>
                </div>
              ) : (
                 <Button variant="outline" onClick={() => setOpen(false)}>
                    Thoát
                 </Button>
              )
            )}

            {step < 4 && (
              <Button onClick={() => setStep(step + 1)}>
                Tiếp tục →
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DANH SÁCH BOOKINGS */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="🔍 Tìm theo số điện thoại hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Lọc theo loại sự kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại sự kiện</SelectItem>
            <SelectItem value="Hội nghị">🏢 Hội nghị</SelectItem>
            <SelectItem value="Sự kiện công ty">🏙️ Sự kiện công ty</SelectItem>
            <SelectItem value="Sự kiện đại chúng">
              🎤 Sự kiện đại chúng
            </SelectItem>
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
          .map((b) => {
            const plan = plansMap[b._id];
            const status = plan?.status;

            return (
              <Card key={b._id} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-blue-900">{b.customer_name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                           <Phone className="w-3 h-3" />
                           {b.phone}
                        </div>
                      </div>
                      <div className="mt-1">
                        {plan ? getStatusBadge(status) : (
                             <span className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit bg-red-100 text-red-700">
                               <Sparkles className="w-3 h-3" />
                               Chưa có KH
                             </span>
                        )}
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                   <div className="border-t my-2"></div>
                   <div className="grid gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                         <div>
                            <span className="font-semibold text-gray-700">Loại:</span> {b.event_type}
                         </div>
                      </div>
                       <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                         <div>
                            <span className="font-semibold text-gray-700">Ngày:</span> {formatDate(b.event_date)}
                         </div>
                      </div>
                       <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                         <div>
                            <span className="font-semibold text-gray-700">Email:</span> {b.email}
                         </div>
                      </div>
                   </div>

                   <div className="mt-3">
                     {!plan ? (
                       <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenPlanDialog(b, "create")}>
                         📋 Lên kế hoạch sự kiện
                       </Button>
                     ) : (
                       <Button className="w-full" variant="outline" onClick={() => handleOpenPlanDialog(b, "edit", plan)}>
                          {["draft", "pending_manager_demo"].includes(status) && "Lên kế hoạch"}
                          {["manager_approved_demo", "pending_customer_demo"].includes(status) && "Xem/sửa kế hoạch"}
                          {["customer_approved_demo", "cancelled", "completed", "in_progress", "manager_approved", "customer_approved"].includes(status) && "Xem"}
                       </Button>
                     )}
                   </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
