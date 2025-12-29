import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, QrCode, TrainFront } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import BookingSteps from '../components/common/BookingSteps';
import { LICH_TRINH_DB } from '../services/db_mock'; // Lấy lại thông tin tàu
import '../styles/pages/BookingFlow.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ các bước trước
  const { selectedSeats, tripId, totalPrice } = location.state || { selectedSeats: [], tripId: '', totalPrice: 0 };

  // Tìm thông tin chuyến tàu trong DB giả để hiển thị giờ
  const tripInfo = LICH_TRINH_DB.find(t => t.id === tripId) || {
    tenTau: 'SE1', gaDi: 'Hà Nội', gaDen: 'Sài Gòn', gioDi: '06:00', gioDen: '18:30', thoiGianChay: '32h'
  };

  // State chọn phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Mặc định tiền mặt

  const handleConfirmPayment = () => {
    // Logic gọi API thanh toán ở đây
    // Sau khi thành công -> Chuyển sang trang Hoàn tất
    navigate('/booking/success', {
      state: { tripInfo, selectedSeats, totalPrice, paymentMethod }
    });
  };

  return (
    <div className="booking-container">
      <CustomerNavbar />
      <BookingSteps currentStep={5} /> {/* Bước 5: Thanh toán */}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="seat-layout-container">
          
          {/* --- CỘT TRÁI: Review Thông tin --- */}
          <div className="payment-review-section">
            
            {/* 1. Thông tin chuyến tàu */}
            <div className="review-card">
              <div className="review-header">Thông tin chuyến tàu</div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{tripInfo.tenTau}</h3>
                  <span className="text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">{tripInfo.loaiTau || 'Thống nhất'}</span>
                </div>
                <div className="bg-slate-50 border px-3 py-1 rounded-full text-sm font-medium text-slate-600">
                  {tripInfo.thoiGianChay}
                </div>
              </div>

              <div className="trip-summary-row">
                <div className="station-time-group">
                  <div className="station">Ga đi</div>
                  <div className="station font-bold text-slate-700">{tripInfo.gaDi === 'HN' ? 'Hà Nội' : tripInfo.gaDi}</div>
                  <div className="time">{tripInfo.gioDi}</div>
                </div>
                
                {/* Đường kẻ nối */}
                <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-6 mt-4"></div>

                <div className="station-time-group right">
                  <div className="station">Ga đến</div>
                  <div className="station font-bold text-slate-700">{tripInfo.gaDen === 'SG' ? 'TP.Hồ Chí Minh' : tripInfo.gaDen}</div>
                  <div className="time">{tripInfo.gioDen}</div>
                </div>
              </div>
            </div>

            {/* 2. Thông tin chỗ ngồi */}
            <div className="review-card">
              <div className="review-header">Thông tin chỗ ngồi</div>
              <div className="space-y-3">
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xs">
                        {seat.maToa}{seat.seatNum}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{seat.tenToa}</div>
                        <div className="text-xs text-slate-500">Ghế {seat.seatNum} • {seat.loaiToa || 'Thường'}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-700">{seat.price.toLocaleString()} đ</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- CỘT PHẢI: Sidebar Thanh toán --- */}
          <div className="booking-sidebar">
            <h3 className="sidebar-title">Thanh toán</h3>
            <p className="text-sm text-slate-500 mb-4">Chọn phương thức thanh toán</p>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Tạm tính:</span>
              <span className="font-medium">{totalPrice.toLocaleString()} đ</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t">
              <span className="text-lg font-bold text-slate-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()} đ</span>
            </div>

            {/* Danh sách phương thức */}
            <div className="payment-methods-list">
              
              <div 
                className={`payment-method-item ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="method-icon"><Wallet size={20}/></div>
                <div className="method-info">
                  <h4>Tiền mặt</h4>
                  <p>Thanh toán tại quầy</p>
                </div>
              </div>

              <div 
                className={`payment-method-item ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="method-icon"><CreditCard size={20}/></div>
                <div className="method-info">
                  <h4>Thẻ ngân hàng</h4>
                  <p>Quẹt thẻ ATM/Visa</p>
                </div>
              </div>

              <div 
                className={`payment-method-item ${paymentMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qr')}
              >
                <div className="method-icon"><QrCode size={20}/></div>
                <div className="method-info">
                  <h4>QR Code</h4>
                  <p>Quét mã thanh toán</p>
                </div>
              </div>

            </div>

            <p className="payment-note">
              * Sau khi xác nhận thanh toán, vé sẽ được in tự động và gửi về email.
            </p>

            <button className="btn-continue" onClick={handleConfirmPayment}>
              Xác nhận thanh toán
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;