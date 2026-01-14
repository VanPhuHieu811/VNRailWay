import React, { useState } from 'react';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  Search, Bell, X, User, Calendar, MapPin, 
  FileText, ArrowRight 
} from 'lucide-react';

const LeaveRequestManagement = () => {
  // --- STATE MANAGEMENT ---
  
  // Trạng thái cho các Modal
  const [replacementModal, setReplacementModal] = useState({ open: false, request: null });
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  
  // State dữ liệu nhập liệu trong Modal
  const [selectedReplacement, setSelectedReplacement] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Danh sách nhân viên rảnh (Mock data cho Luồng chính: Tìm nhân viên chưa có việc)
  const availableStaff = [
    { id: 'NV008', name: 'Phạm Văn Hưng', role: 'Tiếp viên' },
    { id: 'NV009', name: 'Lê Thị Thu', role: 'Tiếp viên' },
    { id: 'NV010', name: 'Trần Văn Tú', role: 'Bảo vệ' },
  ];

  // Danh sách đơn nghỉ phép (Mock data)
  const [requests, setRequests] = useState([
    {
      id: 1,
      employeeName: "Nguyễn Văn B",
      employeeId: "NV001",
      role: "Tiếp viên",
      trainCode: "SE1",
      carriage: "Toa 3",
      date: "2024-01-20",
      shift: "Ca sáng (06:00 - 14:00)",
      reason: "Gia đình có việc gấp cần về quê",
      sentAt: "2024-01-15 09:30",
      status: "pending" // pending, approved, rejected, expired
    },
    {
      id: 2,
      employeeName: "Trần Thị C",
      employeeId: "NV002",
      role: "Tiếp viên",
      trainCode: "SE3",
      carriage: "Toa 5",
      date: "2024-01-21",
      shift: "Ca chiều (14:00 - 22:00)",
      reason: "Khám bệnh định kỳ",
      sentAt: "2024-01-16 14:20",
      status: "pending"
    },
    {
      id: 3,
      employeeName: "Lê Văn D",
      employeeId: "NV003",
      role: "Bảo vệ",
      trainCode: "SE5",
      carriage: "Toa 1",
      date: "2024-01-10",
      shift: "Ca đêm (22:00 - 06:00)",
      reason: "Con ốm cần chăm sóc",
      sentAt: "2024-01-11 08:00",
      status: "expired" // Luồng phụ: Đơn hết hạn/không hợp lệ
    },
    {
      id: 4,
      employeeName: "Hoàng Văn E",
      employeeId: "NV004",
      role: "Lái tàu",
      trainCode: "SE1",
      carriage: "Đầu máy",
      date: "2024-01-18",
      shift: "Ca sáng",
      reason: "Nghỉ phép năm",
      sentAt: "2024-01-12",
      status: "approved",
      replacement: "Nguyễn Văn X"
    }
  ]);

  // --- HANDLERS ---

  // 1. Xử lý Duyệt đơn (Kèm người thay thế)
  const handleApprove = () => {
    if (!selectedReplacement) {
      alert("Vui lòng chọn nhân viên thay thế!");
      return;
    }

    setRequests(requests.map(req => 
      req.id === replacementModal.request.id 
        ? { ...req, status: 'approved', replacement: selectedReplacement } 
        : req
    ));
    
    // Reset & Close Modal
    setReplacementModal({ open: false, request: null });
    setSelectedReplacement('');
  };

  // 2. Xử lý Từ chối (Kèm lý do)
  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    setRequests(requests.map(req => 
      req.id === rejectModal.request.id 
        ? { ...req, status: 'rejected', rejectionReason: rejectReason } 
        : req
    ));

    // Reset & Close Modal
    setRejectModal({ open: false, request: null });
    setRejectReason('');
  };

  // Helper: Đếm số lượng cho Stats
  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    expired: requests.filter(r => r.status === 'expired').length,
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn nghỉ phép</h1>
          <p className="text-gray-500 text-sm">Duyệt và quản lý đơn xin nghỉ của nhân viên</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Tìm kiếm..." className="pl-9 pr-4 py-2 border rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><Clock className="w-6 h-6"/></div>
          <div><h3 className="text-2xl font-bold text-gray-800">{stats.pending}</h3><p className="text-sm text-gray-500">Chờ duyệt</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle className="w-6 h-6"/></div>
          <div><h3 className="text-2xl font-bold text-gray-800">{stats.approved}</h3><p className="text-sm text-gray-500">Đã duyệt</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><XCircle className="w-6 h-6"/></div>
          <div><h3 className="text-2xl font-bold text-gray-800">{stats.rejected}</h3><p className="text-sm text-gray-500">Từ chối</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-gray-500 rounded-full"><AlertCircle className="w-6 h-6"/></div>
          <div><h3 className="text-2xl font-bold text-gray-800">{stats.expired}</h3><p className="text-sm text-gray-500">Hết hạn</p></div>
        </div>
      </div>

      {/* REQUEST LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Danh sách đơn nghỉ phép
        </h2>

        <div className="space-y-4">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className={`p-5 rounded-xl border transition-all ${
                req.status === 'expired' ? 'bg-gray-50 border-gray-200 opacity-60' : // Luồng phụ: Làm mờ đơn hết hạn
                req.status === 'approved' ? 'bg-green-50 border-green-200' :
                req.status === 'rejected' ? 'bg-red-50 border-red-200' :
                'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Employee Info & Status */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    req.status === 'expired' ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {req.employeeName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 text-lg">{req.employeeName}</h3>
                      {req.status === 'pending' && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">Chờ duyệt</span>}
                      {req.status === 'approved' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">Đã duyệt</span>}
                      {req.status === 'rejected' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">Đã từ chối</span>}
                      {req.status === 'expired' && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-bold">Hết hạn</span>}
                    </div>
                    <p className="text-sm text-gray-500">{req.role} - Mã NV: {req.employeeId}</p>
                    
                    {/* Details: Train, Shift, Reason */}
                    <div className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> {req.trainCode} - {req.carriage}</span>
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400"/> {req.date}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> {req.shift}</span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                      <span className="font-semibold text-gray-900">Lý do: </span> {req.reason}
                    </div>

                    {req.status === 'approved' && (
                       <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Người thay thế: {req.replacement}
                       </div>
                    )}
                     {req.status === 'rejected' && (
                       <div className="mt-2 text-sm text-red-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Lý do từ chối: {req.rejectionReason}
                       </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">Gửi lúc: {req.sentAt}</p>
                  </div>
                </div>

                {/* Actions Buttons (Only for Pending) */}
                {req.status === 'pending' && (
                  <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button 
                      onClick={() => setRejectModal({ open: true, request: req })}
                      className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Từ chối
                    </button>
                    <button 
                      onClick={() => setReplacementModal({ open: true, request: req })}
                      className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <User className="w-4 h-4" /> Chọn người thay
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL 1: CHỌN NGƯỜI THAY THẾ (APPROVE) --- */}
      {replacementModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Chọn nhân viên thay ca</h3>
                <p className="text-sm text-gray-500">Thay thế cho {replacementModal.request?.employeeName}</p>
              </div>
              <button onClick={() => setReplacementModal({ open: false, request: null })} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6">
              {/* Thông tin ca làm việc */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-2">Thông tin ca làm việc</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Tàu: {replacementModal.request?.trainCode} - {replacementModal.request?.carriage}</p>
                  <p>• Ngày: {replacementModal.request?.date}</p>
                  <p>• Ca: {replacementModal.request?.shift}</p>
                </div>
              </div>

              {/* Select Replacement */}
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên trống ca</label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedReplacement}
                  onChange={(e) => setSelectedReplacement(e.target.value)}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {availableStaff.length > 0 ? (
                    availableStaff.map(staff => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name} - {staff.role} ({staff.id})
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có nhân viên nào trống ca</option> // Luồng phụ
                  )}
                </select>
              </div>
              
              {availableStaff.length === 0 && (
                 <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3"/> Hiện tại không có nhân viên nào trống lịch cho ca này.
                 </p>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setReplacementModal({ open: false, request: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
              >
                Hủy
              </button>
              <button 
                onClick={handleApprove}
                disabled={availableStaff.length === 0}
                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${availableStaff.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <CheckCircle className="w-4 h-4" /> Duyệt đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TỪ CHỐI (REJECT) --- */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-red-600">Từ chối đơn nghỉ phép</h3>
              <button onClick={() => setRejectModal({ open: false, request: null })} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                Bạn đang từ chối đơn của nhân viên <strong>{rejectModal.request?.employeeName}</strong>. 
                Vui lòng nhập lý do bên dưới:
              </p>
              
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 h-32 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setRejectModal({ open: false, request: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveRequestManagement;