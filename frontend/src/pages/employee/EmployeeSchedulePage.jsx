import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Calendar, Clock, MapPin, User, X, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMyScheduleService } from '../../services/staffApi'; // Import Service vừa tạo
import '../../styles/pages/employee/EmployeeSchedulePage.css';

const EmployeeSchedulePage = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();
 
  // State quản lý ngày lọc
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('current'); // 'current', 'next', 'custom'
  
  const [selectedShift, setSelectedShift] = useState(null); // Để hiện Modal

  // Helper: Format ngày YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Helper: Lấy ngày đầu tuần và cuối tuần
  const getWeekRange = (offsetWeeks = 0) => {
    // --- LƯU Ý QUAN TRỌNG: TEST DATA ---
    // Để test khớp mock data DB, ta dùng ngày giả lập 31/12/2025.
    // Khi chạy thực tế, hãy đổi dòng dưới thành: const today = new Date();
    const today = new Date("2025-12-31"); 
    
    const day = today.getDay(); // 0 (CN) -> 6 (T7)
    // Tính ngày thứ 2 đầu tuần (Nếu hôm nay là CN thì lùi về thứ 2 tuần trước)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
    
    const start = new Date(today);
    start.setDate(diff + (offsetWeeks * 7)); // Cộng thêm số tuần offset
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Cộng 6 ngày để ra Chủ Nhật
    
    return { start: formatDate(start), end: formatDate(end) };
  };

  const fetchEmployeeSchedule = async (start, end) => {
    if (!start || !end) return;
    
    try {
      setLoading(true);
      // Gọi qua Service đã tách
      const response = await getMyScheduleService(start, end);

      if (response && response.success) {
        setSchedules(response.data || []);
      } else {
        setSchedules([]);
        toast.info("Không tìm thấy lịch trong khoảng thời gian này.");
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch làm việc: ", err);
      // Nếu lỗi do chưa đăng nhập hoặc hết phiên
      if (err.response && err.response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn.");
          navigate('/login');
      } else {
          toast.error(err.message || "Lỗi kết nối server.");
      }
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // 1. Khởi tạo: Load tuần hiện tại
  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa
    const employee = localStorage.getItem('employee');
    if (!employee) {
        toast.warning("Vui lòng đăng nhập để xem lịch.");
        navigate('/login');
        return;
    }

    const range = getWeekRange(0);
    setStartDate(range.start);
    setEndDate(range.end);
    fetchEmployeeSchedule(range.start, range.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Xử lý nút bấm Tuần này / Tuần sau
  const handlePresetClick = (type) => {
    setActiveFilter(type);
    const range = type === 'current' ? getWeekRange(0) : getWeekRange(1);
    setStartDate(range.start);
    setEndDate(range.end);
    fetchEmployeeSchedule(range.start, range.end);
  };

  // 3. Hàm lọc dữ liệu (Custom)
  const filterSchedules = () => {
    if(!startDate || !endDate) {
        toast.warning("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc");
        return;
    }
    fetchEmployeeSchedule(startDate, endDate);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Chuẩn bị': return { text: 'Sắp khởi hành', class: 'sap-khoi-hanh' };
      case 'Đang chạy': return { text: 'Đang chạy', class: 'dang-chay' };
      case 'Hoàn thành': return { text: 'Đã hoàn thành', class: 'da-hoan-thanh' };
      default: return { text: status || 'Chưa rõ', class: '' };
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  return (
    <div className="schedule-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title"><Train size={28} className="text-blue-700"/> Lịch làm việc</h1>
        <p className="page-subtitle">Xem phân công chuyến tàu của bạn</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <h3 className="filter-title"><Calendar size={16} className="inline mr-2"/>Chọn khoảng thời gian</h3>
        <div className="filter-controls">
          <button 
            className={`btn-filter-preset ${activeFilter === 'current' ? 'active' : ''}`}
            onClick={() => handlePresetClick('current')}
          >
            Tuần hiện tại
          </button>
          <button 
            className={`btn-filter-preset ${activeFilter === 'next' ? 'active' : ''}`}
            onClick={() => handlePresetClick('next')}
          >
            Tuần tiếp theo
          </button>
          
          <div className="date-range-box">
            <input 
              type="date" 
              className="custom-date-input" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setActiveFilter('custom'); }}
            />
            <span className="text-slate-400">đến</span>
            <input 
              type="date" 
              className="custom-date-input" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setActiveFilter('custom'); }}
            />
          </div>

          <button className="btn-search-schedule" onClick={filterSchedules}>
            Xem
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
         <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) :
      schedules.length > 0 ? (
        <div className="schedule-grid">
          {schedules.map(item => {
            const status = getStatusInfo(item.TrangThaiChuyenTau);
            return (
              <div key={item.MaPhanCong} className="schedule-card" onClick={() => setSelectedShift(item)}>
                <div className="card-header">
                  <div className="train-code">
                    <Train size={20} className="text-blue-600"/> {item.MaChuyenTau}
                    <span className="train-date">{formatDisplayDate(item.NgayKhoiHanh)}</span>
                  </div>
                  <span className={`status-tag ${status.class}`}>{status.text}</span>
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <MapPin size={16} className="text-blue-500"/>
                    <span className="font-semibold text-slate-700">{item.TenTuyen}</span>
                  </div>
                  <div className="info-row">
                    <Clock size={16} className="text-slate-400"/>
                    {/* Format lại giờ cho đẹp nếu cần (cắt giây) */}
                    <span>{item.GioDi?.substring(0,5)} - {item.GioDen?.substring(0,5)}</span>
                  </div>
                  
                  <div className="mt-3 pt-2 text-xs text-slate-400 flex items-center justify-end border-t border-slate-100">
                    Xem chi tiết <ChevronRight size={12}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed">
          Không có lịch làm việc trong khoảng thời gian này.
        </div>
      )}

      {/* Detail Modal */}
      {selectedShift && (
        <div className="modal-overlay" onClick={() => setSelectedShift(null)}>
          <div className="schedule-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <Train size={24} className="text-blue-700"/>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedShift.MaChuyenTau}</h3>
                  <p className="text-sm text-slate-500">{formatDisplayDate(selectedShift.NgayKhoiHanh)}</p>
                </div>
              </div>
              <span className={`status-tag ${getStatusInfo(selectedShift.TrangThaiChuyenTau).class}`}>  
                {getStatusInfo(selectedShift.TrangThaiChuyenTau).text}
              </span>
              <button onClick={() => setSelectedShift(null)} className="text-slate-400 hover:text-red-500">
                <X size={24}/>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-detail-row">
                <div className="detail-item">
                  <label><MapPin size={14} className="inline mr-1"/>Tuyến</label>
                  <span>{selectedShift.TenTuyen}</span>
                </div>
                <div className="detail-item text-right">
                  <label><Clock size={14} className="inline mr-1"/>Thời gian</label>
                  <span>{selectedShift.GioDi?.substring(0,5)} - {selectedShift.GioDen?.substring(0,5)}</span>
                </div>
              </div>
              
              <div className="divider"></div>

              <div className="modal-detail-row">
                <div className="detail-item">
                  <label>Đoàn tàu</label>
                  <span>{selectedShift.MaDoanTau}</span>
                </div>
                <div className="detail-item">
                  <label>Toa</label>
                  <span>{selectedShift.MaToa || 'Không'}</span>
                </div>
                <div className="detail-item text-right">
                  <label><User size={14} className="inline mr-1"/>Vai trò</label>
                  <span className="text-blue-600 font-bold">{selectedShift.VaiTro}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeSchedulePage;