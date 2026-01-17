// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
// import { ArrowLeft, CheckCircle, Ticket, Trash2, AlertCircle } from 'lucide-react';
// import { getGheByTauId } from '../../../services/db_mock';

// const SalesExchangeSeatSelectionPage = () => {
//   const { tripId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // 1. Lấy dữ liệu vé cũ.
//   const { oldTicketData } = location.state || {}; 

//   // --- SAFETY CHECK: Nếu reload trang mất dữ liệu vé cũ -> Quay về ---
//   if (!oldTicketData) {
//       return <Navigate to="/employee/sales/history" replace />;
//   }

//   const [carriages, setCarriages] = useState([]);
  
//   // State lưu ghế mới đang chọn (Chỉ 1 ghế vì là Đổi vé)
//   const [selectedSeat, setSelectedSeat] = useState(null);

//   useEffect(() => {
//     // Load dữ liệu ghế của chuyến tàu mới
//     const data = getGheByTauId(tripId);
//     setCarriages(data);
//   }, [tripId]);

//   // --- LOGIC CHỌN GHẾ (SINGLE SELECT) ---
//   const handleSeatClick = (carriage, seat, isBooked) => {
//     if (isBooked) return;
    
//     const seatUid = `${carriage.maToa}-${seat.id}`;

//     // Nếu click vào ghế đang chọn -> Bỏ chọn
//     if (selectedSeat?.uid === seatUid) {
//         setSelectedSeat(null);
//     } else {
//         // Chọn ghế mới (Tự động thay thế ghế cũ)
//         setSelectedSeat({
//             uid: seatUid,
//             id: seat.id,
//             label: seat.label,
//             maToa: carriage.maToa,
//             tenToa: carriage.tenToa,
//             price: carriage.giaCoBan,
//             loaiToa: carriage.loaiToa
//         });
//     }
//   };

//   // --- XÁC NHẬN ĐỔI VÉ ---
//   const handleConfirm = () => {
//     if (!selectedSeat) return;
    
//     // Điều hướng sang trang Xác nhận đổi vé
//     navigate('/employee/sales/exchange/confirm', {
//         state: {
//             oldTicketData: oldTicketData, // Vé cũ
//             newSeatData: selectedSeat,    // Vé mới
//             tripId: tripId
//         }
//     });
//   };

//   // Tính chênh lệch giá
//   const priceDiff = useMemo(() => {
//       if (!selectedSeat) return 0;
//       return selectedSeat.price - (oldTicketData.price || 0);
//   }, [selectedSeat, oldTicketData]);

//   // --- HELPER: Chia mảng cho giao diện ---
//   const chunkArray = (array, size) => {
//     const chunked = [];
//     for (let i = 0; i < array.length; i += size) {
//       chunked.push(array.slice(i, i + size));
//     }
//     return chunked;
//   };

//   // --- RENDER 1 GHẾ ---
//   const renderSingleSeat = (carriage, seat, customClass = "") => {
//     const isBooked = seat.status === 'booked';
//     const isSelected = selectedSeat?.uid === `${carriage.maToa}-${seat.id}`;
    
//     let baseClass = "relative flex items-center justify-center border rounded cursor-pointer transition-all shadow-sm select-none";
//     let colorClass = isBooked ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed" : 
//                      isSelected ? "bg-blue-600 text-white border-blue-600 font-bold shadow-md transform scale-105 z-10" : 
//                      "bg-white hover:border-blue-500 text-gray-700 border-gray-300";

//     return (
//         <div 
//             key={seat.id}
//             onClick={() => handleSeatClick(carriage, seat, isBooked)}
//             className={`${baseClass} ${colorClass} ${customClass}`}
//             title={`Ghế ${seat.label}`}
//         >
//             <span className="text-xs font-medium">{seat.label}</span>
//         </div>
//     );
//   };

//   // --- RENDER NỘI DUNG TOA ---
//   const renderCarriageContent = (carriage) => {
    
