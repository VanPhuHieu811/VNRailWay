import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogIn } from 'lucide-react'; 
import { loginUser } from '../services/authService';
import '../styles/pages/LoginPage.css'; 

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- HÀM ĐIỀU HƯỚNG ---
  const handleRoleRedirect = (role) => {
    // Chuẩn hóa role về chữ hoa để so sánh
    const upperRole = role?.toUpperCase();

    if (upperRole === 'CUSTOMER') {
      navigate('/customer/dashboard');
    } 
    // Tất cả các role nhân viên đều đưa về cổng chung '/employee'
    // App.jsx sẽ lo việc phân luồng chi tiết (Crew -> Lịch, Sales -> Vé...)
    else if (['MANAGER', 'SALES', 'CREW'].includes(upperRole)) {
      navigate('/employee'); 
    } 
    else {  
      console.warn("Role không xác định:", role);
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      
      // 1. Lưu thông tin chung
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // 2. QUAN TRỌNG: Lưu key 'employee' nếu không phải khách hàng
      // Để EmployeeLayout và App.jsx có thể đọc được role
      if (response.data.role !== 'CUSTOMER') {
         localStorage.setItem('employee', JSON.stringify(response.data));
      }

      toast.success(`Chào mừng ${response.data.fullName}!`);
      
      setTimeout(() => {
        handleRoleRedirect(response.data.role);
      }, 1000);

    } catch (error) {
      toast.error(error.message);
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
           <p className="text-xs text-gray-400 mb-2">Test: sales/123, crew/123, admin/123</p>
           Chưa có tài khoản? <Link to="/register" className="link-highlight">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;