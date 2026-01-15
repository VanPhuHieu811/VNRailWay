import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';

const SalesExchangeSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { diff, isPayMore } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} strokeWidth={3}/>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Đổi vé thành công!</h1>
        <p className="text-slate-500 mb-6">Giao dịch đã được ghi nhận vào hệ thống.</p>
        
        <div className="bg-slate-50 p-4 rounded mb-6 text-left text-sm">
           <div className="flex justify-between mb-2">
             <span>Trạng thái tiền:</span>
             <span className="font-bold">{isPayMore ? "Đã thu thêm" : "Đã hoàn tiền"}</span>
           </div>
           <div className="flex justify-between text-lg font-bold text-slate-800">
             <span>Số tiền:</span>
             <span>{Math.abs(diff).toLocaleString()} đ</span>
           </div>
        </div>

        <button 
          onClick={() => navigate('/employee/sales/exchange')}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18}/> Đổi vé khác
        </button>
      </div>
    </div>
  );
};
export default SalesExchangeSuccessPage;