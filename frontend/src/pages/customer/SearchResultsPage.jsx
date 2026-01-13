import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Clock, ChevronLeft, ChevronRight, Search, Calendar, AlertCircle } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';    
import ExchangeSteps from '../../components/common/ExchangeSteps'; 
import { LICH_TRINH_DB, GA_TAU_DB } from '../../services/db_mock';
import '../../styles/pages/BookingFlow.css';

const SearchResultsPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu từ trang trước
  const stateData = location.state || {};
  const { isExchange, exchangeData } = stateData;

  // --- HÀM HELPER ---
  const formatLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeStationCode = (input) => {
    if (!input) return null;
    const foundByCode = GA_TAU_DB.find(g => g.maGa === input);
    if (foundByCode) return input;
    const foundByName = GA_TAU_DB.find(g => g.tenGa === input || g.tenGa.toLowerCase() === input.toLowerCase());
    return foundByName ? foundByName.maGa : input; 
  };

  const getStationName = (code) => GA_TAU_DB.find(g => g.maGa === code)?.tenGa || code;

  // --- CẤU HÌNH NGÀY MẪU ---
  const MOCK_DATA_DATE = '2026-01-02'; 
  const todayStr = formatLocalISODate(new Date());

  // --- KHỞI TẠO STATE ---
  const [searchCriteria, setSearchCriteria] = useState(() => {
    let initialDate = stateData.date || stateData.ngayDi;
    if (!initialDate || initialDate === todayStr) {
      initialDate = MOCK_DATA_DATE;
    }
    return {
      from: normalizeStationCode(stateData.from || stateData.gaDi) || 'HN',
      to: normalizeStationCode(stateData.to || stateData.gaDen) || 'SG',
      date: initialDate 
    };
  });

  const [employeeInput, setEmployeeInput] = useState({ ...searchCriteria });
  const [selectedDateStr, setSelectedDateStr] = useState(searchCriteria.date);

  // --- ĐỒNG BỘ DỮ LIỆU ---
  useEffect(() => {
    if (!isEmployee && location.state) {
        let newDate = location.state.date || location.state.ngayDi;
        if (newDate === todayStr) newDate = MOCK_DATA_DATE;

        const newState = {
            from: normalizeStationCode(location.state.from || location.state.gaDi) || 'HN',
            to: normalizeStationCode(location.state.to || location.state.gaDen) || 'SG',
            date: newDate
        };
        setSearchCriteria(newState);
        setSelectedDateStr(newState.date);
    }
  }, [location.state, isEmployee]);

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
  
  const handleEmployeeSearch = () => {
    setSearchCriteria(employeeInput);
    setSelectedDateStr(employeeInput.date);
  };

  const handleReverseSearch = () => {
    const reversed = { ...searchCriteria, from: searchCriteria.to, to: searchCriteria.from };
    setSearchCriteria(reversed);
    setEmployeeInput(reversed);
  };

  // --- LỌC TÀU ---
  const allTrainsOnDate = LICH_TRINH_DB.filter(t => t.ngayDi === searchCriteria.date);
  const displayTrains = allTrainsOnDate.filter(train => {
    const matchFrom = train.gaDi === searchCriteria.from;
    const matchTo = train.gaDen === searchCriteria.to;
    return matchFrom && matchTo;
  });
  
  // --- TÁCH LUỒNG LOGIC TẠI ĐÂY (FIX BUG & SEPARATION) ---
