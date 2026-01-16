import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Train, CheckCircle, Armchair, Loader2, Bed } from 'lucide-react'; // Đã thêm icon Bed
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import { bookingApi } from '../../services/bookingApi';
import { LICH_TRINH_DB } from '../../services/db_mock';
import '../../styles/pages/SeatSelectionPage.css';

const SeatSelectionPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy dữ liệu an toàn từ state
  const { isExchange, exchangeData, searchParams, tripInfo: stateTripInfo } = location.state || {};

  // Tìm thông tin tàu (Mock hoặc props)
  const tripInfo = stateTripInfo || LICH_TRINH_DB.find(t => t.id === tripId) || { 
    id: tripId,
    tenTau: tripId || 'Tàu SE', 
    gioDi: '--:--', 
    gaDi: searchParams?.from || 'Đi', // Cố gắng lấy từ param tìm kiếm nếu thiếu
    gaDen: searchParams?.to || 'Đến' 
};

  // State quản lý dữ liệu
  const [carriages, setCarriages] = useState([]);       
  const [activeCarriageId, setActiveCarriageId] = useState(null); 
  const [selectedSeats, setSelectedSeats] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 2. Xác định số lượng ghế CẦN chọn (Nếu đổi vé)
  const requiredSeatsCount = isExchange ? (exchangeData?.seatsToExchange?.length || 0) : 0;

  // --- USE EFFECT: GỌI API ---
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

    if (tripId) {
        fetchSeatMap();
    }
  }, [tripId]);

  // Lấy dữ liệu toa đang active
  const currentCarriageData = useMemo(() => {
      return carriages.find(c => c.MaToaTau === activeCarriageId);
  }, [carriages, activeCarriageId]);

  // --- LOGIC XỬ LÝ CLICK GHẾ ---
  const handleSeatClick = (seat) => {
    if (seat.TrangThai === 'Booked') return;

    // Tạo ID duy nhất: MaToa-MaViTri
    const uniqueSeatId = `${activeCarriageId}-${seat.MaViTri}`;
    const isSelected = selectedSeats.find(s => s.id === uniqueSeatId);

    if (isSelected) {
      // Bỏ chọn
      setSelectedSeats(prev => prev.filter(s => s.id !== uniqueSeatId));
    } else {
      // Logic kiểm tra số lượng vé
      if (isExchange) {
        if (selectedSeats.length >= requiredSeatsCount) {
          alert(`Bạn đang đổi ${requiredSeatsCount} vé cũ, nên chỉ được chọn tối đa ${requiredSeatsCount} ghế mới.`);
          return;
        }
      } else {
          if (selectedSeats.length >= 6) {
              alert("Mỗi lần đặt tối đa 6 vé.");
              return;
          }
      }

      // Chọn mới
      setSelectedSeats(prev => [
        ...prev, 
        { 
          id: uniqueSeatId,
          maViTri: seat.MaViTri,
          soGhe: seat.SoGhe, 
          maToa: activeCarriageId, 
          tenToa: currentCarriageData?.TenToa, 
          price: 500000, 
          loaiToa: currentCarriageData?.LoaiToa || "Ghế ngồi mềm"
        }
      ]);
    }
  };

  // --- [RENDER ITEM] NÚT GHẾ HOẶC GIƯỜNG ---
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
              {/* Icon giường nếu là loại bed */}
              {type === 'bed' && <Bed size={14} className="mr-1" />}
              {seat.SoGhe}
              
              {/* Phần đệm ghế (chỉ hiện cho ghế ngồi) */}
              {type !== 'bed' && (
                  <div className={`absolute -bottom-2 w-full h-1.5 rounded-b-sm 
                      ${isSelected ? 'bg-blue-700' : isBooked ? 'bg-gray-300' : 'bg-gray-200'}`}>
                  </div>
              )}
          </button>
      );
  };

  // --- [RENDER LAYOUT] PHÂN LOẠI TOA GHẾ / TOA GIƯỜNG ---
  const renderCarriageLayout = () => {
      if (!currentCarriageData) return null;
      const seats = currentCarriageData.seats || [];

      // Kiểm tra xem toa này có dữ liệu Phòng/Tầng không (=> Toa Giường Nằm)
      const isSleeper = seats.length > 0 && seats[0].Phong != null;

      // TRƯỜNG HỢP 1: TOA GHẾ NGỒI (Render Grid thông thường)
      if (!isSleeper) {
          return (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
                  {seats.map(seat => renderSeatItem(seat, 'seat'))}
              </div>
          );
      }

      // TRƯỜNG HỢP 2: TOA GIƯỜNG NẰM (Render theo Khoang & Tầng)
      // Group ghế theo Phòng
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
                  
                  // Sắp xếp tầng cao -> tầng thấp (để hiển thị đúng thực tế: Tầng 2 ở trên)
                  cabinSeats.sort((a, b) => b.Tang - a.Tang);

                  return (
                      <div key={phongNum} className="cabin-box min-w-[140px] bg-slate-50 border border-slate-300 rounded-lg p-3 shadow-sm hover:border-blue-300 transition-colors">
                          <div className="text-center text-xs font-bold text-slate-500 mb-2 uppercase border-b border-slate-200 pb-1">
                              Phòng {phongNum}
                          </div>
                          
                          {/* Chia 2 cột: Trái (Lẻ) - Phải (Chẵn) */}
                          <div className="flex gap-2">
                              {/* Cột Trái: Giường số Lẻ (1, 3, 5) */}
                              <div className="flex flex-col gap-1 flex-1">
                                  {cabinSeats.filter(s => s.SoGhe % 2 !== 0).map(seat => renderSeatItem(seat, 'bed'))}
                              </div>
                              
                              {/* Cột Phải: Giường số Chẵn (2, 4, 6) */}
                              <div className="flex flex-col gap-1 flex-1">
                                  {cabinSeats.filter(s => s.SoGhe % 2 === 0).map(seat => renderSeatItem(seat, 'bed'))}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  // --- TÍNH TOÁN TIỀN (LOGIC CŨ) ---
  const newTicketPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const oldTicketValue = isExchange ? (exchangeData?.exchangeValue || 0) : 0; 
  const priceDiff = newTicketPrice - oldTicketValue;

  // --- CHUYỂN BƯỚC (LOGIC CŨ) ---
  const handleContinue = () => {
    if (isExchange) {
      if (selectedSeats.length !== requiredSeatsCount) {
         alert(`Vui lòng chọn đủ ${requiredSeatsCount} ghế mới.`);
         return;
      }
      navigate('/exchange/confirm', { 
        state: { exchangeData, newSeats: selectedSeats, newTotalPrice: newTicketPrice, newTripInfo: tripInfo, isEmployee: false } 
      });
    } else {
      if (selectedSeats.length === 0) {
        alert("Vui lòng chọn ít nhất 1 ghế.");
        return;
      }
      navigate('/booking/passengers', { 
        state: { selectedSeats, tripId, tripInfo, searchParams } 
      });
    }
  };

  // Bảo vệ trang
  if (isExchange && !exchangeData) {
    return (
        <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <AlertCircle size={40} className="text-red-500 mb-4"/>
            <p className="text-slate-600 mb-4">Dữ liệu phiên làm việc đã hết hạn. Vui lòng thực hiện lại.</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Về trang chủ</button>
        </div>
    );
  }

  return (
    <div className="booking-container bg-gray-50 min-h-screen">
      <CustomerNavbar />
      {isExchange ? <ExchangeSteps currentStep={4} /> : <BookingSteps currentStep={3} />}

      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* === CỘT TRÁI: SƠ ĐỒ GHẾ === */}
        <div className="flex-1 space-y-4">
            <div onClick={() => navigate(-1)} className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-2 font-medium w-fit mb-2">
                <ArrowLeft size={18} /> Quay lại tìm kiếm
            </div>

            {/* Header Tàu */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {isExchange ? "Chọn chỗ ngồi mới" : "Chọn chỗ ngồi"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                        <Train size={16}/> Tàu {tripInfo.tenTau} ({tripInfo.gaDi} - {tripInfo.gaDen})
                    </p>
                </div>
            </div>

            {/* Thông báo đổi vé */}
            {isExchange && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm">
                    Bạn cần chọn đúng <strong>{requiredSeatsCount}</strong> vị trí mới để thay thế cho vé cũ.
                    <br/><span className="text-xs text-orange-600 italic">Giá trị vé cũ ({oldTicketValue.toLocaleString()}đ) sẽ được cấn trừ.</span>
                </span>
                </div>
            )}

            {/* Thanh chọn Toa */}
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
                                <span className="text-sm font-bold">{coach.TenToa}</span>
                                <span className="text-[10px] opacity-80">{coach.seats.filter(s => s.TrangThai === 'Available').length} chỗ trống</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- KHU VỰC SƠ ĐỒ GHẾ --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">
                            {currentCarriageData?.MaToaTau}
                        </h3>
                        <p className="text-sm text-gray-500">{currentCarriageData?.LoaiToa || "Toa hành khách"}</p>
                    </div>
                    <div className="flex gap-4 text-xs font-medium">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded bg-white"></div> Trống</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded bg-blue-600"></div> Đang chọn</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded bg-gray-200 cursor-not-allowed"></div> Đã bán</div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Loader2 size={30} className="animate-spin mb-2 text-blue-500"/> Đang tải sơ đồ ghế...
                    </div>
                ) : (
                    // Hiển thị layout (Tự động nhận diện Ghế/Giường)
                    renderCarriageLayout()
                )}
                
                <div className="mt-12 text-center text-xs text-gray-400 italic bg-gray-50 py-2 rounded">
                    (Hướng đầu tàu về phía bên phải màn hình)
                </div>
            </div>
        </div>

        {/* === CỘT PHẢI: SIDEBAR (Giữ nguyên) === */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                <Armchair size={20} className="text-blue-600"/> {isExchange ? "Thông tin đổi vé" : "Giỏ vé"}
            </h3>
            
            {isExchange && (
              <div className="mb-4 flex justify-between items-center bg-slate-100 p-3 rounded-lg text-sm">
                <span className="text-slate-600 font-semibold">Tiến độ:</span>
                <span className={`font-bold flex items-center gap-1 ${selectedSeats.length === requiredSeatsCount ? 'text-green-600' : 'text-orange-500'}`}>
                  {selectedSeats.length === requiredSeatsCount && <CheckCircle size={16}/>}
                  {selectedSeats.length} / {requiredSeatsCount} ghế
                </span>
              </div>
            )}

            <div className="mb-6 min-h-[120px] max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedSeats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-lg">Chưa chọn chỗ nào</div>
              ) : (
                <div className="space-y-3">
                  {selectedSeats.map((s) => (
                    <div key={s.id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 transition-all hover:shadow-sm">
                      <div>
                        <div className="font-bold text-blue-800 text-sm flex items-center gap-2">
                            <Train size={14}/> {s.tenToa} - {s.loaiToa?.toLowerCase().includes('nằm') ? 'Giường' : 'Ghế'} {s.soGhe}
                        </div>
                        <div className="text-xs text-blue-600 mt-0.5">{s.loaiToa}</div>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-gray-700 text-sm">{s.price.toLocaleString()}đ</div>
                          <button onClick={() => setSelectedSeats(prev => prev.filter(item => item.id !== s.id))} className="text-red-400 hover:text-red-600 text-xs underline mt-1 block w-full">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              {isExchange ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Giá trị vé cũ:</span><span className="font-medium">{oldTicketValue.toLocaleString()} đ</span></div>
                  <div className="flex justify-between text-blue-600 font-medium"><span>Giá vé mới:</span><span>{newTicketPrice.toLocaleString()} đ</span></div>
                  <div className="border-t border-dashed pt-2 flex justify-between items-center text-base">
                    <span className="font-bold text-slate-800">Chênh lệch:</span>
                    <span className={`font-bold ${priceDiff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {priceDiff >= 0 ? `+${priceDiff.toLocaleString()}` : priceDiff.toLocaleString()} đ
                    </span>
                  </div>
                  <p className="text-xs text-right text-slate-400 italic">{priceDiff >= 0 ? "(Thanh toán thêm)" : "(Hoàn tiền vào ví)"}</p>
                </div>
              ) : (
                <div className="flex justify-between items-end">
                    <div><span className="text-xs text-gray-500 block">Tổng tiền tạm tính</span><span className="text-2xl font-bold text-blue-700">{newTicketPrice.toLocaleString()} đ</span></div>
                    <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{selectedSeats.length} vé</span>
                </div>
              )}
            </div>

            <button onClick={handleContinue} disabled={isExchange ? selectedSeats.length !== requiredSeatsCount : selectedSeats.length === 0}
              className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide
                ${(isExchange ? selectedSeats.length !== requiredSeatsCount : selectedSeats.length === 0) ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}>
              {isExchange ? "Xác nhận đổi vé" : "Nhập thông tin khách hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;