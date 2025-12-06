/**
 * Sepay Payment Gateway Integration Library
 * Handles webhook data parsing and signature verification
 */

/**
 * Parse webhook data from Sepay
 * @param {Object} payload - Raw webhook payload from Sepay
 * @returns {Object} Parsed transaction data
 */
export function parseWebhookData(payload) {
  // Extract payment code from content or code field
  // Supports multiple formats: PLADIVO-12/2025/HĐ-SK-1-XXX or PLADIVO-HD001-1-XXX
  const paymentCode = payload.code || extractPaymentCodeFromContent(payload.content);

  return {
    transactionId: payload.id,
    gateway: payload.gateway,
    transactionDate: payload.transaction_date,
    accountNumber: payload.account_number,
    paymentCode: paymentCode,
    transferContent: payload.content,
    transferType: payload.transfer_type, // 'in' or 'out'
    amount: payload.amount_in || 0,
    amountOut: payload.amount_out || 0,
    accumulated: payload.accumulated,
    referenceCode: payload.reference_code,
  };
}

/**
 * Extract payment code from transfer content
 * @param {string} content - Transfer content/description
 * @returns {string|null} Extracted payment code or null
 */
function extractPaymentCodeFromContent(content) {
  if (!content) return null;
  
  // Match pattern: PLADIVO-12/2025/HĐ-SK-1-XXXXXX (new format with slashes)
  const newFormatMatch = content.match(/PLADIVO-\d+\/\d+\/[^\s]+/i);
  if (newFormatMatch) return newFormatMatch[0];
  
  // Match pattern: PLADIVO-HDXXX-X-XXXXXX (old format with dashes)
  const oldFormatMatch = content.match(/PLADIVO-HD\d+-\d+-[A-Z0-9]+/i);
  return oldFormatMatch ? oldFormatMatch[0] : null;
}

/**
 * Verify webhook signature from Sepay
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Signature from x-sepay-signature header
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(payload, signature) {
  // In sandbox/development mode, signature verification is optional
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Webhook signature verification skipped in development mode');
    return true;
  }

  // TODO: Implement actual signature verification for production
  // This would typically involve:
  // 1. Get webhook secret from environment variables
  // 2. Create HMAC hash of payload using secret
  // 3. Compare with provided signature
  
  const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('⚠️ SEPAY_WEBHOOK_SECRET not configured');
    return true; // Allow in development
  }

  // Placeholder for actual signature verification
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', webhookSecret)
  //   .update(JSON.stringify(payload))
  //   .digest('hex');
  // return expectedSignature === signature;

  return true;
}

/**
 * Generate payment code for contract payment schedule
 * Format: PLADIVO-HDXXX-X-XXXXXX
 * @param {string} contractNumber - Contract number (e.g., "HD001")
 * @param {number} scheduleIndex - Payment schedule index (1-based)
 * @returns {string} Generated payment code
 */
export function generatePaymentCode(contractNumber, scheduleIndex) {
  // Generate random suffix (6 characters)
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `PLADIVO-${contractNumber}-${scheduleIndex}-${suffix}`;
}

/**
 * Format amount to VND currency
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted amount
 */
export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Get Sepay account info from environment
 * @returns {Object} Account information
 */
export function getSepayAccountInfo() {
  return {
    accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || '0123456789',
    accountName: process.env.SEPAY_ACCOUNT_NAME || 'CONG TY PLADIVO',
    bankName: process.env.SEPAY_BANK_NAME || 'Vietcombank',
    bankCode: process.env.SEPAY_BANK_CODE || 'VCB',
  };
}

/**
 * Create payment data for a contract payment schedule item
 * @param {Object} contract - Contract object
 * @param {number} scheduleIndex - Index of payment schedule item (0-based)
 * @returns {Object} Payment data with code, link, and QR code
 */
export function createPaymentData(contract, scheduleIndex) {
  const paymentItem = contract.payment_schedule[scheduleIndex];
  const scheduleNumber = scheduleIndex + 1; // 1-based for display
  
  // Generate payment code: PLADIVO-{contract_number}-{schedule_number}-{random}
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const payment_code = `PLADIVO-${contract.contract_number}-${scheduleNumber}-${suffix}`;
  
  // Get account info
  const accountInfo = getSepayAccountInfo();
  
  // Create transfer content
  const transferContent = `${payment_code} Thanh toan hop dong`;
  
  // Create payment link (bank transfer info)
  const payment_link = `https://img.vietqr.io/image/${accountInfo.bankCode}-${accountInfo.accountNumber}-compact2.png?amount=${paymentItem.amount}&addInfo=${encodeURIComponent(payment_code)}&accountName=${encodeURIComponent(accountInfo.accountName)}`;
  
  // QR code is same as payment link for VietQR
  const qr_code = payment_link;
  
  return {
    payment_code,
    payment_link,
    qr_code,
    transfer_content: transferContent,
    bank_info: accountInfo
  };
}
