import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Train, CheckCircle } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import { getGheByTauId, LICH_TRINH_DB } from '../../services/db_mock'; 
import '../../styles/pages/BookingFlow.css';

const SeatSelectionPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy dữ liệu an toàn từ state
  const { isExchange, exchangeData, searchParams } = location.state || {};

  // Tìm thông tin tàu để hiển thị header
  const tripInfo = LICH_TRINH_DB.find(t => t.id === tripId) || { tenTau: tripId, gioDi: '--:--', gaDi: '', gaDen: '' };

  const [carriages, setCarriages] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // 2. Xác định số lượng ghế CẦN chọn (Nếu đổi vé)
  // Sử dụng optional chaining (?.) để tránh lỗi crash nếu exchangeData null
  const requiredSeatsCount = isExchange ? (exchangeData?.seatsToExchange?.length || 0) : 0;

  useEffect(() => {
    // Giả lập API lấy sơ đồ ghế
    const data = getGheByTauId(tripId);
    setCarriages(data);
  }, [tripId]);

  const handleSeatClick = (carriage, seatNum, isBooked) => {
    if (isBooked) return;
    const seatId = `${carriage.maToa}-${seatNum}`;
    const isSelected = selectedSeats.find(s => s.id === seatId);

    if (isSelected) {
      // Bỏ chọn
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      // Chọn mới
      if (isExchange) {
        // LOGIC ĐỔI VÉ: Chặn không cho chọn quá số lượng vé cũ
        if (selectedSeats.length >= requiredSeatsCount) {
          alert(`Bạn đang đổi ${requiredSeatsCount} vé cũ, nên chỉ được chọn tối đa ${requiredSeatsCount} ghế mới.`);
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

  // 3. Tính toán tiền (Fix lỗi Crash ở đây)
  const newTicketPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  // Thêm fallback || 0 để đảm bảo không lỗi
  const oldTicketValue = isExchange ? (exchangeData?.exchangeValue || 0) : 0; 
  const priceDiff = newTicketPrice - oldTicketValue;

  const handleContinue = () => {
    // --- LUỒNG ĐỔI VÉ ---
    if (isExchange) {
      if (selectedSeats.length !== requiredSeatsCount) {
         alert(`Vui lòng chọn đủ ${requiredSeatsCount} ghế mới.`);
         return;
      }
      
      // Chuyển sang trang Xác nhận (Customer)
      navigate('/exchange/confirm', { 
        state: { 
          exchangeData,          
          newSeats: selectedSeats, 
          newTotalPrice: newTicketPrice,
          newTripInfo: tripInfo,
          isEmployee: false 
        } 
      });

    } 
    // --- LUỒNG ĐẶT VÉ MỚI ---
    else {
      if (selectedSeats.length === 0) {
        alert("Vui lòng chọn ít nhất 1 ghế.");
        return;
      }

      navigate('/booking/passengers', { 
        state: { 
            selectedSeats, 
            tripId, 
            tripInfo, 
            searchParams 
        } 
      });
    }
  };

  // 4. Bảo vệ trang: Nếu F5 mất dữ liệu đổi vé -> Về trang chủ
  if (isExchange && !exchangeData) {
    return (
        <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <AlertCircle size={40} className="text-red-500 mb-4"/>
            <p className="text-slate-600 mb-4">Dữ liệu phiên làm việc đã hết hạn. Vui lòng thực hiện lại.</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Về trang chủ
            </button>
        </div>
    );
  }

  return (
    <div className="booking-container">
      <CustomerNavbar />
      
      {/* Hiển thị Steps: Đổi vé (B4) hoặc Đặt vé (B3) */}
      {isExchange ? <ExchangeSteps currentStep={4} /> : <BookingSteps currentStep={3} />}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại tìm kiếm
        </div>

        <div className="seat-layout-container">
          
          {/* CỘT TRÁI: SƠ ĐỒ GHẾ */}
          <div className="seat-map-card">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                    {isExchange ? "Chọn chỗ ngồi mới" : "Chọn chỗ ngồi"}
                    </h2>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                        <Train size={16}/> Tàu {tripInfo.tenTau} ({tripInfo.gaDi} - {tripInfo.gaDen})
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Giờ đi: {tripInfo.gioDi}
                    </p>
                </div>
            </div>

            {/* Thông báo nhắc nhở khi đổi vé */}
            {isExchange && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm">
                    Bạn cần chọn đúng <strong>{requiredSeatsCount}</strong> vị trí mới để thay thế cho vé cũ.
                    <br/>
                    <span className="text-xs text-orange-600 italic">Giá trị vé cũ ({oldTicketValue.toLocaleString()}đ) sẽ được cấn trừ.</span>
                </span>
              </div>
            )}

            {/* Render các toa tàu */}
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
                    
                    // Disable các ghế còn lại nếu đã chọn đủ số lượng cần đổi
                    const isDisabledLook = isExchange && !isSelected && !isBooked && selectedSeats.length >= requiredSeatsCount;

                    return (
                      <div 
                        key={seatNum}
                        onClick={() => handleSeatClick(carriage, seatNum, isBooked)}
                        className={`seat-item 
                            ${isBooked ? 'booked' : ''} 
                            ${isSelected ? 'selected' : ''} 
                            ${isDisabledLook ? 'opacity-40 cursor-not-allowed' : ''}
                        `}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="seat-legend">
              <div className="legend-item"><div className="legend-box" style={{background: 'white'}}></div> Trống</div>
              <div className="legend-item"><div className="legend-box" style={{background: '#0ea5e9', borderColor: '#0ea5e9'}}></div> Đang chọn</div>
              <div className="legend-item"><div className="legend-box" style={{background: '#f1f5f9'}}></div> Đã đặt</div>
            </div>
          </div>

          {/* CỘT PHẢI: GIỎ HÀNG / THÔNG TIN */}
          <div className="booking-sidebar">
            <h3 className="sidebar-title">{isExchange ? "Thông tin đổi vé" : "Thông tin đặt chỗ"}</h3>
            
            {/* Tiến độ chọn (chỉ hiện khi đổi vé) */}
            {isExchange && (
              <div className="mb-4 flex justify-between items-center bg-slate-100 p-3 rounded-lg">
                <span className="text-sm text-slate-600 font-semibold">Đã chọn:</span>
                <span className={`font-bold flex items-center gap-1 ${selectedSeats.length === requiredSeatsCount ? 'text-green-600' : 'text-orange-500'}`}>
                  {selectedSeats.length === requiredSeatsCount && <CheckCircle size={16}/>}
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
                // --- GIAO DIỆN TÍNH TIỀN KHI ĐỔI VÉ ---
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
                    <span className="font-bold text-slate-800 text-sm">Chênh lệch:</span>
                    <span className={`text-xl font-bold ${priceDiff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {priceDiff >= 0 ? `+${priceDiff.toLocaleString()}` : priceDiff.toLocaleString()} đ
                    </span>
                  </div>
                  <p className="text-xs text-right text-slate-400 italic">
                    {priceDiff >= 0 ? "(Bạn cần thanh toán thêm)" : "(Bạn sẽ được hoàn tiền)"}
                  </p>
                </div>
              ) : (
                // --- GIAO DIỆN TÍNH TIỀN ĐẶT VÉ MỚI ---
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
                // Disable nếu đổi vé mà chưa chọn đủ số lượng
                disabled={isExchange ? selectedSeats.length !== requiredSeatsCount : selectedSeats.length === 0}
                onClick={handleContinue}
              >
                {isExchange ? "Tiếp tục đổi vé" : "Tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;