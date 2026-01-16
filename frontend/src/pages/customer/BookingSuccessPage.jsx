import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Printer, Home, PlusCircle, User } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import '../../styles/pages/BookingFlow.css';

const BookingSuccessPage = ({ isEmployee = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu truyền từ các trang trước
  const { tripInfo,  totalPrice, passengers, resultData } = location.state || { };
    if (!passengers) {
      return (
        <div className="p-10 text-center">
            <p>Không tìm thấy thông tin vé vừa đặt.</p>
            <button onClick={() => navigate('/')} className="text-blue-600 underline">Về trang chủ</button>
        </div>
      );
  }

  // Tạo mã vé ngẫu nhiên giả lập (Mỗi lần render sẽ khác nhau, thực tế lấy từ API response)
  const ticketCode = resultData?.maDatVe || "VNR" + Math.floor(100000 + Math.random() * 900000);

  // Helper để lấy tên hành khách tương ứng với ghế (nếu có danh sách passengers)
  const getPassengerName = (seatId) => {
    if (!passengers || passengers.length === 0) return 'Khách lẻ';
    const passenger = passengers.find(p => p.seatId === seatId);
    return passenger ? passenger.fullName.toUpperCase() : 'KHÁCH HÀNG';
  };

  // Nút quay về trang chủ (Khách) hoặc Bán vé mới (Sales)
  const handleHomeAction = () => {
    navigate('/customer/dashboard'); 
  };

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      
      {/* 1. ẨN NAVBAR NẾU LÀ NHÂN VIÊN */}
      {!isEmployee && (
        <>
          <CustomerNavbar />
          <BookingSteps currentStep={6} />
        </>
      )}

      <div className="booking-content">
        <div className="success-container">
          
          {/* Icon Check xanh */}
          <div className="success-icon-box">
            <Check size={32} strokeWidth={3} />
          </div>

          <h1 className="success-title">
            {isEmployee ? "Xuất vé thành công!" : "Đặt vé thành công!"}
          </h1>
          <p className="success-desc">
            {isEmployee 
              ? "Giao dịch đã được ghi nhận. Vui lòng in vé và giao cho khách hàng." 
              : "Vé điện tử đã được gửi đến email của bạn. Cảm ơn bạn đã sử dụng dịch vụ!"}
          </p>

          {/* --- VÉ TÀU VISUAL (MÔ PHỎNG VÉ IN) --- */}
          <div className="ticket-visual">
            
            {/* Header Vé */}
            <div className="ticket-header">
              <div className="ticket-brand">
                <h3>VÉ TÀU HỎA / TRAIN TICKET</h3>
                <p>Tổng công ty Đường sắt Việt Nam</p>
              </div>
              <div className="ticket-id">
                CODE: {ticketCode}
              </div>
            </div>

            {/* Nội dung Vé */}
            <div className="ticket-body">
              
              {/* Thông tin chuyến */}
              <div className="ticket-row">
                <div className="ticket-field">
                  <label>Mác tàu / Train</label>
                  <span className="font-bold text-xl text-blue-800">{tripInfo.tenTau}</span>
                </div>
                <div className="ticket-field text-right">
                  <label>Ngày đi / Date</label>
                  <span className="font-bold">{tripInfo.ngayDi || '02/01/2026'}</span>
                </div>
              </div>

              <div className="ticket-row border-b border-dashed border-slate-300 pb-3 mb-3">
                <div className="ticket-field">
                  <label>Ga đi / From</label>
                  <span className="font-semibold">{tripInfo.gaDi === 'HN' ? 'Hà Nội' : tripInfo.gaDi}</span>
                  <span className="ticket-big-time text-blue-600">{tripInfo.gioDi}</span>
                </div>
                <div className="ticket-field text-right">
                  <label>Ga đến / To</label>
                  <span className="font-semibold">{tripInfo.gaDen === 'SG' ? 'TP.Hồ Chí Minh' : tripInfo.gaDen}</span>
                  <span className="ticket-big-time text-blue-600">{tripInfo.gioDen}</span>
                </div>
              </div>

              {/* Danh sách ghế & Hành khách */}
              <div className="mb-2">
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Chi tiết vé / Ticket Details</label>
                
                {passengers.map((p, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded border border-slate-100 mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-lg">
                        {p.tenToa || 'Toa Khách'} - Số {p.seatNum || p.SoGhe}
                      </span>
                      <span className="font-bold text-slate-800">
                        {p.price ? p.price.toLocaleString() : (p.GiaCoBan || 0).toLocaleString()} đ
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>Loại: {p.loaiToa || p.DoiTuong || 'Thường'}</span>
                      <span className="flex items-center gap-1 uppercase font-semibold">
                        <User size={12}/> {p.fullName || p.HoTen}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">CCCD: {p.cmnd || p.CCCD}</div>
                  </div>
                ))}
              </div>

              <div className="text-right mt-4 pt-2 border-t border-slate-200">
                <span className="text-sm text-slate-500 mr-2">Tổng tiền / Total:</span>
                <span className="text-xl font-bold text-red-600">
                    {totalPrice ? totalPrice.toLocaleString() : '0'} VNĐ
                </span>
              </div>

            </div>
          </div>



          {/* --- CÁC NÚT HÀNH ĐỘNG --- */}
          <div className="action-buttons-center">
            
            {/* Nút 1: Về trang chủ hoặc Bán mới */}
            <button onClick={handleHomeAction} className="btn-home">
              {isEmployee ? <PlusCircle size={18} /> : <Home size={18} />}
              {isEmployee ? " Bán vé mới" : " Về trang chủ"}
            </button>
            
            {/* Nút 2: In vé */}
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