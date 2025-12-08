import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import EventPlan from "@/models/EventPlan";
import Booking from "@/models/Booking";
import { sendContractEmail } from "@/lib/email";
import { createPaymentData } from "@/lib/sepay";

// GET: Lấy hợp đồng theo booking_id HOẶC lấy tất cả nếu không có booking_id
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get("booking_id");

    // Case 1: List all (for dropdowns)
    if (!booking_id) {
        const contracts = await EventContract.find()
            .select("contract_number title party_a status createdAt") // Select necessary fields
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: contracts
        });
    }

    // Case 2: Get specific contract detail by booking_idl
    const contract = await EventContract.findOne({ booking_id });
    const eventPlan = await EventPlan.findOne({ booking_id }).lean();
    
    // Nếu chưa có hợp đồng, trả về thông tin gợi ý từ EventPlan và Booking để điền form
    if (!contract) {
        const booking = await Booking.findById(booking_id).lean();

        if (!booking || !eventPlan) {
             return NextResponse.json(
                { success: false, message: "Booking or EventPlan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            exists: false,
            data: {
                booking,
                eventPlan
            }
        });
    }

    return NextResponse.json({ 
        success: true, 
        exists: true, 
        data: {
            ...contract.toObject(),
            eventPlan // Return eventPlan alongside contract data
        }
    });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc cập nhật hợp đồng
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Generate payment codes/links if missing
    if (data.payment_schedule && Array.isArray(data.payment_schedule)) {
        console.log(`Processing payment schedule for contract ${data.contract_number}, items: ${data.payment_schedule.length}`);
        
        data.payment_schedule = data.payment_schedule.map((item, index) => {
            // Check if payment info is incomplete (missing code or QR)
            if (!item.payment_code || !item.qr_code) {
                console.log(`Generating payment data for item ${index}`);
                
                // Ensure contract_number is available for code generation
                if (!data.contract_number) {
                    console.warn(`Missing contract_number for item ${index}, using 'DRAFT'`);
                }
                
                const contractForGen = { 
                    ...data, 
                    contract_number: data.contract_number || 'DRAFT',
                    payment_schedule: data.payment_schedule 
                };
                
                const paymentData = createPaymentData(contractForGen, index);
                return {
                    ...item,
                    ...paymentData
                };
            }
            return item;
        });
    }

    // Kiểm tra xem đã có hợp đồng chưa
    let contract = await EventContract.findOne({ booking_id: data.booking_id });

    if (contract) {
      // Update
      contract = await EventContract.findByIdAndUpdate(contract._id, data, { new: true });
    } else {
      // Create
      contract = await EventContract.create(data);
    }

    // Gửi email cho khách hàng
    if (contract && contract.party_a && contract.party_a.email) {
      // Chạy bất đồng bộ, không đợi email gửi xong mới phản hồi client để tránh delay
      sendContractEmail(contract, contract.party_a.email)
        .then(res => {
          if (!res.success) console.error("Failed to send contract email:", res.error);
        })
        .catch(err => console.error("Error invoking sendContractEmail:", err));
    }

    return NextResponse.json({
      success: true,
      data: contract,
      message: "Lưu hợp đồng thành công và đã gửi email cho khách hàng",
    });
  } catch (error) {
    console.error("Error saving contract:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
