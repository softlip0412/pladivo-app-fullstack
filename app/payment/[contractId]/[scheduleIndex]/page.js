'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { contractId, scheduleIndex } = params;
  const paymentCode = searchParams.get('code');

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, [contractId, scheduleIndex]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/event-contracts?booking_id=${contractId}`);
      const result = await response.json();

      if (result.success && result.exists) {
        const contract = result.data;
        const paymentItem = contract.payment_schedule[parseInt(scheduleIndex)];
        
        setPaymentData({
          contract,
          paymentItem,
          scheduleIndex: parseInt(scheduleIndex),
        });
      } else {
        setError('Không tìm thấy thông tin thanh toán');
      }
    } catch (err) {
      setError('Lỗi khi tải thông tin thanh toán');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Lỗi</h1>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const { contract, paymentItem } = paymentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              💳 Thanh toán hợp đồng
            </h1>
            <p className="text-gray-600">Hợp đồng số: <strong>{contract.contract_number}</strong></p>
          </div>

          {/* Payment Status */}
          {paymentItem.status === 'paid' ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Đã thanh toán</h2>
              <p className="text-green-600">
                Thanh toán đã được xác nhận vào {formatDate(paymentItem.paid_at)}
              </p>
            </div>
          ) : (
            <>
              {/* Payment Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-semibold mb-1">Nội dung thanh toán</p>
                  <p className="text-lg font-bold text-purple-900">{paymentItem.description}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Số tiền</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(paymentItem.amount)}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
                  <p className="text-sm text-pink-600 font-semibold mb-1">Hạn thanh toán</p>
                  <p className="text-lg font-bold text-pink-900">{formatDate(paymentItem.deadline)}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700 font-semibold mb-1">Trạng thái</p>
                  <p className="text-lg font-bold text-yellow-900">⏳ Chờ thanh toán</p>
                </div>
              </div>

              {/* QR Code & Bank Transfer */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* QR Code */}
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    📱 Quét mã QR
                  </h3>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img 
                      src={paymentItem.qr_code} 
                      alt="QR Code thanh toán"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <p className="text-sm text-purple-700 mt-4">
                    Sử dụng app ngân hàng để quét mã QR và thanh toán
                  </p>
                </div>

                {/* Bank Transfer Info */}
                <div className="bg-white border-2 border-purple-200 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    🏦 Thông tin chuyển khoản
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Ngân hàng</p>
                      <p className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_SEPAY_BANK_CODE || 'VCB'} - Vietcombank</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số tài khoản</p>
                      <p className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER || '0123456789'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chủ tài khoản</p>
                      <p className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME || 'CONG TY PLADIVO'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số tiền</p>
                      <p className="font-bold text-2xl text-red-600">{formatCurrency(paymentItem.amount)}</p>
                    </div>
                    <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 font-bold mb-2">⚠️ Nội dung chuyển khoản (BẮT BUỘC)</p>
                      <code className="bg-white px-3 py-2 rounded text-pink-600 font-mono font-bold text-lg block">
                        {paymentCode || paymentItem.payment_code}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="font-bold text-blue-900 mb-2">💡 Lưu ý quan trọng:</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                  <li>Vui lòng nhập <strong>CHÍNH XÁC</strong> nội dung chuyển khoản như trên</li>
                  <li>Hệ thống sẽ tự động xác nhận thanh toán trong vòng 1-2 phút</li>
                  <li>Sau khi thanh toán đợt đầu tiên, hợp đồng sẽ được kích hoạt</li>
                  <li>Nếu có vấn đề, vui lòng liên hệ: {contract.party_b?.phone || '0987654321'}</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>© 2024 PLADIVO - Công ty Tổ chức Sự kiện</p>
          <p className="mt-1">Hotline: {contract.party_b?.phone || '0987654321'}</p>
        </div>
      </div>
    </div>
  );
}
