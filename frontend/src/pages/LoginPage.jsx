import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogIn } from 'lucide-react';

// Đảm bảo import đúng tên file service bạn đã tạo
import { loginUser, getCurrentUserInfo } from '../services/authApi'; 
import { getMyProfileService } from '../services/staffApi';
import '../styles/pages/LoginPage.css';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- HÀM 1: CHUYỂN ĐỔI ROLE (QUAN TRỌNG) ---
  // Nhận vào Role từ bảng Tài Khoản VÀ Chức danh từ bảng Nhân Viên
  const mapRoleToAppCode = (dbRole, jobTitle = '') => {
    
    // 1. Ưu tiên kiểm tra chức danh cụ thể (Job Title)
    // Nếu là Lái tàu, Tiếp viên, Trưởng tàu... -> Gán là CREW
    const lowerJob = jobTitle ? jobTitle.toLowerCase() : '';
    if (lowerJob.includes('lái tàu') || 
        lowerJob.includes('tiếp viên') || 
        lowerJob.includes('trưởng tàu') || 
        lowerJob.includes('kỹ thuật')) {
        return 'CREW';
    }

    // 2. Nếu không có chức danh đặc biệt, kiểm tra Role trong DB
    if (!dbRole) return 'CUSTOMER';
    const normalizedRole = dbRole.trim(); 

    switch (normalizedRole) {
      case 'Khách hàng': return 'CUSTOMER';
      case 'Quản lý':    return 'MANAGER';
      case 'Bán vé':     return 'SALES';
      case 'Nhân viên':  return 'CREW'; 
      default:           return 'CUSTOMER';
    }
  };

  // --- HÀM 2: ĐIỀU HƯỚNG ---
  const handleRoleRedirect = (appRole) => {
    console.log("Redirecting for App Role:", appRole);

    switch (appRole) {
      case 'CUSTOMER':
        navigate('/customer/dashboard');
        break;
      case 'MANAGER':
        navigate('/employee'); 
        break;
      case 'SALES':
        navigate('/employee'); 
        break;
      case 'CREW':
        navigate('/employee'); 
        break;
      default:
        navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const loginResponse = await loginUser(data);
      const { token, user: accountInfo } = loginResponse.data;

      if (!token) throw new Error("Không nhận được token xác thực.");
      
      localStorage.setItem('token', token);

      let fullUserData = {};
      let dbRoleRaw = accountInfo.VaiTro; 
      let finalAppRole = '';

      if (accountInfo.MaNV) {
        try {
          const staffRes = await getMyProfileService();
          
          const staffData = staffRes.data.nhanVien; 
          
          finalAppRole = mapRoleToAppCode(dbRoleRaw, staffData.loaiNhanVien);

          fullUserData = {
            ...accountInfo,
            ...staffData,
            role: finalAppRole,
            originalRole: dbRoleRaw, 
            fullName: staffData.hoTen 
          };

          localStorage.setItem('employee', JSON.stringify(fullUserData));

        } catch (err) {
          console.error("Lỗi lấy thông tin nhân viên:", err);
          throw new Error("Tài khoản nhân viên chưa được cấu hình hồ sơ.");
        }

      } else {
        try {
          const userRes = await getCurrentUserInfo();
          const customerData = userRes.data.khachHang || {};
          
          finalAppRole = 'CUSTOMER';

          fullUserData = {
            ...accountInfo,
            ...customerData,
            role: finalAppRole,
            fullName: customerData.hoTen || accountInfo.TenTaiKhoan
          };

        } catch (err) {
          finalAppRole = 'CUSTOMER';
          fullUserData = { ...accountInfo, role: finalAppRole, fullName: accountInfo.TenTaiKhoan };
        }
      }

      localStorage.setItem('user', JSON.stringify(fullUserData));

      toast.success(`Xin chào, ${fullUserData.fullName}!`);
      
      setTimeout(() => {
        handleRoleRedirect(finalAppRole);
      }, 1000);

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-box"><LogIn size={28} /></div>
          <div>
            <h1 className="login-title">Đăng nhập</h1>
            <p className="login-subtitle">Hệ thống VNRailway</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input 
              {...register("username", { required: "Vui lòng nhập tên đăng nhập" })}
              className="form-input" placeholder="Nhập tên đăng nhập"
            />
            {errors.username && <p className="error-text">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password"
              {...register("password", { required: "Vui lòng nhập mật khẩu" })}
              className="form-input" placeholder="Nhập mật khẩu"
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-login">
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        
        <div className="login-footer">
           Chưa có tài khoản? <Link to="/register" className="link-highlight">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;