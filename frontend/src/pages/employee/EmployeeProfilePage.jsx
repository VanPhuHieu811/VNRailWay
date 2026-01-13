import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, CreditCard, UserCircle } from 'lucide-react';
import { NHAN_VIEN_DB } from '../../services/db_mock';
import '../../styles/pages/employee/EmployeeProfilePage.css';

const EmployeeProfilePage = () => {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    // 1. Lấy thông tin user đăng nhập
    const storedUser = JSON.parse(localStorage.getItem('employee'));
    
    if (storedUser) {
      // 2. Tìm chi tiết trong Mock DB
      const details = NHAN_VIEN_DB.find(e => e.maNhanVien === storedUser.maNhanVien);
      // Ưu tiên dữ liệu chi tiết từ bảng Nhân Viên, nếu không có thì dùng tạm từ LocalStorage
      setEmployee(details || storedUser);
    } else {
      // Fallback test
      setEmployee(NHAN_VIEN_DB[2]); 
    }
  }, []);

  if (!employee) return <div className="p-10 text-center">Đang tải thông tin...</div>;

  // Format ngày sinh
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Map loại nhân viên sang tiếng Việt cho đẹp
  const getRoleName = (role) => {
    switch(role) {
        case 'MANAGER': return 'Quản lý';
        case 'SALES': return 'Nhân viên Bán vé';
        case 'CREW': return 'Nhân viên Tàu';
        default: return role;
    }
  }

  return (
    <div className="profile-container">
      {/* HEADER: Avatar & Tên */}
      <div className="profile-header-card">
        <div className="avatar-large">
          {employee.hoTen ? employee.hoTen.charAt(0) : 'U'}
        </div>
        <div className="profile-basic-info">
          <h2>{employee.hoTen}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="role-badge">{getRoleName(employee.loaiNhanVien)}</span>
            <span className="text-slate-400 text-sm">|</span>
            <span className="text-slate-500 text-sm font-medium">MNV: {employee.maNhanVien}</span>
          </div>
        </div>
      </div>

      {/* BODY: Thông tin chi tiết (Dựa đúng theo Schema DB) */}
      <div className="detail-card">
        <h3 className="card-title">
          <User size={20} className="text-blue-600"/> Thông tin cá nhân
        </h3>
        
        <div className="info-grid">
          
          {/* Cột 1 */}
          <div className="info-column space-y-6">
            <div className="info-item">
              <label><Calendar size={14} className="inline mr-1"/> Ngày sinh</label>
              <p>{formatDate(employee.ngaySinh)}</p>
            </div>

            <div className="info-item">
              <label><UserCircle size={14} className="inline mr-1"/> Giới tính</label>
              <p>{employee.gioTinh || "---"}</p>
            </div>

            <div className="info-item">
              <label><CreditCard size={14} className="inline mr-1"/> Số CCCD / CMND</label>
              <p>{employee.cccd}</p>
            </div>
          </div>

          {/* Cột 2 */}
          <div className="info-column space-y-6">
            <div className="info-item">
              <label><Phone size={14} className="inline mr-1"/> Số điện thoại</label>
              <p>{employee.soDienThoai || employee.sdt}</p>
            </div>

            <div className="info-item">
              <label><MapPin size={14} className="inline mr-1"/> Địa chỉ</label>
              <p>{employee.diaChi}</p>
            </div>
          </div>

        </div>

        {/* Nút thao tác (Optional) */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold hover:bg-slate-50" onClick={() => alert("Chức năng đổi mật khẩu")}>
                Đổi mật khẩu
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700" onClick={() => alert("Chức năng cập nhật thông tin")}>
                Cập nhật thông tin
            </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;