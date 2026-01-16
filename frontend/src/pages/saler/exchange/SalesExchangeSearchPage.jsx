import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ArrowRight, ArrowLeft, Calendar, 
  MapPin, Clock, Ticket, ArrowRightLeft, Train, Filter 
} from 'lucide-react';
import { GA_TAU_DB, LICH_TRINH_DB } from '../../../services/db_mock';

const SalesExchangeSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy dữ liệu từ trang trước (nếu có)
  const { oldTicketData, searchDefaults } = location.state || {};
  const getStationCode = (stationNameOrCode) => {
    if (!stationNameOrCode) return "";
    // Tìm trong DB xem có ga nào trùng tên không
    const station = GA_TAU_DB.find(s => s.tenGa === stationNameOrCode || s.maGa === stationNameOrCode);
    return station ? station.maGa : stationNameOrCode; // Trả về mã ga (VD: HN)
  };
  const [criteria, setCriteria] = useState({
    from: getStationCode(searchDefaults?.from) || 'HN', // Chuyển "Hà Nội" -> "HN"
    to: getStationCode(searchDefaults?.to) || 'SG',     // Chuyển "Sài Gòn" -> "SG"
    date: searchDefaults?.date || '2026-01-16'          // Mặc định ngày có dữ liệu Mock
  });

  const [searchResults, setSearchResults] = useState([]);

  // 3. Tự động tìm kiếm khi vào trang
  useEffect(() => {
    handleSearch();
  }, [criteria]); // Thêm criteria vào dependency để khi state update xong mới search

  const handleSearch = () => {
    console.log("Đang tìm kiếm với tiêu chí:", criteria); // Debug xem log

    const results = LICH_TRINH_DB.filter(t => 
      t.gaDi === criteria.from && 
      t.gaDen === criteria.to && 
      t.ngayDi === criteria.date
    );
    setSearchResults(results);
  };

  // Hàm đảo chiều Ga
  const handleSwapStations = () => {
    setCriteria(prev => ({
        ...prev,
        from: prev.to,
        to: prev.from
    }));
  };

  // Chuyển hướng sang chọn ghế
  const handleSelectTrip = (tripId) => {
    navigate(`/employee/sales/exchange/seats/${tripId}`, {
      state: { 
        tripId, 
        oldTicketData, // Truyền tiếp cục dữ liệu vé cũ
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-slate-600 transition-colors"
        >
            <ArrowLeft size={20}/>
        </button>
        <div>
            <h1 className="text-xl font-bold text-slate-800">Tìm chuyến thay thế</h1>
            <p className="text-xs text-slate-500">Bước 2: Chọn lịch trình mới phù hợp với khách hàng</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6">
        
        {/* SECTION 1: THÔNG TIN VÉ CŨ (CONTEXT) */}
        {oldTicketData ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-orange-700 uppercase mb-1 flex items-center gap-2">
                            Vé đang đổi <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-[10px]">Hoàn lại</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            {oldTicketData.ticketCode} 
                            <span className="text-slate-300">|</span>
                            <span>{oldTicketData.seatInfo}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-orange-100 text-right min-w-[150px]">
                    <span className="text-xs text-slate-500 block">Giá trị vé cũ</span>
                    <span className="font-bold text-red-600 text-lg">{oldTicketData.price?.toLocaleString()} đ</span>
                </div>
            </div>
        ) : (
            // Fallback UI nếu mất state (reload trang)
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
                ⚠ Không tìm thấy thông tin vé cũ. Vui lòng quay lại trang danh sách để chọn vé cần đổi.
            </div>
        )}

        {/* SECTION 2: FORM TÌM KIẾM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                
                {/* Ga Đi */}
                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <MapPin size={14}/> Ga đi
                    </label>
                    <select 
                        className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={criteria.from} 
                        onChange={e => setCriteria({...criteria, from: e.target.value})}
                    >
                        {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
                    </select>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex justify-center pb-2">
                    <button onClick={handleSwapStations} className="p-2 bg-gray-100 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <ArrowRightLeft size={20} />
                    </button>
                </div>

                {/* Ga Đến */}
                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <MapPin size={14}/> Ga đến
                    </label>
                    <select 
                        className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={criteria.to} 
                        onChange={e => setCriteria({...criteria, to: e.target.value})}
                    >
                        {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
                    </select>
                </div>

                {/* Ngày đi */}
                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <Calendar size={14}/> Ngày đi
                    </label>
                    <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={criteria.date} 
                        onChange={e => setCriteria({...criteria, date: e.target.value})} 
                    />
                </div>

                {/* Button Tìm */}
                <div className="md:col-span-2">
                    <button 
                        onClick={handleSearch}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Search size={20}/> Tìm kiếm
                    </button>
                </div>
            </div>
        </div>

        {/* SECTION 3: KẾT QUẢ TÌM KIẾM */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Train className="text-blue-600"/> Kết quả tìm kiếm
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{searchResults.length}</span>
                </h2>
                <div className="text-sm text-slate-500">
                    Ngày: <span className="font-bold text-slate-700">{new Date(criteria.date).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>

            <div className="space-y-4">
                {searchResults.length > 0 ? (
                    searchResults.map((trip) => (
                        <div 
                            key={trip.id} 
                            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
                            onClick={() => handleSelectTrip(trip.id)}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                
                                {/* Info Tàu & Giờ */}
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className="bg-blue-50 w-20 h-20 rounded-xl flex flex-col items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                                        <span className="text-[10px] font-bold uppercase">Mác tàu</span>
                                        <span className="text-2xl font-black">{trip.tenTau}</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 text-xl font-bold text-slate-800 mb-2">
                                            <div className="text-center min-w-[60px]">{trip.gioDi}</div>
                                            <div className="flex-1 flex flex-col items-center px-4 relative">
                                                <div className="h-[2px] w-full bg-gray-200 absolute top-1/2"></div>
                                                <div className="bg-white px-2 relative z-10 text-xs text-slate-400 font-medium border border-gray-100 rounded-full">{trip.thoiGianChay}</div>
                                            </div>
                                            <div className="text-center min-w-[60px]">{trip.gioDen}</div>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500">
                                            <span>{trip.gaDi}</span>
                                            <span>{trip.gaDen}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider Mobile */}
                                <div className="w-full h-[1px] bg-gray-100 md:hidden"></div>

                                {/* Giá & Button */}
                                <div className="flex items-center gap-8 md:border-l md:border-gray-100 md:pl-8 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-center md:text-right">
                                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Chỗ trống</div>
                                        <div className={`font-bold ${trip.choTrong > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {trip.choTrong > 0 ? `${trip.choTrong} ghế` : 'Hết vé'}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Giá vé từ</div>
                                        <div className="text-xl font-bold text-blue-600">{trip.giaVe.toLocaleString()} đ</div>
                                    </div>

                                    <button className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                        <ArrowRight size={20}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search size={32}/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Không tìm thấy chuyến tàu nào</h3>
                        <p className="text-slate-500">Thử thay đổi ngày đi hoặc ga đến khác (VD: 2026-01-16)</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SalesExchangeSearchPage;