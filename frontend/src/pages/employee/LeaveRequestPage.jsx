import React, { useState, useEffect } from 'react';
import { 
  FileText, List, Train, Clock, MapPin, 
  AlertTriangle, CheckCircle, XCircle, Loader, Plus 
} from 'lucide-react';
import { PHAN_CONG_DB, DON_NGHI_PHEP_DB } from '../../services/db_mock';
import '../../styles/pages/employee/LeaveRequestPage.css';

const LeaveRequestPage = () => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [availableShifts, setAvailableShifts] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  
  // Form State
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load dữ liệu khi vào trang
  useEffect(() => {
    // Giả lập lấy User ID từ LocalStorage (NV003 - Lái tàu)
    const user = JSON.parse(localStorage.getItem('employee')) || {};
    const userId = user.maNhanVien || "NV003";

    // A. Lấy lịch sử đơn nghỉ
    const myHistory = DON_NGHI_PHEP_DB.filter(d => d.maNhanVien === userId);
    setHistoryList(myHistory);

    // B. Lấy các chuyến tàu SẮP TỚI được phân công (để hiện trong dropdown)
    // Điều kiện: Chưa khởi hành VÀ Chưa có trong danh sách đơn nghỉ
    const assignedShifts = PHAN_CONG_DB.filter(item => {
      const isMyShift = item.maNhanVien === userId;
      const isFuture = item.trangThai === 'SapKhoiHanh';
      
      // Check xem đã nộp đơn cho chuyến này chưa
      const alreadyRequested = myHistory.some(h => h.maPhanCong === item.id);
      
      return isMyShift && isFuture && !alreadyRequested;
    });

    setAvailableShifts(assignedShifts);
  }, []);

  // Xử lý Gửi đơn
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedShiftId || !reason.trim()) return;

    setIsSubmitting(true);

    // Giả lập gọi API (delay 1s)
    setTimeout(() => {
      // 1. Tìm thông tin chuyến tàu đã chọn
      const shift = availableShifts.find(s => s.id === selectedShiftId);
      
      // 2. Tạo object đơn mới
      const newRequest = {
        id: `DNP-${Date.now()}`,
        maNhanVien: shift.maNhanVien,
        maPhanCong: shift.id,
        tenTau: shift.tenTau,
        tuyen: shift.tuyen,
        ngayKhoiHanh: shift.ngayKhoiHanh,
        gioDi: shift.gioDi,
        gioDen: shift.gioDen,
        lyDo: reason,
        trangThai: "ChoDuyet",
        ngayTao: new Date().toLocaleDateString('vi-VN')
      };

      // 3. Cập nhật State
      setHistoryList([newRequest, ...historyList]); // Thêm vào đầu lịch sử
      setAvailableShifts(prev => prev.filter(s => s.id !== selectedShiftId)); // Xóa khỏi danh sách chọn
      
      // 4. Reset form & Chuyển tab
      setSelectedShiftId('');
      setReason('');
      setIsSubmitting(false);
      setActiveTab('history');
      alert("Gửi đơn nghỉ phép thành công!");
    }, 1000);
  };

  // Helper render badge trạng thái
  const renderStatus = (status) => {
    switch (status) {
      case 'ChoDuyet': return <span className="status-label pending"><Loader size={12}/> Chờ duyệt</span>;
      case 'DaDuyet': return <span className="status-label approved"><CheckCircle size={12}/> Đã duyệt</span>;
      default: return <span className="status-label rejected"><XCircle size={12}/> Từ chối</span>;
    }
  };

  const selectedShiftDetails = availableShifts.find(s => s.id === selectedShiftId);

  return (
    <div className="leave-container">
      <div className="page-header">
        <h1 className="page-title"><FileText size={28} className="text-blue-700"/> Đơn nghỉ phép</h1>
        <p className="page-subtitle">Tạo và quản lý đơn xin nghỉ phép</p>
      </div>

      {/* Tabs */}
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

      {/* --- CONTENT --- */}
      {activeTab === 'create' ? (
        // CREATE TAB
        availableShifts.length > 0 ? (
          <div className="create-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Chọn chuyến tàu</label>
                <select 
                  className="form-select"
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn chuyến tàu --</option>
                  {availableShifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                      {shift.tenTau} ({shift.ngayKhoiHanh}) - {shift.tuyen}
                    </option>
                  ))}
                </select>

                {/* Preview thông tin chuyến tàu khi chọn */}
                {selectedShiftDetails && (
                  <div className="selected-shift-preview">
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <span className="font-bold flex items-center gap-1"><Train size={16}/> {selectedShiftDetails.tenTau}</span>
                      <span className="flex items-center gap-1"><Clock size={16}/> {selectedShiftDetails.gioDi} - {selectedShiftDetails.gioDen}</span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin size={16}/> {selectedShiftDetails.tuyen}
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
          // Empty State (Giống hình 1)
          <div className="empty-state">
            <div className="empty-icon-box">
              <AlertTriangle size={32}/>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Không có chuyến đủ điều kiện</h3>
            <p className="text-slate-500 text-sm">
              Hiện tại bạn không có chuyến tàu sắp tới nào, hoặc bạn đã gửi đơn cho tất cả các chuyến.
            </p>
          </div>
        )
      ) : (
        // HISTORY TAB (Giống hình 2)
        <div className="history-list">
          {historyList.length > 0 ? (
            historyList.map(item => (
              <div key={item.id} className="history-card">
                <div className="card-top">
                  <div className="flex flex-col">
                    <div className="train-badge">
                      <Train size={16}/> {item.tenTau}
                    </div>
                    <span className="route-text mt-2">{item.tuyen}</span>
                  </div>
                  {renderStatus(item.trangThai)}
                </div>
                
                <div className="time-text">
                  <Clock size={14}/> {item.gioDi} - {item.gioDen} • {item.ngayKhoiHanh}
                </div>

                <div className="reason-box">
                  <span className="font-semibold text-slate-700">Lý do: </span> 
                  {item.lyDo}
                </div>

                <div className="date-created">
                  Ngày tạo: {item.ngayTao}
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