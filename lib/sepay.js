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
  
  // Match new pattern: PLD + alphanumeric (e.g., PLDA1A1A1)
  const pldMatch = content.match(/PLD[A-Z0-9]{3,10}/i);
  if (pldMatch) return pldMatch[0];

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

  // Check Authorization header (API Key)
  if (arguments.length > 2) {
    const authorization = arguments[2];
    if (authorization) {
       const apiKey = process.env.SEPAY_API_KEY;
       const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
       
       // Allow if header contains our API Key or Secret
       if (apiKey && authorization.includes(apiKey)) return true;
       if (webhookSecret && authorization.includes(webhookSecret)) return true;
    }
  }

  // HMAC Signature Verification (if signature is provided)
  const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('⚠️ SEPAY_WEBHOOK_SECRET not configured');
    return true; // Allow if no secret configured
  }

  if (!signature) return false;

  const crypto = require('crypto');
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return expectedSignature === signature;
}

/**
 * Generate payment code for contract payment schedule
 * Format: PLADIVO-HDXXX-X-XXXXXX
 * @param {string} contractNumber - Contract number (e.g., "HD001")
 * @param {number} scheduleIndex - Payment schedule index (1-based)
 * @returns {string} Generated payment code
 */
// Update this function to match new format: PLD + 6 chars
export function generatePaymentCode(contractNumber, scheduleIndex) {
  // Generate random alphanumeric suffix (6 characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `PLD${suffix}`;
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
    accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || '00002456029',
    accountName: process.env.SEPAY_ACCOUNT_NAME || 'CONG TY PLADIVO',
    bankName: process.env.SEPAY_BANK_NAME || 'TPBank',
    bankCode: process.env.SEPAY_BANK_CODE || 'TPB',
  };
}

export function createPaymentData(contract, scheduleIndex) {
  const paymentItem = contract.payment_schedule[scheduleIndex];
  
  // Generate payment code using the new function
  const payment_code = generatePaymentCode(contract.contract_number, scheduleIndex);
  
  // Get account info
  const accountInfo = getSepayAccountInfo();
  
  // Create transfer content
  const transferContent = `${payment_code}`;
  
  // Create payment link (bank transfer info)
  const payment_link = `https://img.vietqr.io/image/${accountInfo.bankCode}-${accountInfo.accountNumber}-compact2.png?amount=2000&addInfo=${encodeURIComponent(payment_code)}&accountName=${encodeURIComponent(accountInfo.accountName)}`;
  
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
