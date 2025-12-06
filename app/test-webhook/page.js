'use client';

import { useState } from 'react';

export default function TestWebhookPage() {
  const [contractId, setContractId] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const simulatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Simulate Sepay webhook payload
      const webhookPayload = {
        id: `TEST-${Date.now()}`,
        gateway: 'VCB',
        transaction_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        account_number: process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER || '0123456789',
        code: paymentCode,
        content: `${paymentCode} Thanh toan hop dong`,
        transfer_type: 'in',
        amount_in: parseInt(amount),
        amount_out: 0,
        accumulated: 50000000,
        reference_code: `REF-${Date.now()}`,
      };

      const response = await fetch('/api/sepay/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const data = await response.json();
      setResult({
        success: response.ok,
        data,
        status: response.status,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              🧪 Test Sepay Webhook
            </h1>
            <p className="text-gray-600">Công cụ giả lập thanh toán cho môi trường development</p>
          </div>

          <form onSubmit={simulatePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contract ID
              </label>
              <input
                type="text"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Nhập Contract ID (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Để trống nếu chỉ test webhook</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={paymentCode}
                onChange={(e) => setPaymentCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="VD: PLADIVO-HD001-1-ABC123"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Lấy từ email hoặc payment page
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số tiền <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="VD: 5000000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Số tiền thanh toán (VNĐ)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </span>
              ) : (
                '🚀 Giả lập thanh toán'
              )}
            </button>
          </form>

          {/* Result Display */}
          {result && (
            <div className="mt-8">
              <div
                className={`p-6 rounded-lg border-2 ${
                  result.success
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {result.success ? '✅ Thành công' : '❌ Thất bại'}
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>

                {result.success && result.data?.data?.is_first_payment && (
                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                    <p className="text-yellow-800 font-bold">
                      🎉 Đây là thanh toán đầu tiên - Hợp đồng đã được kích hoạt!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h4 className="font-bold text-blue-900 mb-3">📖 Hướng dẫn sử dụng:</h4>
            <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm">
              <li>Tạo một hợp đồng mới từ trang Customer Management</li>
              <li>Kiểm tra email để lấy Payment Code (VD: PLADIVO-HD001-1-ABC123)</li>
              <li>Nhập Payment Code và số tiền vào form trên</li>
              <li>Click "Giả lập thanh toán" để test webhook</li>
              <li>Kiểm tra kết quả và verify trong database</li>
            </ol>
          </div>

          {/* Environment Info */}
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">🔧 Thông tin môi trường:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Webhook URL:</span>
                <code className="block bg-white px-2 py-1 rounded mt-1 text-xs">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/api/sepay/webhook
                </code>
              </div>
              <div>
                <span className="text-gray-600">Environment:</span>
                <code className="block bg-white px-2 py-1 rounded mt-1 text-xs">
                  Development (Sandbox)
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
