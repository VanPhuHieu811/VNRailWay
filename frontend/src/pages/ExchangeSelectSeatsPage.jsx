import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User, Train } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import ExchangeSteps from '../components/common/ExchangeSteps';
import '../styles/pages/ExchangeFlow.css';

const ExchangeSelectSeatsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin vé từ trang trước
  const { ticket } = location.state || {};

  // Nếu không có dữ liệu (user vào thẳng link), đẩy về trang chủ
  if (!ticket) {
    return <div className="p-10 text-center">Không tìm thấy thông tin vé.</div>;
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

  // Tính tổng tiền vé muốn đổi (để tham khảo)
  const totalExchangeValue = ticket.seats
    .filter(seat => selectedSeatIds.includes(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0);

  const handleContinue = () => {
    if (selectedSeatIds.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế để đổi!");
      return;
    }
    
    // Logic: Chuyển sang bước 3 (Tìm tàu mới)
    // Mang theo thông tin vé cũ và danh sách ghế muốn đổi
    navigate('/exchange/search', { 
      state: { 
        oldTicket: ticket,
        seatsToExchange: selectedSeatIds,
        exchangeValue: totalExchangeValue
      } 
    });
  };

  return (
    <div className="exchange-container">
      <CustomerNavbar />
      
      {/* Bước 2: Chi tiết vé (Active) */}
      <ExchangeSteps currentStep={2} />

      <div className="exchange-content">
        {/* Nút quay lại */}
        <div onClick={() => navigate(-1)} className="btn-back mb-4 flex items-center gap-2 cursor-pointer text-slate-600 hover:text-blue-600">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: Danh sách ghế để chọn */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Chọn vé muốn đổi</h2>
            <p className="text-slate-500 mb-4 text-sm">Vui lòng chọn các hành khách/ghế mà bạn muốn thực hiện đổi vé.</p>

            <div className="exchange-card">
              {ticket.seats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                return (
                  <div 
                    key={seat.id} 
                    className={`seat-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSeatSelection(seat.id)}
                  >
                    {/* Checkbox */}
                    <div className="custom-checkbox">
                      {isSelected && <Check size={14} />}
                    </div>

                    {/* Nội dung ghế + Hành khách */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="seat-tag">Toa {seat.maToa} - Ghế {seat.seatNum}</span>
                          <div className="passenger-details mt-1">
                            <h4 className="flex items-center gap-2">
                              <User size={14} className="text-slate-400"/>
                              {seat.passengerName || "Khách lẻ"}
                            </h4>
                            <p>CMND/CCCD: {seat.passengerID || "---"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-700">{seat.price.toLocaleString()} đ</div>
                          <div className="text-xs text-slate-400">{seat.loaiToa}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: Tóm tắt vé gốc & Action */}
          <div>
            <div className="booking-sidebar sticky top-24">
              <h3 className="sidebar-title">Thông tin vé gốc</h3>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <div className="font-bold text-blue-700 text-lg mb-1">{ticket.tripInfo.tenTau}</div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Train size={14} /> 
                  {ticket.tripInfo.gaDi} ➝ {ticket.tripInfo.gaDen}
                </div>
                <div className="text-sm text-slate-500">
                  Ngày đi: <strong>{new Date(ticket.tripInfo.ngayDi).toLocaleDateString('vi-VN')}</strong>
                </div>
              </div>

              <div className="total-section mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Số vé chọn đổi:</span>
                  <span className="font-bold">{selectedSeatIds.length}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-800 font-bold">Giá trị hoàn đổi:</span>
                  <span className="text-xl font-bold text-blue-600">{totalExchangeValue.toLocaleString()} đ</span>
                </div>
                
                <button className="btn-continue" onClick={handleContinue}>
                  Tiếp tục đổi vé
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center italic">
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