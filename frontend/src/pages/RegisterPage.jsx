import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { User, CreditCard, Calendar, Phone, MapPin, Mail, Lock, ShieldCheck } from 'lucide-react';

import { registerUser } from '../services/authService';

// QUAN TRỌNG: Import file CSS riêng
import '../styles/pages/RegisterPage.css';

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Gọi hàm giả lập API
      const response = await registerUser(data);
      toast.success(response.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <div className="header-icon-box">
            <User size={32} />
          </div>
          <div>
            <h1 className="register-title">Đăng ký tài khoản</h1>
            <p className="register-subtitle">Tạo tài khoản để đặt vé trực tuyến</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* --- Phần 1: Thông tin cá nhân --- */}
          <h2 className="section-title">
            <User size={18} color="#0891b2"/> Thông tin cá nhân
          </h2>
          
          <div className="form-row">
            {/* CMND/CCCD */}
            <div className="form-group">
              <label className="form-label">CMND/CCCD <span className="required">*</span></label>
              <div className="input-wrapper">
                <input 
                  {...register("cmnd", { required: "Vui lòng nhập CMND/CCCD" })}
                  className={`form-input ${errors.cmnd ? 'error' : ''}`}
                  placeholder="Nhập số CMND/CCCD"
                />
                <CreditCard className="input-icon" size={18}/>
              </div>
              {errors.cmnd && <p className="error-message">{errors.cmnd.message}</p>}
            </div>

            {/* Họ và tên */}
            <div className="form-group">
              <label className="form-label">Họ và tên <span className="required">*</span></label>
              <input 
                {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                className="form-input"
                placeholder="Nhập họ tên đầy đủ"
              />
              {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
            </div>
          </div>

          <div className="form-row">
            {/* Ngày sinh */}
            <div className="form-group">
              <label className="form-label">Ngày sinh <span className="required">*</span></label>
              <div className="input-wrapper">
                <input 
                  type="date"
                  {...register("dob", { required: "Vui lòng chọn ngày sinh" })}
                  className="form-input"
                />
                <Calendar className="input-icon" size={18}/>
              </div>
              {errors.dob && <p className="error-message">{errors.dob.message}</p>}
            </div>

            {/* Số điện thoại */}
            <div className="form-group">
              <label className="form-label">Số điện thoại <span className="required">*</span></label>
              <div className="input-wrapper">
                <input 
                  {...register("phone", { 
                    required: "Vui lòng nhập SĐT",
                    pattern: { value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/, message: "SĐT không hợp lệ" }
                  })}
                  className="form-input"
                  placeholder="Nhập số điện thoại"
                />
                <Phone className="input-icon" size={18}/>
              </div>
              {errors.phone && <p className="error-message">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Địa chỉ (Full width) */}
          <div className="form-group full-width">
            <label className="form-label">Địa chỉ <span className="required">*</span></label>
            <div className="input-wrapper">
              <input 
                {...register("address", { required: "Vui lòng nhập địa chỉ" })}
                className="form-input"
                placeholder="Nhập địa chỉ đầy đủ"
              />
              <MapPin className="input-icon" size={18}/>
            </div>
            {errors.address && <p className="error-message">{errors.address.message}</p>}
          </div>

          {/* Email (Full width) */}
          <div className="form-group full-width" style={{marginTop: '20px'}}>
            <label className="form-label">Email <span className="required">*</span></label>
            <div className="input-wrapper">
              <input 
                {...register("email", { 
                  required: "Vui lòng nhập Email",
                  pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
                })}
                className="form-input"
                placeholder="example@email.com"
              />
              <Mail className="input-icon" size={18}/>
            </div>
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          <hr className="divider" />

          {/* --- Phần 2: Thông tin đăng nhập --- */}
          <h2 className="section-title">
            <ShieldCheck size={18} color="#0891b2"/> Thông tin đăng nhập
          </h2>
          
          <div className="form-group full-width">
            <label className="form-label">Tên đăng nhập <span className="required">*</span></label>
            <input 
              {...register("username", { required: "Vui lòng nhập tên đăng nhập" })}
              className="form-input"
              placeholder="Chọn tên đăng nhập"
            />
            {errors.username && <p className="error-message">{errors.username.message}</p>}
          </div>

          <div className="form-row" style={{marginTop: '20px'}}>
            <div className="form-group">
              <label className="form-label">Mật khẩu <span className="required">*</span></label>
              <div className="input-wrapper">
                <input 
                  type="password"
                  {...register("password", { 
                    required: "Vui lòng nhập mật khẩu",
                    minLength: { value: 6, message: "Mật khẩu phải trên 6 ký tự" }
                  })}
                  className="form-input"
                  placeholder="Nhập mật khẩu"
                />
                <Lock className="input-icon" size={18}/>
              </div>
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu <span className="required">*</span></label>
              <input 
                type="password"
                {...register("confirmPassword", { 
                  required: "Vui lòng nhập lại mật khẩu",
                  validate: value => value === password || "Mật khẩu không khớp"
                })}
                className="form-input"
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <div className="login-redirect">
          Đã có tài khoản? <Link to="/login" className="login-link">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;