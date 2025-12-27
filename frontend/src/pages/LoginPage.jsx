import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogIn } from 'lucide-react'; // Icon

import { loginUser } from '../services/authService';
import '../styles/pages/LoginPage.css'; 

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm xử lý sau khi API trả về thành công
  const handleRoleRedirect = (role) => {
    const roleLower = role.toLowerCase(); 

    if (roleLower === 'quản trị') {
      navigate('/admin/dashboard');
    } else if (roleLower === 'nhân viên') {
      navigate('/manager/dashboard');
    } else if (roleLower === 'khách hàng') {
      navigate('/customer/dashboard'); 
    } else {  
      console.warn("Role không xác định:", role);
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      
      // Lưu thông tin vào localStorage (để dùng cho các trang sau này)
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);

      toast.success(`Chào mừng ${response.data.fullName}!`);
      
      // Đợi 1s để user đọc thông báo rồi mới chuyển trang
      setTimeout(() => {
        handleRoleRedirect(response.data.role);
      }, 1000);

    } catch (error) {
      toast.error(error.message); // Hiển thị lỗi (Use case 2.2.1)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-center" autoClose={2000} />
      
      <div className="login-card">
        {/* Header giống hình */}
        <div className="login-header">
          <div className="login-icon-box">
            <LogIn size={28} />
          </div>
          <div>
            <h1 className="login-title">Đăng nhập</h1>
            <p className="login-subtitle">Truy cập vào tài khoản của bạn</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Tên đăng nhập */}
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input 
              {...register("username", { required: "Vui lòng nhập tên đăng nhập" })}
              className="form-input"
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && <p className="error-text">{errors.username.message}</p>}
          </div>

          {/* Mật khẩu */}
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password"
              {...register("password", { required: "Vui lòng nhập mật khẩu" })}
              className="form-input"
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          {/* Nút Đăng nhập */}
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