// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { 
//   Search, ArrowRight, ArrowLeft, Calendar, 
//   MapPin, Clock, Ticket, ArrowRightLeft, Train, Filter 
// } from 'lucide-react';
// import { GA_TAU_DB, LICH_TRINH_DB } from '../../../services/db_mock';

// const SalesExchangeSearchPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // 1. Lấy dữ liệu từ trang trước (nếu có)
//   const { oldTicketData, searchDefaults } = location.state || {};
//   const getStationCode = (stationNameOrCode) => {
//     if (!stationNameOrCode) return "";
//     // Tìm trong DB xem có ga nào trùng tên không
//     const station = GA_TAU_DB.find(s => s.tenGa === stationNameOrCode || s.maGa === stationNameOrCode);
//     return station ? station.maGa : stationNameOrCode; // Trả về mã ga (VD: HN)
//   };
//   const [criteria, setCriteria] = useState({
//     from: getStationCode(searchDefaults?.from) || 'HN', // Chuyển "Hà Nội" -> "HN"
//     to: getStationCode(searchDefaults?.to) || 'SG',     // Chuyển "Sài Gòn" -> "SG"
//     date: searchDefaults?.date || '2026-01-16'          // Mặc định ngày có dữ liệu Mock
//   });

//   const [searchResults, setSearchResults] = useState([]);

//   // 3. Tự động tìm kiếm khi vào trang
//   useEffect(() => {
//     handleSearch();
//   }, [criteria]); // Thêm criteria vào dependency để khi state update xong mới search

//   const handleSearch = () => {
//     console.log("Đang tìm kiếm với tiêu chí:", criteria); // Debug xem log

//     const results = LICH_TRINH_DB.filter(t => 
//       t.gaDi === criteria.from && 
//       t.gaDen === criteria.to && 
//       t.ngayDi === criteria.date
//     );
//     setSearchResults(results);
//   };

//   // Hàm đảo chiều Ga
//   const handleSwapStations = () => {
//     setCriteria(prev => ({
//         ...prev,
//         from: prev.to,
//         to: prev.from
//     }));
//   };

//   // Chuyển hướng sang chọn ghế
//   const handleSelectTrip = (tripId) => {
//     navigate(`/employee/sales/exchange/seats/${tripId}`, {
//       state: { 
//         tripId, 
//         oldTicketData, // Truyền tiếp cục dữ liệu vé cũ
//       }
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
//       {/* HEADER */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm flex items-center gap-4">
//         <button 
//             onClick={() => navigate(-1)} 
//             className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-slate-600 transition-colors"
//         >
//             <ArrowLeft size={20}/>
//         </button>
//         <div>
//             <h1 className="text-xl font-bold text-slate-800">Tìm chuyến thay thế</h1>
//             <p className="text-xs text-slate-500">Bước 2: Chọn lịch trình mới phù hợp với khách hàng</p>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-6 mt-6">
        
//         {/* SECTION 1: THÔNG TIN VÉ CŨ (CONTEXT) */}
//         {oldTicketData ? (
//             <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
//                 <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
//                         <Ticket size={24} />
//                     </div>
//                     <div>
//                         <div className="text-xs font-bold text-orange-700 uppercase mb-1 flex items-center gap-2">
//                             Vé đang đổi <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-[10px]">Hoàn lại</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-slate-800 font-bold">
//                             {oldTicketData.ticketCode} 
//                             <span className="text-slate-300">|</span>
//                             <span>{oldTicketData.seatInfo}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-white px-4 py-2 rounded-lg border border-orange-100 text-right min-w-[150px]">
//                     <span className="text-xs text-slate-500 block">Giá trị vé cũ</span>
//                     <span className="font-bold text-red-600 text-lg">{oldTicketData.price?.toLocaleString()} đ</span>
//                 </div>
//             </div>
//         ) : (
//             // Fallback UI nếu mất state (reload trang)
//             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
//                 ⚠ Không tìm thấy thông tin vé cũ. Vui lòng quay lại trang danh sách để chọn vé cần đổi.
//             </div>
//         )}

//         {/* SECTION 2: FORM TÌM KIẾM */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
//             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                
//                 {/* Ga Đi */}
//                 <div className="md:col-span-3">
//                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
//                         <MapPin size={14}/> Ga đi
//                     </label>
//                     <select 
//                         className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={criteria.from} 
//                         onChange={e => setCriteria({...criteria, from: e.target.value})}
//                     >
//                         {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
//                     </select>
//                 </div>

//                 {/* Swap Button */}
//                 <div className="md:col-span-1 flex justify-center pb-2">
//                     <button onClick={handleSwapStations} className="p-2 bg-gray-100 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
//                         <ArrowRightLeft size={20} />
//                     </button>
//                 </div>

//                 {/* Ga Đến */}
//                 <div className="md:col-span-3">
//                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
//                         <MapPin size={14}/> Ga đến
//                     </label>
//                     <select 
//                         className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={criteria.to} 
//                         onChange={e => setCriteria({...criteria, to: e.target.value})}
//                     >
//                         {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
//                     </select>
//                 </div>

//                 {/* Ngày đi */}
//                 <div className="md:col-span-3">
//                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
//                         <Calendar size={14}/> Ngày đi
//                     </label>
//                     <input 
//                         type="date" 
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={criteria.date} 
//                         onChange={e => setCriteria({...criteria, date: e.target.value})} 
//                     />
//                 </div>

//                 {/* Button Tìm */}
//                 <div className="md:col-span-2">
//                     <button 
//                         onClick={handleSearch}
//                         className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
//                     >
//                         <Search size={20}/> Tìm kiếm
//                     </button>
//                 </div>
//             </div>
//         </div>

//         {/* SECTION 3: KẾT QUẢ TÌM KIẾM */}
//         <div>
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
//                     <Train className="text-blue-600"/> Kết quả tìm kiếm
//                     <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{searchResults.length}</span>
//                 </h2>
//                 <div className="text-sm text-slate-500">
//                     Ngày: <span className="font-bold text-slate-700">{new Date(criteria.date).toLocaleDateString('vi-VN')}</span>
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 {searchResults.length > 0 ? (
//                     searchResults.map((trip) => (
//                         <div 
//                             key={trip.id} 
//                             className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
//                             onClick={() => handleSelectTrip(trip.id)}
//                         >
//                             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                
//                                 {/* Info Tàu & Giờ */}
//                                 <div className="flex items-center gap-6 flex-1 w-full">
//                                     <div className="bg-blue-50 w-20 h-20 rounded-xl flex flex-col items-center justify-center text-blue-700 shrink-0 border border-blue-100">
//                                         <span className="text-[10px] font-bold uppercase">Mác tàu</span>
//                                         <span className="text-2xl font-black">{trip.tenTau}</span>
//                                     </div>
                                    
//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-4 text-xl font-bold text-slate-800 mb-2">
//                                             <div className="text-center min-w-[60px]">{trip.gioDi}</div>
//                                             <div className="flex-1 flex flex-col items-center px-4 relative">
//                                                 <div className="h-[2px] w-full bg-gray-200 absolute top-1/2"></div>
//                                                 <div className="bg-white px-2 relative z-10 text-xs text-slate-400 font-medium border border-gray-100 rounded-full">{trip.thoiGianChay}</div>
//                                             </div>
//                                             <div className="text-center min-w-[60px]">{trip.gioDen}</div>
//                                         </div>
//                                         <div className="flex justify-between text-sm text-slate-500">
//                                             <span>{trip.gaDi}</span>
//                                             <span>{trip.gaDen}</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Divider Mobile */}
//                                 <div className="w-full h-[1px] bg-gray-100 md:hidden"></div>

//                                 {/* Giá & Button */}
//                                 <div className="flex items-center gap-8 md:border-l md:border-gray-100 md:pl-8 w-full md:w-auto justify-between md:justify-end">
//                                     <div className="text-center md:text-right">
//                                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Chỗ trống</div>
//                                         <div className={`font-bold ${trip.choTrong > 0 ? 'text-green-600' : 'text-red-500'}`}>
//                                             {trip.choTrong > 0 ? `${trip.choTrong} ghế` : 'Hết vé'}
//                                         </div>
//                                     </div>

//                                     <div className="text-right">
//                                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Giá vé từ</div>
//                                         <div className="text-xl font-bold text-blue-600">{trip.giaVe.toLocaleString()} đ</div>
//                                     </div>

//                                     <button className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
//                                         <ArrowRight size={20}/>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
//                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
//                             <Search size={32}/>
//                         </div>
//                         <h3 className="text-lg font-bold text-slate-700">Không tìm thấy chuyến tàu nào</h3>
//                         <p className="text-slate-500">Thử thay đổi ngày đi hoặc ga đến khác (VD: 2026-01-16)</p>
//                     </div>
//                 )}
//             </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default SalesExchangeSearchPage;

// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { 
//   Search, ArrowRight, ArrowLeft, Calendar, 
//   MapPin, Ticket, ArrowRightLeft, Train, Loader2 
// } from 'lucide-react';
// import { GA_TAU_DB } from '../../../services/db_mock';

// // Cấu hình URL API (Chỉnh port nếu backend của bạn khác 5000)
// const API_BASE_URL = 'http://localhost:3000/api/v1/schedules'; 

// const SalesExchangeSearchPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // 1. Lấy dữ liệu từ trang trước
//   const { oldTicketData, searchDefaults } = location.state || {};

//   // Helper: Chuyển tên ga thành mã ga (nếu cần)
//   const getStationCode = (stationNameOrCode) => {
//     if (!stationNameOrCode) return "";
//     const station = GA_TAU_DB.find(s => s.tenGa === stationNameOrCode || s.maGa === stationNameOrCode);
//     return station ? station.maGa : stationNameOrCode;
//   };

//   const [criteria, setCriteria] = useState({
//     from: getStationCode(searchDefaults?.from) || 'HN',
//     to: getStationCode(searchDefaults?.to) || 'SG',
//     date: searchDefaults?.date || new Date().toISOString().split('T')[0]
//   });

//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false); // State loading

//   // 2. Tự động tìm kiếm khi criteria thay đổi (bao gồm lần đầu vào trang)
//   useEffect(() => {
//     handleSearch();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [criteria]);

//   // --- LOGIC GỌI API ---
//   const handleSearch = async () => {
//     if (!criteria.from || !criteria.to || !criteria.date) return;

//     setLoading(true);
//     setSearchResults([]);

//     try {
//       // Tạo Query String: ?from=HN&to=SG&date=2026-01-16
//       const queryParams = new URLSearchParams({
//         from: criteria.from,
//         to: criteria.to,
//         date: criteria.date
//       }).toString();

//       const response = await fetch(`${API_BASE_URL}/search?${queryParams}`);
//       const result = await response.json();

//       if (result.success && result.data) {
//         // API trả về { lan1_TruocKhiCho, lan2_SauKhiCho } (Do logic demo Phantom Read)
//         // Với nghiệp vụ bán vé, ta lấy dữ liệu mới nhất hoặc lần đọc đầu tiên đều được.
//         // Ở đây lấy lan1 cho nhanh.
//         const rawData = result.data.lan1_TruocKhiCho || [];

//         // Map dữ liệu từ SQL (PascalCase) sang Frontend (camelCase)
//         const mappedResults = rawData.map(item => ({
//           id: item.MaChuyenTau,
//           tenTau: item.TenTau,
//           gaDi: item.GaXuatPhat, // Tên ga
//           gaDen: item.GaKetThuc, // Tên ga
          
//           // Xử lý thời gian (SQL trả về ISO String: 2026-01-16T06:00:00.000Z)
//           gioDi: formatTime(item.GioKhoiHanh),
//           gioDen: formatTime(item.GioDen),
//           thoiGianChay: calculateDuration(item.GioKhoiHanh, item.GioDen),
          
//           choTrong: item.SoChoTrong,
          
//           // API hiện tại chưa trả về giá vé cơ bản (cần join bảng giá). 
//           // Tạm thời mock giá để UI không vỡ.
//           giaVe: 500000 + Math.floor(Math.random() * 500000) 
//         }));

//         setSearchResults(mappedResults);
//       }
//     } catch (error) {
//       console.error("Lỗi tìm kiếm chuyến tàu:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- HELPER FUNCTIONS ---
//   const formatTime = (isoString) => {
//     if (!isoString) return "--:--";
//     const date = new Date(isoString);
//     // Lấy giờ:phút (HH:mm)
//     return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
//   };

//   const calculateDuration = (startIso, endIso) => {
//     if (!startIso || !endIso) return "--";
//     const start = new Date(startIso);
//     const end = new Date(endIso);
//     const diffMs = end - start;
//     const diffHrs = Math.floor(diffMs / 3600000);
//     const diffMins = Math.round((diffMs % 3600000) / 60000);
//     return `${diffHrs}h ${diffMins}m`;
//   };

//   // Hàm đảo chiều Ga
//   const handleSwapStations = () => {
//     setCriteria(prev => ({
//         ...prev,
//         from: prev.to,
//         to: prev.from
//     }));
//   };

//   // Chuyển hướng sang chọn ghế
//   const handleSelectTrip = (tripId) => {
//     navigate(`/employee/sales/exchange/seats/${tripId}`, {
//       state: { 
//         tripId, 
//         oldTicketData, 
//       }
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
//       {/* HEADER */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm flex items-center gap-4">
//         <button 
//             onClick={() => navigate(-1)} 
//             className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-slate-600 transition-colors"
//         >
//             <ArrowLeft size={20}/>
//         </button>
//         <div>
//             <h1 className="text-xl font-bold text-slate-800">Tìm chuyến thay thế</h1>
//             <p className="text-xs text-slate-500">Bước 2: Chọn lịch trình mới phù hợp với khách hàng</p>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-6 mt-6">
        
//         {/* SECTION 1: THÔNG TIN VÉ CŨ (CONTEXT) */}
//         {oldTicketData ? (
//             <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
//                 <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
//                         <Ticket size={24} />
//                     </div>
//                     <div>
//                         <div className="text-xs font-bold text-orange-700 uppercase mb-1 flex items-center gap-2">
//                             Vé đang đổi <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-[10px]">Hoàn lại</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-slate-800 font-bold">
//                             {oldTicketData.ticketCode} 
//                             <span className="text-slate-300">|</span>
//                             <span>{oldTicketData.seatInfo}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-white px-4 py-2 rounded-lg border border-orange-100 text-right min-w-[150px]">
//                     <span className="text-xs text-slate-500 block">Giá trị vé cũ</span>
//                     <span className="font-bold text-red-600 text-lg">{oldTicketData.price?.toLocaleString()} đ</span>
//                 </div>
//             </div>
//         ) : (
//             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
//                 ⚠ Không tìm thấy thông tin vé cũ. Vui lòng quay lại trang danh sách để chọn vé cần đổi.
//             </div>
//         )}

//         {/* SECTION 2: FORM TÌM KIẾM */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
//             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                
//                 {/* Ga Đi */}
//                 <div className="md:col-span-3">
//                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
//                         <MapPin size={14}/> Ga đi
//                     </label>
//                     <select 
//                         className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={criteria.from} 
//                         onChange={e => setCriteria({...criteria, from: e.target.value})}
//                     >
//                         {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
//                     </select>
//                 </div>

//                 {/* Swap Button */}
//                 <div className="md:col-span-1 flex justify-center pb-2">
//                     <button onClick={handleSwapStations} className="p-2 bg-gray-100 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
//                         <ArrowRightLeft size={20} />
//                     </button>
//                 </div>

//                 {/* Ga Đến */}
//                 <div className="md:col-span-3">
//                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
//                         <MapPin size={14}/> Ga đến
//                     </label>
//                     <select 
//                         className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={criteria.to} 
//                         onChange={e => setCriteria({...criteria, to: e.target.value})}
//                     >
//                         {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
//                     </select>
//                 </div>

//                 {/* Ngày đi */}
//                 <div className="md:col-span-3">
//                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
//                         <Calendar size={14}/> Ngày đi
//                     </label>
//                     <input 
//                         type="date" 
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={criteria.date} 
//                         onChange={e => setCriteria({...criteria, date: e.target.value})} 
//                     />
//                 </div>

//                 {/* Button Tìm */}
//                 <div className="md:col-span-2">
//                     <button 
//                         onClick={handleSearch}
//                         disabled={loading}
//                         className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
//                     >
//                         {loading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
//                         {loading ? 'Đang tìm' : 'Tìm kiếm'}
//                     </button>
//                 </div>
//             </div>
//         </div>

//         {/* SECTION 3: KẾT QUẢ TÌM KIẾM */}
//         <div>
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
//                     <Train className="text-blue-600"/> Kết quả tìm kiếm
//                     {!loading && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{searchResults.length}</span>}
//                 </h2>
//                 <div className="text-sm text-slate-500">
//                     Ngày: <span className="font-bold text-slate-700">{new Date(criteria.date).toLocaleDateString('vi-VN')}</span>
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 {loading ? (
//                     // Skeleton Loading hoặc Spinner
//                     <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
//                         <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3"/>
//                         <p className="text-slate-500">Đang tìm chuyến tàu phù hợp...</p>
//                     </div>
//                 ) : searchResults.length > 0 ? (
//                     searchResults.map((trip) => (
//                         <div 
//                             key={trip.id} 
//                             className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
//                             onClick={() => handleSelectTrip(trip.id)}
//                         >
//                             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                
//                                 {/* Info Tàu & Giờ */}
//                                 <div className="flex items-center gap-6 flex-1 w-full">
//                                     <div className="bg-blue-50 w-20 h-20 rounded-xl flex flex-col items-center justify-center text-blue-700 shrink-0 border border-blue-100">
//                                         <span className="text-[10px] font-bold uppercase">Mác tàu</span>
//                                         <span className="text-2xl font-black">{trip.tenTau}</span>
//                                     </div>
                                    
//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-4 text-xl font-bold text-slate-800 mb-2">
//                                             <div className="text-center min-w-[60px]">{trip.gioDi}</div>
//                                             <div className="flex-1 flex flex-col items-center px-4 relative">
//                                                 <div className="h-[2px] w-full bg-gray-200 absolute top-1/2"></div>
//                                                 <div className="bg-white px-2 relative z-10 text-xs text-slate-400 font-medium border border-gray-100 rounded-full">{trip.thoiGianChay}</div>
//                                             </div>
//                                             <div className="text-center min-w-[60px]">{trip.gioDen}</div>
//                                         </div>
//                                         <div className="flex justify-between text-sm text-slate-500">
//                                             <span>{trip.gaDi}</span>
//                                             <span>{trip.gaDen}</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Divider Mobile */}
//                                 <div className="w-full h-[1px] bg-gray-100 md:hidden"></div>

//                                 {/* Giá & Button */}
//                                 <div className="flex items-center gap-8 md:border-l md:border-gray-100 md:pl-8 w-full md:w-auto justify-between md:justify-end">
//                                     <div className="text-center md:text-right">
//                                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Chỗ trống</div>
//                                         <div className={`font-bold ${trip.choTrong > 0 ? 'text-green-600' : 'text-red-500'}`}>
//                                             {trip.choTrong > 0 ? `${trip.choTrong} ghế` : 'Hết vé'}
//                                         </div>
//                                     </div>

//                                     <div className="text-right">
//                                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Giá vé từ</div>
//                                         <div className="text-xl font-bold text-blue-600">{trip.giaVe.toLocaleString()} đ</div>
//                                     </div>

//                                     <button className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
//                                         <ArrowRight size={20}/>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
//                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
//                             <Search size={32}/>
//                         </div>
//                         <h3 className="text-lg font-bold text-slate-700">Không tìm thấy chuyến tàu nào</h3>
//                         <p className="text-slate-500">Thử thay đổi ngày đi hoặc ga đến khác (VD: 2026-01-16)</p>
//                     </div>
//                 )}
//             </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default SalesExchangeSearchPage;


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ArrowRight, ArrowLeft, Calendar, 
  MapPin, Ticket, ArrowRightLeft, Train, Loader2 
} from 'lucide-react';

// Cấu hình URL Gốc API
const API_ROOT = 'http://localhost:3000/api/v1'; 

const SalesExchangeSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy dữ liệu từ trang trước (TicketExchangePage)
  // oldTicketData.routeCode phải chứa mã tuyến (VD: "TT02")
  const { oldTicketData, searchDefaults } = location.state || {};

  // --- STATE ---
  const [stations, setStations] = useState([]); // Lưu danh sách ga của tuyến
  const [loadingStations, setLoadingStations] = useState(true);
  
  const [criteria, setCriteria] = useState({
    from: '', 
    to: '',
    date: searchDefaults?.date || new Date().toISOString().split('T')[0]
  });

  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // --- 2. GỌI API LẤY CHI TIẾT TUYẾN ---
  useEffect(() => {
    const fetchRouteStations = async () => {
      const routeId = oldTicketData?.routeCode || 'TT01'; 

      try {
        setLoadingStations(true);
        
        // [SỬA ĐOẠN NÀY] ----------------------------------------------------
        // 1. Lấy token từ localStorage (hoặc nơi bạn lưu khi login)
        const token = localStorage.getItem('token'); // Kiểm tra lại key bạn lưu là 'token' hay 'accessToken'

        // 2. Thêm headers vào fetch
        const response = await fetch(`${API_ROOT}/routes/${routeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Gửi kèm Token "Bearer ..."
            }
        });
        // -------------------------------------------------------------------

        if (response.status === 401) {
            alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            navigate('/login'); // Đá về trang login nếu lỗi 401
            return;
        }

        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data.stations)) {
          const stationList = result.data.stations; 
          setStations(stationList);

          const getStationCode = (val) => {
             if (!val) return "";
             const found = stationList.find(s => s.maGaTau === val || s.tenGa === val);
             return found ? found.maGaTau : val;
          };

          setCriteria(prev => ({
            ...prev,
            from: getStationCode(searchDefaults?.from) || (stationList[0]?.maGaTau || ''), 
            to: getStationCode(searchDefaults?.to) || (stationList[stationList.length - 1]?.maGaTau || '')
          }));
        } 
      } catch (error) {
        console.error("Lỗi kết nối API lấy danh sách ga:", error);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchRouteStations();
  }, [oldTicketData, searchDefaults, navigate]);

  // --- LOGIC GỌI API TÌM CHUYẾN TÀU (SCHEDULES) ---
  const handleSearch = async () => {
    if (!criteria.from || !criteria.to || !criteria.date) return;

    setLoadingSearch(true);
    setSearchResults([]);

    try {
      const queryParams = new URLSearchParams({
        from: criteria.from,
        to: criteria.to,
        date: criteria.date
      }).toString();

      // Gọi API Search: GET http://localhost:3000/api/v1/schedules/search?...
      const response = await fetch(`${API_ROOT}/schedules/search?${queryParams}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Lấy data lan1 (như logic demo Phantom Read trước đó)
        const rawData = result.data.lan1_TruocKhiCho || [];

        const mappedResults = rawData.map(item => ({
          id: item.MaChuyenTau,
          tenTau: item.TenTau,
          gaDi: item.GaXuatPhat, // API Search trả về Tên ga
          gaDen: item.GaKetThuc, // API Search trả về Tên ga
          gioDi: formatTime(item.GioKhoiHanh),
          gioDen: formatTime(item.GioDen),
          thoiGianChay: calculateDuration(item.GioKhoiHanh, item.GioDen),
          choTrong: item.SoChoTrong,
          // Mock giá vé (vì API Search chưa join bảng giá)
          giaVe: 500000 + Math.floor(Math.random() * 500000) 
        }));

        setSearchResults(mappedResults);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm chuyến tàu:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (startIso, endIso) => {
    if (!startIso || !endIso) return "--";
    const diffMs = new Date(endIso) - new Date(startIso);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round((diffMs % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m`;
  };

  const handleSwapStations = () => {
    setCriteria(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const handleSelectTrip = (tripId) => {
    navigate(`/employee/sales/exchange/seats/${tripId}`, {
      state: { tripId, oldTicketData }
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
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
                ⚠ Không tìm thấy thông tin vé cũ.
            </div>
        )}

        {/* SECTION 2: FORM TÌM KIẾM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                
                {/* Ga Đi - Dữ liệu từ API Route Detail */}
                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <MapPin size={14}/> Ga đi
                    </label>
                    {loadingStations ? (
                        <div className="w-full h-11 bg-gray-100 rounded-xl animate-pulse"></div>
                    ) : (
                        <select 
                            className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={criteria.from} 
                            onChange={e => setCriteria({...criteria, from: e.target.value})}
                        >
                            {/* Map đúng trường maGaTau và tenGa từ JSON API */}
                            {stations.map(g => (
                                <option key={g.maGaTau} value={g.maGaTau}>{g.tenGa}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="md:col-span-1 flex justify-center pb-2">
                    <button onClick={handleSwapStations} className="p-2 bg-gray-100 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <ArrowRightLeft size={20} />
                    </button>
                </div>

                {/* Ga Đến - Dữ liệu từ API Route Detail */}
                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <MapPin size={14}/> Ga đến
                    </label>
                    {loadingStations ? (
                        <div className="w-full h-11 bg-gray-100 rounded-xl animate-pulse"></div>
                    ) : (
                        <select 
                            className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={criteria.to} 
                            onChange={e => setCriteria({...criteria, to: e.target.value})}
                        >
                            {stations.map(g => (
                                <option key={g.maGaTau} value={g.maGaTau}>{g.tenGa}</option>
                            ))}
                        </select>
                    )}
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
                        disabled={loadingSearch}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loadingSearch ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                        {loadingSearch ? 'Đang tìm' : 'Tìm kiếm'}
                    </button>
                </div>
            </div>
        </div>

        {/* SECTION 3: KẾT QUẢ TÌM KIẾM */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Train className="text-blue-600"/> Kết quả tìm kiếm
                    {!loadingSearch && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{searchResults.length}</span>}
                </h2>
                <div className="text-sm text-slate-500">
                    Ngày: <span className="font-bold text-slate-700">{new Date(criteria.date).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>

            <div className="space-y-4">
                {loadingSearch ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3"/>
                        <p className="text-slate-500">Đang tìm chuyến tàu phù hợp...</p>
                    </div>
                ) : searchResults.length > 0 ? (
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
                        <Search size={32} className="mx-auto mb-4 text-gray-400"/>
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