//     // === TOA NGỒI (LAYOUT NGANG) ===
//     if (carriage.type === 'seat') {
//         const columns = chunkArray(carriage.danhSachGhe, 4);

//         return (
//             <div className="bg-gray-50 p-4 rounded-xl overflow-x-auto">
//                 <div className="flex items-start min-w-max gap-6 pb-2">
//                     <div className="flex flex-col items-center justify-center self-stretch w-16 bg-gray-200 rounded-l-lg border-r border-gray-300 opacity-70">
//                         <div className="w-10 h-1 bg-gray-400 rounded-full mb-2"></div>
//                         <span className="text-[10px] font-bold text-gray-500 uppercase text-center leading-tight">Đầu<br/>Toa</span>
//                     </div>

//                     <div className="flex gap-4">
//                         {columns.map((col, colIndex) => (
//                             <div key={colIndex} className="flex flex-col gap-3">
//                                 <div className="flex flex-col gap-1">
//                                     {col[0] && renderSingleSeat(carriage, col[0], "w-10 h-10 rounded text-sm")}
//                                     {col[1] && renderSingleSeat(carriage, col[1], "w-10 h-10 rounded text-sm")}
//                                 </div>
//                                 <div className="h-6 flex items-center justify-center">
//                                     <span className="text-[10px] text-gray-300 select-none">||</span>
//                                 </div>
//                                 <div className="flex flex-col gap-1">
//                                     {col[2] && renderSingleSeat(carriage, col[2], "w-10 h-10 rounded text-sm")}
//                                     {col[3] && renderSingleSeat(carriage, col[3], "w-10 h-10 rounded text-sm")}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="flex flex-col items-center justify-center self-stretch w-16 bg-gray-200 rounded-r-lg border-l border-gray-300 opacity-70">
//                          <span className="text-[10px] font-bold text-gray-500 uppercase text-center leading-tight">Cuối<br/>Toa</span>
//                          <div className="w-10 h-1 bg-gray-400 rounded-full mt-2"></div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // === TOA GIƯỜNG NẰM ===
//     if (carriage.type.includes('sleeper')) {
//         const cabins = carriage.danhSachGhe.reduce((acc, seat) => {
//             acc[seat.cabin] = acc[seat.cabin] || [];
//             acc[seat.cabin].push(seat);
//             return acc;
//         }, {});

//         return (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
//                 {Object.entries(cabins).map(([cabinNum, seats]) => (
//                     <div key={cabinNum} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
//                         <div className="bg-blue-50 px-2 py-1 text-center border-b border-blue-100">
//                             <span className="text-[10px] font-bold text-blue-600 uppercase">Khoang {cabinNum}</span>
//                         </div>
//                         <div className="p-2 grid grid-cols-2 gap-2 bg-white flex-1 relative min-h-[100px]">
//                             <div className="absolute inset-y-2 left-1/2 w-px bg-gray-100 transform -translate-x-1/2"></div>
//                             {seats.map(seat => (
//                                 renderSingleSeat(carriage, seat, "w-full h-full min-h-[40px] rounded shadow-sm border-gray-200 text-xs") 
//                             ))}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         );
//     }
//   };

//   return (
//     <div className="p-4 bg-slate-100 min-h-screen flex flex-col md:flex-row gap-4 font-sans">
      
//       {/* 1. CỘT TRÁI: DANH SÁCH TOA TÀU */}
//       <div className="flex-1 space-y-4 overflow-y-auto max-h-screen pr-2 pb-20 md:pb-0">
//         <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-100 z-20 py-2">
//            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
//            <div>
//                <h2 className="font-bold text-xl text-gray-800">Chọn ghế mới (Đổi vé)</h2>
//                <p className="text-sm text-slate-500">Chuyến tàu: <span className="font-bold text-blue-700">{tripId}</span></p>
//            </div>
//         </div>

//         {carriages.map((carriage) => (
//           <div key={carriage.maToa} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
//                 <div>
//                     <h3 className="font-bold text-blue-800 text-sm">{carriage.tenToa}</h3>
//                     <p className="text-xs text-blue-600">{carriage.loaiToa}</p>
//                 </div>
//                 <div className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded border">
//                     {carriage.type === 'seat' ? 'Ngồi' : carriage.type === 'sleeper_4' ? 'Khoang 4' : 'Khoang 6'}
//                 </div>
//             </div>
//             {renderCarriageContent(carriage)}
//           </div>
//         ))}
//       </div>

//       {/* 2. CỘT PHẢI: THÔNG TIN ĐỔI VÉ */}
//       <div className="w-full md:w-80 h-fit sticky top-4">
//         <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
//            <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide border-b pb-3 flex items-center gap-2">
//                <Ticket size={16} className="text-orange-500"/> Chi tiết đổi vé
//            </h3>
           
//            {/* Vé Cũ */}
//            <div className="mb-4 bg-orange-50 p-3 rounded border border-orange-200 border-dashed relative">
//              <div className="text-[10px] font-bold text-orange-700 uppercase mb-1">Vé hoàn lại (Cũ)</div>
//              <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-700 font-medium">{oldTicketData.seatInfo}</span>
//                 <span className="font-bold text-red-500 line-through text-sm">
//                     {oldTicketData.price.toLocaleString()} đ
//                 </span>
//              </div>
//            </div>

//            {/* Vé Mới */}
//            <div className="mb-6">
//              <div className="text-[10px] font-bold text-blue-600 uppercase mb-2">Vé mới chọn</div>
             
//              {selectedSeat ? (
//                <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200 text-sm animate-in fade-in">
//                   <div>
//                       <div className="font-bold text-gray-800">{selectedSeat.tenToa}</div>
//                       <div className="text-xs text-gray-500">Ghế {selectedSeat.label}</div>
//                   </div>
//                   <div className="text-right">
//                       <div className="font-bold text-blue-700">{selectedSeat.price.toLocaleString()} đ</div>
//                       <button 
//                           onClick={() => setSelectedSeat(null)} 
//                           className="text-red-400 hover:text-red-600 text-xs mt-1 underline"
//                       >
//                           Bỏ chọn
//                       </button>
//                   </div>
//                </div>
//              ) : (
//                 <div className="text-sm text-gray-400 italic py-6 flex flex-col items-center justify-center border border-dashed rounded bg-gray-50">
//                     <AlertCircle size={20} className="mb-2 opacity-50"/> 
//                     Vui lòng chọn 1 chỗ ngồi
//                 </div>
//              )}
//            </div>

//            {/* Tổng kết Chênh lệch */}
//            <div className="border-t pt-4">
//              {selectedSeat && (
//                  <div className="flex justify-between items-end mb-4 bg-slate-50 p-3 rounded-lg">
//                    <span className="text-gray-600 font-medium text-sm">Chênh lệch:</span>
//                    <div className="text-right">
//                        <span className={`text-xl font-bold ${priceDiff > 0 ? 'text-blue-600' : 'text-green-600'}`}>
//                           {priceDiff.toLocaleString()} đ
//                        </span>
//                        <p className="text-[10px] text-gray-500 mt-0.5">
//                            {priceDiff > 0 ? '(Khách cần trả thêm)' : '(Hoàn tiền cho khách)'}
//                        </p>
//                    </div>
//                  </div>
//              )}

//              <button 
//                onClick={handleConfirm}
//                disabled={!selectedSeat}
//                className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
//                   ${selectedSeat ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}
//                `}
//              >
//                <CheckCircle size={18} />
//                Xác nhận đổi vé
//              </button>
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesExchangeSeatSelectionPage;

// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
// import { ArrowLeft, CheckCircle, Ticket, AlertCircle, Loader2 } from 'lucide-react';

// // Cấu hình URL API
// const API_BASE_URL = 'http://localhost:3000/api/v1'; 

// const SalesExchangeSeatSelectionPage = () => {
//   const { tripId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // 1. Lấy dữ liệu vé cũ từ trang trước
//   const { oldTicketData, searchCriteria } = location.state || {}; 

//   // State
//   const [seats, setSeats] = useState([]); // Danh sách ghế từ API
//   const [loadingSeats, setLoadingSeats] = useState(true);
//   const [selectedSeat, setSelectedSeat] = useState(null);
  
//   // State giá vé mới (tính từ API)
//   const [newTicketPrice, setNewTicketPrice] = useState(0);
//   const [loadingPrice, setLoadingPrice] = useState(false);

//   // --- SAFETY CHECK ---
//   if (!oldTicketData) {
//       return <Navigate to="/employee/sales/history" replace />;
//   }

//   // --- 2. GỌI API LẤY DANH SÁCH GHẾ ---
//   useEffect(() => {
//     const fetchSeats = async () => {
//       try {
//         setLoadingSeats(true);
//         // GET /api/v1/trips/:id/seats
//         // Header cần token nếu backend yêu cầu authenticationMiddleware
//         const token = localStorage.getItem('token');
//         const response = await fetch(`${API_BASE_URL}/trips/${tripId}/seats`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         const result = await response.json();

//         if (result.success) {
//           setSeats(result.data);
//         }
//       } catch (error) {
//         console.error("Lỗi lấy danh sách ghế:", error);
//       } finally {
//         setLoadingSeats(false);
//       }
//     };

//     fetchSeats();
//   }, [tripId]);

//   // --- 3. GỌI API TÍNH GIÁ VÉ (Khi chọn ghế) ---
//   const fetchPrice = async (seatId) => {
//       try {
//           setLoadingPrice(true);
//           const response = await fetch(`${API_BASE_URL}/prices/calculate`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                   tripId: tripId,
//                   fromStationId: oldTicketData.searchDefaults?.from || 'GA01', // Lấy từ context vé cũ hoặc state search
//                   toStationId: oldTicketData.searchDefaults?.to || 'GA12',
//                   seatId: seatId,
//                   promotionCode: null 
//               })
//           });
          
//           const result = await response.json();
//           if (result.success) {
//               setNewTicketPrice(result.data.GiaThucTe); // Lấy giá thực tế từ API
//           }
//       } catch (error) {
//           console.error("Lỗi tính giá:", error);
//       } finally {
//           setLoadingPrice(false);
//       }
//   };

//   // --- LOGIC CHỌN GHẾ ---
//   const handleSeatClick = (seat) => {
//     if (seat.TrangThai === 'Đã đặt') return;
    
//     // Nếu click lại ghế đang chọn -> Bỏ chọn
//     if (selectedSeat?.MaViTri === seat.MaViTri) {
//         setSelectedSeat(null);
//         setNewTicketPrice(0);
//     } else {
//         // Chọn ghế mới
//         setSelectedSeat(seat);
//         // Gọi API tính giá ngay lập tức
//         fetchPrice(seat.MaViTri);
//     }
//   };

//   // --- XÁC NHẬN ---
//   const handleConfirm = () => {
//     if (!selectedSeat) return;
    
//     navigate('/employee/sales/exchange/confirm', {
//         state: {
//             oldTicketData, 
//             newSeatData: {
//                 ...selectedSeat,
//                 price: newTicketPrice // Đính kèm giá vừa tính được
//             },    
//             tripId
//         }
//     });
//   };

//   // --- HELPER: GROUP GHẾ THEO TOA ---
//   // API trả về danh sách phẳng (flat list), ta cần gom nhóm theo MaToaTau để hiển thị
//   const carriages = useMemo(() => {
//       const groups = {};
//       seats.forEach(seat => {
//           if (!groups[seat.MaToaTau]) {
//               groups[seat.MaToaTau] = {
//                   id: seat.MaToaTau,
//                   name: `Toa ${seat.MaToaTau}`, // Hoặc lấy tên toa nếu API trả về
//                   type: seat.LoaiVT, // Ghế / Giường
//                   seats: []
//               };
//           }
//           groups[seat.MaToaTau].seats.push(seat);
//       });
//       return Object.values(groups);
//   }, [seats]);

