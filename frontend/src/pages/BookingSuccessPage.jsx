import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Check, Printer, Home, Download } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import BookingSteps from '../components/common/BookingSteps';
import '../styles/pages/BookingFlow.css';

const BookingSuccessPage = () => {
  const location = useLocation();

  // Lấy dữ liệu truyền từ trang Payment
  const { tripInfo, selectedSeats, totalPrice } = location.state || { 
    // Dữ liệu fallback để test nếu không đi từ quy trình
    tripInfo: { tenTau: 'SE1', gaDi: 'Hà Nội', gaDen: 'Sài Gòn', gioDi: '06:00', gioDen: '18:30', ngayDi: '2025-11-24' },
    selectedSeats: [{ maToa: 'B', seatNum: 4, loaiToa: 'Standard', price: 890000 }],
    totalPrice: 890000 
  };

  // Tạo mã vé ngẫu nhiên giả lập
  const ticketId = "TK" + Math.floor(100000000000 + Math.random() * 900000000000);

  return (
    <div className="booking-container">
      <CustomerNavbar />
      {/* Bước 6: Hoàn tất (Active) */}
      <BookingSteps currentStep={6} />

      <div className="booking-content">
        <div className="success-container">
          
          {/* Icon Check xanh */}
          <div className="success-icon-box">
            <Check size={32} strokeWidth={3} />
          </div>

          <h1 className="success-title">Đặt vé thành công!</h1>
          <p className="success-desc">Vé đã được tạo và sẵn sàng để in. Vui lòng kiểm tra email để xem chi tiết.</p>

          {/* --- VÉ TÀU VISUAL --- */}
          <div className="ticket-visual">
            
            {/* Header Vé (Màu xanh) */}
            <div className="ticket-header">
              <div className="ticket-brand">
                <h3>Vé Tàu Hỏa</h3>
                <p>Tổng công ty Đường sắt Việt Nam</p>
              </div>
              <div className="ticket-id">{ticketId}</div>
            </div>

            {/* Nội dung Vé */}
            <div className="ticket-body">
              
              {/* Dòng 1: Số hiệu tàu & Ngày đi */}
              <div className="ticket-row">
                <div className="ticket-field">
                  <label>Tàu số</label>
                  <span>{tripInfo.tenTau}</span>
                  <label style={{marginTop: 4, fontSize: 12}}>Thống nhất</label>
                </div>
                <div className="ticket-field text-right">
                  <label>Ngày đi</label>
                  <span>{tripInfo.ngayDi || '24/11/2025'}</span>
                </div>
              </div>

              {/* Dòng 2: Ga đi & Ga đến (Giờ to) */}
              <div className="ticket-row">
                <div className="ticket-field">
                  <label>Ga đi</label>
                  <span style={{marginBottom: 4}}>{tripInfo.gaDi === 'HN' ? 'Hà Nội' : tripInfo.gaDi}</span>
                  <span className="ticket-big-time">{tripInfo.gioDi}</span>
                </div>
                <div className="ticket-field text-right">
                  <label>Ga đến</label>
                  <span style={{marginBottom: 4}}>{tripInfo.gaDen === 'SG' ? 'TP.Hồ Chí Minh' : tripInfo.gaDen}</span>
                  <span className="ticket-big-time">{tripInfo.gioDen}</span>
                </div>
              </div>

              {/* Dòng 3: Thông tin chỗ ngồi */}
              <div style={{marginBottom: 8}}>
                <label className="text-sm text-slate-400 block mb-2">Thông tin chỗ ngồi</label>
                {selectedSeats.map((seat, index) => (
                  <div key={index} className="ticket-seat-item">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">Toa {seat.maToa} - Chỗ {seat.seatNum}</span>
                      <p className="text-sm text-slate-500">{seat.loaiToa || 'Standard'}</p>
                    </div>
                    <div className="font-bold text-slate-800">
                      {seat.price.toLocaleString()} đ
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Các nút hành động */}
          <div className="action-buttons-center">
            <Link to="/customer/dashboard" className="btn-home">
              <Home size={18} /> Về trang chủ
            </Link>
            
            <button className="btn-print" onClick={() => window.print()}>
              <Printer size={18} /> In vé ngay
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;