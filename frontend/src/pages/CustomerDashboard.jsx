import React from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Calendar, Clock, Search } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import { GA_TAU_DB } from '../services/db_mock';
import '../styles/pages/CustomerDashboard.css';

const CustomerDashboard = () => {
  const { register, handleSubmit } = useForm();

  const onSearch = (data) => {
    console.log("Dữ liệu tìm kiếm:", data);
    alert(`Đang tìm chuyến từ ${data.fromStation} đến ${data.toStation} ngày ${data.date}`);
    // Sau này sẽ gọi API tìm chuyến ở đây
  };

  return (
    <div className="dashboard-container">
      <CustomerNavbar />

      {/* Hero Section */}
      <div className="hero-banner">
        <h1 className="hero-title">Đặt vé tàu trực tuyến</h1>
        <p className="hero-subtitle">Nhanh chóng, tiện lợi, an toàn</p>
      </div>

      {/* Form Tìm kiếm */}
      <div className="search-card-container">
        <div className="search-card">
          <form onSubmit={handleSubmit(onSearch)}>
            
            {/* Hàng 1: Ga đi - Ga đến */}
            <div className="search-grid">
              <div className="search-group">
                <label className="search-label"><MapPin size={16} /> Ga đi</label>
                <div className="search-input-wrapper">
                  <MapPin className="field-icon" size={20} />
                  <select 
                    {...register("fromStation")} 
                    className="search-select"
                  >
                    <option value="">Chọn ga đi</option>
                    {GA_TAU_DB.map((ga) => (
                      <option key={ga.maGa} value={ga.maGa}>{ga.tenGa}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-group">
                <label className="search-label"><MapPin size={16} /> Ga đến</label>
                <div className="search-input-wrapper">
                  <MapPin className="field-icon text-red-500" size={20} />
                  <select 
                    {...register("toStation")} 
                    className="search-select"
                  >
                    <option value="">Chọn ga đến</option>
                    {GA_TAU_DB.map((ga) => (
                      <option key={ga.maGa} value={ga.maGa}>{ga.tenGa}</option>
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

            {/* Nút Tìm kiếm */}
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