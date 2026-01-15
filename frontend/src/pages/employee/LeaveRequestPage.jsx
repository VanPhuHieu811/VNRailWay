import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, List, Train, Clock, MapPin, 
  CheckCircle, XCircle, Loader, Plus 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/pages/employee/LeaveRequestPage.css';

// Import Service
import { 
  getMyScheduleService, 
  getMyLeaveHistoryService, 
  createLeaveRequestService 
} from '../../services/staffApi';

const LeaveRequestPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  
  // Data State
  const [availableShifts, setAvailableShifts] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  
  // Form State
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: Format hiển thị ngày
  const convertDateToDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- 1. Load Lịch sử ---
  const fetchHistoryLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeaveHistoryService();
      if (res && res.success) {
        setHistoryList(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
      // Không toast lỗi ở đây để tránh spam khi mới vào trang
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Load Danh sách chuyến tàu để chọn (Khi chọn ngày) ---
  useEffect(() => {
    if (!leaveDate) return;

    const fetchShiftsForDate = async () => {
      try {
        setLoading(true);
        // Gọi API lấy lịch, truyền ngày bắt đầu = ngày kết thúc = ngày chọn
        const res = await getMyScheduleService(leaveDate, leaveDate);
        
        if (res && res.success && res.data.length > 0) {
          setAvailableShifts(res.data);
          toast.info(`Tìm thấy ${res.data.length} ca làm việc.`);
        } else {
          setAvailableShifts([]);
          toast.warning(`Bạn không có ca làm việc nào trong ngày ${convertDateToDisplay(leaveDate)}.`);
        }
      } catch (err) {
        console.error("Lỗi tải ca làm việc:", err);
        setAvailableShifts([]);
        toast.error("Không thể tải thông tin ca làm việc.");
      } finally {
        setLoading(false);
      }
    };

    fetchShiftsForDate();
  }, [leaveDate]);
    
  // --- 3. Init: Kiểm tra đăng nhập & Load lịch sử ---
  useEffect(() => {
    const employee = localStorage.getItem('employee');
    if (!employee) {
        toast.error("Vui lòng đăng nhập lại.");
        navigate('/login');
        return;
    }
    fetchHistoryLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 4. Xử lý Gửi đơn ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShiftId || !reason.trim()) {
        toast.warning("Vui lòng chọn chuyến tàu và nhập lý do.");
        return;
    }

    try {
      setIsSubmitting(true);
      
      const res = await createLeaveRequestService(selectedShiftId, reason);

      if (res && res.success) {
        toast.success("Gửi đơn nghỉ phép thành công!");
        
        // Reset form
        setSelectedShiftId('');
        setReason('');
        setLeaveDate('');
        setAvailableShifts([]);

        // Refresh lịch sử và chuyển tab
        await fetchHistoryLeaves();
        setActiveTab('history');
      } 
    } catch (err) {
      console.error("Lỗi gửi đơn:", err);
      const msg = err.response?.data?.message || err.message || "Gửi đơn thất bại.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectFocus = (e) => {
    if (!leaveDate) {
      e.target.blur();
      toast.warning("Vui lòng chọn ngày trước!");
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'Đang chờ': return <span className="status-label pending"><Loader size={12} className="animate-spin"/> Chờ duyệt</span>;
      case 'Chấp nhận': 
      case 'Đã duyệt': return <span className="status-label approved"><CheckCircle size={12}/> Đã duyệt</span>;
      default: return <span className="status-label rejected"><XCircle size={12}/> Từ chối</span>;
    }
  };

  const selectedShiftDetails = availableShifts.find(s => s.MaPhanCong === selectedShiftId);

  return (
    <div className="leave-container relative">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <h1 className="page-title"><FileText size={28} className="text-blue-700"/> Đơn nghỉ phép</h1>
        <p className="page-subtitle">Tạo và quản lý đơn xin nghỉ phép cá nhân</p>
      </div>

      <div className="tabs-with-filter">
        <div className="tabs-wrapper">
          <button 
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <Plus size={18}/> Tạo đơn mới
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <List size={18}/> Lịch sử ({historyList.length})
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="leave-date-filter">
            <label className="leave-date-label">Chọn ngày muốn nghỉ</label>
            <div className="leave-date-picker">
              <input
                type="date"
                className="custom-date-input"
                value={leaveDate}
                onChange={(e) => {
                  setLeaveDate(e.target.value);
                  setSelectedShiftId('');
                }}
              />
            </div>
          </div>
        )}
      </div>

      {activeTab === 'create' ? (
        <div className="create-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Chọn ca làm việc cần nghỉ</label>
              <select 
                className="form-select"
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                onFocus={handleSelectFocus}
                disabled={!leaveDate || availableShifts.length === 0}
              >
                <option value="">
                    {!leaveDate ? "-- Vui lòng chọn ngày trước --" : 
                     availableShifts.length === 0 ? "-- Không có ca làm việc --" : "-- Chọn chuyến tàu --"}
                </option>
                {availableShifts.map(shift => (
                  <option key={shift.MaPhanCong} value={shift.MaPhanCong}>
                    {shift.MaChuyenTau} | {shift.GioDi.substring(0,5)} - {shift.GioDen.substring(0,5)} | {shift.TenTuyen}
                  </option>
                ))}
              </select>

              {selectedShiftDetails && (
                <div className="selected-shift-preview bg-blue-50 p-3 rounded-md mt-2 border border-blue-100">
                  <div className="flex items-center gap-4 text-sm text-slate-700 mb-1">
                    <span className="font-bold flex items-center gap-1 text-blue-700"><Train size={16}/> {selectedShiftDetails.MaChuyenTau}</span>
                    <span className="flex items-center gap-1"><Clock size={16}/> {selectedShiftDetails.GioDi} - {selectedShiftDetails.GioDen}</span>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin size={16}/> {selectedShiftDetails.TenTuyen}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Lý do nghỉ phép <span className="text-red-500">*</span></label>
              <textarea 
                className="form-textarea"
                placeholder="Nhập lý do chi tiết (VD: Bị ốm, việc gia đình...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={5}
              />
            </div>

            <button 
                type="submit" 
                className={`btn-submit ${isSubmitting || !selectedShiftId ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={isSubmitting || !selectedShiftId}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
            </button>
          </form>
        </div>
      ) : (
        // HISTORY TAB
        <div className="history-list">
          {loading && historyList.length === 0 ? (
             <div className="text-center py-5">Đang tải...</div>
          ) : historyList.length > 0 ? (
            historyList.map(item => (
              <div key={item.MaDon} className="history-card">
                <div className="card-top">
                  <div className="flex flex-col">
                    <div className="train-badge bg-slate-100 text-slate-700">
                      <Train size={16}/> {item.MaChuyenTau || 'N/A'}
                    </div>
                    {/* Backend trả về TenTuyen ở chỗ nào đó, nếu không có thì ẩn */}
                    {item.TenTuyen && <span className="route-text mt-2">{item.TenTuyen}</span>}
                  </div>
                  {renderStatus(item.TrangThai)}
                </div>
                
                <div className="time-text mt-2 text-slate-500 text-sm flex items-center gap-2">
                  <Clock size={14}/> 
                  <span>Ngày khởi hành: <b>{convertDateToDisplay(item.NgayKhoiHanh)}</b></span>
                </div>

                <div className="reason-box mt-3 bg-slate-50 p-2 rounded text-sm text-slate-700">
                  <span className="font-semibold">Lý do: </span> 
                  {item.LyDo}
                </div>

                <div className="date-created text-xs text-slate-400 mt-2 text-right">
                  Ngày tạo đơn: {convertDateToDisplay(item.NgayTao)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 italic bg-white rounded-lg border border-dashed">
                Bạn chưa tạo đơn nghỉ phép nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestPage;