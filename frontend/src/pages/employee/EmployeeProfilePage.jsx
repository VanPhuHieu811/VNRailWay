import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, MapPin, Calendar, CreditCard, 
  UserCircle, Loader, Mail, Shield, Save, X 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import API mới
import { getMyProfileService, updateMyProfileService } from '../../services/staffApi'; 

const EmployeeProfilePage = () => {
  const [employee, setEmployee] = useState(null);
  const [account, setAccount] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // State cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

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
        // Khởi tạo dữ liệu form ban đầu
        setFormData({
            hoTen: res.data.nhanVien.hoTen,
            ngaySinh: res.data.nhanVien.ngaySinh ? res.data.nhanVien.ngaySinh.split('T')[0] : '',
            gioiTinh: res.data.nhanVien.gioiTinh,
            soDienThoai: res.data.nhanVien.soDienThoai,
            cccd: res.data.nhanVien.cccd,
            diaChi: res.data.nhanVien.diaChi
        });
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

  // Hàm xử lý Lưu thông tin
  const handleSave = async () => {
    try {
        setIsSaving(true);
        // Gọi API cập nhật
        const res = await updateMyProfileService(formData);

        if (res && res.success) {
            toast.success("Cập nhật thông tin thành công!");
            // Cập nhật lại state hiển thị
            setEmployee({ ...employee, ...formData });
            setIsEditing(false); // Tắt chế độ sửa
        } else {
            toast.error(res?.message || "Cập nhật thất bại.");
        }
    } catch (error) {
        console.error("Lỗi lưu profile:", error);
        toast.error("Có lỗi xảy ra khi lưu.");
    } finally {
        setIsSaving(false);
    }
  };

  // Hàm xử lý Hủy bỏ
  const handleCancel = () => {
      // Reset form về dữ liệu gốc
      setFormData({
        hoTen: employee.hoTen,
        ngaySinh: employee.ngaySinh ? employee.ngaySinh.split('T')[0] : '',
        gioiTinh: employee.gioiTinh,
        soDienThoai: employee.soDienThoai,
        cccd: employee.cccd,
        diaChi: employee.diaChi
      });
      setIsEditing(false);
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
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white">
              {employee.hoTen ? employee.hoTen.charAt(0).toUpperCase() : 'N'}
            </div>
          </div>
          
          <div className="text-center md:text-left w-full">
            {/* Nếu đang sửa thì hiện Input Họ tên */}
            {isEditing ? (
                <input 
                    type="text" 
                    className="text-2xl font-extrabold text-slate-800 mb-2 border-b-2 border-blue-500 focus:outline-none w-full md:w-auto bg-transparent"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                />
            ) : (
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{employee.hoTen}</h2>
            )}
            
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
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
             <div className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <User size={20} className="text-blue-600"/>
                Thông tin cá nhân
             </div>
             {isEditing && <span className="text-sm text-blue-600 font-medium animate-pulse">Đang chỉnh sửa...</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            
            {/* 1. NGÀY SINH */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Calendar size={14} className="mr-1.5"/> Ngày sinh
              </label>
              {isEditing ? (
                  <input 
                    type="date"
                    className="text-base font-semibold text-slate-800 pb-1 border-b border-slate-300 focus:border-blue-500 outline-none w-full"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})}
                  />
              ) : (
                  <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                    {formatDate(employee.ngaySinh)}
                  </div>
              )}
            </div>

            {/* 2. EMAIL (KHÔNG ĐƯỢC SỬA) */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Mail size={14} className="mr-1.5"/> Email Hệ thống
              </label>
              <div className="text-base font-semibold text-slate-500 pb-2 border-b border-slate-100 min-h-[32px] cursor-not-allowed bg-slate-50 px-2 rounded">
                {account?.email || "---"} 
              </div>
            </div>

            {/* 3. GIỚI TÍNH */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <UserCircle size={14} className="mr-1.5"/> Giới tính
              </label>
              {isEditing ? (
                  <select 
                    className="text-base font-semibold text-slate-800 pb-1 border-b border-slate-300 focus:border-blue-500 outline-none w-full bg-white"
                    value={formData.gioiTinh}
                    onChange={(e) => setFormData({...formData, gioiTinh: e.target.value})}
                  >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                  </select>
              ) : (
                  <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                    {employee.gioiTinh || "---"}
                  </div>
              )}
            </div>

            {/* 4. SỐ ĐIỆN THOẠI */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Phone size={14} className="mr-1.5"/> Số điện thoại
              </label>
              {isEditing ? (
                  <input 
                    type="text"
                    className="text-base font-semibold text-slate-800 pb-1 border-b border-slate-300 focus:border-blue-500 outline-none w-full"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({...formData, soDienThoai: e.target.value})}
                  />
              ) : (
                  <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                    {employee.soDienThoai || "---"}
                  </div>
              )}
            </div>

            {/* 5. CCCD */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <CreditCard size={14} className="mr-1.5"/> Số CCCD / CMND
              </label>
              {isEditing ? (
                  <input 
                    type="text"
                    className="text-base font-semibold text-slate-800 pb-1 border-b border-slate-300 focus:border-blue-500 outline-none w-full"
                    value={formData.cccd}
                    onChange={(e) => setFormData({...formData, cccd: e.target.value})}
                  />
              ) : (
                  <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                    {employee.cccd}
                  </div>
              )}
            </div>

            {/* 6. ĐỊA CHỈ */}
            <div className="flex flex-col">
              <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <MapPin size={14} className="mr-1.5"/> Địa chỉ
              </label>
              {isEditing ? (
                  <input 
                    type="text"
                    className="text-base font-semibold text-slate-800 pb-1 border-b border-slate-300 focus:border-blue-500 outline-none w-full"
                    value={formData.diaChi}
                    onChange={(e) => setFormData({...formData, diaChi: e.target.value})}
                  />
              ) : (
                  <div className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100 min-h-[32px]">
                    {employee.diaChi || "---"}
                  </div>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
            {isEditing ? (
                <>
                    <button 
                        className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        <X size={16}/> Hủy
                    </button>
                    <button 
                        className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-green-600 text-white border border-green-600 hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader className="animate-spin" size={16}/> : <Save size={16}/>}
                        Lưu thay đổi
                    </button>
                </>
            ) : (
                <button 
                    className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => setIsEditing(true)}
                >
                    Cập nhật thông tin
                </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeProfilePage;