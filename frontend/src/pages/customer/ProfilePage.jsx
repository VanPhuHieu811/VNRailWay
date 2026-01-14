import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Save, CreditCard, LogOut } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import { VE_DA_DAT_DB } from '../../services/db_mock'; 
import '../../styles/pages/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  
  const [currentUser, setCurrentUser] = useState({});
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user')) || {};
    setCurrentUser(savedUser);

    setValue('fullName', savedUser.fullName || 'Nguyễn Văn A');
    setValue('email', savedUser.email || 'nguyenvana@example.com');
    setValue('phone', savedUser.phone || '0123456789');
    
    setTicketCount(VE_DA_DAT_DB.length); 
  }, [setValue]);

  const onUpdateInfo = (data) => {
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    toast.success("Cập nhật thông tin thành công!");
  };

  const onChangePassword = (data) => {
    toast.info("Chức năng đổi mật khẩu đang được xử lý...");
  };

  const handleLogout = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirm) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <div className="profile-page-wrapper">
      
      {/* 1. NAVBAR FULL WIDTH (Nằm tách biệt để phủ kín ngang) */}
      <div className="profile-header-full">
         <CustomerNavbar />
      </div>

      <ToastContainer position="top-right" autoClose={2000} />

      {/* 2. MAIN CONTENT (Căn giữa bởi max-width) */}
      <div className="profile-main-container">
        
        <div className="page-header">
          <h1 className="page-title">Tài khoản của tôi</h1>
          <p className="page-subtitle">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        <div className="profile-grid">
          
          {/* CỘT TRÁI: FORM */}
          <div className="profile-main">
            
            {/* Card Thông tin cá nhân */}
            <div className="profile-card">
              <div className="card-header">
                <User size={20} className="text-blue-500" />
                Thông tin cá nhân
              </div>
              <form onSubmit={handleSubmit(onUpdateInfo)}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input {...register("fullName")} className="form-input" placeholder="Nhập họ tên" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input {...register("email")} className="form-input" disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input {...register("phone")} className="form-input" placeholder="Nhập số điện thoại" />
                </div>
                <button type="submit" className="btn-save">
                  <Save size={16} /> Cập nhật thông tin
                </button>
              </form>
            </div>

            {/* Card Đổi mật khẩu */}
            <div className="profile-card">
              <div className="card-header">
                <Lock size={20} className="text-blue-500" />
                Đổi mật khẩu
              </div>
              <form onSubmit={handleSubmit(onChangePassword)}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input type="password" className="form-input" placeholder="Nhập mật khẩu hiện tại" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <input type="password" className="form-input" placeholder="Nhập mật khẩu mới" />
                </div>
                <button type="button" className="btn-save" style={{backgroundColor: '#64748b'}}>
                  <Lock size={16} /> Đổi mật khẩu
                </button>
              </form>
            </div>
          </div>

          {/* CỘT PHẢI: SIDEBAR PROFILE */}
          <div className="profile-sidebar">
            <div className="profile-card" style={{textAlign: 'center'}}>
              
              <div className="avatar-section">
                <div className="avatar-circle">
                  <User size={40} />
                </div>
                <h3 className="user-name-large">{currentUser.fullName}</h3>
                <p className="user-email-small">{currentUser.email}</p>
              </div>

              <div className="stats-divider"></div>

              <div className="stat-row">
                <span className="stat-label flex items-center gap-2">
                  <CreditCard size={14}/> Số vé đã đặt
                </span>
                <span className="stat-value">{ticketCount}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label flex items-center gap-2">
                  <User size={14}/> Thành viên từ
                </span>
                <span className="stat-value">01/2024</span>
              </div>

              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={16} /> Đăng xuất
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;