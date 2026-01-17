// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { ArrowRight, Printer, RefreshCw, User, Edit3 } from 'lucide-react';
// import { LICH_TRINH_DB } from '../../../services/db_mock';
// // Import Modal sửa khách (đảm bảo đường dẫn đúng với cấu trúc thư mục của bạn)
// import EditPassengerModal from '../../../components/common/EditPassengerModal'; 

// const SalesExchangeConfirmPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { oldTicketData, newSeatData, tripId } = location.state || {};

//   const tripInfo = LICH_TRINH_DB.find(t => t.id === tripId) || {};

//   // --- 1. STATE QUẢN LÝ THÔNG TIN KHÁCH HÀNG MỚI ---
//   // Mặc định lấy thông tin từ vé cũ
//   const [newPassenger, setNewPassenger] = useState({
//     fullName: oldTicketData?.passengerName || '',
//     passengerID: oldTicketData?.passengerID || '',
//     type: 'Người lớn', // Mặc định hoặc lấy từ dữ liệu cũ nếu có
//     phone: '',         // Các trường này có thể rỗng nếu dữ liệu cũ không có
//     dob: '',
//     address: ''
//   });

//   const [isEditingPassenger, setIsEditingPassenger] = useState(false);

//   // --- 2. TÍNH TOÁN ---
//   const diff = (newSeatData?.price || 0) - (oldTicketData?.price || 0);
//   const isPayMore = diff >= 0;

//   // --- 3. HÀM XỬ LÝ ---
//   const handleUpdatePassenger = (updatedInfo) => {
//     setNewPassenger({
//         ...newPassenger,
//         ...updatedInfo
//     });
//   };

//   const handleFinish = () => {
//     // API Call đổi vé tại đây (Gửi kèm thông tin newPassenger)
//     console.log("Đổi vé cho khách:", newPassenger);

//     navigate('/employee/sales/exchange/success', {
//       state: { 
//         diff, 
//         isPayMore,
//         finalPassenger: newPassenger // Truyền thông tin khách mới sang trang in vé
//       }
//     });
//   };

//   if (!oldTicketData || !newSeatData) return <div>Không có dữ liệu đổi vé</div>;

//   return (
//     <div className="p-8 bg-slate-50 min-h-screen flex justify-center">
//       <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="bg-blue-600 p-4 text-white font-bold text-lg flex items-center gap-2">
//           <RefreshCw/> Xác nhận giao dịch đổi vé
//         </div>

//         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
//           {/* Mũi tên ở giữa */}
//           <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full border shadow-sm z-10">
//             <ArrowRight size={24} className="text-slate-400"/>
//           </div>

//           {/* === CỘT TRÁI: VÉ CŨ === */}
//           <div className="bg-slate-50 p-4 rounded border border-slate-200">
//             <div className="text-xs font-bold text-slate-500 uppercase mb-2">Vé cũ (Thu hồi)</div>
//             <div className="text-lg font-bold text-slate-800">{oldTicketData.ticketCode}</div>
            
//             {/* Thông tin khách cũ (Cố định) */}
//             <div className="flex items-center gap-2 text-sm text-slate-600 mb-2 mt-1">
//                 <User size={14} /> 
//                 <span>{oldTicketData.passengerName} - {oldTicketData.passengerID}</span>
//             </div>

//             <div className="border-t border-dashed border-slate-300 my-2 pt-2">
//               <div className="flex justify-between">
//                 <span>Giá trị vé:</span>
//                 <span className="font-bold">{oldTicketData.price.toLocaleString()} đ</span>
//               </div>
//             </div>
//           </div>

//           {/* === CỘT PHẢI: VÉ MỚI (CHO PHÉP SỬA KHÁCH) === */}
//           <div className="bg-blue-50 p-4 rounded border border-blue-200">
//             <div className="text-xs font-bold text-blue-600 uppercase mb-2">Vé mới (Xuất vé)</div>
//             <div className="text-lg font-bold text-slate-800">{tripInfo.tenTau} ({tripInfo.gaDi} - {tripInfo.gaDen})</div>
//             <div className="text-sm text-slate-600 mb-2">
//                {tripInfo.ngayDi} | {newSeatData.tenToa} - Ghế {newSeatData.seatNum}
//             </div>

//             {/* --- KHU VỰC THÔNG TIN KHÁCH MỚI --- */}
//             <div className="bg-white p-3 rounded border border-blue-100 mb-2 shadow-sm">
//                 <div className="flex justify-between items-start">
//                     <div>
//                         <div className="text-xs text-slate-400 font-bold uppercase mb-1">Hành khách đi tàu</div>
//                         <div className="font-bold text-slate-800 text-sm uppercase">{newPassenger.fullName}</div>
//                         <div className="text-xs text-slate-500">CCCD: {newPassenger.passengerID}</div>
//                         <div className="text-xs text-slate-500">Loại: {newPassenger.type}</div>
//                     </div>
                    
