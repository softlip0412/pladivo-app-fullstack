// Quick test to check payment code extraction
const { parseWebhookData } = require('./lib/sepay.js');

const testPayload = {
  id: 'TEST-123',
  gateway: 'VCB',
  transaction_date: '2025-12-05 10:00:00',
  account_number: '0123456789',
  code: 'PLADIVO-12/2025/HĐ-SK-1-MIS0HT35',
  content: 'PLADIVO-12/2025/HĐ-SK-1-MIS0HT35 Thanh toan hop dong',
  transfer_type: 'in',
  amount_in: 100000000,
  amount_out: 0,
  accumulated: 50000000,
  reference_code: 'REF-123'
};

console.log('Testing payment code extraction...');
console.log('Input payload:', testPayload);
console.log('\nParsed data:', parseWebhookData(testPayload));
console.log('\nExtracted payment code:', parseWebhookData(testPayload).paymentCode);
