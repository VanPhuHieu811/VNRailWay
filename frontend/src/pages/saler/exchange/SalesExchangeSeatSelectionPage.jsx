import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { getGheByTauId } from '../../../services/db_mock';

const SalesExchangeSeatSelectionPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { oldTicketData } = location.state || {};

  const [carriages, setCarriages] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null); // Chỉ lưu 1 ghế vì đang đổi 1 vé

  useEffect(() => {
    setCarriages(getGheByTauId(tripId));
  }, [tripId]);

  const handleSeatClick = (carriage, seatNum, isBooked) => {
    if (isBooked) return;
    // Chọn ghế mới (ghi đè ghế cũ nếu đã chọn)
    setSelectedSeat({
      id: `${carriage.maToa}-${seatNum}`,
      seatNum,
      maToa: carriage.maToa,
      tenToa: carriage.tenToa,
      price: carriage.giaCoBan,
      loaiToa: carriage.loaiToa
    });
  };

  const handleConfirm = () => {
    if (!selectedSeat) return;
    navigate('/employee/sales/exchange/confirm', {
      state: {
        oldTicketData,
        newSeatData: selectedSeat,
        tripId
      }
    });
  };

  return (
    <div className="p-4 bg-slate-100 min-h-screen flex gap-4">
      {/* CỘT TRÁI: Sơ đồ ghế */}
      <div className="flex-1 bg-white rounded-lg shadow p-4">
        <div className="mb-4 flex items-center gap-2">
           <button onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
           <h2 className="font-bold text-lg">Chọn ghế mới - Tàu {tripId}</h2>
        </div>
        {carriages.map((carriage) => (
          <div key={carriage.maToa} className="mb-6">
            <div className="font-bold text-slate-700 mb-2">{carriage.tenToa} ({carriage.loaiToa})</div>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: carriage.soGhe }, (_, i) => {
                const seatNum = i + 1;
                const isBooked = carriage.gheDaDat.includes(seatNum);
                const isSelected = selectedSeat?.id === `${carriage.maToa}-${seatNum}`;
                return (
                  <div 
                    key={seatNum}
                    onClick={() => handleSeatClick(carriage, seatNum, isBooked)}
                    className={`h-10 rounded border flex items-center justify-center cursor-pointer font-bold text-sm 
                      ${isBooked ? 'bg-slate-200 text-slate-400' : isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:border-blue-500'}`}
                  >
                    {seatNum}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CỘT PHẢI: Thông tin đối chiếu */}
      <div className="w-80 bg-white rounded-lg shadow p-4 h-fit">
        <h3 className="font-bold text-slate-800 mb-4 uppercase text-sm border-b pb-2">Thông tin đổi vé</h3>
        
        {/* Vé cũ */}
        <div className="mb-4 opacity-75">
          <div className="text-xs font-bold text-slate-500 uppercase">Vé cũ (Hoàn lại)</div>
          <div className="font-bold text-red-500 line-through">{oldTicketData?.price.toLocaleString()} đ</div>
          <div className="text-xs text-slate-600">{oldTicketData?.seatInfo}</div>
        </div>

        {/* Vé mới */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase">Vé mới (Thanh toán)</div>
          {selectedSeat ? (
            <>
              <div className="font-bold text-blue-600">{selectedSeat.price.toLocaleString()} đ</div>
              <div className="text-sm font-semibold">{selectedSeat.tenToa} - Ghế {selectedSeat.seatNum}</div>
            </>
          ) : <span className="text-sm italic text-slate-400">Chưa chọn ghế</span>}
        </div>

        {/* Chênh lệch tạm tính */}
        {selectedSeat && (
          <div className="border-t pt-3 mb-4">
             <div className="flex justify-between font-bold">
                <span>Chênh lệch:</span>
                <span className={selectedSeat.price - oldTicketData.price > 0 ? 'text-blue-600' : 'text-green-600'}>
                   {(selectedSeat.price - oldTicketData.price).toLocaleString()} đ
                </span>
             </div>
          </div>
        )}

        <button 
          onClick={handleConfirm}
          disabled={!selectedSeat}
          className="w-full bg-blue-600 text-white py-2 rounded font-bold disabled:bg-slate-300"
        >
          Xác nhận đổi
        </button>
      </div>
    </div>
  );
};

export default SalesExchangeSeatSelectionPage;