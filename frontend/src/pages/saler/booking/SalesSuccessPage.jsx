import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, PlusCircle, Printer } from 'lucide-react';

const SalesSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalPrice } = location.state || { totalPrice: 0 };
  
  // Mã giao dịch giả
  const orderId = "HD" + Math.floor(Math.random() * 1000000);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} strokeWidth={3}/>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Xuất vé thành công!</h1>
        <p className="text-slate-500 mb-6">Mã đơn hàng: <span className="font-mono font-bold text-slate-700">{orderId}</span></p>

        <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
          <p className="text-sm text-slate-500 uppercase font-bold">Tổng tiền đã thu</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalPrice?.toLocaleString()} đ</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.print()}
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 flex items-center justify-center gap-2"
          >
            <Printer size={18}/> In vé ngay
          </button>
          
          <button 
            onClick={() => navigate('/employee/sales/counter')}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <PlusCircle size={18}/> Bán vé mới
          </button>
        </div>
      </div>
    </div>
  );
};
export default SalesSuccessPage;