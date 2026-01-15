import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { getGheByTauId } from '../../../services/db_mock';
// Có thể import lại CSS cũ hoặc viết CSS riêng
import '../../../styles/pages/BookingFlow.css'; 

const SalesSeatSelectionPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [carriages, setCarriages] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    setCarriages(getGheByTauId(tripId));
  }, [tripId]);

  const handleSeatClick = (carriage, seatNum, isBooked) => {
    if (isBooked) return;
    const seatId = `${carriage.maToa}-${seatNum}`;
    const isSelected = selectedSeats.find(s => s.id === seatId);

    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      setSelectedSeats(prev => [
        ...prev, 
        { 
          id: seatId, seatNum, maToa: carriage.maToa, tenToa: carriage.tenToa, 
          price: carriage.giaCoBan, loaiToa: carriage.loaiToa
        }
      ]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleContinue = () => {
    // Điều hướng sang trang nhập thông tin khách của Sales
    navigate('/employee/sales/passengers', { 
      state: { selectedSeats, tripId } 
    });
  };

  return (
    <div className="p-4 bg-slate-100 min-h-screen flex gap-4">
      {/* CỘT TRÁI: SƠ ĐỒ GHẾ */}
      <div className="flex-1 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
           <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1">
             <ArrowLeft size={18}/> Quay lại
           </button>
           <h2 className="font-bold text-lg">Chọn chỗ - Tàu {tripId}</h2>
        </div>

        {carriages.map((carriage) => (
          <div key={carriage.maToa} className="mb-6">
            <div className="flex items-center gap-2 mb-2 bg-slate-50 p-2 rounded">
              <span className="font-bold text-slate-700">{carriage.tenToa}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{carriage.loaiToa}</span>
            </div>
            <div className="grid grid-cols-6 gap-2 md:grid-cols-10">
              {Array.from({ length: carriage.soGhe }, (_, i) => {
                const seatNum = i + 1;
                const isBooked = carriage.gheDaDat.includes(seatNum);
                const isSelected = selectedSeats.some(s => s.id === `${carriage.maToa}-${seatNum}`);
                
                return (
                  <div 
                    key={seatNum}
                    onClick={() => handleSeatClick(carriage, seatNum, isBooked)}
                    className={`
                      h-10 rounded border flex items-center justify-center cursor-pointer font-bold text-sm transition
                      ${isBooked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:border-blue-400 text-slate-700'}
                    `}
                  >
                    {seatNum}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG NHÂN VIÊN */}
      <div className="w-80 bg-white rounded-lg shadow p-4 h-fit sticky top-4">
        <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Vé đang chọn</h3>
        <div className="max-h-[400px] overflow-y-auto space-y-2 mb-4">
          {selectedSeats.length === 0 ? <p className="text-sm text-slate-400 italic">Chưa chọn ghế nào</p> : 
            selectedSeats.map(seat => (
              <div key={seat.id} className="flex justify-between items-center bg-blue-50 p-2 rounded text-sm">
                <div>
                  <div className="font-bold text-slate-700">{seat.tenToa} - Ghế {seat.seatNum}</div>
                  <div className="text-xs text-slate-500">{seat.loaiToa}</div>
                </div>
                <div className="font-bold text-blue-700">{seat.price.toLocaleString()}</div>
              </div>
            ))
          }
        </div>
        
        <div className="border-t pt-3">
           <div className="flex justify-between items-center text-lg font-bold mb-4">
             <span>Tổng tiền:</span>
             <span className="text-red-600">{totalPrice.toLocaleString()} đ</span>
           </div>
           <button 
             className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-slate-300"
             disabled={selectedSeats.length === 0}
             onClick={handleContinue}
           >
             Nhập thông tin khách ({selectedSeats.length})
           </button>
        </div>
      </div>
    </div>
  );
};
export default SalesSeatSelectionPage;