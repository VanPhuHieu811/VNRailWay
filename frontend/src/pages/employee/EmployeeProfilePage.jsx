import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, MapPin, Calendar, CreditCard, 
  UserCircle, Loader, Mail, Shield 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMyProfileService } from '../../services/staffApi'; 

const EmployeeProfilePage = () => {
  const [employee, setEmployee] = useState(null);
  const [account, setAccount] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfileService();

      if (res && res.success) {
        setEmployee(res.data.nhanVien);
        setAccount(res.data.account);
      } else {
        toast.error("Không thể tải thông tin nhân viên.");
      }
    } catch (error) {
      console.error("Lỗi tải profile:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         toast.error("Phiên đăng nhập hết hạn.");
         navigate('/login');
      } else {
         toast.error("Lỗi kết nối server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getRoleName = (roleCode) => {
    if (!roleCode) return 'Nhân viên';
    const role = roleCode.toUpperCase();
    if (role.includes('QUANLY') || role === 'MANAGER') return 'Quản Lý';
    if (role.includes('BANVE') || role === 'SALES') return 'NV Bán vé';
    if (role.includes('TAU') || role === 'CREW') return 'Lái Tàu';
    return roleCode;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
        <Loader className="animate-spin mb-3 text-blue-600" size={40} />
        <p className="font-medium">Đang tải hồ sơ nhân viên...</p>
      </div>
    );
  }

  if (!employee) return <div className="p-10 text-center text-red-500">Không tìm thấy thông tin nhân viên.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-5 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <div className="w-full max-w-4xl">
        
        {/* HEADER CARD */}
        <div className="bg-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 mb-6 shadow-sm border border-slate-200">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white">
              {employee.hoTen ? employee.hoTen.charAt(0).toUpperCase() : 'N'}
            </div>
          </div>
          
          {/* Info Header */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{employee.hoTen}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                {getRoleName(employee.loaiNhanVien)}
              </span>
              <span className="text-slate-300 hidden md:inline">|</span>
              <span className="text-slate-500 text-sm flex items-center gap-1.5">
                <Shield size={14}/> MNV: {employee.maNV}
              </span>
            </div>
          </div>
        </div>

        {/* DETAIL CARD */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="text-lg font-bold text-slate-700 mb-8 flex items-center gap-2 border-b border-slate-100 pb-4">
            <User size={20} className="text-blue-600"/>
            Thông tin cá nhân
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            
            {/* ITEM 1 */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Calendar size={14} className="mr-1.5"/> Ngày sinh
              </label>
              <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                {formatDate(employee.ngaySinh)}
              </div>
            </div>

            {/* ITEM 2 */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Mail size={14} className="mr-1.5"/> Email Hệ thống
              </label>
              <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                {account?.email || "---"}
              </div>
            </div>

            {/* ITEM 3 */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <UserCircle size={14} className="mr-1.5"/> Giới tính
              </label>
              <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                {employee.gioiTinh || "---"}
              </div>
            </div>

            {/* ITEM 4 */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Phone size={14} className="mr-1.5"/> Số điện thoại
              </label>
              <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                {employee.soDienThoai || "---"}
              </div>
            </div>

            {/* ITEM 5 */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <CreditCard size={14} className="mr-1.5"/> Số CCCD / CMND
              </label>
              <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                {employee.cccd}
              </div>
            </div>

            {/* ITEM 6 */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <MapPin size={14} className="mr-1.5"/> Địa chỉ
              </label>
              <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                {employee.diaChi || "---"}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => toast.info("Liên hệ quản lý để cập nhật")}
            >
              Cập nhật thông tin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeProfilePage;