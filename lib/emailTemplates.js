/**
 * Generate HTML email template for contract notification
 * @param {Object} contractData - Contract data
 * @returns {string} - HTML email content
 */
export const generateContractEmailHTML = (contractData) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hợp Đồng Dịch Vụ Tổ Chức Sự Kiện</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      color: #667eea;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #667eea;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .info-value {
      color: #333;
      font-size: 15px;
    }
    .party-box {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    .party-title {
      font-weight: 600;
      color: #667eea;
      font-size: 16px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background-color: #667eea;
      color: white;
      font-weight: 600;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .total-cost {
      background-color: #fff3cd;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
      margin: 20px 0;
    }
    .total-cost-label {
      font-size: 16px;
      color: #856404;
      margin-bottom: 8px;
    }
    .total-cost-value {
      font-size: 28px;
      font-weight: 700;
      color: #856404;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer-note {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #dee2e6;
      font-size: 13px;
      color: #999;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 15px 0;
      border-radius: 4px;
    }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 HỢP ĐỒNG DỊCH VỤ TỔ CHỨC SỰ KIỆN</h1>
      <p>Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của PLADIVO</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Contract Info -->
      <div class="section">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Số Hợp Đồng</div>
            <div class="info-value"><strong>${contractData.contract_number || 'N/A'}</strong></div>
          </div>
          <div class="info-item">
            <div class="info-label">Ngày Ký</div>
            <div class="info-value">${formatDate(contractData.signing_date)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Địa Điểm Ký</div>
            <div class="info-value">${contractData.signing_location || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Party Information -->
      <div class="section">
        <div class="section-title">1. THÔNG TIN CÁC BÊN</div>
        
        <div class="party-box">
          <div class="party-title">BÊN A - BÊN THUÊ TỔ CHỨC SỰ KIỆN</div>
          <div class="info-grid">
            <div>
              <div class="info-label">Tên khách hàng</div>
              <div class="info-value">${contractData.party_a?.name || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">Điện thoại</div>
              <div class="info-value">${contractData.party_a?.phone || 'N/A'}</div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div class="info-label">Địa chỉ</div>
              <div class="info-value">${contractData.party_a?.address || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">Email</div>
              <div class="info-value">${contractData.party_a?.email || 'N/A'}</div>
            </div>
            ${contractData.party_a?.representative ? `
            <div>
              <div class="info-label">Đại diện</div>
              <div class="info-value">${contractData.party_a.representative}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="party-box">
          <div class="party-title">BÊN B - ĐƠN VỊ TỔ CHỨC SỰ KIỆN</div>
          <div class="info-grid">
            <div style="grid-column: 1 / -1;">
              <div class="info-label">Tên đơn vị</div>
              <div class="info-value"><strong>${contractData.party_b?.name || 'CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO'}</strong></div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div class="info-label">Địa chỉ</div>
              <div class="info-value">${contractData.party_b?.address || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">Đại diện</div>
              <div class="info-value">${contractData.party_b?.representative || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">Điện thoại</div>
              <div class="info-value">${contractData.party_b?.phone || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Content -->
      <div class="section">
        <div class="section-title">2. NỘI DUNG SỰ KIỆN</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Thời gian</div>
            <div class="info-value">${contractData.event_content?.time || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Quy mô</div>
            <div class="info-value">${contractData.event_content?.scale || 'N/A'}</div>
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="info-label">Địa điểm</div>
            <div class="info-value">${contractData.event_content?.location || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Work Items -->
      <div class="section">
        <div class="section-title">3. HẠNG MỤC CÔNG VIỆC</div>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; white-space: pre-line;">
          ${contractData.work_items || 'Không có thông tin'}
        </div>
      </div>

      <!-- Total Cost -->
      <div class="total-cost">
        <div class="total-cost-label">TỔNG GIÁ TRỊ HỢP ĐỒNG</div>
        <div class="total-cost-value">${formatCurrency(contractData.total_cost)}</div>
      </div>

      <!-- Payment Schedule -->
      ${contractData.payment_schedule && contractData.payment_schedule.length > 0 ? `
      <div class="section">
        <div class="section-title">5. TIẾN ĐỘ THANH TOÁN</div>
        <table>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Số tiền</th>
              <th>Hạn thanh toán</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            ${contractData.payment_schedule.map((item, index) => `
              <tr>
                <td>${item.description || 'N/A'}</td>
                <td><strong>${formatCurrency(item.amount)}</strong></td>
                <td>${formatDate(item.deadline)}</td>
                <td>
                  ${item.status === 'paid' 
                    ? '<span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">✓ Đã thanh toán</span>'
                    : '<span style="background-color: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">⏳ Chưa thanh toán</span>'
                  }
                  ${item.paid_at ? `<br><small style="color: #666;">Ngày: ${formatDate(item.paid_at)}</small>` : ''}
                </td>
                <td>
                  ${item.status !== 'paid' && item.payment_link ? `
                    <a href="${item.payment_link}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">
                      💳 Thanh toán ngay
                    </a>
                  ` : item.status === 'paid' ? `
                    <span style="color: #28a745; font-weight: 600;">✓ Hoàn tất</span>
                  ` : ''}
                </td>
              </tr>
              ${item.status !== 'paid' && item.qr_code && item.payment_code ? `
              <tr>
                <td colspan="5" style="background-color: #f8f9fa; padding: 20px;">
                  <div style="display: flex; gap: 30px; align-items: flex-start;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #667eea; margin-bottom: 10px;">📱 Quét mã QR để thanh toán:</div>
                      <img src="${item.qr_code}" alt="QR Code thanh toán" style="max-width: 200px; border: 2px solid #dee2e6; border-radius: 8px; padding: 10px; background: white;">
                    </div>
                    <div style="flex: 2;">
                      <div style="font-weight: 600; color: #667eea; margin-bottom: 10px;">🏦 Hoặc chuyển khoản theo thông tin:</div>
                      <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
                        <div style="margin-bottom: 8px;">
                          <span style="color: #666; font-size: 13px;">Ngân hàng:</span>
                          <strong style="margin-left: 10px;">${'TPB'} - TPBank</strong>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <span style="color: #666; font-size: 13px;">Số tài khoản:</span>
                          <strong style="margin-left: 10px;">${'00002456029'}</strong>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <span style="color: #666; font-size: 13px;">Chủ tài khoản:</span>
                          <strong style="margin-left: 10px;">${ 'CONG TY PLADIVO'}</strong>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <span style="color: #666; font-size: 13px;">Số tiền:</span>
                          <strong style="margin-left: 10px; color: #dc3545;">${formatCurrency(item.amount)}</strong>
                        </div>
                        <div style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 10px;">
                          <span style="color: #856404; font-size: 13px; font-weight: 600;">⚠️ Nội dung chuyển khoản (BẮT BUỘC):</span><br>
                          <code style="background: white; padding: 4px 8px; border-radius: 3px; font-size: 14px; color: #d63384; font-weight: 700; display: inline-block; margin-top: 5px;">${item.payment_code}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              ` : ''}
            `).join('')}
          </tbody>
        </table>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin-top: 20px; border-radius: 4px;">
          <strong style="color: #0d47a1;">💡 Lưu ý quan trọng khi thanh toán:</strong><br>
          <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0;">
            <li>Vui lòng nhập <strong>CHÍNH XÁC</strong> nội dung chuyển khoản như hướng dẫn</li>
            <li>Hệ thống sẽ tự động xác nhận thanh toán trong vòng 1-2 phút</li>
            <li>Sau khi thanh toán đợt đầu tiên, hợp đồng sẽ được kích hoạt</li>
            <li>Nếu có vấn đề, vui lòng liên hệ hotline: ${contractData.party_b?.phone || '0987654321'}</li>
          </ul>
        </div>
      </div>
      ` : ''}

      <!-- Responsibilities -->
      <div class="section">
        <div class="section-title">6. TRÁCH NHIỆM CÁC BÊN</div>
        
        <div style="margin-bottom: 15px;">
          <div class="info-label" style="margin-bottom: 8px;">Trách nhiệm Bên A:</div>
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px;">
            ${contractData.party_a_responsibilities || 'N/A'}
          </div>
        </div>

        <div>
          <div class="info-label" style="margin-bottom: 8px;">Trách nhiệm Bên B:</div>
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px;">
            ${contractData.party_b_responsibilities || 'N/A'}
          </div>
        </div>
      </div>

      <!-- General Terms -->
      <div class="section">
        <div class="section-title">7. ĐIỀU KHOẢN CHUNG</div>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
          ${contractData.general_terms || 'N/A'}
        </div>
      </div>

      <!-- Important Note -->
      <div class="highlight">
        <strong>📌 Lưu ý quan trọng:</strong><br>
        Đây là bản sao hợp đồng được gửi qua email. Vui lòng kiểm tra kỹ thông tin và liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <strong>CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO</strong><br>
      📍 Địa chỉ: ${contractData.party_b?.address || 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội'}<br>
      📞 Điện thoại: ${contractData.party_b?.phone || '0987654321'}<br>
      📧 Email: ${contractData.party_b?.email || 'contact@pladivo.com'}
      
      <div class="footer-note">
        Email này được gửi tự động từ hệ thống quản lý sự kiện PLADIVO.<br>
        Vui lòng không trả lời trực tiếp email này.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate HTML email template for payment confirmation
 * @param {Object} contract - Contract data
 * @param {Object} paymentItem - Payment schedule item that was paid
 * @param {Object} transactionData - Transaction data from Sepay
 * @returns {string} - HTML email content
 */
export const generatePaymentConfirmationEmailHTML = (contract, paymentItem, transactionData) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
  };

  // Calculate totals
  const totalPaid = contract.payment_schedule
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalRemaining = contract.total_cost - totalPaid;
  const remainingPayments = contract.payment_schedule.filter(p => p.status !== 'paid');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác Nhận Thanh Toán</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      color: #10b981;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #10b981;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .info-value {
      color: #333;
      font-size: 15px;
    }
    .transaction-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #10b981;
      margin: 20px 0;
    }
    .amount-highlight {
      font-size: 32px;
      font-weight: 700;
      color: #059669;
      text-align: center;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #333;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .badge-paid {
      background-color: #10b981;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-pending {
      background-color: #fbbf24;
      color: #78350f;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .summary-box {
      background-color: #fff7ed;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #f59e0b;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer-note {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #dee2e6;
      font-size: 13px;
      color: #999;
    }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>THANH TOÁN THÀNH CÔNG!</h1>
      <p>Cảm ơn quý khách đã thanh toán đúng hạn</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Transaction Amount -->
      <div class="amount-highlight">
        ${formatCurrency(paymentItem.amount)}
      </div>

      <!-- Transaction Info -->
      <div class="section">
        <div class="section-title">📋 Thông Tin Giao Dịch</div>
        <div class="transaction-box">
          <div class="info-grid">
            <div>
              <div class="info-label">Mã giao dịch</div>
              <div class="info-value"><strong>${transactionData.transactionId || 'N/A'}</strong></div>
            </div>
            <div>
              <div class="info-label">Thời gian</div>
              <div class="info-value">${formatDateTime(transactionData.transactionDate || paymentItem.paid_at)}</div>
            </div>
            <div>
              <div class="info-label">Ngân hàng</div>
              <div class="info-value">${transactionData.gateway || 'TPBank'}</div>
            </div>
            <div>
              <div class="info-label">Nội dung CK</div>
              <div class="info-value">${paymentItem.payment_code}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contract Info -->
      <div class="section">
        <div class="section-title">📄 Thông Tin Hợp Đồng</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Số hợp đồng</div>
            <div class="info-value"><strong>${contract.contract_number}</strong></div>
          </div>
          <div class="info-item">
            <div class="info-label">Khách hàng</div>
            <div class="info-value">${contract.party_a?.name || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Nội dung thanh toán</div>
            <div class="info-value">${paymentItem.description}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Trạng thái</div>
            <div class="info-value"><span class="badge-paid">✓ Đã thanh toán</span></div>
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="section">
        <div class="section-title">💰 Tổng Kết Thanh Toán</div>
        <div class="summary-box">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <div style="font-size: 13px; color: #78350f; margin-bottom: 5px;">Tổng hợp đồng</div>
              <div style="font-size: 20px; font-weight: 700; color: #333;">${formatCurrency(contract.total_cost)}</div>
            </div>
            <div>
              <div style="font-size: 13px; color: #78350f; margin-bottom: 5px;">Đã thanh toán</div>
              <div style="font-size: 20px; font-weight: 700; color: #10b981;">${formatCurrency(totalPaid)}</div>
            </div>
          </div>
          <div style="border-top: 2px dashed #f59e0b; padding-top: 15px; margin-top: 15px;">
            <div style="font-size: 13px; color: #78350f; margin-bottom: 5px;">Còn lại</div>
            <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${formatCurrency(totalRemaining)}</div>
          </div>
        </div>
      </div>

      ${remainingPayments.length > 0 ? `
      <!-- Remaining Payments -->
      <div class="section">
        <div class="section-title">📅 Các Đợt Thanh Toán Tiếp Theo</div>
        <table>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Số tiền</th>
              <th>Hạn thanh toán</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${remainingPayments.map(item => `
              <tr>
                <td>${item.description}</td>
                <td><strong>${formatCurrency(item.amount)}</strong></td>
                <td>${formatDate(item.deadline)}</td>
                <td><span class="badge-pending">⏳ Chưa thanh toán</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : `
      <div class="section">
        <div style="background-color: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
          <h3 style="color: #059669; margin: 0 0 10px 0;">Hoàn Tất Thanh Toán!</h3>
          <p style="color: #047857; margin: 0;">Quý khách đã thanh toán đầy đủ tất cả các khoản theo hợp đồng.</p>
        </div>
      </div>
      `}

      <!-- Thank You Note -->
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-top: 30px;">
        <h4 style="color: #1e40af; margin: 0 0 10px 0;">💙 Cảm ơn quý khách!</h4>
        <p style="margin: 0; color: #1e40af;">
          PLADIVO rất cảm kích sự tin tưởng của quý khách. Chúng tôi sẽ nỗ lực hết mình để mang đến sự kiện tuyệt vời nhất cho quý khách.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <strong>CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO</strong><br>
      📍 Địa chỉ: ${contract.party_b?.address || 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội'}<br>
      📞 Điện thoại: ${contract.party_b?.phone || '0987654321'}<br>
      📧 Email: ${contract.party_b?.email || 'contact@pladivo.com'}
      
      <div class="footer-note">
        Email này được gửi tự động từ hệ thống quản lý sự kiện P LADIVO.<br>
        Vui lòng không trả lời trực tiếp email này.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate HTML email template for sending entry tickets
 * @param {Object} order - Order data
 * @param {Array} qrCodes - Array of QR codes (base64 or URL)
 * @returns {string} - HTML email content
 */
export const generateEntryTicketEmailHTML = (order, qrCodes) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vé Điện Tử - ${order.event_name}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 30px; }
    .event-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
    .event-title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    .info-row { display: flex; align-items: flex-start; margin-bottom: 8px; }
    .info-icon { margin-right: 10px; font-size: 16px; }
    .ticket-list { margin-top: 20px; }
    .ticket-item { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: white; text-align: center; position: relative; }
    .ticket-type { font-weight: 700; color: #4f46e5; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; margin-bottom: 5px; }
    .ticket-area { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 15px; }
    .qr-image { max-width: 200px; height: auto; display: block; margin: 0 auto; }
    .ticket-code { font-family: monospace; font-size: 16px; color: #64748b; margin-top: 10px; display: block; }
    .footer { background: #f1f5f9; text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ THANH TOÁN THÀNH CÔNG</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.8;">Mã đơn: ${order.order_code}</p>
    </div>
    
    <div class="content">
      <p>Xin chào <strong>${order.customer_name}</strong>,</p>
      <p>Thanh toán của bạn đã được xác nhận. Dưới đây là vé điện tử của bạn. Vui lòng xuất trình mã QR này tại cửa check-in.</p>
      
      <div class="event-card">
        <div class="event-title">${order.event_name}</div>
        <div class="info-row">
          <span class="info-icon">🕒</span>
          <span>${formatDate(order.event_date)}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">📍</span>
          <span>${order.event_location || 'Đang cập nhật'}</span>
        </div>
      </div>

      <div class="ticket-list">
        ${qrCodes.map((qr, index) => `
          <div class="ticket-item">
             <div class="ticket-type">${order.ticket_type}</div>
             <div class="ticket-area">${order.ticket_area}</div>
             <img src="${qr}" alt="Ticket QR Code" class="qr-image" />
             <span class="ticket-code">Vé #${index + 1}</span>
          </div>
        `).join('')}
      </div>

      <p style="font-size: 13px; color: #666; text-align: center; margin-top: 30px;">
        ⚠️ Lưu ý: Mỗi mã QR chỉ có giá trị sử dụng một lần để check-in. Vui lòng bảo mật vé của bạn.
      </p>
    </div>

    <div class="footer">
      <strong>PLADIVO EVENT MANAGEMENT</strong><br>
      Hotline: 0987654321 - Email: support@pladivo.com
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate HTML email template for ticket order
 * @param {Object} order - Order data
 * @param {Object} ticket - Ticket data
 * @param {Object} event - Event data
 * @param {Object} paymentInfo - Payment info including QR code
 * @returns {string} - HTML email content
 */
export const generateTicketOrderEmailHTML = (order, ticket, event, paymentInfo) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác Nhận Đặt Vé Thành Công</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; }
    .header h2 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
    .payment-info { background: #ecfdf5; padding: 20px; border-radius: 8px; border: 1px solid #10b981; }
    .qr-code { text-align: center; margin: 20px 0; }
    .qr-code img { max-width: 200px; border: 4px solid white; padding: 10px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #ddd; padding-bottom: 10px; }
    .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { color: #666; font-size: 14px; }
    .value { font-weight: 600; color: #333; }
    .total-price { color: #dc2626; font-size: 18px; font-weight: 700; }
    .bank-details { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; }
    .transfer-content { background: #fff3cd; color: #856404; padding: 10px; text-align: center; font-weight: bold; border-radius: 4px; margin-top: 10px; border: 1px dashed #d97706; font-family: monospace; font-size: 16px; }
    .footer { background: #f8f9fa; text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎉 Đặt Vé Thành Công!</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Mã đơn hàng: ${order.order_id || order._id.slice(-6).toUpperCase()}</p>
    </div>
    <div class="content">
      <p>Xin chào <strong>${order.customer_name || 'Quý khách'}</strong>,</p>
      <p>Cảm ơn quý khách đã đặt vé tại PLADIVO. Đơn hàng của quý khách đã được ghi nhận.</p>
      
      <div class="order-info">
        <h3 style="margin-top: 0; color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; display: inline-block;">🎫 Thông tin vé</h3>
        <div class="info-row">
          <span class="label">Sự kiện:</span>
          <span class="value">${event.title}</span>
        </div>
        <div class="info-row">
          <span class="label">Thời gian:</span>
          <span class="value">${formatDate(event.start_datetime)}</span>
        </div>
         <div class="info-row">
          <span class="label">Địa điểm:</span>
          <span class="value">${event.location || 'Đang cập nhật'}</span>
        </div>
        <div class="info-row">
          <span class="label">Loại vé:</span>
          <span class="value">${ticket.type}</span>
        </div>
        <div class="info-row">
          <span class="label">Số lượng:</span>
          <span class="value">${order.quantity} vé</span>
        </div>
        <div class="info-row">
          <span class="label">Tổng thanh toán:</span>
          <span class="value total-price">${formatCurrency(order.total_price)}</span>
        </div>
      </div>

      <div class="payment-info">
        <h3 style="margin-top: 0; color: #059669; text-align: center;">💳 Hướng Dẫn Thanh Toán</h3>
        <p style="text-align: center; margin-bottom: 20px;">Quý khách vui lòng chuyển khoản hoặc quét mã QR dưới đây:</p>
        
        <div class="qr-code">
          <img src="${paymentInfo.qrCode}" alt="QR code thanh toán" />
          <p style="font-size: 13px; color: #666; margin-top: 5px;">Sử dụng App ngân hàng để quét mã</p>
        </div>

        <div class="bank-details">
          <div class="info-row">
            <span class="label">Ngân hàng:</span>
            <span class="value">${paymentInfo.bankCode} - ${paymentInfo.bankName}</span>
          </div>
          <div class="info-row">
            <span class="label">Số tài khoản:</span>
            <span class="value" style="font-size: 16px;">${paymentInfo.accountNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Chủ tài khoản:</span>
            <span class="value">${paymentInfo.accountName}</span>
          </div>
          
          <p style="margin: 15px 0 5px 0; font-weight: 600; color: #d97706; text-align: center;">👇 Nội dung chuyển khoản (Bắt buộc):</p>
          <div class="transfer-content">
            ${order.order_id || order._id.toString()}
          </div>
        </div>
      </div>
      
      <p style="text-align: center; margin-top: 25px; color: #666; font-size: 14px;">
        Vé điện tử chính thức sẽ được gửi đến email này ngay sau khi chúng tôi nhận được thanh toán.
      </p>
    </div>
    <div class="footer">
      <strong>CÔNG TY TỔ CHỨC SỰ KIỆN PLADIVO</strong><br>
      📍 Địa chỉ: Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội<br>
      📞 Hotline: 0987654321 - 📧 Email: support@pladivo.com<br>
      <br>
      <span style="color: #999;">Email này được gửi tự động, vui lòng không trả lời.</span>
    </div>
  </div>
</body>
</html>
  `;
};
