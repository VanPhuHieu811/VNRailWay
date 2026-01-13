import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ArrowLeft, Train } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import { GA_TAU_DB } from '../../services/db_mock';
import '../../styles/pages/ExchangeSelectSeatsPage.css'; // Tái sử dụng CSS của trang chọn ghế để đồng bộ

const ExchangeSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Nhận dữ liệu từ trang trước (ExchangeSelectSeatsPage)
  // Dữ liệu này được gói trong object 'state' của navigate
  const { oldTicket, seatsToExchange, exchangeValue } = location.state || {};

  // Default state cho form tìm kiếm (Lấy từ vé cũ)
  const [searchParams, setSearchParams] = useState({
    from: oldTicket?.tripInfo?.gaDi || 'HN', // Mã ga (VD: HN)
    to: oldTicket?.tripInfo?.gaDen || 'SG',  // Mã ga (VD: SG)
    date: new Date().toISOString().split('T')[0] // Mặc định hôm nay
  });

  // Nếu người dùng truy cập trực tiếp link mà không qua bước chọn vé cũ
  if (!oldTicket) {
    return (
        <div className="exchange-page-wrapper">
            <CustomerNavbar />
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-500">
                <p className="mb-4">Không tìm thấy thông tin vé cần đổi.</p>
                <button onClick={() => navigate('/my-tickets')} className="text-blue-600 underline font-medium">Quay lại Vé của tôi</button>
            </div>
        </div>
    );
  }

  const handleSearch = () => {
    // Chuyển sang trang Kết quả tìm kiếm
    navigate('/booking/search-results', { 
      state: { 
        // 1. Dữ liệu tìm kiếm
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.date,
        
        // 2. Cờ báo hiệu đổi vé
        isExchange: true, 
        
        // 3. Dữ liệu vé cũ (quan trọng để tính tiền sau này)
        exchangeData: {
            originalTicketCode: oldTicket.maVe,
            seatsToExchange: seatsToExchange, // Danh sách ID ghế cũ
            exchangeValue: exchangeValue      // Tổng tiền vé cũ
        }
      } 
    });
  };

  return (
    <div className="exchange-page-wrapper">
      
      {/* 1. NAVBAR FULL WIDTH */}
      <div className="exchange-header-full exchange-navbar-wrapper">
         <CustomerNavbar />
      </div>

      {/* 2. STEPS FULL WIDTH */}
      <div className="exchange-header-full exchange-steps-wrapper">
         {/* Bước 2: Tìm tàu mới */}
         <ExchangeSteps currentStep={2} />
      </div>

      {/* 3. MAIN CONTENT (Căn giữa, max-width) */}
      <div className="exchange-main-container">
        
        {/* Nút quay lại */}
        <div onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={20} /> Quay lại chọn ghế
        </div>

        <div className="max-w-4xl mx-auto">
            
            {/* Header Form */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3">
                    <Train className="text-blue-600" size={32}/> Tìm chuyến tàu thay thế
                </h2>
                <p className="text-slate-500 mt-2">Nhập thông tin hành trình mới mà bạn muốn đổi sang.</p>
            </div>

            {/* Card Form tìm kiếm */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    
                    {/* Ga Đi */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Ga đi</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-blue-600" size={20}/>
                            <select 
                                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg bg-white"
                                value={searchParams.from}
                                onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                            >
                                {GA_TAU_DB.map(g => (
                                    <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Ga Đến */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Ga đến</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-red-600" size={20}/>
                            <select 
                                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg bg-white"
                                value={searchParams.to}
                                onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                            >
                                {GA_TAU_DB.map(g => (
                                    <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Ngày đi */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Ngày đi mới</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-slate-500" size={20}/>
                            <input 
                                type="date"
                                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg"
                                value={searchParams.date}
                                onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={handleSearch}
                        className="btn-submit-exchange w-full md:w-auto md:px-12 flex items-center justify-center gap-2"
                    >
                        <Search size={20}/> Tìm chuyến tàu
                    </button>
                </div>
            </div>

            {/* Thông báo vé cũ */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-slate-600 flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-0.5">
                    <Train size={16}/>
                </div>
                <div>
                    <strong>Lưu ý:</strong> 
                    <p className="mt-1">
                        Bạn đang thực hiện đổi vé. Giá trị vé cũ (<strong>{exchangeValue.toLocaleString()} đ</strong>) sẽ được cấn trừ vào đơn hàng mới.
                        Phần chênh lệch (nếu có) sẽ được thanh toán thêm hoặc hoàn trả.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeSearchPage;