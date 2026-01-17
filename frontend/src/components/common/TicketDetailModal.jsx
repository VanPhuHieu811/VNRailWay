import React from 'react';
import { X, QrCode, User, MapPin, Calendar, Clock, Ticket as TicketIcon } from 'lucide-react';
import '../../styles/pages/MyTickets.css'; // Dùng chung style với trang MyTickets hoặc tạo file mới

const TicketDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const { tripInfo, seats, totalPrice, maVe, ngayDat, contactInfo } = ticket;

  // Helper format tiền tệ
  const formatCurrency = (amount) => amount ? amount.toLocaleString('vi-VN') + ' ₫' : '0 ₫';

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      
      {/* Ticket Card Container */}
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* === HEADER === */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 relative text-white">
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" 
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white/20 p-1.5 rounded text-white">
                   <TicketIcon size={20} /> 
                </div>
                <h3 className="text-xl font-bold tracking-wide uppercase">Vé Tàu Hỏa</h3>
              </div>
              <p className="text-blue-100 text-xs font-medium opacity-90">Tổng công ty Đường sắt Việt Nam</p>
            </div>
            
            {/* Giả lập QR Code */}
            <div className="bg-white p-1 rounded">
                <QrCode size={48} className="text-slate-800"/>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-end">
             <div>
                <span className="text-blue-200 text-xs uppercase block mb-0.5">Mã đặt chỗ</span>
                <span className="text-2xl font-bold font-mono tracking-wider text-yellow-300">#{maVe}</span>
             </div>
             <div className="text-right">
                <span className="text-blue-200 text-xs uppercase block mb-0.5">Ngày đặt</span>
                <span className="font-medium">{new Date(ngayDat).toLocaleDateString('vi-VN')}</span>
             </div>
          </div>
        </div>

        {/* === BODY === */}
        <div className="p-6 bg-slate-50 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* 1. Hành trình */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4 border-b border-dashed border-slate-200 pb-3">
               <div>
                  <span className="text-slate-400 text-xs uppercase font-bold">Mác tàu</span>
                  <div className="text-xl font-black text-blue-700">{tripInfo.tenTau}</div>
               </div>
               <div className="text-right">
                  <span className="text-slate-400 text-xs uppercase font-bold">Ngày khởi hành</span>
                  <div className="text-lg font-bold text-slate-700 flex items-center justify-end gap-2">
                     <Calendar size={16} className="text-blue-500"/>
                     {new Date(tripInfo.ngayDi).toLocaleDateString('vi-VN')}
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-left">
                    <div className="text-2xl font-bold text-slate-800">{tripInfo.gioDi}</div>
                    <div className="flex items-center gap-1 text-slate-500 font-medium text-sm mt-1">
                        <MapPin size={14}/> {tripInfo.gaDi}
                    </div>
                </div>

                {/* Line nối */}
                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full h-[2px] bg-slate-200 relative mt-2">
                        <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-slate-300"></div>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 font-medium">Thời gian di chuyển</span>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-400">{tripInfo.gioDen || '--:--'}</div>
                    <div className="flex items-center justify-end gap-1 text-slate-500 font-medium text-sm mt-1">
                        {tripInfo.gaDen} <MapPin size={14}/> 
                    </div>
                </div>
            </div>
          </div>

          {/* 2. Chi tiết ghế & Hành khách */}
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1 flex items-center gap-1">
             <User size={14}/> Danh sách hành khách ({seats.length})
          </h4>
          
          <div className="space-y-3 mb-6">
            {seats.map((seat, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                {/* Dải màu bên trái */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                        <div className="font-bold text-slate-800 uppercase text-sm">
                            {seat.hanhKhach || contactInfo?.hoTen || 'Hành khách'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">{formatCurrency(seat.price)}</div>
                        <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded inline-block mt-1 font-medium border border-blue-100">
                            {tripInfo.LoaiToa || 'Thường'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 rounded p-2 mt-2 ml-2 text-sm border border-slate-100">
                    <span className="font-medium text-slate-600">Toa {seat.maToa || seat.tenToa}</span>
                    <span className="h-4 w-[1px] bg-slate-300 mx-2"></span>
                    <span className="font-bold text-slate-800">Ghế số {seat.seatNum}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Notes */}
          <div className="text-[10px] text-slate-400 space-y-1 italic text-center border-t border-slate-200 pt-4">
             <p>• Vui lòng có mặt tại ga trước giờ tàu chạy ít nhất 30 phút.</p>
             <p>• Khi lên tàu, quý khách xuất trình vé điện tử kèm giấy tờ tùy thân.</p>
             <p>• Vé đã mua không hoàn trả. Mọi thắc mắc vui lòng liên hệ 1900 6469.</p>
          </div>

        </div>

        {/* === FOOTER: TỔNG TIỀN === */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
            <span className="text-slate-500 text-sm font-medium">Tổng thanh toán</span>
            <span className="text-2xl font-bold text-red-600">{formatCurrency(totalPrice)}</span>
        </div>

      </div>
    </div>
  );
};

export default TicketDetailModal;