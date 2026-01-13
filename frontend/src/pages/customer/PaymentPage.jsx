import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, QrCode, Train, CheckCircle } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import { LICH_TRINH_DB } from '../../services/db_mock';
import '../../styles/pages/BookingFlow.css';

const PaymentPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ các bước trước
  const { selectedSeats, tripId, totalPrice, passengers } = location.state || { selectedSeats: [], tripId: '', totalPrice: 0, passengers: [] };

  // Tìm thông tin chuyến tàu (Fallback dữ liệu nếu không tìm thấy để tránh crash)
  const tripInfo = LICH_TRINH_DB.find(t => t.id === tripId) || {
    tenTau: 'SE1', gaDi: 'Hà Nội', gaDen: 'Sài Gòn', gioDi: '06:00', gioDen: '18:30', thoiGianChay: '32h'
  };

  // State chọn phương thức thanh toán
  // Nếu là nhân viên -> Mặc định là Tiền mặt (cash)
  // Nếu là khách -> Mặc định là QR (hoặc tùy chọn)
  const [paymentMethod, setPaymentMethod] = useState(isEmployee ? 'cash' : 'qr');

  const handleConfirmPayment = () => {
    // 1. Xác định đường dẫn cơ sở
    const basePath = isEmployee ? '/employee/sales' : '/booking';

    // 2. Logic giả lập gọi API thanh toán...
    // alert("Đang xử lý thanh toán...");

    // 3. Chuyển sang trang Hoàn tất
    navigate(`${basePath}/success`, {
      state: { 
        tripInfo, 
        selectedSeats, 
        totalPrice, 
        paymentMethod,
        passengers // Truyền danh sách hành khách sang trang in vé
      }
    });
  };

  const handleBack = () => {
    const basePath = isEmployee ? '/employee/sales' : '/booking';
    navigate(`${basePath}/passengers`, { 
        state: { ...location.state } // Giữ lại state cũ để không mất dữ liệu form
    });
  };

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      
      {/* 1. ẨN NAVBAR NẾU LÀ NHÂN VIÊN */}
      {!isEmployee && (
        <>
          <CustomerNavbar />
          <BookingSteps currentStep={5} /> 
        </>
      )}

      <div className="booking-content">
        <div onClick={handleBack} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="seat-layout-container">
          
          {/* --- CỘT TRÁI: REVIEW THÔNG TIN --- */}
          <div className="payment-review-section">
            
            {/* 1. Thông tin chuyến tàu */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2">
                <Train size={20}/> Thông tin chuyến tàu
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{tripInfo.tenTau}</h3>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{tripInfo.loaiTau || 'Thống nhất'}</span>
                </div>
                <div className="bg-slate-50 border px-3 py-1 rounded-full text-sm font-medium text-slate-600">
                  Thời gian: {tripInfo.thoiGianChay}
                </div>
              </div>

              <div className="trip-summary-row">
                <div className="station-time-group">
                  <div className="station-label">Ga đi</div>
                  <div className="station-name">{tripInfo.gaDi === 'HN' ? 'Hà Nội' : tripInfo.gaDi}</div>
                  <div className="time-big">{tripInfo.gioDi}</div>
                </div>
                
                {/* Đường kẻ nối */}
                <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-6 mt-6 relative">
                    <div className="absolute -top-1.5 right-0 w-3 h-3 bg-slate-300 rounded-full"></div>
                    <div className="absolute -top-1.5 left-0 w-3 h-3 bg-slate-300 rounded-full"></div>
                </div>

                <div className="station-time-group right">
                  <div className="station-label text-right">Ga đến</div>
                  <div className="station-name text-right">{tripInfo.gaDen === 'SG' ? 'TP.Hồ Chí Minh' : tripInfo.gaDen}</div>
                  <div className="time-big text-right">{tripInfo.gioDen}</div>
                </div>
              </div>
            </div>

            {/* 2. Danh sách hành khách & Ghế */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2">
                <CheckCircle size={20}/> Chi tiết vé đặt ({selectedSeats.length} vé)
              </div>
              <div className="space-y-3">
                {selectedSeats.map((seat, index) => {
                    const passenger = passengers[index] || {};
                    return (
                        <div key={seat.id} className="flex justify-between items-start p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                                    {seat.seatNum}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-lg">{passenger.fullName || 'Hành khách'}</div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Toa {seat.tenToa} • {seat.loaiToa || 'Ngồi mềm'} • {passenger.type || 'Người lớn'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">CCCD: {passenger.cmnd || '---'}</div>
                                </div>
                            </div>
                            <div className="font-bold text-orange-600 text-lg">
                                {seat.price.toLocaleString()} ₫
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>

          </div>

          {/* --- CỘT PHẢI: SIDEBAR THANH TOÁN --- */}
          <div className="booking-sidebar">
            <h3 className="sidebar-title">Thanh toán</h3>
            <p className="text-sm text-slate-500 mb-4">
                {isEmployee ? "Chọn hình thức thu tiền" : "Chọn phương thức thanh toán"}
            </p>
            
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-600">Tạm tính:</span>
              <span className="font-medium">{totalPrice.toLocaleString()} đ</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
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
                  <p>{isEmployee ? "Thu tiền trực tiếp tại quầy" : "Thanh toán tại ga"}</p>
                </div>
              </div>

              <div 
                className={`payment-method-item ${paymentMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qr')}
              >
                <div className="method-icon"><QrCode size={20}/></div>
                <div className="method-info">
                  <h4>QR Code</h4>
                  <p>Quét mã VNPAY / Momo</p>
                </div>
              </div>

              <div 
                className={`payment-method-item ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="method-icon"><CreditCard size={20}/></div>
                <div className="method-info">
                  <h4>Thẻ ngân hàng</h4>
                  <p>{isEmployee ? "Máy POS" : "Thẻ ATM / Visa / Master"}</p>
                </div>
              </div>

            </div>

            <p className="payment-note mt-4 text-xs text-slate-400 text-center">
              {isEmployee 
                ? "Kiểm tra kỹ số tiền trước khi xác nhận in vé." 
                : "Vé điện tử sẽ được gửi về email sau khi thanh toán thành công."}
            </p>

            <button className="btn-continue mt-4" onClick={handleConfirmPayment}>
              {isEmployee ? "Xác nhận & In vé" : "Thanh toán ngay"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;