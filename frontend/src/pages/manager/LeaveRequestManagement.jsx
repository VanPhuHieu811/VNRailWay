import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  Search, Bell, X, User, Calendar, MapPin,
  FileText, Filter, Loader2
} from 'lucide-react';
import { getLeaveRequests, approveLeaveRequestLost, approveLeaveRequestFixed, rejectLeaveRequest, getAvailableStaff } from '../../services/leave.service';

const LeaveRequestManagement = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'

  // Trạng thái cho các Modal
  const [replacementModal, setReplacementModal] = useState({ open: false, request: null, mode: 'lost' }); // mode: 'lost' | 'fixed'
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });

  // State dữ liệu nhập liệu trong Modal
  const [selectedReplacement, setSelectedReplacement] = useState(''); // Stores ID
  const [rejectReason, setRejectReason] = useState('');

  const [availableStaffList, setAvailableStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Requests on Mount or Tab Change
  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaveRequests(activeTab);

      const mapped = data.map(item => ({
        ...item,
        trainCode: item.tripCode,
      }));

      setRequests(mapped);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
      setError("Không thể tải danh sách đơn nghỉ phép.");
    } finally {
      setLoading(false);
    }
  };

  // Load available staff when opening Main Approval Modal
  useEffect(() => {
    if (replacementModal.open && replacementModal.request) {
      const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
          const staff = await getAvailableStaff(
            replacementModal.request.tripCode || replacementModal.request.trainCode,
            replacementModal.request.role
          );
          setAvailableStaffList(staff);
        } catch (error) {
          console.error("Error fetching staff", error);
          alert("Lỗi khi tìm nhân viên thay thế");
        } finally {
          setLoadingStaff(false);
        }
      };

      fetchStaff();
      setSelectedReplacement('');
    }
  }, [replacementModal.open, replacementModal.request]);

  // --- HANDLERS ---

  // 1. Xử lý Duyệt đơn (Kèm người thay thế)
  const handleApprove = async () => {
    if (!selectedReplacement) {
      alert("Vui lòng chọn nhân viên thay thế!");
      return;
    }

    setLoadingApprove(true);
    try {
      const approveFn = replacementModal.mode === 'fixed' ? approveLeaveRequestFixed : approveLeaveRequestLost;
      await approveFn(replacementModal.request.id, selectedReplacement);

      // Update UI: Remove from list if in 'pending' tab, or update status
      setRequests(requests.filter(req => req.id !== replacementModal.request.id));

      alert("Đã duyệt đơn thành công!");

      // Reset & Close Modal
      setReplacementModal({ open: false, request: null, mode: 'lost' });
      setSelectedReplacement('');
    } catch (err) {
      alert("Lỗi khi duyệt đơn: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingApprove(false);
    }
  };

  // 2. Xử lý Từ chối (Kèm lý do)
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    setLoadingReject(true);
    try {
      await rejectLeaveRequest(rejectModal.request.id, rejectReason);

      // Update UI
      setRequests(requests.filter(req => req.id !== rejectModal.request.id));

      alert("Đã từ chối đơn.");

      // Reset & Close Modal
      setRejectModal({ open: false, request: null });
      setRejectReason('');
    } catch (err) {
      alert("Lỗi khi từ chối đơn: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingReject(false);
    }
  };

  // Helper: Đếm số lượng cho Stats (Chỉ tính trên data đang hiển thị thì không đúng lắm nếu phân trang, nhưng tạm thời ok)
  // Thực tế nên lấy stats từ API riêng hoặc đếm từ response

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn nghỉ phép</h1>
          <p className="text-gray-500 text-sm">Duyệt đơn và sắp xếp nhân sự thay thế</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Chờ duyệt
          {/* Badge count could go here */}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Lịch sử / Đã xử lý
        </button>
      </div>

      {/* REQUEST LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-20" />
            <p>Không có đơn nào trong danh sách này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-xl border transition-all ${req.status === 'approved' ? 'bg-green-50 border-green-200' :
                    req.status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-white border-gray-200 hover:shadow-md'
                  }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                  {/* Employee Info & Status */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${req.status === 'pending' ? 'bg-blue-100 text-blue-600' :
                        req.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {req.employeeName ? req.employeeName.charAt(0) : '?'}
                    </div>
                    <div className="w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">{req.employeeName}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {req.status === 'pending' ? 'Chờ duyệt' :
                            req.status === 'approved' ? 'Đã chấp nhận' : 'Đã từ chối'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">{req.role} - Mã NV: {req.employeeId}</p>

                      {/* Details Grid */}
                      <div className="flex flex-col gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> Tàu: <b>{req.trainCode} - {req.carriage}</b></span>
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Ngày: <b>{new Date(req.date).toLocaleDateString('vi-VN')}</b></span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Ca: <b>{req.shift}</b></span>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="font-semibold">Lý do:</span> {req.reason}
                        </div>
                      </div>

                      {req.status === 'approved' && req.replacement && (
                        <div className="mt-3 text-sm text-green-700 flex items-center gap-2 bg-green-100/50 p-2 rounded border border-green-100">
                          <CheckCircle className="w-4 h-4" />
                          <span>Người thay thế: <b>{req.replacement}</b></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons (Only for Pending) */}
                  {activeTab === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setReplacementModal({ open: true, request: req, mode: 'lost' })}
                        className="px-3 py-2 bg-orange-500 text-white rounded-lg
                                  hover:bg-orange-600 transition-colors
                                  flex items-center gap-2 shadow-sm text-sm whitespace-nowrap"
                      >
                        <User className="w-4 h-4" /> Duyệt (Lost Update)
                      </button>

                      <button
                        onClick={() => setReplacementModal({ open: true, request: req, mode: 'fixed' })}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg
                                  hover:bg-blue-700 transition-colors
                                  flex items-center gap-2 shadow-sm text-sm whitespace-nowrap"
                      >
                        <User className="w-4 h-4" /> Duyệt (Fixed)
                      </button>

                      <button
                        onClick={() => setRejectModal({ open: true, request: req })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700
                                  hover:bg-red-50 hover:text-red-600 hover:border-red-200
                                  transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL 1: CHỌN NGƯỜI THAY THẾ (APPROVE) --- */}
      {replacementModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Chọn nhân viên thay ca</h3>
                <p className="text-sm text-gray-500">Thay thế cho {replacementModal.request?.employeeName}</p>
                <p className="text-xs text-blue-600 mt-1">Chế độ duyệt: {replacementModal.mode === 'fixed' ? 'Fix lost update' : 'Mô phỏng lost update'}</p>
              </div>
              <button onClick={() => setReplacementModal({ open: false, request: null, mode: 'lost' })} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6">
              {/* Thông tin ca làm việc */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-2">Thông tin ca cần thay</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Tàu: {replacementModal.request?.trainCode} - {replacementModal.request?.carriage}</p>
                  <p>• Ngày: {new Date(replacementModal.request?.date).toLocaleDateString('vi-VN')}</p>
                  <p>• Vai trò: {replacementModal.request?.role}</p>
                </div>
              </div>

              {/* Select Replacement */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhân viên khả dụng (Cùng vai trò & Trống lịch)
              </label>

              {loadingStaff ? (
                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">Đang tìm nhân viên...</div>
              ) : (
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={selectedReplacement}
                    onChange={(e) => setSelectedReplacement(e.target.value)}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {availableStaffList.length > 0 ? (
                      availableStaffList.map(staff => (
                        <option key={staff.MaNV} value={staff.MaNV}>
                          {staff.HoTen} - {staff.LoaiNhanVien} ({staff.MaNV})
                        </option>
                      ))
                    ) : (
                      <option disabled>Không tìm thấy nhân viên phù hợp</option>
                    )}
                  </select>
                </div>
              )}

              {!loadingStaff && availableStaffList.length === 0 && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Không có nhân viên nào trống lịch cho ca này.
                </p>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setReplacementModal({ open: false, request: null, mode: 'lost' })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
                disabled={loadingApprove}
              >
                Hủy
              </button>
              <button
                onClick={handleApprove}
                disabled={!selectedReplacement || loadingApprove}
                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 
                   ${!selectedReplacement || loadingApprove ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loadingApprove ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Xác nhận Duyệt
                  </>
                )}
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
              <button onClick={() => setRejectModal({ open: false, request: null })} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
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
                disabled={loadingReject}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                disabled={loadingReject}
                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                  loadingReject ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loadingReject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveRequestManagement;