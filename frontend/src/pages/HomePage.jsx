import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, Clock, CreditCard, UserPlus, LogIn } from 'lucide-react';
import '../styles/pages/HomePage.css'; // Import file CSS

const HomePage = () => {
  return (
    <div className="home-container">
      
      {/* --- Phần Hero --- */}
      <div className="hero-section">
        {/* Logo Icon */}
        <div className="logo-box">
          <Ticket size={32} />
        </div>

        {/* Tiêu đề */}
        <h1 className="hero-title">
          Hệ thống đặt vé <span className="highlight-text">Trực tuyến</span>
        </h1>
        
        <p className="hero-subtitle">
          Đặt vé nhanh chóng, dễ dàng và an toàn. Tạo tài khoản để bắt đầu trải nghiệm dịch vụ của chúng tôi ngay hôm nay.
        </p>

        {/* Nút bấm điều hướng */}
        <div className="action-buttons">
          <Link to="/register" className="btn-primary">
            <UserPlus size={18} style={{marginRight: '8px', display: 'inline'}}/>
            Đăng ký ngay
          </Link>
          
          <Link to="/login" className="btn-outline">
            <LogIn size={18} style={{marginRight: '8px', display: 'inline'}}/>
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* --- Phần 3 Thẻ Tính năng --- */}
      <div className="features-grid">
        {/* Thẻ 1 */}
        <div className="feature-card">
          <div className="feature-icon bg-blue">
            <ShieldCheck size={20} />
          </div>
          <h3 className="feature-title">An toàn & Bảo mật</h3>
          <p className="feature-desc">Thông tin của bạn được mã hóa và bảo vệ với công nghệ tiên tiến nhất.</p>
        </div>

        {/* Thẻ 2 */}
        <div className="feature-card">
          <div className="feature-icon bg-green">
            <Clock size={20} />
          </div>
          <h3 className="feature-title">Nhanh chóng</h3>
          <p className="feature-desc">Đặt vé chỉ trong vài phút với giao diện thân thiện và dễ sử dụng.</p>
        </div>

        {/* Thẻ 3 */}
        <div className="feature-card">
          <div className="feature-icon bg-purple">
            <CreditCard size={20} />
          </div>
          <h3 className="feature-title">Thanh toán linh hoạt</h3>
          <p className="feature-desc">Hỗ trợ nhiều phương thức thanh toán phù hợp với nhu cầu của bạn.</p>
        </div>
      </div>

    </div>
  );
};

export default HomePage;