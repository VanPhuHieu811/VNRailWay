import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import { getGheByTauId } from '../../services/db_mock';
import '../../styles/pages/BookingFlow.css';

const SeatSelectionPage = ({ isEmployee = false }) => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isExchange, exchangeData, newTripInfo } = location.state || {};

  const [carriages, setCarriages] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const requiredSeatsCount = isExchange ? exchangeData?.seatsToExchange?.length : 0;

  useEffect(() => {
    const data = getGheByTauId(tripId);
    setCarriages(data);
  }, [tripId]);

  const handleSeatClick = (carriage, seatNum, isBooked) => {
    if (isBooked) return;
    const seatId = `${carriage.maToa}-${seatNum}`;
    const isSelected = selectedSeats.find(s => s.id === seatId);

    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      if (isExchange) {
        if (selectedSeats.length >= requiredSeatsCount) {
          alert(`Bạn chỉ được chọn tối đa ${requiredSeatsCount} ghế mới tương ứng với số vé muốn đổi.`);
          return;
        }
      }
      setSelectedSeats(prev => [
        ...prev, 
        { 
          id: seatId, seatNum, maToa: carriage.maToa, tenToa: carriage.tenToa, 
          price: carriage.giaCoBan, loaiToa: carriage.loaiToa
        }
      ]);
    }
  };

  const newTicketPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const oldTicketValue = isExchange ? exchangeData.exchangeValue : 0;
  const priceDiff = newTicketPrice - oldTicketValue;

  const handleContinue = () => {
    // 1. Luồng Đổi Vé
    if (isExchange) {
      if (selectedSeats.length !== requiredSeatsCount) {
         alert(`Vui lòng chọn đủ ${requiredSeatsCount} ghế mới.`);
         return;
      }
      
      // 👇 SỬA LỖI: Điều hướng dựa trên Role để giữ Sidebar
      const confirmPath = isEmployee 
          ? '/employee/sales/exchange/confirm'  // Route con của Employee
          : '/exchange/confirm';                // Route gốc của Khách

      navigate(confirmPath, { 
        state: { 
          ...exchangeData, 
          newSeats: selectedSeats, 
          priceDiff, 
          newTotalPrice: newTicketPrice, 
          newTripInfo, 
          isEmployee // Truyền cờ này sang trang sau
        } 
      });

    } else {
      // 2. Luồng Bán Vé Mới
      const basePath = isEmployee ? '/employee/sales' : '/booking';
      navigate(`${basePath}/passengers`, { 
        state: { 
            selectedSeats, 
            tripId, 
            searchParams: location.state?.searchParams 
        } 
      });
    }
  };

  const currentExchangeStep = isEmployee ? 4 : 4;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      {!isEmployee && <CustomerNavbar />}
      
      {isExchange ? (
        <ExchangeSteps currentStep={currentExchangeStep} isEmployee={isEmployee} />
      ) : (
        !isEmployee && <BookingSteps currentStep={3} />
      )}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> {isEmployee ? 'Quay lại tìm kiếm' : 'Quay lại'}
        </div>

        <div className="seat-layout-container">
          <div className="seat-map-card">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {isExchange ? "Chọn chỗ ngồi mới" : "Chọn chỗ ngồi"}
            </h2>
            <p className="text-slate-500 mb-6">Tàu {tripId}</p>

            {isExchange && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">Bạn cần chọn đúng <strong>{requiredSeatsCount}</strong> vị trí mới để thay thế.</span>
              </div>
            )}

            {carriages.map((carriage) => (
              <div key={carriage.maToa} className="carriage-section">
                <div className="carriage-header">
                  <span className="carriage-title">{carriage.tenToa}</span>
                  <span className="carriage-type-badge">{carriage.loaiToa}</span>
                </div>
                <div className="seat-grid">
                  {Array.from({ length: carriage.soGhe }, (_, i) => {
                    const seatNum = i + 1;
                    const isBooked = carriage.gheDaDat.includes(seatNum);
                    const isSelected = selectedSeats.some(s => s.id === `${carriage.maToa}-${seatNum}`);
                    const isDisabledLook = isExchange && !isSelected && !isBooked && selectedSeats.length >= requiredSeatsCount;

                    return (
                      <div 
                        key={seatNum}
                        onClick={() => handleSeatClick(carriage, seatNum, isBooked)}
                        className={`seat-item ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isDisabledLook ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Legend (Giữ nguyên) */}
            <div className="seat-legend">
              <div className="legend-item"><div className="legend-box" style={{background: 'white'}}></div> Trống</div>
              <div className="legend-item"><div className="legend-box" style={{background: '#0ea5e9', borderColor: '#0ea5e9'}}></div> Đã chọn</div>
              <div className="legend-item"><div className="legend-box" style={{background: '#f1f5f9'}}></div> Đã đặt</div>
            </div>
          </div>

          <div className="booking-sidebar">
            <h3 className="sidebar-title">{isExchange ? "Thông tin đổi vé" : "Thông tin đặt chỗ"}</h3>
            
            {isExchange && (
              <div className="mb-4 flex justify-between items-center bg-slate-100 p-3 rounded-lg">
                <span className="text-sm text-slate-600 font-semibold">Tiến độ chọn:</span>
                <span className={`font-bold ${selectedSeats.length === requiredSeatsCount ? 'text-green-600' : 'text-orange-500'}`}>
                  {selectedSeats.length} / {requiredSeatsCount} ghế
                </span>
              </div>
            )}

            <div className="selected-list">
              <p className="text-sm font-semibold text-slate-600 mb-2">Chỗ đã chọn:</p>
              {selectedSeats.length === 0 ? <p className="empty-msg">Chưa chọn chỗ nào</p> : 
                selectedSeats.map(seat => (
                  <div key={seat.id} className="selected-seat-tag">
                    <span className="font-bold text-slate-700">{seat.tenToa} - Ghế {seat.seatNum}</span>
                    <span className="text-blue-600">{seat.price.toLocaleString()}đ</span>
                  </div>
                ))
              }
            </div>

            <div className="total-section">
              {isExchange ? (
                <div className="exchange-calc space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giá trị vé cũ:</span>
                    <span className="font-semibold text-slate-700">{oldTicketValue.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giá vé mới:</span>
                    <span className="font-semibold text-blue-600">{newTicketPrice.toLocaleString()} đ</span>
                  </div>
                  <div className="border-t border-dashed border-slate-300 my-2 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Chênh lệch:</span>
                    <span className={`text-xl font-bold ${priceDiff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {priceDiff >= 0 ? `+${priceDiff.toLocaleString()}` : priceDiff.toLocaleString()} đ
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600">Số lượng vé</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-800 font-bold text-lg">Tổng tiền</span>
                    <span className="text-xl font-bold text-red-600">{newTicketPrice.toLocaleString()} đ</span>
                  </div>
                </>
              )}
              
              <button 
                className="btn-continue"
                disabled={isExchange ? selectedSeats.length !== requiredSeatsCount : selectedSeats.length === 0}
                onClick={handleContinue}
              >
                {isExchange ? "Tiếp tục đổi vé" : (isEmployee ? "Nhập thông tin khách" : "Tiếp tục")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;