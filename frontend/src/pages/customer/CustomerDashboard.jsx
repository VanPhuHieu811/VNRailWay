import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search } from 'lucide-react';

import CustomerNavbar from '../../components/layout/CustomerNavbar';
import { scheduleApi } from '../../services/scheduleApi'; // Import API
import '../../styles/pages/CustomerDashboard.css';

const CustomerDashboard = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  
  // State lưu danh sách ga lấy từ API
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. LẤY DANH SÁCH GA TỪ API KHI MỞ TRANG
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await scheduleApi.getStations();
        if (res.success) {
          setStations(res.data); // data gồm: { MaGaTau, TenGa }
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách ga:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStations();
  }, []);

  const onSearch = (data) => {
    console.log("Dữ liệu form:", data);
    
    // 2. CHUYỂN TRANG VÀ GỬI MÃ GA (Backend cần Mã, không phải Tên)
    navigate('/booking/search-results', { 
      state: { 
        from: data.fromStation, // Đây sẽ là Mã (VD: GA_HN) do value option bên dưới
        to: data.toStation,     // Đây sẽ là Mã (VD: GA_SG)
        date: data.date ,
        time: data.time || null
      } 
    });
  };

  return (
    <div className="dashboard-container">
      <CustomerNavbar />

      <div className="hero-banner">
        <h1 className="hero-title">Đặt vé tàu trực tuyến</h1>
        <p className="hero-subtitle">Nhanh chóng, tiện lợi, an toàn trên mọi hành trình</p>
      </div>

      <div className="search-card-container">
        <div className="search-card">
          <form onSubmit={handleSubmit(onSearch)}>
            
            <div className="search-grid">
              {/* Select Ga Đi */}
              <div className="search-group">
                <label className="search-label"><MapPin size={16} /> Ga đi</label>
                <div className="search-input-wrapper">
                  <MapPin className="field-icon" size={20} />
                  <select 
                    {...register("fromStation", { required: true })} 
                    className="search-select"
                  >
                    <option value="">{isLoading ? "Đang tải..." : "Chọn ga đi"}</option>
                    {stations.map((ga) => (
                      // Value là MA_GA_TAU (GA_HN), hiển thị là TEN_GA (Hà Nội)
                      <option key={ga.MaGaTau} value={ga.MaGaTau}>{ga.TenGa}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Ga Đến */}
              <div className="search-group">
                <label className="search-label"><MapPin size={16} /> Ga đến</label>
                <div className="search-input-wrapper">
                  <MapPin className="field-icon text-red-500" size={20} />
                  <select 
                    {...register("toStation", { required: true })} 
                    className="search-select"
                  >
                    <option value="">{isLoading ? "Đang tải..." : "Chọn ga đến"}</option>
                    {stations.map((ga) => (
                      <option key={ga.MaGaTau} value={ga.MaGaTau}>{ga.TenGa}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="search-grid">
              <div className="search-group">
                <label className="search-label"><Calendar size={16} /> Ngày khởi hành</label>
                <div className="search-input-wrapper">
                  <Calendar className="field-icon" size={20} />
                  <input 
                    type="date" 
                    {...register("date", { required: true })} 
                    className="search-input"
                    defaultValue={new Date().toISOString().split('T')[0]} 
                  />
                </div>
              </div>
              
              {/* Giờ khởi hành giữ nguyên (Option) */}
              <div className="search-group">
                <label className="search-label"><Clock size={16} /> Giờ khởi hành (Tùy chọn)</label>
                <div className="search-input-wrapper">
                    <Clock className="field-icon" size={20} />
                    <input type="time" {...register("time")} className="search-input"/>
                </div>
              </div>
            </div>

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