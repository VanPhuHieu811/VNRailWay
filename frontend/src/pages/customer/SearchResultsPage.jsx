import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, User, MapPin, Clock, ChevronLeft, ChevronRight, 
  Calendar, AlertTriangle, Loader2, AlertCircle 
} from 'lucide-react';

// Import các component
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';    
import ExchangeSteps from '../../components/common/ExchangeSteps'; 

// Import Service API
import { scheduleApi } from '../../services/scheduleApi'; 

// Import CSS
import '../../styles/pages/BookingFlow.css';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu state từ trang Dashboard gửi sang
  const stateData = location.state || {};
  const { isExchange, exchangeData } = stateData;

  // --- 1. STATE QUẢN LÝ ---
  
  // Tiêu chí tìm kiếm
  const [searchCriteria, setSearchCriteria] = useState({
      from: stateData.from || '',
      to: stateData.to || '',
      date: stateData.date || new Date().toISOString().split('T')[0],
      time: stateData.time || '' 
  });

  // Dữ liệu từ API
  const [trainList, setTrainList] = useState([]);       // Danh sách tàu hiển thị
  const [stationsList, setStationsList] = useState([]); // Danh sách ga (để map tên)
  const [isLoading, setIsLoading] = useState(false);    // Trạng thái loading
  
  // State demo Phantom Read
  const [phantomInfo, setPhantomInfo] = useState({
      detected: false,
      countBefore: 0,
      countAfter: 0,
      newIds: [] // Lưu danh sách ID các chuyến tàu "ma" mới xuất hiện
  });

  // --- 2. USE EFFECT: GỌI API ---

  // A. Lấy danh sách Ga (để hiển thị Tên Ga thay vì Mã)
  useEffect(() => {
     const fetchStations = async () => {
        try {
            const res = await scheduleApi.getStations();
            if(res.success) setStationsList(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách ga:", error);
        }
     };
     fetchStations();
  }, []);

  // Helper: Lấy tên ga từ mã
  const getStationName = (code) => {
      const st = stationsList.find(s => s.MaGaTau === code);
      return st ? st.TenGa : code;
  };

  // B. Tìm kiếm chuyến tàu (Chạy khi tiêu chí thay đổi)
  useEffect(() => {
    const fetchTrains = async () => {
      if (!searchCriteria.from || !searchCriteria.to) return;

      setIsLoading(true);
      setTrainList([]); // Reset danh sách cũ
      setPhantomInfo({ detected: false, countBefore: 0, countAfter: 0, newIds: [] }); // Reset cảnh báo
      
      try {
        console.log("🚀 Đang tìm vé với tiêu chí:", searchCriteria);
        
        // Gọi API Search
        const response = await scheduleApi.searchSchedules(
            searchCriteria.from, 
            searchCriteria.to, 
            searchCriteria.date,
            searchCriteria.time 
        );

        if (response.success && response.data) {
            // Lấy dữ liệu từ 2 lần đọc của Backend
            const listLan1 = response.data.lan1_TruocKhiCho || [];
            const listLan2 = response.data.lan2_SauKhiCho || [];

            console.log(`Kết quả: Lần 1 = ${listLan1.length}, Lần 2 = ${listLan2.length}`);

            // --- LOGIC PHÁT HIỆN PHANTOM READ ---
            // Tìm các chuyến có trong Lan2 mà không có trong Lan1
            const oldIds = new Set(listLan1.map(item => item.MaChuyenTau));
            const diffIds = listLan2
                .filter(item => !oldIds.has(item.MaChuyenTau))
                .map(item => item.MaChuyenTau);

            // Nếu tìm thấy ID mới -> Kích hoạt cảnh báo
            if (diffIds.length > 0) {
                setPhantomInfo({
                    detected: true,
                    countBefore: listLan1.length,
                    countAfter: listLan2.length,
                    newIds: diffIds
                });
            } else if (listLan1.length !== listLan2.length) {
                // Trường hợp lệch số lượng nhưng ko tìm ra ID (ít gặp, hoặc do xóa)
                setPhantomInfo({
                    detected: true,
                    countBefore: listLan1.length,
                    countAfter: listLan2.length,
                    newIds: []
                });
            }

            // Luôn hiển thị dữ liệu mới nhất (Lần 2)
            setTrainList(listLan2);
        }
      } catch (error) {
        console.error("❌ Lỗi tìm chuyến:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrains();
  }, [searchCriteria]); 

  // --- 3. CÁC HÀM HELPER XỬ LÝ GIAO DIỆN ---

  const handleChangeDate = (newDateStr) => {
    setSearchCriteria(prev => ({ ...prev, date: newDateStr }));
  };

  const dateList = useMemo(() => {
     const center = new Date(searchCriteria.date);
     let startDate = new Date(center);
     startDate.setDate(center.getDate() - 3);
     const dates = [];
     for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dates.push(d);
     }
     return dates;
  }, [searchCriteria.date]);

  const formatDateDisplay = (dateObj) => {
    const days = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    return { 
        dayName: days[dateObj.getDay()], 
        dateNum: `${dateObj.getDate()}/${dateObj.getMonth() + 1}` 
    };
  };
  
  const formatISODate = (d) => d.toISOString().split('T')[0];

  const formatTimeOnly = (isoString) => {
      if(!isoString) return "--:--";
      return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start, end) => {
     if(!start || !end) return "--";
     const startTime = new Date(start).getTime();
     const endTime = new Date(end).getTime();
     const diffMs = endTime - startTime;
     if (diffMs < 0) return "Qua đêm";
     const hours = Math.floor(diffMs / (1000 * 60 * 60));
     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
     return `${hours}h ${minutes}p`;
  };

  const handleSelectTrip = (tripId) => {
    const selectedTrain = trainList.find(t => t.MaChuyenTau === tripId);
    
    // 2. Tạo object tripInfo chuẩn để truyền sang các trang sau
    const tripInfoToSend = {
        id: selectedTrain.MaChuyenTau,
        tenTau: selectedTrain.TenTau,
        // Lấy tên ga từ hàm helper có sẵn
        gaDi: getStationName(searchCriteria.from), 
        gaDen: getStationName(searchCriteria.to),
        maGaDi: searchCriteria.from,
        maGaDen: searchCriteria.to,
        // Format giờ
        gioDi: formatTimeOnly(selectedTrain.GioKhoiHanh),
        gioDen: formatTimeOnly(selectedTrain.GioDen),
        thoiGianChay: calculateDuration(selectedTrain.GioKhoiHanh, selectedTrain.GioDen),
        ngayDi: new Date(selectedTrain.GioKhoiHanh).toLocaleDateString('vi-VN')
    };

    const targetPath = isExchange ? `/exchange/seats/${tripId}` : `/booking/seats/${tripId}`;
    
    navigate(targetPath, { 
        state: { 
            tripId, 
            searchParams: searchCriteria, 
            isExchange, 
            exchangeData,
            tripInfo: tripInfoToSend // <--- QUAN TRỌNG: Truyền cái này đi
        } 
    });
  };

  // --- 4. RENDER GIAO DIỆN ---
  return (
    <div className="booking-container">
      <CustomerNavbar />
      {isExchange ? <ExchangeSteps currentStep={2} /> : <BookingSteps currentStep={2} />}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="info-card">
          <h3 className="info-title">
            {isExchange ? "Chọn chuyến tàu thay thế" : "Kết quả tìm kiếm"}
          </h3>
          <div className="info-route">
            <MapPin size={16} /> <span className="font-medium">{getStationName(searchCriteria.from)}</span> 
            <span className="mx-2 text-gray-400">➝</span>
            <MapPin size={16} /> <span className="font-medium">{getStationName(searchCriteria.to)}</span>
            
            {searchCriteria.time && (
                <span className="ml-3 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={12}/> Sau {searchCriteria.time}
                </span>
            )}
          </div>
          
          {isExchange && (
             <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
                <AlertCircle size={14}/> <span>Giá vé cũ sẽ được trừ vào đơn hàng mới.</span>
             </div>
          )}
        </div>

        {/* CẢNH BÁO PHANTOM READ */}
        {phantomInfo.detected && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-pulse shadow-sm">
                <AlertTriangle className="text-red-600 w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-red-700 font-bold text-sm uppercase">⚠️ Demo: Phát hiện lỗi Phantom Read</h4>
                    <p className="text-red-600 text-sm mt-1">Dữ liệu không nhất quán do có giao dịch khác thay đổi dữ liệu trong khi đang đọc.</p>
                    <ul className="list-disc list-inside text-sm text-red-800 mt-1 font-medium bg-red-100/50 p-2 rounded">
                        <li>Lần đọc 1: Tìm thấy <strong>{phantomInfo.countBefore}</strong> chuyến.</li>
                        <li>Lần đọc 2: Tìm thấy <strong>{phantomInfo.countAfter}</strong> chuyến.</li>
                    </ul>
                </div>
            </div>
        )}

        {/* DATE LINE */}
        <div className="date-line-container">
            <button className="nav-arrow-btn" onClick={() => {
                const d = new Date(searchCriteria.date);
                d.setDate(d.getDate() - 1);
                handleChangeDate(formatISODate(d));
            }}>
              <ChevronLeft size={24} />
            </button>
            
            <div className="date-scroll-wrapper">
              {dateList.map((dateObj, index) => {
                const dStr = formatISODate(dateObj);
                const { dayName, dateNum } = formatDateDisplay(dateObj);
                const isActive = dStr === searchCriteria.date;
                return (
                  <div 
                    key={index} 
                    className={`date-item ${isActive ? 'active' : ''}`} 
                    onClick={() => handleChangeDate(dStr)}
                  >
                    <span className="day-label">{dayName}</span>
                    <span className="date-label">{dateNum}</span>
                  </div>
                );
              })}
            </div>

            <button className="nav-arrow-btn" onClick={() => {
                const d = new Date(searchCriteria.date);
                d.setDate(d.getDate() + 1);
                handleChangeDate(formatISODate(d));
            }}>
              <ChevronRight size={24} />
            </button>
        </div>

        {/* LIST DANH SÁCH TÀU */}
        <div className="train-list min-h-[300px]">
          {isLoading ? (
             <div className="text-center py-12">
                <Loader2 size={40} className="mx-auto text-blue-600 animate-spin mb-4"/>
                <p className="text-gray-700 font-medium text-lg">Đang tìm chuyến tàu phù hợp...</p>
                <p className="text-sm text-orange-500 mt-2 bg-orange-50 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-100">
                    <Clock size={14}/>
                    <span>Mô phỏng Transaction Delay (Vui lòng đợi 10 giây)</span>
                </p>
             </div>
          ) : trainList.length > 0 ? (
            // Render danh sách tàu
            trainList.map((train) => {
              // Kiểm tra xem tàu này có phải là tàu mới (Phantom) không
              const isPhantomItem = phantomInfo.newIds?.includes(train.MaChuyenTau);
              
              return (
                <div 
                  key={train.MaChuyenTau} 
                  className={`train-card transition-all ${isPhantomItem ? 'border-red-300 ring-4 ring-red-50' : ''}`}
                >
                  <div className="train-header">
                    <div className="flex items-center gap-2">
                        <span className="train-name border border-blue-200 bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-bold">
                          {train.TenTau}
                        </span>
                        <span className="train-badge text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                          {train.MaDoanTau}
                        </span>
                    </div>
                    
                    {/* Tag đánh dấu Phantom (Chỉ hiện nếu là item mới) */}
                    {isPhantomItem && (
                        <span className="ml-auto text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded shadow-sm animate-pulse">
                          MỚI XUẤT HIỆN
                        </span>
                    )}
                  </div>

                  <div className="train-schedule">
                    <div className="time-box">
                      <div className="time-big">{formatTimeOnly(train.GioKhoiHanh)}</div>
                      <div className="station-name">{getStationName(searchCriteria.from)}</div>
                    </div>
                    
                    <div className="duration-line">
                      <div className="flex flex-col items-center">
                          <Clock size={14} className="text-gray-400 mb-1"/>
                          <span className="text-xs text-gray-500 font-medium">
                              {calculateDuration(train.GioKhoiHanh, train.GioDen)}
                          </span>
                      </div>
                      <div className="line-draw relative w-full h-[2px] bg-gray-200 mt-1">
                          <div className="absolute -top-[3px] left-0 w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="absolute -top-[3px] right-0 w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>

                    <div className="time-box right">
                      <div className="time-big">{formatTimeOnly(train.GioDen)}</div>
                      <div className="station-name">{getStationName(searchCriteria.to)}</div>
                    </div>
                  </div>

                  <div className="train-footer">
                    <div className="seat-status flex items-center gap-1 text-sm text-gray-600">
                      <User size={16} className={train.SoChoTrong > 0 ? "text-green-600" : "text-red-500"}/> 
                      {train.SoChoTrong > 0 ? (
                          <span>Còn <b className="text-green-600">{train.SoChoTrong}</b> chỗ trống</span>
                      ) : (
                          <span className="text-red-600 font-bold">Hết vé</span>
                      )}
                    </div>
                    
                    <div className="price-box">
                      <div className="text-right mr-3">
                          <span className="block text-xs text-gray-400">Giá vé từ</span>
                          <span className="block text-blue-600 font-bold text-lg">Liên hệ</span>
                      </div>
                      
                      <button 
                          className={`btn-select ${train.SoChoTrong === 0 ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                          disabled={train.SoChoTrong === 0}
                          onClick={() => handleSelectTrip(train.MaChuyenTau)}
                      >
                        {isExchange ? "Chọn tàu này" : "Chọn chuyến"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 mt-4">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy chuyến tàu nào.</p>
              <p className="text-sm text-slate-400 mt-1">
                 Hãy thử chọn ngày khác hoặc thay đổi ga đi/đến.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;