const handleSelectTrip = (tripId) => {
    const selectedTripInfo = LICH_TRINH_DB.find(t => t.id === tripId);
    
    // Mặc định đường dẫn cho khách hàng
    let basePath = '/booking'; 

    if (isEmployee) {
        if (isExchange) {
            // 👇 QUAN TRỌNG: Nếu là Đổi vé -> Dùng đường dẫn có chứa '/exchange'
            basePath = '/employee/sales/exchange'; 
        } else {
            // Nếu là Bán vé -> Dùng đường dẫn sales thường
            basePath = '/employee/sales';
        }
    }
    
    let navigateState = {
        tripId,
        searchParams: searchCriteria,
        newTripInfo: selectedTripInfo,
        isExchange: false
    };

    if (isExchange) {
        navigateState.isExchange = true;
        navigateState.exchangeData = exchangeData;
    }

    // Lúc này URL sẽ là: /employee/sales/exchange/seats/:tripId (Sidebar sẽ nhận ra Exchange)
    navigate(`${basePath}/seats/${tripId}`, {
      state: navigateState
    });
  };

  // Xác định bước cho ExchangeSteps (Nếu đang đổi vé)
  // Sales: Bước 2 (Tìm tàu), Khách: Bước 3
  const currentStepNum = isEmployee ? 3 : 3;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      
      {/* 1. NAVBAR KHÁCH HÀNG (Ẩn với Sales) */}
      {!isEmployee && <CustomerNavbar />}
      
      {/* 2. THANH TIẾN TRÌNH (STEPS) */}
      {isExchange ? (
        // A. TRƯỜNG HỢP ĐỔI VÉ (Sales hoặc Khách): Hiện ExchangeSteps
        <ExchangeSteps currentStep={currentStepNum} isEmployee={isEmployee} />
      ) : (
        !isEmployee && <BookingSteps currentStep={2} />
      )}

      <div className="booking-content">
        
        {/* Nút Quay lại (Chỉ hiện cho Khách) */}
        {!isEmployee && (
          <div onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} /> Quay lại
          </div>
        )}

        {isEmployee ? (
          // --- GIAO DIỆN TÌM KIẾM CỦA SALES ---
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-200 mb-6">
            {/* Tiêu đề thay đổi tùy theo ngữ cảnh */}
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Search size={20}/> {isExchange ? "Tìm chuyến tàu thay thế" : "Bán vé tại quầy"}
            </h2>
            
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ga đi</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-blue-600" size={16}/>
                  <select 
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={employeeInput.from}
                    onChange={e => setEmployeeInput({...employeeInput, from: e.target.value})}
                  >
                    {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ga đến</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-red-600" size={16}/>
                  <select 
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={employeeInput.to}
                    onChange={e => setEmployeeInput({...employeeInput, to: e.target.value})}
                  >
                    {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ngày đi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16}/>
                  <input 
                    type="date" 
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={employeeInput.date}
                    onChange={e => setEmployeeInput({...employeeInput, date: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleEmployeeSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 h-[42px] flex items-center gap-2"
              >
                <Search size={18}/> Tìm chuyến
              </button>
            </div>
          </div>
        ) : (
          // --- GIAO DIỆN KHÁCH HÀNG ---
          <div className="info-card">
            <h3 className="info-title">
              {isExchange ? "Chọn chuyến tàu thay thế" : "Kết quả tìm kiếm"}
            </h3>
            <div className="info-route">
              <MapPin size={16} /> <span>{getStationName(searchCriteria.from)}</span> 
              <span>➝</span>
              <MapPin size={16} /> <span>{getStationName(searchCriteria.to)}</span>
            </div>
          </div>
        )}

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
                    <button className="btn-select" onClick={() => handleSelectTrip(train.id)}>
                      {isExchange ? "Chọn tàu này" : "Chọn chuyến này"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
              <Calendar size={40} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy chuyến tàu nào.</p>
              
              <div className="mt-3 text-sm text-slate-500">
                <p>Điều kiện tìm kiếm:</p>
                <div className="flex justify-center gap-2 items-center mt-1 font-semibold">
                    <span>{getStationName(searchCriteria.from)}</span>
                    <span>→</span>
                    <span>{getStationName(searchCriteria.to)}</span>
                </div>
                <p className="mt-1">Ngày: {selectedDateStr}</p>
              </div>

              {allTrainsOnDate.length > 0 && (
                 <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg inline-block text-left max-w-md">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-orange-600 shrink-0" size={20}/>
                        <div>
                            <p className="text-orange-800 font-bold text-sm mb-1">
                                Gợi ý (Debug): Có {allTrainsOnDate.length} tàu chạy ngày này nhưng khác tuyến!
                            </p>
                            <ul className="text-xs text-orange-700 space-y-1 list-disc pl-4">
                                {allTrainsOnDate.map(t => (
                                    <li key={t.id}>
                                        Tàu <b>{t.tenTau}</b> chạy tuyến: {getStationName(t.gaDi)} → {getStationName(t.gaDen)}
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={handleReverseSearch}
                                className="mt-3 text-xs bg-orange-200 text-orange-800 px-3 py-1.5 rounded font-bold hover:bg-orange-300 w-full"
                            >
                                Đảo chiều tìm kiếm để xem thử?
                            </button>
                        </div>
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;