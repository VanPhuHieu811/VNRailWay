import React, { useState, useEffect } from 'react';
import { 
  FileText, List, Train, Clock, MapPin, 
  AlertTriangle, CheckCircle, XCircle, Loader, Plus, X 
} from 'lucide-react';
import { PHAN_CONG_DB, DON_NGHI_PHEP_DB } from '../../services/db_mock';
import '../../styles/pages/employee/LeaveRequestPage.css';
import { handle } from '../../api/api';

const LeaveRequestPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [availableShifts, setAvailableShifts] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  
  // Form State
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');

  // --- STATE THÔNG BÁO ---
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  const id = "NV05"; // ID nhân viên giả định

  const convertDateToDisplay = (isoDate) => {
    if (!isoDate) return '';

    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Helper: Hiển thị thông báo
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000); // 5 giây tự tắt
  };

  // --- 1. Load Lịch sử (Dùng Mock hoặc API riêng) ---
  const fetchHistoryLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/v1/staff/me/leave-history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-staff-id": id
        }
      });

      const data = await handle(res);
      console.log(data.data);
      if (data?.success) {
        setHistoryList(data.data || []);
      }
      else {
        setHistoryList([]);
      }
    }
    catch (err) {
      console.log("Lỗi khi tải lịch sử xin nghỉ phép: ", err);
      showNotification("Lỗi kết nối đến server", "error");
      setAvailableShifts([]);
    }
    finally {
      setLoading(false);
    }
  };

  // --- 2. EFFECT: Gọi API Lọc chuyến tàu theo ngày ---
  useEffect(() => {
    if (!leaveDate) return;

    const fetchLeaveRequests = async(date) => {
      try {
        setLoading(true);

        // Tạo query params
        const queryParams = new URLSearchParams({
          tuNgay: date, // Chú ý: Backend bên kia đang nhận startDate/endDate (check lại server.js)
          denNgay: date
        }).toString();

        // --- SỬA LỖI 1: Gọi API đúng port 5000 (Backend) ---
        const response = await fetch(`http://localhost:3000/api/v1/staff/me/schedule?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-staff-id": id 
          }
        });
        
        // --- SỬA LỖI 2: Parse JSON trước khi dùng ---
        const resJson = await response.json(); 

        if (resJson && resJson.data.length > 0) { // Giả sử API trả về mảng trực tiếp hoặc resJson.data
           // Nếu API trả về { success: true, data: [...] } thì dùng resJson.data
           const data = resJson.data || resJson; 
           setAvailableShifts(data);
        } else {
           setAvailableShifts([]);
           // --- SỬA LỖI 3: Khôi phục thông báo khi không có dữ liệu ---
           showNotification(
             `Không có chuyến tàu nào được phân công cho bạn vào ngày ${convertDateToDisplay(date)}.`, 
             'error'
           );
        }
      } catch (err) {
        console.log("Lỗi khi tải lịch làm việc: ", err);
        showNotification("Lỗi kết nối đến server", "error");
        setAvailableShifts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests(leaveDate);
  }, [leaveDate]);
    
  useEffect(() => {
    fetchHistoryLeaves();
  }, []);
  // Xử lý khi click vào dropdown mà chưa chọn ngày
  const handleSelectFocus = (e) => {
    if (!leaveDate) {
      e.target.blur();
      showNotification("Vui lòng chọn ngày xin nghỉ phép trước!", "warning");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShiftId || !reason.trim()) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:3000/api/v1/staff/me/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-staff-id": id
        },
        body: JSON.stringify({
          maPhanCong: selectedShiftId,
          lyDo: reason
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.message || "Gửi đơn thất bại", "error");
        return;
      }

      setSelectedShiftId('');
      setReason('');

      await fetchHistoryLeaves();

      setActiveTab('history');

      showNotification("Gửi đơn nghỉ phép thành công!", "success");

    } catch (err) {
      console.log("Lỗi gửi đơn:", err);
      showNotification("Lỗi kết nối đến server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'Đang chờ': return <span className="status-label pending"><Loader size={12}/> Chờ duyệt</span>;
      case 'Chấp nhận': return <span className="status-label approved"><CheckCircle size={12}/> Đã duyệt</span>;
      default: return <span className="status-label rejected"><XCircle size={12}/> Từ chối</span>;
    }
  };

  const selectedShiftDetails = availableShifts.find(s => s.MaPhanCong === selectedShiftId);

  return (
    <div className="leave-container relative">
      
      {/* --- TOAST NOTIFICATION --- */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in
          ${notification.type === 'warning' ? 'bg-orange-50 border-l-4 border-orange-500 text-orange-800' : 
            notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-800' : 
            'bg-red-50 border-l-4 border-red-500 text-red-800'} 
        `}>
          {notification.type === 'warning' ? <AlertTriangle size={20}/> : 
           notification.type === 'success' ? <CheckCircle size={20}/> : <XCircle size={20}/>}
          <span className="font-medium text-sm">{notification.message}</span>
          <button onClick={() => setNotification({...notification, show: false})} className="ml-2 opacity-50 hover:opacity-100">
            <X size={16}/>
          </button>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title"><FileText size={28} className="text-blue-700"/> Đơn nghỉ phép</h1>
        <p className="page-subtitle">Tạo và quản lý đơn xin nghỉ phép</p>
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
            <label className="leave-date-label">Chọn ngày xin nghỉ phép</label>
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
              <label className="form-label">Chọn chuyến tàu</label>
              <select 
                className="form-select"
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                onFocus={handleSelectFocus}
                required
              >
                <option value="">-- Chọn chuyến tàu --</option>
                {availableShifts.map(shift => (
                  <option key={shift.MaPhanCong} value={shift.MaPhanCong}>
                    {shift.MaChuyen} ({convertDateToDisplay(shift.NgayKhoiHanh)}) - {shift.TenTuyen}
                  </option>
                ))}
              </select>

              {selectedShiftDetails && (
                <div className="selected-shift-preview">
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <span className="font-bold flex items-center gap-1"><Train size={16}/> {selectedShiftDetails.MaChuyenTau}</span>
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
                placeholder="Nhập lý do xin nghỉ phép (tối thiểu 10 ký tự)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={10}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
            </button>
          </form>
        </div>
      ) : (
        // HISTORY TAB
        <div className="history-list">
          {historyList.length > 0 ? (
            historyList.map(item => (
              <div key={item.MaDon} className="history-card">
                <div className="card-top">
                  <div className="flex flex-col">
                    <div className="train-badge">
                      <Train size={16}/> {item.MaChuyenTau}
                    </div>
                    <span className="route-text mt-2">{item.TenTuyen}</span>
                  </div>
                  {renderStatus(item.TrangThai)}
                </div>
                
                <div className="time-text">
                  <Clock size={14}/> {item.GioDi} - {item.GioDen} • {convertDateToDisplay(item.NgayKhoiHanh)}
                </div>

                <div className="reason-box">
                  <span className="font-semibold text-slate-700">Lý do: </span> 
                  {item.LyDo}
                </div>

                <div className="date-created">
                  Ngày tạo: {convertDateToDisplay(item.NgayTao)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 italic">Chưa có lịch sử đơn nghỉ phép.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestPage;