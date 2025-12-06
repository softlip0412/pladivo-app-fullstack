
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