//   // Tính chênh lệch giá
//   const priceDiff = newTicketPrice - (oldTicketData.price || 0);

//   // --- RENDER 1 GHẾ ---
//   const renderSingleSeat = (seat) => {
//     const isBooked = seat.TrangThai === 'Đã đặt';
//     const isSelected = selectedSeat?.MaViTri === seat.MaViTri;
    
//     let baseClass = "w-10 h-10 rounded border flex items-center justify-center text-xs font-bold cursor-pointer transition-all";
//     let colorClass = isBooked ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed" : 
//                      isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-110" : 
//                      "bg-white hover:border-blue-500 text-gray-700 border-gray-300";

//     return (
//         <div 
//             key={seat.MaViTri}
//             onClick={() => handleSeatClick(seat)}
//             className={`${baseClass} ${colorClass}`}
//             title={`Ghế ${seat.SoGhe} - ${seat.LoaiVT}`}
//         >
//             {seat.SoGhe}
//         </div>
//     );
//   };

//   return (
//     <div className="p-4 bg-slate-100 min-h-screen flex flex-col md:flex-row gap-4 font-sans">
      
//       {/* 1. CỘT TRÁI: DANH SÁCH TOA TÀU */}
//       <div className="flex-1 space-y-4 overflow-y-auto max-h-screen pr-2 pb-20 md:pb-0">
//         <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-100 z-20 py-2">
//            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
//            <div>
//                <h2 className="font-bold text-xl text-gray-800">Chọn ghế mới</h2>
//                <p className="text-sm text-slate-500">Chuyến tàu: <span className="font-bold text-blue-700">{tripId}</span></p>
//            </div>
//         </div>

//         {loadingSeats ? (
//             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10"/></div>
//         ) : carriages.length === 0 ? (
//             <div className="text-center py-10 text-gray-500">Không tìm thấy thông tin toa/ghế cho chuyến này.</div>
//         ) : (
//             carriages.map((carriage) => (
//               <div key={carriage.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
//                     <h3 className="font-bold text-blue-800 text-sm">{carriage.name}</h3>
//                     <span className="text-xs bg-white px-2 py-1 rounded border text-gray-600">{carriage.type}</span>
//                 </div>
                
//                 {/* Grid Ghế */}
//                 <div className="p-4 flex flex-wrap gap-3 justify-center bg-slate-50">
//                     {carriage.seats.map(seat => renderSingleSeat(seat))}
//                 </div>
//               </div>
//             ))
//         )}
//       </div>

//       {/* 2. CỘT PHẢI: CHI TIẾT THANH TOÁN */}
//       <div className="w-full md:w-80 h-fit sticky top-4">
//         <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
//            <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide border-b pb-3 flex items-center gap-2">
//                <Ticket size={16} className="text-orange-500"/> Chi tiết đổi vé
//            </h3>
           
//            {/* Vé Cũ */}
//            <div className="mb-4 bg-orange-50 p-3 rounded border border-orange-200 border-dashed relative">
//              <div className="text-[10px] font-bold text-orange-700 uppercase mb-1">Vé hoàn lại (Cũ)</div>
//              <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-700 font-medium truncate w-32">{oldTicketData.seatInfo}</span>
//                 <span className="font-bold text-red-500 line-through text-sm">
//                     {oldTicketData.price.toLocaleString()} đ
//                 </span>
//              </div>
//            </div>

//            {/* Vé Mới */}
//            <div className="mb-6">
//              <div className="text-[10px] font-bold text-blue-600 uppercase mb-2">Vé mới chọn</div>
             