//                     {/* Nút sửa */}
//                     <button 
//                         onClick={() => setIsEditingPassenger(true)}
//                         className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
//                     >
//                         <Edit3 size={14}/> Sửa
//                     </button>
//                 </div>
//             </div>

//             <div className="border-t border-dashed border-blue-300 my-2 pt-2">
//               <div className="flex justify-between">
//                 <span>Giá vé mới:</span>
//                 <span className="font-bold text-blue-700">{newSeatData.price.toLocaleString()} đ</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Phần thanh toán */}
//         <div className="bg-slate-100 p-6 border-t border-slate-200">
//            <div className="flex justify-between items-center mb-6 max-w-lg mx-auto bg-white p-4 rounded shadow-sm">
//               <span className="text-lg font-bold text-slate-700">
//                 {isPayMore ? "Khách cần trả thêm:" : "Hoàn lại cho khách:"}
//               </span>
//               <span className={`text-2xl font-bold ${isPayMore ? 'text-red-600' : 'text-green-600'}`}>
//                  {Math.abs(diff).toLocaleString()} đ
//               </span>
//            </div>

//            <div className="flex justify-end gap-3">
//              <button onClick={() => navigate(-1)} className="px-6 py-3 rounded font-bold text-slate-600 hover:bg-slate-200">
//                Quay lại
//              </button>
//              <button onClick={handleFinish} className="px-6 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2">
//                <Printer size={18}/> Xác nhận & In vé mới
//              </button>
//            </div>
//         </div>
//       </div>

//       {/* --- MODAL SỬA THÔNG TIN --- */}
//       {isEditingPassenger && (
//         <EditPassengerModal 
//             passenger={newPassenger}
//             onClose={() => setIsEditingPassenger(false)}
//             onSave={handleUpdatePassenger}
//         />
//       )}
//     </div>
//   );
// };

// export default SalesExchangeConfirmPage;


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Printer, RefreshCw, User, Edit3, Loader2 } from 'lucide-react';
import EditPassengerModal from '../../../components/common/EditPassengerModal'; 

// Cấu hình URL API (Điều chỉnh port nếu cần)
const API_BASE_URL = 'http://localhost:3000/api/v1';

const SalesExchangeConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { oldTicketData, newSeatData, tripId } = location.state || {};

  // Mock thông tin chuyến tàu mới (Hoặc lấy từ API trip detail nếu có)
  const tripInfo = {
      tenTau: newSeatData?.tenTau || tripId, 
      gaDi: oldTicketData?.searchDefaults?.from || '---',
      gaDen: oldTicketData?.searchDefaults?.to || '---',
      ngayDi: oldTicketData?.searchDefaults?.date || '---'
  };

  // --- 1. STATE ---
  const [newPassenger, setNewPassenger] = useState({
    fullName: oldTicketData?.passengerName || '',
    passengerID: oldTicketData?.identity || '', 
    type: 'Người lớn', 
    phone: '',        
    dob: '',      // [MỚI] Ngày sinh
    address: ''   // [MỚI] Địa chỉ
  });

  const [isEditingPassenger, setIsEditingPassenger] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state

  // --- 2. TÍNH TOÁN HIỂN THỊ (Frontend estimate) ---
  const diff = (newSeatData?.price || 0) - (oldTicketData?.price || 0);
  const isPayMore = diff >= 0;

  // --- 3. HÀM XỬ LÝ ---
  const handleUpdatePassenger = (updatedInfo) => {
    setNewPassenger({ ...newPassenger, ...updatedInfo });
  };

  // [QUAN TRỌNG] GỌI API ĐỔI VÉ
  const handleFinish = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
        const token = localStorage.getItem('accessToken');
        
        // Payload gửi lên Backend (Khớp với Service Backend)
        const payload = {
            // Thông tin vé
            oldTicketCode: oldTicketData.ticketCode,
            newTripId: tripId,
            newSeatId: newSeatData.MaViTri, 
            newPrice: newSeatData.price,
            
            // Lấy từ context search trước đó hoặc mặc định
            fromStation: location.state?.searchDefaults?.from || 'GA01', 
            toStation: location.state?.searchDefaults?.to || 'GA12',
            
            // Thông tin khách hàng (Lấy từ state newPassenger)
            passengerName: newPassenger.fullName,
            passengerID: newPassenger.passengerID,
            passengerPhone: newPassenger.phone,
            passengerType: newPassenger.type,
            
            // [MỚI] Gửi thêm ngày sinh và địa chỉ
            passengerDob: newPassenger.dob,         // Format: YYYY-MM-DD
            passengerAddress: newPassenger.address, 
            
            // Thông tin nhân viên (Lấy từ token decode hoặc localStorage)
            staffId: 'NV001' // Ví dụ hardcode, thực tế lấy từ userContext
        };

        // Gọi API
        const response = await fetch(`${API_BASE_URL}/tickets/confirm-exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            // Thành công -> Chuyển trang Success với dữ liệu từ DB trả về
            navigate('/employee/sales/exchange/success', {
              state: { 
                // Data từ SQL trả về (MaVeMoi, MaDoiVe, TongTienThanhToan...)
                finalData: result.data, 
                // Thông tin khách để hiển thị lại nếu cần
                passenger: newPassenger 
              }
            });
        } else {
            // Hiển thị lỗi từ Backend (VD: Vé cũ trạng thái không hợp lệ)
            alert(`Lỗi đổi vé: ${result.message}`);
        }

    } catch (error) {
        console.error("API Error:", error);
        alert("Có lỗi xảy ra khi kết nối server.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (!oldTicketData || !newSeatData) return <div>Dữ liệu không hợp lệ. Vui lòng thực hiện lại từ đầu.</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white font-bold text-lg flex items-center gap-2">
          <RefreshCw/> Xác nhận giao dịch đổi vé
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full border shadow-sm z-10">
            <ArrowRight size={24} className="text-slate-400"/>
          </div>

          {/* VÉ CŨ */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Vé cũ (Thu hồi)</div>
            <div className="text-lg font-bold text-slate-800">{oldTicketData.ticketCode}</div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2 mt-1">
                <User size={14} /> 
                <span>{oldTicketData.passengerName} - {oldTicketData.identity}</span>
            </div>
            <div className="border-t border-dashed border-slate-300 my-2 pt-2 flex justify-between">
                <span>Giá trị vé:</span>
                <span className="font-bold">{oldTicketData.price.toLocaleString()} đ</span>
            </div>
          </div>

          {/* VÉ MỚI & THÔNG TIN KHÁCH */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <div className="text-xs font-bold text-blue-600 uppercase mb-2">Vé mới (Xuất vé)</div>
            <div className="text-lg font-bold text-slate-800">
                {tripId} ({tripInfo.gaDi} - {tripInfo.gaDen})
            </div>
            <div className="text-sm text-slate-600 mb-2">
               {tripInfo.ngayDi} | {newSeatData.MaToaTau ? `Toa ${newSeatData.MaToaTau}` : ''} - Ghế {newSeatData.SoGhe}
            </div>

            {/* BOX KHÁCH HÀNG (CÓ NÚT SỬA) */}
            <div className="bg-white p-3 rounded border border-blue-100 mb-2 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Hành khách đi tàu</div>
                        <div className="font-bold text-slate-800 text-sm uppercase">{newPassenger.fullName}</div>
                        <div className="text-xs text-slate-500">CCCD: {newPassenger.passengerID}</div>
                        {/* Hiển thị thêm thông tin mới nếu có */}
                        {newPassenger.dob && <div className="text-xs text-slate-500">NS: {newPassenger.dob}</div>}
                    </div>
                    <button 
                        onClick={() => setIsEditingPassenger(true)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                        <Edit3 size={14}/> Sửa
                    </button>
                </div>
            </div>

            <div className="border-t border-dashed border-blue-300 my-2 pt-2 flex justify-between">
                <span>Giá vé mới:</span>
                <span className="font-bold text-blue-700">{newSeatData.price.toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {/* FOOTER THANH TOÁN */}
        <div className="bg-slate-100 p-6 border-t border-slate-200">
           <div className="flex justify-between items-center mb-6 max-w-lg mx-auto bg-white p-4 rounded shadow-sm">
              <div>
                  <span className="text-lg font-bold text-slate-700 block">
                    {isPayMore ? "Khách cần trả thêm:" : "Hoàn lại cho khách:"}
                  </span>
                  <span className="text-xs text-slate-400 italic">(Chưa bao gồm phí đổi vé)</span>
              </div>
              <span className={`text-2xl font-bold ${isPayMore ? 'text-red-600' : 'text-green-600'}`}>
                 {Math.abs(diff).toLocaleString()} đ
              </span>
           </div>

           <div className="flex justify-end gap-3">
             <button 
                onClick={() => navigate(-1)} 
                className="px-6 py-3 rounded font-bold text-slate-600 hover:bg-slate-200" 
                disabled={isProcessing}
             >
               Quay lại
             </button>
             <button 
                onClick={handleFinish} 
                className="px-6 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
                disabled={isProcessing}
             >
               {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Printer size={18}/>} 
               {isProcessing ? 'Đang xử lý...' : 'Xác nhận & In vé mới'}
             </button>
           </div>
        </div>
      </div>

      {/* Modal Sửa Khách */}
      {isEditingPassenger && (
        <EditPassengerModal 
            passenger={newPassenger}
            onClose={() => setIsEditingPassenger(false)}
            onSave={handleUpdatePassenger}
        />
      )}
    </div>
  );
};

export default SalesExchangeConfirmPage;