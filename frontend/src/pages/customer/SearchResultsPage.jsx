import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';    
import { LICH_TRINH_DB, GA_TAU_DB } from '../../services/db_mock';
import '../../styles/pages/BookingFlow.css';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || {};

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
    const foundByName = GA_TAU_DB.find(g => g.tenGa === input);
    return foundByName ? foundByName.maGa : input; 
  };

  const MOCK_DATA_DATE = '2026-01-02'; 
  const todayStr = formatLocalISODate(new Date());

  const [searchCriteria, setSearchCriteria] = useState(() => {
    let initialDate = stateData.date || stateData.ngayDi;
    if (!initialDate || initialDate === todayStr) initialDate = MOCK_DATA_DATE;
    return {
      from: normalizeStationCode(stateData.from) || 'HN',
      to: normalizeStationCode(stateData.to) || 'SG',
      date: initialDate 
    };
  });

  const [selectedDateStr, setSelectedDateStr] = useState(searchCriteria.date);

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

  const allTrainsOnDate = LICH_TRINH_DB.filter(t => t.ngayDi === searchCriteria.date);
  const displayTrains = allTrainsOnDate.filter(train => {
    return train.gaDi === searchCriteria.from && train.gaDen === searchCriteria.to;
  });

  const handleSelectTrip = (tripId) => {
    navigate(`/booking/seats/${tripId}`, {
      state: { tripId, searchParams: searchCriteria }
    });
  };

  return (
    <div className="booking-container">
      <CustomerNavbar />
      <BookingSteps currentStep={2} />

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="info-card">
          <h3 className="info-title">Kết quả tìm kiếm</h3>
          <div className="info-route">
            <MapPin size={16} /> <span>{getStationName(searchCriteria.from)}</span> 
            <span>➝</span>
            <MapPin size={16} /> <span>{getStationName(searchCriteria.to)}</span>
          </div>
        </div>

        <div className="date-line-container">
            <button className="nav-arrow-btn" onClick={() => handleChangeDate(-1)}><ChevronLeft size={24} /></button>
            <div className="date-scroll-wrapper">
              {dateList.map((dateObj, index) => {
                const dStr = formatLocalISODate(dateObj);
                const { dayName, dateNum } = formatDateDisplay(dateObj);
                return (
                  <div key={index} className={`date-item ${dStr === selectedDateStr ? 'active' : ''}`} 
                    onClick={() => { setSelectedDateStr(dStr); setSearchCriteria(prev => ({ ...prev, date: dStr })); }}
                  >
                    <span className="day-label">{dayName}</span>
                    <span className="date-label">{dateNum}</span>
                  </div>
                );
              })}
            </div>
            <button className="nav-arrow-btn" onClick={() => handleChangeDate(1)}><ChevronRight size={24} /></button>
        </div>

        <div className="train-list">
          {displayTrains.length > 0 ? (
            displayTrains.map((train) => (
              <div key={train.id} className="train-card">
                <div className="train-header">
                  <span className="train-name bg-blue-50 px-2 rounded border border-blue-200">{train.tenTau}</span>
                  <span className="train-badge">{train.loaiTau}</span>
                </div>
                <div className="train-schedule">
                  <div className="time-box">
                    <div className="time-big">{train.gioDi}</div>
                    <div className="station-name">{getStationName(train.gaDi)}</div>
                  </div>
                  <div className="duration-line">
                    <Clock size={14} style={{marginBottom: 4}}/> <span>{train.thoiGianChay}</span> <div className="line-draw"></div>
                  </div>
                  <div className="time-box right">
                    <div className="time-big">{train.gioDen}</div>
                    <div className="station-name">{getStationName(train.gaDen)}</div>
                  </div>
                </div>
                <div className="train-footer">
                  <div className="seat-status"><User size={16} /> Còn {train.choTrong} chỗ</div>
                  <div className="price-box">
                    <span className="price-label">Giá từ</span>
                    <div className="price-value">{train.giaVe.toLocaleString()} đ</div>
                    <button className="btn-select" onClick={() => handleSelectTrip(train.id)}>Chọn chuyến</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <Calendar size={40} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500">Không tìm thấy chuyến tàu nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SearchResultsPage;