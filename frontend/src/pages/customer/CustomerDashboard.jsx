import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // Import hook điều hướng
import { MapPin, Calendar, Clock, Search } from 'lucide-react';

// Import các thành phần phụ trợ
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import { GA_TAU_DB } from '../../services/db_mock'; // Dữ liệu danh sách Ga tàu
import '../../styles/pages/CustomerDashboard.css';  // CSS giao diện

const CustomerDashboard = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate(); // Khởi tạo hook điều hướng

  // Hàm xử lý khi nhấn nút Tìm kiếm
  const onSearch = (data) => {
    console.log("Dữ liệu form:", data);
    
    // Logic: Chuyển sang trang kết quả và gửi kèm dữ liệu tìm kiếm
    navigate('/booking/search-results', { 
      state: { 
        from: data.fromStation || 'Hà Nội',    // Mặc định nếu user không chọn
        to: data.toStation || 'TP.Hồ Chí Minh',
        date: data.date 
      } 
    });
  };

  return (
    <div className="dashboard-container">
      {/* Navbar riêng cho khách hàng */}
      <CustomerNavbar />

      {/* Hero Section (Phần nền xanh) */}
      <div className="hero-banner">
        <h1 className="hero-title">Đặt vé tàu trực tuyến</h1>
        <p className="hero-subtitle">Nhanh chóng, tiện lợi, an toàn trên mọi hành trình</p>
      </div>

      {/* Form Tìm kiếm (Card nổi) */}
      <div className="search-card-container">
        <div className="search-card">
          <form onSubmit={handleSubmit(onSearch)}>
            
            {/* Hàng 1: Ga đi - Ga đến */}
            <div className="search-grid">
              {/* Ga đi */}
              <div className="search-group">
                <label className="search-label"><MapPin size={16} /> Ga đi</label>
                <div className="search-input-wrapper">
                  <MapPin className="field-icon" size={20} />
                  <select 
                    {...register("fromStation")} 
                    className="search-select"
                    defaultValue="HN" // Mặc định chọn Hà Nội
                  >
                    <option value="">Chọn ga đi</option>
                    {GA_TAU_DB.map((ga) => (
                      <option key={ga.maGa} value={ga.tenGa}>{ga.tenGa}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ga đến */}
              <div className="search-group">
                <label className="search-label"><MapPin size={16} /> Ga đến</label>
                <div className="search-input-wrapper">
                  <MapPin className="field-icon text-red-500" size={20} />
                  <select 
                    {...register("toStation")} 
                    className="search-select"
                    defaultValue="SG" // Mặc định chọn Sài Gòn
                  >
                    <option value="">Chọn ga đến</option>
                    {GA_TAU_DB.map((ga) => (
                      <option key={ga.maGa} value={ga.tenGa}>{ga.tenGa}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Hàng 2: Ngày giờ */}
            <div className="search-grid">
              <div className="search-group">
                <label className="search-label"><Calendar size={16} /> Ngày khởi hành</label>
                <div className="search-input-wrapper">
                  <Calendar className="field-icon" size={20} />
                  <input 
                    type="date" 
                    {...register("date")} 
                    className="search-input"
                    defaultValue={new Date().toISOString().split('T')[0]} // Mặc định là hôm nay
                  />
                </div>
              </div>

              <div className="search-group">
                <label className="search-label"><Clock size={16} /> Giờ khởi hành (Tùy chọn)</label>
                <div className="search-input-wrapper">
                  <Clock className="field-icon" size={20} />
                  <input 
                    type="time" 
                    {...register("time")} 
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            {/* Nút Submit */}
            <button type="submit" className="btn-search">
              <Search size={20} /> Tìm chuyến tàu
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;