//              {selectedSeat ? (
//                <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm animate-in fade-in">
//                   <div className="flex justify-between items-start mb-2">
//                       <div>
//                           <div className="font-bold text-gray-800">Toa {selectedSeat.MaToaTau}</div>
//                           <div className="text-xs text-gray-500">Ghế {selectedSeat.SoGhe} ({selectedSeat.LoaiVT})</div>
//                       </div>
//                       {loadingPrice ? (
//                           <Loader2 className="w-4 h-4 animate-spin text-blue-600"/>
//                       ) : (
//                           <div className="font-bold text-blue-700">{newTicketPrice.toLocaleString()} đ</div>
//                       )}
//                   </div>
//                   <button onClick={() => setSelectedSeat(null)} className="text-red-400 hover:text-red-600 text-xs underline w-full text-right">
//                       Bỏ chọn
//                   </button>
//                </div>
//              ) : (
//                 <div className="text-sm text-gray-400 italic py-6 flex flex-col items-center justify-center border border-dashed rounded bg-gray-50">
//                     <AlertCircle size={20} className="mb-2 opacity-50"/> 
//                     Vui lòng chọn 1 chỗ ngồi
//                 </div>
//              )}
//            </div>

//            {/* Tổng kết Chênh lệch */}
//            <div className="border-t pt-4">
//              {selectedSeat && !loadingPrice && (
//                  <div className="flex justify-between items-end mb-4 bg-slate-50 p-3 rounded-lg">
//                    <span className="text-gray-600 font-medium text-sm">Chênh lệch:</span>
//                    <div className="text-right">
//                        <span className={`text-xl font-bold ${priceDiff > 0 ? 'text-blue-600' : 'text-green-600'}`}>
//                           {Math.abs(priceDiff).toLocaleString()} đ
//                        </span>
//                        <p className="text-[10px] text-gray-500 mt-0.5">
//                            {priceDiff > 0 ? '(Khách trả thêm)' : '(Hoàn lại khách)'}
//                        </p>
//                    </div>
//                  </div>
//              )}

//              <button 
//                onClick={handleConfirm}
//                disabled={!selectedSeat || loadingPrice}
//                className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
//                   ${selectedSeat && !loadingPrice ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}
//                `}
//              >
//                <CheckCircle size={18} />
//                Xác nhận đổi vé
//              </button>
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesExchangeSeatSelectionPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Ticket, AlertCircle, Loader2 } from 'lucide-react';

// Cấu hình URL API
const API_BASE_URL = 'http://localhost:3000/api/v1'; 

const SalesExchangeSeatSelectionPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy dữ liệu vé cũ
  const { oldTicketData } = location.state || {}; 

  // State
  const [carriages, setCarriages] = useState([]); // Lưu danh sách Toa (kèm ghế bên trong)
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  // State giá vé mới
  const [newTicketPrice, setNewTicketPrice] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // --- SAFETY CHECK ---
  if (!oldTicketData) {
      return <Navigate to="/employee/sales/history" replace />;
  }

  // --- 2. GỌI API LẤY DANH SÁCH GHẾ ---
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoadingSeats(true);
        // GET /api/v1/customers/seats/:tripId (Theo API bạn cung cấp)
        const response = await fetch(`${API_BASE_URL}/customers/seats/${tripId}`);
        const result = await response.json();

        if (result.success) {
          // API trả về mảng các toa tàu luôn, không cần group lại
          setCarriages(result.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách ghế:", error);
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [tripId]);

  // --- 3. GỌI API TÍNH GIÁ VÉ ---
  const fetchPrice = async (seatId) => {
      try {
          setLoadingPrice(true);
          const response = await fetch(`${API_BASE_URL}/prices/calculate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  tripId: tripId,
                  // Lấy từ context search (nếu có) hoặc mặc định
                  fromStationId: location.state?.searchDefaults?.from || 'GA01', 
                  toStationId: location.state?.searchDefaults?.to || 'GA12',
                  seatId: seatId,
                  promotionCode: null 
              })
          });
          
          const result = await response.json();
          if (result.success) {
              setNewTicketPrice(result.data.GiaThucTe); 
          }
      } catch (error) {
          console.error("Lỗi tính giá:", error);
      } finally {
          setLoadingPrice(false);
      }
  };

  // --- LOGIC CHỌN GHẾ ---
  const handleSeatClick = (seat, carriageInfo) => {
    if (seat.TrangThai === 'Booked') return;
    
    // Nếu click lại ghế đang chọn -> Bỏ chọn
    if (selectedSeat?.MaViTri === seat.MaViTri) {
        setSelectedSeat(null);
        setNewTicketPrice(0);
    } else {
        // Chọn ghế mới
        setSelectedSeat({
            ...seat,
            MaToaTau: carriageInfo.MaToaTau, // Bổ sung thông tin toa
            LoaiToa: carriageInfo.LoaiToa
        });
        // Gọi API tính giá
        fetchPrice(seat.MaViTri);
    }
  };

  // --- XÁC NHẬN ---
  const handleConfirm = () => {
    if (!selectedSeat) return;
    
    navigate('/employee/sales/exchange/confirm', {
        state: {
            oldTicketData, 
            newSeatData: {
                ...selectedSeat,
                price: newTicketPrice 
            },    
            tripId
        }
    });
  };

  // Tính chênh lệch giá
  const priceDiff = newTicketPrice - (oldTicketData.price || 0);

  // --- RENDER 1 GHẾ (COMPONENT CON) ---
  const SingleSeat = ({ seat, carriageInfo }) => {
    const isBooked = seat.TrangThai === 'Booked';
    const isSelected = selectedSeat?.MaViTri === seat.MaViTri;
    
    let baseClass = "w-10 h-10 rounded border flex items-center justify-center text-xs font-bold cursor-pointer transition-all";
    let colorClass = isBooked ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed" : 
                     isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-110" : 
                     "bg-white hover:border-blue-500 text-gray-700 border-gray-300";

    return (
        <div 
            onClick={() => handleSeatClick(seat, carriageInfo)}
            className={`${baseClass} ${colorClass}`}
            title={`Ghế ${seat.SoGhe}`}
        >
            {seat.SoGhe}
        </div>
    );
  };

  // --- RENDER NỘI DUNG TOA (Dựa trên LoaiToa) ---
  const renderCarriageContent = (carriage) => {
      // 1. Toa Ghế Ngồi (Không có Phong/Tang hoặc Phong=null)
      if (carriage.LoaiToa.includes('Ghế')) {
          return (
              <div className="p-4 flex flex-wrap gap-3 justify-center bg-slate-50">
                  {carriage.seats.map(seat => (
                      <SingleSeat key={seat.MaViTri} seat={seat} carriageInfo={carriage} />
                  ))}
              </div>
          );
      }

      // 2. Toa Giường Nằm (Có Phong) -> Group theo Phòng
      const cabins = carriage.seats.reduce((acc, seat) => {
          const cabinNum = seat.Phong || 'chung';
          if (!acc[cabinNum]) acc[cabinNum] = [];
          acc[cabinNum].push(seat);
          return acc;
      }, {});

      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-slate-50">
              {Object.entries(cabins).map(([cabinNum, cabinSeats]) => (
                  <div key={cabinNum} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-blue-50 px-2 py-1 text-center border-b border-blue-100">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Khoang {cabinNum}</span>
                      </div>
                      <div className="p-2 grid grid-cols-2 gap-2 bg-white flex-1 relative min-h-[80px]">
                          {/* Đường kẻ giữa mô phỏng lối đi hoặc tầng */}
                          {cabinSeats.map(seat => (
                              <div key={seat.MaViTri} className="flex flex-col items-center">
                                  <SingleSeat seat={seat} carriageInfo={carriage} />
                                  {seat.Tang && <span className="text-[9px] text-gray-400 mt-1">Tầng {seat.Tang}</span>}
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="p-4 bg-slate-100 min-h-screen flex flex-col md:flex-row gap-4 font-sans">
      
      {/* 1. CỘT TRÁI: DANH SÁCH TOA TÀU */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-screen pr-2 pb-20 md:pb-0">
        <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-100 z-20 py-2">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
           <div>
               <h2 className="font-bold text-xl text-gray-800">Chọn ghế mới</h2>
               <p className="text-sm text-slate-500">Chuyến tàu: <span className="font-bold text-blue-700">{tripId}</span></p>
           </div>
        </div>

        {loadingSeats ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10"/></div>
        ) : carriages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Không tìm thấy thông tin toa/ghế cho chuyến này.</div>
        ) : (
            carriages.map((carriage) => (
              <div key={carriage.MaToaTau} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
                    <h3 className="font-bold text-blue-800 text-sm">Toa {carriage.MaToaTau}</h3>
                    <span className="text-xs bg-white px-2 py-1 rounded border text-gray-600">{carriage.LoaiToa}</span>
                </div>
                
                {renderCarriageContent(carriage)}
              </div>
            ))
        )}
      </div>

      {/* 2. CỘT PHẢI: CHI TIẾT ĐỔI VÉ */}
      <div className="w-full md:w-80 h-fit sticky top-4">
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide border-b pb-3 flex items-center gap-2">
               <Ticket size={16} className="text-orange-500"/> Chi tiết đổi vé
           </h3>
           
           {/* Vé Cũ */}
           <div className="mb-4 bg-orange-50 p-3 rounded border border-orange-200 border-dashed relative">
             <div className="text-[10px] font-bold text-orange-700 uppercase mb-1">Vé hoàn lại (Cũ)</div>
             <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium truncate w-32">{oldTicketData.seatInfo}</span>
                <span className="font-bold text-red-500 line-through text-sm">
                    {oldTicketData.price.toLocaleString()} đ
                </span>
             </div>
           </div>

           {/* Vé Mới */}
           <div className="mb-6">
             <div className="text-[10px] font-bold text-blue-600 uppercase mb-2">Vé mới chọn</div>
             
             {selectedSeat ? (
               <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm animate-in fade-in">
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <div className="font-bold text-gray-800">Toa {selectedSeat.MaToaTau}</div>
                          <div className="text-xs text-gray-500">
                              Ghế {selectedSeat.SoGhe} ({selectedSeat.LoaiToa})
                          </div>
                      </div>
                      {loadingPrice ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600"/>
                      ) : (
                          <div className="font-bold text-blue-700">{newTicketPrice.toLocaleString()} đ</div>
                      )}
                  </div>
                  <button onClick={() => setSelectedSeat(null)} className="text-red-400 hover:text-red-600 text-xs underline w-full text-right">
                      Bỏ chọn
                  </button>
               </div>
             ) : (
                <div className="text-sm text-gray-400 italic py-6 flex flex-col items-center justify-center border border-dashed rounded bg-gray-50">
                    <AlertCircle size={20} className="mb-2 opacity-50"/> 
                    Vui lòng chọn 1 chỗ ngồi
                </div>
             )}
           </div>

           {/* Tổng kết Chênh lệch */}
           <div className="border-t pt-4">
             {selectedSeat && !loadingPrice && (
                 <div className="flex justify-between items-end mb-4 bg-slate-50 p-3 rounded-lg">
                   <span className="text-gray-600 font-medium text-sm">Chênh lệch:</span>
                   <div className="text-right">
                       <span className={`text-xl font-bold ${priceDiff > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                          {Math.abs(priceDiff).toLocaleString()} đ
                       </span>
                       <p className="text-[10px] text-gray-500 mt-0.5">
                           {priceDiff > 0 ? '(Khách trả thêm)' : '(Hoàn lại khách)'}
                       </p>
                   </div>
                 </div>
             )}

             <button 
               onClick={handleConfirm}
               disabled={!selectedSeat || loadingPrice}
               className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                  ${selectedSeat && !loadingPrice ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}
               `}
             >
               <CheckCircle size={18} />
               Xác nhận đổi vé
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SalesExchangeSeatSelectionPage;