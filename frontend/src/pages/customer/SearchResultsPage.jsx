import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Clock, ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';    
import ExchangeSteps from '../../components/common/ExchangeSteps'; 
import { LICH_TRINH_DB, GA_TAU_DB } from '../../services/db_mock';
import '../../styles/pages/BookingFlow.css';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu state từ trang trước
  const stateData = location.state || {};
  // Quan trọng: Lấy cờ isExchange và dữ liệu vé cũ
  const { isExchange, exchangeData } = stateData;

  // --- HÀM HELPER ---
  const formatLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStationName = (code) => GA_TAU_DB.find(g => g.maGa === code)?.tenGa || code;

  const normalizeStationCode = (input) => {
    if (!input) return null;
    const foundByCode = GA_TAU_DB.find(g => g.maGa === input);
    if (foundByCode) return input;
    const foundByName = GA_TAU_DB.find(g => g.tenGa === input || g.tenGa.toLowerCase() === input.toLowerCase());
    return foundByName ? foundByName.maGa : input; 
  };

  // --- CẤU HÌNH DATA MẪU ---
  const MOCK_DATA_DATE = '2026-01-02'; 
  const todayStr = formatLocalISODate(new Date());

  // --- STATE ---
  const [searchCriteria, setSearchCriteria] = useState(() => {
    let initialDate = stateData.date || stateData.ngayDi;
    // Nếu không có ngày hoặc là hôm nay (mà DB mock không có) thì fallback về ngày mẫu
    if (!initialDate || initialDate === todayStr) {
      initialDate = MOCK_DATA_DATE;
    }
    return {
      from: normalizeStationCode(stateData.from || stateData.gaDi) || 'HN',
      to: normalizeStationCode(stateData.to || stateData.gaDen) || 'SG',
      date: initialDate 
    };
  });

  const [selectedDateStr, setSelectedDateStr] = useState(searchCriteria.date);

  // --- LOGIC DATE LINE ---
  const getNormalizedDate = (dStr) => {
    if (!dStr) return new Date(MOCK_DATA_DATE);
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d); 
  };

  const dateList = useMemo(() => {
    const center = getNormalizedDate(selectedDateStr);
    let startDate = new Date(center);
    startDate.setDate(center.getDate() - 3);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDateStr]);

  const handleChangeDate = (direction) => {
    const currentDate = getNormalizedDate(selectedDateStr);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    const newDateStr = formatLocalISODate(newDate);
    setSelectedDateStr(newDateStr);
    setSearchCriteria(prev => ({ ...prev, date: newDateStr }));
  };

  const formatDateDisplay = (dateObj) => {
    const days = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    return { dayName: days[dateObj.getDay()], dateNum: `${dateObj.getDate()}/${dateObj.getMonth() + 1}` };
  };

  // --- LỌC TÀU ---
  const allTrainsOnDate = LICH_TRINH_DB.filter(t => t.ngayDi === searchCriteria.date);
  const displayTrains = allTrainsOnDate.filter(train => {
    const matchFrom = train.gaDi === searchCriteria.from;
    const matchTo = train.gaDen === searchCriteria.to;
    return matchFrom && matchTo;
  });

  // --- LOGIC CHỌN CHUYẾN (ĐÃ SỬA) ---
  const handleSelectTrip = (tripId) => {
    // 1. Nếu là ĐỔI VÉ
    if (isExchange) {
      navigate(`/exchange/seats/${tripId}`, {
        state: { 
          tripId,
          searchParams: searchCriteria,
          isExchange: true,      // Đánh dấu để trang sau biết
          exchangeData: exchangeData // QUAN TRỌNG: Truyền tiếp vé cũ để tính tiền
        }
      });
    } 
    // 2. Nếu là ĐẶT VÉ MỚI
    else {
      navigate(`/booking/seats/${tripId}`, { 
        state: { 
            tripId, 
            searchParams: searchCriteria 
        } 
      });
    }
  };

  return (
    <div className="booking-container">
      <CustomerNavbar />
      
      {/* Hiển thị thanh tiến trình tùy theo ngữ cảnh */}
      {isExchange ? (
        <ExchangeSteps currentStep={2} /> // Bước 2: Tìm chuyến mới
      ) : (
        <BookingSteps currentStep={2} /> // Bước 2: Chọn chuyến
      )}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="info-card">
          <h3 className="info-title">
            {isExchange ? "Chọn chuyến tàu thay thế" : "Kết quả tìm kiếm"}
          </h3>
          <div className="info-route">
            <MapPin size={16} /> <span>{getStationName(searchCriteria.from)}</span> 
            <span>➝</span>
            <MapPin size={16} /> <span>{getStationName(searchCriteria.to)}</span>
          </div>
          
          {/* Nếu đang đổi vé, hiện thông báo nhỏ nhắc nhở */}
          {isExchange && (
             <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
                <AlertCircle size={14}/> 
                <span>Giá vé cũ sẽ được trừ vào đơn hàng mới.</span>
             </div>
          )}
        </div>

        {/* --- DATE LINE --- */}
        <div className="date-line-container">
            <button className="nav-arrow-btn" onClick={() => handleChangeDate(-1)}>
              <ChevronLeft size={24} />
            </button>
            <div className="date-scroll-wrapper">
              {dateList.map((dateObj, index) => {
                const dStr = formatLocalISODate(dateObj);
                const { dayName, dateNum } = formatDateDisplay(dateObj);
                const isActive = dStr === selectedDateStr;
                return (
                  <div 
                    key={index} 
                    className={`date-item ${isActive ? 'active' : ''}`} 
                    onClick={() => {
                        setSelectedDateStr(dStr);
                        setSearchCriteria(prev => ({ ...prev, date: dStr }));
                    }}
                  >
                    <span className="day-label">{dayName}</span>
                    <span className="date-label">{dateNum}</span>
                  </div>
                );
              })}
            </div>
            <button className="nav-arrow-btn" onClick={() => handleChangeDate(1)}>
              <ChevronRight size={24} />
            </button>
        </div>

        {/* --- LIST KẾT QUẢ --- */}
        <div className="train-list">
          {displayTrains.length > 0 ? (
            displayTrains.map((train) => (
              <div key={train.id} className="train-card">
                <div className="train-header">
                  <span className="train-name border border-blue-200 bg-blue-50 px-2 rounded">{train.tenTau}</span>
                  <span className="train-badge">{train.loaiTau}</span>
                </div>
                <div className="train-schedule">
                  <div className="time-box">
                    <div className="time-big">{train.gioDi}</div>
                    <div className="station-name">{getStationName(train.gaDi)}</div>
                  </div>
                  <div className="duration-line">
                    <Clock size={14} style={{marginBottom: 4}}/>
                    <span>{train.thoiGianChay}</span>
                    <div className="line-draw"></div>
                  </div>
                  <div className="time-box right">
                    <div className="time-big">{train.gioDen}</div>
                    <div className="station-name">{getStationName(train.gaDen)}</div>
                  </div>
                </div>
                <div className="train-footer">
                  <div className="seat-status">
                    <User size={16} /> Còn {train.choTrong} chỗ trống
                  </div>
                  <div className="price-box">
                    <span className="price-label">Giá từ</span>
                    <div className="price-value">{train.giaVe.toLocaleString()} đ</div>
                    
                    {/* NÚT CHỌN CHUYẾN GỌI HÀM MỚI */}
                    <button className="btn-select" onClick={() => handleSelectTrip(train.id)}>
                      {isExchange ? "Chọn tàu này" : "Chọn chuyến"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
              <Calendar size={40} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy chuyến tàu nào.</p>
              <p className="text-sm text-slate-400 mt-1">Vui lòng chọn ngày khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;