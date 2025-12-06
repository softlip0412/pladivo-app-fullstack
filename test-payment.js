// Test script để giả lập thanh toán từ Sepay webhook
// Chạy script này để test tự động cập nhật trạng thái thanh toán

const testPayment = async () => {
  // 1. Lấy thông tin hợp đồng và payment code
  const contractId = "YOUR_CONTRACT_ID"; // Thay bằng ID hợp đồng thực
  const paymentCode = "PLADIVO-12-2024-HD-SK-1-ABC123"; // Thay bằng payment code thực
  
  // 2. Giả lập webhook payload từ Sepay
  const webhookPayload = {
    id: "TXN" + Date.now(),
    gateway: "VCB",
    transaction_date: new Date().toISOString(),
    account_number: "0123456789",
    code: paymentCode, // Payment code từ nội dung chuyển khoản
    content: `${paymentCode} Thanh toan hop dong`,
    transfer_type: "in",
    amount_in: 52000000, // Số tiền thanh toán
    amount_out: 0,
    accumulated: 100000000,
    reference_code: "REF" + Date.now()
  };

  // 3. Gửi webhook request
  try {
    const response = await fetch("http://localhost:3000/api/webhooks/sepay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    console.log("✅ Webhook result:", result);
    
    if (result.success) {
      console.log("🎉 Thanh toán đã được cập nhật!");
      console.log("Contract ID:", result.contractId);
      console.log("Payment Index:", result.paymentIndex);
    } else {
      console.log("❌ Lỗi:", result.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

// Chạy test
testPayment();
