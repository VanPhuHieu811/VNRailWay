import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, Calendar, Clock, Search, ArrowLeft } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import ExchangeSteps from '../components/common/ExchangeSteps'; // Import Stepper Đổi vé
import { GA_TAU_DB } from '../services/db_mock';
import '../styles/pages/CustomerDashboard.css'; // Tái sử dụng CSS của Dashboard

const ExchangeSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  // Nhận dữ liệu từ trang trước (ExchangeSelectSeatsPage)
  const exchangeData = location.state; 

  // Nếu người dùng truy cập trực tiếp link mà không qua bước chọn vé cũ
  if (!exchangeData) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-4">Lỗi: Không tìm thấy thông tin vé cần đổi.</p>
        <button onClick={() => navigate('/my-tickets')} className="text-blue-600 underline">
          Quay lại Vé của tôi
        </button>
      </div>
    );
  }

  const { oldTicket } = exchangeData;

  const onSearch = (data) => {
    // Chuyển sang trang Kết quả tìm kiếm (Tái sử dụng trang SearchResultsPage)
    // Nhưng gửi kèm cờ "isExchange: true" để trang đó biết
    navigate('/booking/search-results', { 
      state: { 
        from: data.fromStation,
        to: data.toStation,
        date: data.date,
        isExchange: true, // CỜ QUAN TRỌNG: Báo hiệu đây là đổi vé
        exchangeData: exchangeData // Mang theo thông tin vé cũ và ghế cần đổi
      } 
    });
  };

  return (
    <div className="dashboard-container" style={{backgroundColor: '#f8fafc', minHeight: '100vh'}}>
      <CustomerNavbar />
      
      {/* Bước 3: Tìm tàu mới */}
      <ExchangeSteps currentStep={3} />

      <div className="search-card-container" style={{marginTop: '20px', padding: '0 20px'}}>
        {/* Nút quay lại */}
        <div onClick={() => navigate(-1)} className="btn-back mb-4 flex items-center gap-2 cursor-pointer text-slate-600 hover:text-blue-600">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Tìm chuyến tàu thay thế</h2>

        {/* Card Form tìm kiếm */}
        <div className="search-card" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'}}>
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
                    defaultValue={oldTicket.tripInfo.gaDi} // Tự điền ga cũ
                  >
                    <option value="">Chọn ga đi</option>
                    {GA_TAU_DB.map((ga) => <option key={ga.maGa} value={ga.tenGa}>{ga.tenGa}</option>)}
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
                    defaultValue={oldTicket.tripInfo.gaDen} // Tự điền ga cũ
                  >
                    <option value="">Chọn ga đến</option>
                    {GA_TAU_DB.map((ga) => <option key={ga.maGa} value={ga.tenGa}>{ga.tenGa}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Hàng 2: Ngày giờ */}
            <div className="search-grid">
              <div className="search-group">
                <label className="search-label"><Calendar size={16} /> Ngày khởi hành mới</label>
                <div className="search-input-wrapper">
                  <Calendar className="field-icon" size={20} />
                  <input 
                    type="date" 
                    {...register("date")} 
                    className="search-input" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]} // Mặc định hôm nay
                  />
                </div>
              </div>

              <div className="search-group">
                <label className="search-label"><Clock size={16} /> Giờ khởi hành</label>
                <div className="search-input-wrapper">
                  <Clock className="field-icon" size={20} />
                  <input type="time" {...register("time")} className="search-input" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-search">
              <Search size={20} /> Tìm tàu thay thế
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ExchangeSearchPage;