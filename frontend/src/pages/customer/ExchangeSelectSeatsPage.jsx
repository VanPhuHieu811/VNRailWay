import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Circle, Disc, User, Train, Calendar, AlertCircle } from 'lucide-react'; // Dùng icon Disc/Circle cho Radio
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import '../../styles/pages/ExchangeSelectSeatsPage.css';

const ExchangeSelectSeatsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { ticket } = location.state || {};

  // Validate vé
  if (!ticket) {
    return (
        <div className="exchange-page-wrapper">
            <CustomerNavbar />
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-500">
                <p className="mb-4">Không tìm thấy thông tin vé.</p>
                <button onClick={() => navigate('/')} className="text-blue-600 underline font-medium">Về trang chủ</button>
            </div>
        </div>
    );
  }

  // State lưu danh sách ID ghế (Mặc dù chỉ chọn 1, ta vẫn để mảng để dễ tái sử dụng logic cũ nếu cần)
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  // --- LOGIC MỚI: CHỈ ĐƯỢC CHỌN 1 ---
  const handleSelectSeat = (seatId) => {
    if (selectedSeatIds.includes(seatId)) {
      // Nếu ấn vào ghế đang chọn -> Bỏ chọn (Reset về rỗng)
      setSelectedSeatIds([]);
    } else {
      // Nếu ấn vào ghế khác -> Thay thế hoàn toàn bằng ghế mới (Chỉ giữ 1)
      setSelectedSeatIds([seatId]);
    }
  };

  const totalExchangeValue = ticket.seats
    .filter(seat => selectedSeatIds.includes(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0);

  const handleContinue = () => {
    if (selectedSeatIds.length === 0) {
      alert("Vui lòng chọn 1 vé để đổi!");
      return;
    }
    
    // Logic điều hướng giữ nguyên
    navigate('/exchange/search', { 
      state: { 
        oldTicket: ticket,
        seatsToExchange: selectedSeatIds,
        exchangeValue: totalExchangeValue 
      } 
    });
  };

  return (
    <div className="exchange-page-wrapper">
      <div className="exchange-header-full exchange-navbar-wrapper">
         <CustomerNavbar />
      </div>

      <div className="exchange-header-full exchange-steps-wrapper">
         <ExchangeSteps currentStep={1} />
      </div>

      <div className="exchange-main-container">
        <div onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={20} /> Quay lại vé của tôi
        </div>

        <div className="exchange-grid-layout">
          
          {/* CỘT TRÁI: DANH SÁCH GHẾ */}
          <div className="exchange-column-main">
            <div className="exchange-card">
                <h2 className="card-title">Chọn vé muốn đổi</h2>
                {/* Thông báo rõ ràng cho khách */}
                <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded mb-4 flex items-center gap-2">
                   <AlertCircle size={16}/>
                   <span>Lưu ý: Bạn chỉ được chọn <strong>01 vé</strong> duy nhất trong mỗi lần đổi.</span>
                </div>

                <div className="space-y-4">
                {ticket.seats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    return (
                    <div 
                        key={seat.id} 
                        // Thêm border xanh đậm nếu được chọn
                        className={`seat-select-item cursor-pointer border-2 transition-all p-3 rounded-lg flex gap-3 items-center 
                            ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                        onClick={() => handleSelectSeat(seat.id)}
                    >
                        {/* UI RADIO BUTTON */}
                        <div className={`text-blue-600`}>
                            {isSelected ? <Disc size={24} fill="currentColor" /> : <Circle size={24} className="text-slate-300"/>}
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="flex-1">
                            <div className="seat-info-row flex justify-between mb-1">
                                <span className="seat-name font-bold text-slate-800">Toa {seat.maToa} - Ghế {seat.seatNum}</span>
                                <span className="seat-price font-bold text-blue-600">{seat.price.toLocaleString()} đ</span>
                            </div>
                            
                            <div className="passenger-info-grid text-sm text-slate-600 grid grid-cols-2 gap-2">
                                <div className="info-item flex items-center gap-1">
                                    <User size={14} className="text-slate-400"/>
                                    <span className="font-medium">{seat.passengerName || "Khách lẻ"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="badge-seat-type bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                                        {seat.loaiToa}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
          </div>

          {/* CỘT PHẢI: SIDEBAR */}
          <div className="exchange-column-sidebar">
            <div className="exchange-sidebar-sticky">
                <div className="sidebar-header">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Train size={20} className="text-blue-600"/> Thông tin vé gốc
                    </h3>
                </div>
              
                <div className="sidebar-content">
                    <div className="info-row">
                        <div className="info-label">Chuyến tàu</div>
                        <div className="info-value">{ticket.tripInfo.tenTau}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-label">Hành trình</div>
                        <div className="info-value">{ticket.tripInfo.gaDi} ➝ {ticket.tripInfo.gaDen}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-label">Ngày khởi hành</div>
                        <div className="flex items-center gap-2 info-value">
                            <Calendar size={16} className="text-blue-500"/>
                            {new Date(ticket.tripInfo.ngayDi).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="summary-row mb-6">
                        <span className="font-bold text-slate-700">Giá trị vé đổi:</span>
                        <span className="total-price-display text-xl font-bold text-blue-600">
                            {totalExchangeValue.toLocaleString()} đ
                        </span>
                    </div>
                    
                    <button 
                        className="btn-submit-exchange w-full py-3 rounded font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                        onClick={handleContinue}
                        disabled={selectedSeatIds.length === 0}
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExchangeSelectSeatsPage;