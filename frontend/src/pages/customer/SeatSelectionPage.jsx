import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Train, CheckCircle, Armchair, Loader2, Bed } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import { bookingApi } from '../../services/bookingApi'; // Đảm bảo bookingApi có hàm calculatePrice
import { LICH_TRINH_DB } from '../../services/db_mock';
import '../../styles/pages/SeatSelectionPage.css';

const SeatSelectionPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isExchange, exchangeData, searchParams, tripInfo: stateTripInfo } = location.state || {};

  const tripInfo = stateTripInfo || LICH_TRINH_DB.find(t => t.id === tripId) || { 
    id: tripId,
    tenTau: tripId || 'Tàu SE', 
    gioDi: '--:--', 
    gaDi: searchParams?.from || 'Đi', 
    gaDen: searchParams?.to || 'Đến' 
  };

  const [carriages, setCarriages] = useState([]);       
  const [activeCarriageId, setActiveCarriageId] = useState(null); 
  const [selectedSeats, setSelectedSeats] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false); // [MỚI] Loading khi tính giá

  const requiredSeatsCount = isExchange ? (exchangeData?.seatsToExchange?.length || 0) : 0;

  useEffect(() => {
    const fetchSeatMap = async () => {
        try {
            setIsLoading(true);
            const res = await bookingApi.getSeatMap(tripId);
            if (res.success && res.data.length > 0) {
                setCarriages(res.data);
                setActiveCarriageId(res.data[0].MaToaTau); 
            }
        } catch (error) {
            console.error("Lỗi tải sơ đồ ghế:", error);
        } finally {
            setIsLoading(false);
        }
    };
    if (tripId) fetchSeatMap();
  }, [tripId]);

  const currentCarriageData = useMemo(() => {
      return carriages.find(c => c.MaToaTau === activeCarriageId);
  }, [carriages, activeCarriageId]);

  // --- HÀM TÍNH GIÁ CƠ BẢN (KHÔNG ƯU ĐÃI) ---
  const fetchBasePrice = async (seatId) => {
      try {
          // Gọi API tính giá với promotionCode = null
          const res = await bookingApi.calculatePrice({
              tripId: tripInfo.id,
              fromStationId: tripInfo.maGaDi, 
              toStationId: tripInfo.maGaDen,
              seatId: seatId,
              promotionCode: null 
          });
          if (res.success) return res.data;
          return null;
      } catch (error) {
          console.error("Lỗi tính giá:", error);
          return null;
      }
  };

  const handleSeatClick = async (seat) => {
    if (seat.TrangThai === 'Booked') return;
    if (isCalculating) return;

    const uniqueSeatId = `${activeCarriageId}-${seat.MaViTri}`;
    const isSelected = selectedSeats.find(s => s.id === uniqueSeatId);

    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== uniqueSeatId));
    } else {
      if (isExchange && selectedSeats.length >= requiredSeatsCount) {
          alert(`Bạn chỉ được chọn tối đa ${requiredSeatsCount} ghế.`); return;
      }
      if (!isExchange && selectedSeats.length >= 6) {
          alert("Mỗi lần đặt tối đa 6 vé."); return;
      }

      // [MỚI] Tính giá vé ngay khi click (Giá gốc chưa giảm)
      setIsCalculating(true);
      const priceData = await fetchBasePrice(seat.MaViTri);
      setIsCalculating(false);

      // Giá mặc định nếu API lỗi
      const finalPrice = priceData ? priceData.GiaThucTe : 500000;

      setSelectedSeats(prev => [
        ...prev, 
        { 
          id: uniqueSeatId,
          maViTri: seat.MaViTri,
          soGhe: seat.SoGhe, 
          maToa: activeCarriageId, 
          tenToa: currentCarriageData?.TenToa, 
          loaiToa: currentCarriageData?.LoaiToa || "Ghế ngồi",
          
          // Lưu giá
          price: finalPrice,          // Giá hiện tại (bằng giá gốc vì chưa giảm)
          originalPrice: finalPrice,  // Giá gốc
          discount: 0                 // Chưa có giảm giá
        }
      ]);
    }
  };

  const renderSeatItem = (seat, type = 'seat') => {
      const uniqueSeatId = `${activeCarriageId}-${seat.MaViTri}`;
      const isSelected = selectedSeats.some(s => s.id === uniqueSeatId);
      const isBooked = seat.TrangThai === 'Booked';
      const isDisabledLook = isExchange && !isSelected && !isBooked && selectedSeats.length >= requiredSeatsCount;

      return (
          <button
              key={seat.MaViTri}
              disabled={isBooked}
              onClick={() => handleSeatClick(seat)}
              className={`
                  relative flex items-center justify-center font-bold transition-all border
                  ${type === 'bed' ? 'w-full h-12 rounded-md mb-2 text-xs' : 'w-10 h-12 md:w-12 md:h-14 rounded-t-lg text-sm'}
                  ${isBooked 
                      ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
                      : isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md transform -translate-y-1' 
                          : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50'
                  }
                  ${isDisabledLook ? 'opacity-40 cursor-not-allowed' : ''}
              `}
          >
              {type === 'bed' && <Bed size={14} className="mr-1" />}
              {seat.SoGhe}
              {type !== 'bed' && (
                  <div className={`absolute -bottom-2 w-full h-1.5 rounded-b-sm 
                      ${isSelected ? 'bg-blue-700' : isBooked ? 'bg-gray-300' : 'bg-gray-200'}`}>
                  </div>
              )}
          </button>
      );
  };

  const renderCarriageLayout = () => {
      if (!currentCarriageData) return null;
      const seats = currentCarriageData.seats || [];
      const isSleeper = seats.length > 0 && seats[0].Phong != null;

      if (!isSleeper) {
          return (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
                  {seats.map(seat => renderSeatItem(seat, 'seat'))}
              </div>
          );
      }
      const cabins = {};
      seats.forEach(seat => {
          const p = seat.Phong; 
          if (!cabins[p]) cabins[p] = [];
          cabins[p].push(seat);
      });

      return (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-custom p-1">
              {Object.keys(cabins).map((phongNum) => {
                  const cabinSeats = cabins[phongNum];
                  cabinSeats.sort((a, b) => b.Tang - a.Tang);
                  return (
                      <div key={phongNum} className="cabin-box min-w-[140px] bg-slate-50 border border-slate-300 rounded-lg p-3 shadow-sm hover:border-blue-300 transition-colors">
                          <div className="text-center text-xs font-bold text-slate-500 mb-2 uppercase border-b border-slate-200 pb-1">Phòng {phongNum}</div>
                          <div className="flex gap-2">
                              <div className="flex flex-col gap-1 flex-1">{cabinSeats.filter(s => s.SoGhe % 2 !== 0).map(seat => renderSeatItem(seat, 'bed'))}</div>
                              <div className="flex flex-col gap-1 flex-1">{cabinSeats.filter(s => s.SoGhe % 2 === 0).map(seat => renderSeatItem(seat, 'bed'))}</div>
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  const newTicketPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const oldTicketValue = isExchange ? (exchangeData?.exchangeValue || 0) : 0; 
  const priceDiff = newTicketPrice - oldTicketValue;

  const handleContinue = () => {
    if (isExchange) {
      if (selectedSeats.length !== requiredSeatsCount) { alert(`Vui lòng chọn đủ ${requiredSeatsCount} ghế mới.`); return; }
      navigate('/exchange/confirm', { 
        state: { exchangeData, newSeats: selectedSeats, newTotalPrice: newTicketPrice, newTripInfo: tripInfo, isEmployee: false } 
      });
    } else {
      if (selectedSeats.length === 0) { alert("Vui lòng chọn ít nhất 1 ghế."); return; }
      navigate('/booking/passengers', { 
        state: { selectedSeats, tripId, tripInfo, searchParams } 
      });
    }
  };

  if (isExchange && !exchangeData) return <div>Hết phiên làm việc.</div>;

  return (
    <div className="booking-container bg-gray-50 min-h-screen">
      <CustomerNavbar />
      {isExchange ? <ExchangeSteps currentStep={4} /> : <BookingSteps currentStep={3} />}
      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* CỘT TRÁI */}
        <div className="flex-1 space-y-4">
            <div onClick={() => navigate(-1)} className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-2 font-medium w-fit mb-2">
                <ArrowLeft size={18} /> Quay lại tìm kiếm
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-slate-800">
                    {isExchange ? "Chọn chỗ ngồi mới" : "Chọn chỗ ngồi"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">Tàu {tripInfo.tenTau} ({tripInfo.gaDi} - {tripInfo.gaDen})</p>
            </div>
            
            {/* List Toa */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Train size={18} className="text-blue-600"/> Danh sách toa
                </h3>
                
                {isLoading ? (
                    <div className="flex gap-3 overflow-hidden">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-24 h-12 bg-gray-200 animate-pulse rounded-lg flex-shrink-0"></div>)}
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {carriages.map((coach) => (
                            <button
                                key={coach.MaToaTau}
                                onClick={() => setActiveCarriageId(coach.MaToaTau)}
                                className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg border transition-all min-w-[100px] flex-shrink-0 relative
                                ${activeCarriageId === coach.MaToaTau 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200' 
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                {/* [KHÔI PHỤC] Hiển thị tên toa */}
                                <span className="text-sm font-bold">{coach.TenToa}</span>
                                
                                {/* [KHÔI PHỤC] Hiển thị số chỗ trống */}
                                <span className="text-[10px] opacity-80">
                                    {coach.seats ? coach.seats.filter(s => s.TrangThai === 'Available').length : 0} chỗ trống
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sơ đồ ghế */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                {isLoading ? <div className="text-center p-10"><Loader2 className="animate-spin inline"/> Đang tải...</div> : renderCarriageLayout()}
            </div>
        </div>

        {/* CỘT PHẢI: GIỎ VÉ (Chỉ hiện giá gốc) */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                <Armchair size={20} className="text-blue-600"/> Giỏ vé
            </h3>
            
            <div className="space-y-3 mb-6">
                {selectedSeats.length === 0 && <p className="text-gray-400 italic text-center">Chưa chọn ghế</p>}
                {selectedSeats.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div>
                        <div className="font-bold text-blue-800 text-sm">{s.tenToa} - {s.loaiToa.includes('nằm') ? 'Giường' : 'Ghế'} {s.soGhe}</div>
                        <div className="text-xs text-gray-500">{s.loaiToa}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-gray-700 text-sm">{s.price.toLocaleString()}đ</div>
                        <button onClick={() => setSelectedSeats(prev => prev.filter(item => item.id !== s.id))} className="text-red-400 text-xs underline">Xóa</button>
                    </div>
                </div>
                ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                <div><span className="text-xs text-gray-500 block">Tạm tính</span><span className="text-2xl font-bold text-blue-700">{newTicketPrice.toLocaleString()} đ</span></div>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">{selectedSeats.length} vé</span>
            </div>

            <button onClick={handleContinue} disabled={selectedSeats.length === 0}
              className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white ${selectedSeats.length === 0 ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;