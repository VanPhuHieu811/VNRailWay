import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User, Train, Calendar } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import '../../styles/pages/ExchangeSelectSeatsPage.css'; // Import file CSS đã tách

const ExchangeSelectSeatsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin vé từ trang "Vé của tôi"
  const { ticket } = location.state || {};

  // Nếu không có dữ liệu vé, hiển thị thông báo lỗi
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

  // State lưu danh sách ID ghế muốn đổi
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  // Hàm toggle chọn ghế
  const toggleSeatSelection = (seatId) => {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seatId));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seatId]);
    }
  };

  // Tính tổng tiền vé muốn đổi (để hiển thị)
  const totalExchangeValue = ticket.seats
    .filter(seat => selectedSeatIds.includes(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0);

  // --- SỬA ĐỔI QUAN TRỌNG Ở ĐÂY ---
  const handleContinue = () => {
    if (selectedSeatIds.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế để đổi!");
      return;
    }
    
    // Điều hướng sang trang Tìm kiếm (ExchangeSearchPage)
    // Thay vì đi thẳng sang trang kết quả như trước
    navigate('/exchange/search', { 
      state: { 
        oldTicket: ticket,
        seatsToExchange: selectedSeatIds, // Danh sách ghế cũ đã chọn
        exchangeValue: totalExchangeValue // Tổng tiền vé cũ
      } 
    });
  };

  return (
    <div className="exchange-page-wrapper">
      
      {/* 1. NAVBAR FULL WIDTH */}
      <div className="exchange-header-full exchange-navbar-wrapper">
         <CustomerNavbar />
      </div>

      {/* 2. STEPS FULL WIDTH */}
      <div className="exchange-header-full exchange-steps-wrapper">
         {/* Bước 1: Chi tiết vé */}
         <ExchangeSteps currentStep={1} />
      </div>

      {/* 3. MAIN CONTENT (Căn giữa, max-width 1200px) */}
      <div className="exchange-main-container">
        
        {/* Nút quay lại */}
        <div onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={20} /> Quay lại vé của tôi
        </div>

        <div className="exchange-grid-layout">
          
          {/* CỘT TRÁI: DANH SÁCH GHẾ */}
          <div className="exchange-column-main">
            <div className="exchange-card">
                <h2 className="card-title">Chọn vé muốn đổi</h2>
                <p className="card-desc">Vui lòng chọn các hành khách/ghế mà bạn muốn thực hiện đổi vé.</p>

                <div className="space-y-4">
                {ticket.seats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    return (
                    <div 
                        key={seat.id} 
                        className={`seat-select-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSeatSelection(seat.id)}
                    >
                        {/* Checkbox Custom */}
                        <div className="custom-checkbox-circle">
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3}/>}
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="flex-1">
                            <div className="seat-info-row">
                                <span className="seat-name">Toa {seat.maToa} - Ghế {seat.seatNum}</span>
                                <span className="seat-price">{seat.price.toLocaleString()} đ</span>
                            </div>
                            
                            <div className="passenger-info-grid">
                                <div className="info-item">
                                    <User size={16} className="text-slate-400"/>
                                    <span className="font-medium">{seat.passengerName || "Khách lẻ"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="text-slate-400">CCCD:</span>
                                    <span>{seat.passengerID || "---"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="badge-seat-type">{seat.loaiToa}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
          </div>

          {/* CỘT PHẢI: SIDEBAR (Sticky) */}
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

                    <div className="flex gap-4">
                        <div className="flex-1 info-row">
                            <div className="info-label">Ga đi</div>
                            <div className="info-value">{ticket.tripInfo.gaDi}</div>
                        </div>
                        <div className="flex-1 info-row text-right">
                            <div className="info-label">Ga đến</div>
                            <div className="info-value">{ticket.tripInfo.gaDen}</div>
                        </div>
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
                    <div className="summary-row">
                        <span>Số vé chọn đổi:</span>
                        <span className="font-bold text-slate-800">{selectedSeatIds.length}</span>
                    </div>
                    <div className="summary-row mb-6">
                        <span className="font-bold text-slate-700">Giá trị hoàn đổi:</span>
                        <span className="total-price-display">{totalExchangeValue.toLocaleString()} đ</span>
                    </div>
                    
                    <button 
                        className="btn-submit-exchange"
                        onClick={handleContinue}
                        disabled={selectedSeatIds.length === 0}
                    >
                        Tiếp tục đổi vé
                    </button>
                    
                    <p className="text-xs text-slate-400 mt-3 text-center italic">
                        * Phí đổi vé sẽ được tính ở bước xác nhận cuối cùng.
                    </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExchangeSelectSeatsPage;