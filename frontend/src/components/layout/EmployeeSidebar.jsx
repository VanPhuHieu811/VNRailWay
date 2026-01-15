import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  // Icon chung
  Train, LogOut, DollarSign, User,
  // Icon cho Crew
  Calendar, FileText, 
  // Icon cho Sales
  Ticket, RefreshCw, Search,
  // Icon cho Manager
  BarChart3, Users, FileCheck, CreditCard,
  // Icon MỚI (Thêm vào)
  Map,      // Cho Chuyến tàu
  Percent   // Cho Ưu đãi
} from 'lucide-react';

// Import file CSS
import '../../styles/layout/EmployeeSidebar.css';
// 1. Import API Service
import { getMyProfileService } from '../../services/staffApi';

const EmployeeSidebar = ({ userRole, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);
  
  // 2. Thêm State để lưu tên nhân viên
  const [fullName, setFullName] = useState('Nhân viên');

  // 3. Gọi API lấy thông tin nhân viên khi Sidebar được load
  useEffect(() => {
    const fetchStaffInfo = async () => {
      try {
        const res = await getMyProfileService();
        if (res && res.success && res.data.nhanVien) {
          setFullName(res.data.nhanVien.hoTen);
        }
      } catch (error) {
        // Nếu lỗi thì giữ nguyên mặc định là 'Nhân viên', không chặn giao diện
        console.error("Không thể lấy tên nhân viên cho Sidebar", error);
      }
    };

    fetchStaffInfo();
  }, []);

  // Helper: Lấy chữ cái đầu của tên để làm Avatar
  const getAvatarChar = (name) => {
      return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Helper component để render từng mục menu
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      className={`nav-item ${isActive(to) ? 'active' : ''}`} 
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  const GroupLabel = ({ label }) => (
    <p className="menu-group-label">
      {label}
    </p>
  );

  // Helper hiển thị tên role tiếng Việt
  const getRoleDisplayName = (role) => {
      switch(role) {
          case 'MANAGER': return 'Quản lý';
          case 'SALES': return 'Bán vé';
          case 'CREW': return 'Tổ tàu';
          default: return 'Nhân viên';
      }
  };

  return (
    <div className="sidebar-container">
      {/* 1. LOGO AREA */}
      <div className="sidebar-header">
        <div className="logo-icon-box">
          <Train size={24} />
        </div>
        <span className="logo-text">VNR Staff</span>
      </div>

      {/* 2. MENU ITEMS */}
      <div className="sidebar-menu">
        
        {/* --- NHÓM CREW (Lái tàu, Toa tàu, Trưởng tàu) --- */}
        {userRole === 'CREW' && (
          <>
            <GroupLabel label="Công việc" />
            <NavItem to="/employee/schedule" icon={Calendar} label="Xem lịch làm việc" />
            <NavItem to="/employee/leave-request" icon={FileText} label="Đơn nghỉ phép" />
          </>
        )}

        {/* --- NHÓM SALES (Nhân viên bán vé) --- */}
        {userRole === 'SALES' && (
          <>
            <GroupLabel label="Nghiệp vụ vé" />
            <NavItem to="/employee/sales/counter" icon={Ticket} label="Bán vé tại quầy" />
            <NavItem to="/employee/sales/exchange" icon={RefreshCw} label="Đổi vé" />
            <NavItem to="/employee/sales/history" icon={Search} label="Tra cứu khách hàng" />
          </>
        )}

        {/* --- NHÓM MANAGER (Quản lý) --- */}
        {userRole === 'MANAGER' && (
          <>
            <GroupLabel label="Quản trị hệ thống" />
            <NavItem to="/employee/manager/revenue" icon={BarChart3} label="Báo cáo doanh thu" />
            <NavItem to="/employee/manager/staff" icon={Users} label="Nhân sự" />
            <NavItem to="/employee/manager/approve-leave" icon={FileCheck} label="Duyệt nghỉ phép" />
            <NavItem to="/employee/manager/routes-stations" icon={FileCheck} label="Tuyến/ga" />
            <NavItem to="/employee/manager/trains" icon={Train} label="Đoàn tàu & Toa" />
            <NavItem to="/employee/manager/trips" icon={Map} label="Chuyến tàu" />
            <NavItem to="/employee/manager/pricing" icon={CreditCard} label="Giá vé" />
            <NavItem to="/employee/manager/discounts" icon={Percent} label="Ưu đãi" />
          </>
        )}

        {/* --- CHỨC NĂNG CHUNG (Tất cả nhân viên đều có) --- */}
        <GroupLabel label="Cá nhân" />
        
        <NavItem to="/employee/profile" icon={User} label="Thông tin cá nhân" />
        <NavItem to="/employee/salary" icon={DollarSign} label="Thông tin lương" />

      </div>

      {/* 3. FOOTER (User Info & Logout) */}
      <div className="sidebar-footer">
        {/* Click vào user info để sang trang Profile */}
        <Link to="/employee/profile" className="user-info-box" style={{textDecoration: 'none', cursor: 'pointer'}}>
          <div className="user-avatar">
            {getAvatarChar(fullName)}
          </div>
          <div className="user-details">
            {/* 5. Hiển thị tên thật từ API */}
            <p className="user-name" title={fullName}>{fullName}</p>
            <p className="user-role">{getRoleDisplayName(userRole)}</p>
          </div>
        </Link>
        
        <button onClick={onLogout} className="btn-logout-sidebar">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;