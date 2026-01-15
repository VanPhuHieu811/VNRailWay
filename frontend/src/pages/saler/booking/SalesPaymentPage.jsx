import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer, CreditCard, Banknote } from 'lucide-react';
import { LICH_TRINH_DB } from '../../../services/db_mock';

const SalesPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSeats, tripId, passengers, totalPrice } = location.state || {};

  const tripInfo = LICH_TRINH_DB.find(t => t.id === tripId) || { tenTau: 'Unknown' };
  const [method, setMethod] = useState('cash'); // Mặc định tiền mặt cho Sales

  const handleConfirm = () => {
    // Gọi API tạo order tại đây...
    navigate('/employee/sales/success', {
      state: { selectedSeats, tripInfo, passengers, totalPrice }
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cột trái: Review */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="font-bold text-lg mb-2 text-slate-800">Thông tin đơn hàng</h3>
            <p className="text-slate-600">Tàu: <span className="font-bold text-blue-700">{tripInfo.tenTau}</span></p>
            <p className="text-slate-600">Hành trình: {tripInfo.gaDi} ➝ {tripInfo.gaDen}</p>
            <p className="text-slate-600">Ngày đi: {tripInfo.ngayDi} - {tripInfo.gioDi}</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow-sm">
             <h3 className="font-bold text-sm text-slate-500 uppercase mb-3">Chi tiết vé ({selectedSeats.length})</h3>
             <div className="space-y-2">
               {passengers.map((p, idx) => (
                 <div key={idx} className="flex justify-between text-sm border-b border-dashed pb-2">
                   <div>
                     <div className="font-bold">{p.fullName}</div>
                     <div className="text-xs text-slate-500">{p.seatLabel} ({p.type})</div>
                   </div>
                   <div className="font-bold text-slate-700">
                     {selectedSeats.find(s => s.id === p.seatId)?.price.toLocaleString()}
                   </div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between items-center mt-4 pt-2 border-t font-bold text-lg">
               <span>Tổng thu:</span>
               <span className="text-red-600">{totalPrice.toLocaleString()} đ</span>
             </div>
          </div>
        </div>

        {/* Cột phải: Phương thức */}
        <div className="bg-white p-6 rounded shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4">Hình thức thanh toán</h3>
          
          <div className="space-y-3 mb-6">
            <div 
              onClick={() => setMethod('cash')}
              className={`p-4 border rounded cursor-pointer flex items-center gap-3 ${method === 'cash' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'hover:bg-slate-50'}`}
            >
              <Banknote size={24}/>
              <div>
                <div className="font-bold">Tiền mặt</div>
                <div className="text-xs">Thu tiền trực tiếp tại quầy</div>
              </div>
            </div>

            <div 
              onClick={() => setMethod('card')}
              className={`p-4 border rounded cursor-pointer flex items-center gap-3 ${method === 'card' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'hover:bg-slate-50'}`}
            >
              <CreditCard size={24}/>
              <div>
                <div className="font-bold">Thẻ / POS</div>
                <div className="text-xs">Quẹt thẻ ngân hàng</div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Printer size={20}/> Xác nhận & Xuất vé
          </button>
          
          <button onClick={() => navigate(-1)} className="w-full mt-3 text-slate-500 text-sm hover:underline">
            Quay lại sửa thông tin
          </button>
        </div>

      </div>
    </div>
  );
};
export default SalesPaymentPage;