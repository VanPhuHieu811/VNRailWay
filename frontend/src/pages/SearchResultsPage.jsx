import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Clock, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import BookingSteps from '../components/common/BookingSteps';   // Navbar cho Đặt mới
import ExchangeSteps from '../components/common/ExchangeSteps'; // Navbar cho Đổi vé
import { LICH_TRINH_DB } from '../services/db_mock';
import '../styles/pages/BookingFlow.css';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy dữ liệu state (bao gồm cả cờ isExchange)
  const stateData = location.state || {};
  const { from, to, date, isExchange, exchangeData } = stateData;

  // Fallback nếu không có dữ liệu tìm kiếm
  const initialDateStr = date || new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState(initialDateStr);

  // --- LOGIC DATE LINE ---
  const getNormalizedDate = (dStr) => {
    const d = new Date(dStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const todayDate = getNormalizedDate(new Date().toISOString().split('T')[0]);
  const selectedDateObj = getNormalizedDate(selectedDateStr);

  const dateList = useMemo(() => {
    const center = new Date(selectedDateStr);
    center.setHours(0, 0, 0, 0);
    
    // Mặc định lùi 3 ngày để ngày chọn nằm giữa
    let startDate = new Date(center);
    startDate.setDate(center.getDate() - 3);

    // Nếu lùi quá ngày hôm nay -> Ép bắt đầu từ hôm nay
    if (startDate < todayDate) {
      startDate = new Date(todayDate);
    }

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDateStr, todayDate]);

  const handleChangeDate = (direction) => {
    const newDate = new Date(selectedDateObj);
    newDate.setDate(selectedDateObj.getDate() + direction);
    if (newDate < todayDate) return;
    setSelectedDateStr(newDate.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateObj) => {
    const days = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    const dayName = days[dateObj.getDay()];
    const dateNum = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    return { dayName, dateNum };
  };
  
  const toISODate = (dateObj) => dateObj.toISOString().split('T')[0];
  const canGoBackDate = selectedDateObj > todayDate;

  // --- LỌC TÀU ---
  const filteredTrains = LICH_TRINH_DB.filter(train => train.ngayDi === selectedDateStr);
  const displayTrains = filteredTrains.length > 0 ? filteredTrains : [];

  // --- LOGIC CHỌN TÀU (QUAN TRỌNG) ---
  const handleSelectTrip = (tripId) => {
    // Tìm thông tin chi tiết chuyến tàu được chọn
    const selectedTripInfo = LICH_TRINH_DB.find(t => t.id === tripId);

    if (isExchange) {
      // Nếu là đổi vé: Chuyển sang trang chọn ghế kèm dữ liệu đổi và thông tin tàu mới
      navigate(`/booking/seats/${tripId}`, {
        state: { 
          tripId,
          isExchange: true,
          exchangeData: exchangeData,
          newTripInfo: selectedTripInfo // Truyền thông tin tàu mới sang bước sau
        }
      });
    } else {
      // Nếu đặt mới: Chuyển bình thường
      navigate(`/booking/seats/${tripId}`);
    }
  };

  return (
    <div className="booking-container">
      <CustomerNavbar />
      
      {/* HIỂN THỊ NAVBAR TÙY NGỮ CẢNH */}
      {isExchange ? (
        <ExchangeSteps currentStep={4} /> // Bước 4: Chọn tàu mới
      ) : (
        <BookingSteps currentStep={2} />  // Bước 2: Chọn chuyến
      )}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        {/* Thông tin hành trình */}
        <div className="info-card">
          <h3 className="info-title">
            {isExchange ? "Chọn chuyến tàu thay thế" : "Kết quả tìm kiếm"}
          </h3>
          <div className="info-route">
            <MapPin size={16} /> <span>{from || 'Hà Nội'}</span> 
            <span>➝</span>
            <MapPin size={16} /> <span>{to || 'TP.Hồ Chí Minh'}</span>
          </div>
        </div>

        {/* Date Line */}
        <div className="date-line-container">
          <button className="nav-arrow-btn" onClick={() => handleChangeDate(-1)} disabled={!canGoBackDate}>
            <ChevronLeft size={24} />
          </button>
          <div className="date-scroll-wrapper">
            {dateList.map((dateObj, index) => {
              const dStr = toISODate(dateObj);
              const { dayName, dateNum } = formatDateDisplay(dateObj);
              const isActive = dStr === selectedDateStr;
              return (
                <div 
                  key={index} 
                  className={`date-item ${isActive ? 'active' : ''}`} 
                  onClick={() => setSelectedDateStr(dStr)}
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

        {/* Danh sách tàu */}
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
                    <div className="station-name">{train.gaDi === 'HN' ? 'Hà Nội' : train.gaDi}</div>
                  </div>
                  <div className="duration-line">
                    <Clock size={14} style={{marginBottom: 4}}/>
                    <span>{train.thoiGianChay}</span>
                    <div className="line-draw"></div>
                  </div>
                  <div className="time-box right">
                    <div className="time-big">{train.gioDen}</div>
                    <div className="station-name">{train.gaDen === 'SG' ? 'TP.Hồ Chí Minh' : train.gaDen}</div>
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
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <CalendarDays size={40} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500 font-medium">Không tìm thấy chuyến tàu nào trong ngày {selectedDateStr}</p>
              <p className="text-sm text-gray-400">Vui lòng chọn ngày khác hoặc bấm nút mũi tên để xem ngày kế tiếp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;