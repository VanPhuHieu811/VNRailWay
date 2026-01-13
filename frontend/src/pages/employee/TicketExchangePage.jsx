import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Ticket, User, Train, ArrowRight, AlertCircle, RefreshCw, 
  CreditCard, Armchair, Clock, MapPin 
} from 'lucide-react';
import { VE_DA_DAT_DB } from '../../services/db_mock';
import ExchangeSteps from '../../components/common/ExchangeSteps'; 
import '../../styles/pages/employee/TicketExchangePage.css';

const TicketExchangePage = () => {
  const navigate = useNavigate();
  
  // State quản lý input
  const [ticketCode, setTicketCode] = useState('');
  const [passengerCCCD, setPassengerCCCD] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // State kết quả tìm kiếm
  const [foundResult, setFoundResult] = useState(null); // { ticket: object, seat: object }

  // --- LOGIC 1: TRA CỨU VÉ ---
  const handleSearch = () => {
    setErrorMsg('');
    setFoundResult(null);

    // Validate input
    if (!ticketCode.trim() || !passengerCCCD.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Mã vé và Số giấy tờ tùy thân (CCCD).');
      return;
    }

    // 1. Tìm vé trong DB (Phải là vé đang Active - Đã thanh toán)
    const ticket = VE_DA_DAT_DB.find(t => t.maVe === ticketCode.trim() && t.status === 'active');

    if (!ticket) {
      setErrorMsg('Không tìm thấy vé hợp lệ hoặc vé đã bị hủy/sử dụng.');
      return;
    }

    // 2. Tìm ghế của hành khách có CCCD tương ứng trong vé đó
    // Lưu ý: Dữ liệu seats trong db_mock.js PHẢI có trường passengerID
    const seat = ticket.seats.find(s => s.passengerID === passengerCCCD.trim());

    if (!seat) {
      setErrorMsg(`Tìm thấy vé ${ticket.maVe} nhưng không có hành khách nào khớp với CCCD này.`);
      return;
    }

    // 3. Tìm thấy hợp lệ -> Lưu vào state để hiển thị chi tiết
    setFoundResult({ ticket, seat });
  };

  // --- LOGIC 2: TIẾP TỤC ĐỔI VÉ ---
  const handleProceedExchange = () => {
    if (!foundResult) return;
    const { ticket, seat } = foundResult;

    // Chuyển hướng sang trang Tìm kiếm chuyến tàu (SearchResultsPage)
    // Kèm theo dữ liệu vé cũ để tính toán chênh lệch sau này
    navigate('/employee/sales/exchange/search', { 
      state: {
        isExchange: true,
        exchangeData: {
          originalTicketCode: ticket.maVe,
          originalSeatId: seat.id,
          exchangeValue: seat.price,
          seatsToExchange: [seat]
        },
        from: ticket.tripInfo.gaDi === "Hà Nội" ? "HN" : ticket.tripInfo.gaDi, 
        to: ticket.tripInfo.gaDen === "TP.Hồ Chí Minh" ? "SG" : ticket.tripInfo.gaDen,
        date: new Date().toISOString().split('T')[0] 
      }
    });
  };

  // Hàm reset form để tìm vé khác
  const handleReset = () => {
    setFoundResult(null);
    setTicketCode('');
    setPassengerCCCD('');
    setErrorMsg('');
  };

  // Xác định bước hiện tại cho Navbar: 1 (Tra cứu) hoặc 2 (Chi tiết vé)
  const currentStep = foundResult ? 2 : 1;

  return (
    <div className="page-wrapper">
      {/* 1. THANH NAVBAR (ExchangeSteps) */}
      {/* Truyền isEmployee={true} để hiển thị đúng thứ tự bước của Sales */}
      <ExchangeSteps currentStep={currentStep} isEmployee={true} />

      <div className="exchange-container">
        
        {/* ========================================================= */}
        {/* VIEW 1: FORM TÌM KIẾM (Hiển thị khi chưa tìm thấy vé)     */}
        {/* ========================================================= */}
        {!foundResult && (
          <>
            <div className="page-header mb-6">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw size={28} className="text-blue-600"/> Tra cứu vé cần đổi
              </h1>
              <p className="text-slate-500">Nhập mã vé hoặc số điện thoại để tìm vé cần đổi</p>
            </div>

            <div className="search-box-card">
              <div className="search-body">
                {/* Tabs giả lập */}
                <div className="tab-header mb-4 flex border-b border-gray-200">
                   <button className="py-2 px-4 text-blue-600 font-bold border-b-2 border-blue-600">Tra theo mã vé</button>
                </div>

                {/* Input Mã vé */}
                <div className="form-group mb-4">
                   <label className="block text-sm font-bold text-slate-700 mb-2">Mã vé <span className="text-red-500">*</span></label>
                   <input 
                      type="text" 
                      className="search-input-lg w-full"
                      placeholder="Ví dụ: TK1763952793154"
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                   />
                </div>
                
                {/* Input CCCD */}
                <div className="form-group mb-6">
                   <label className="block text-sm font-bold text-slate-700 mb-2">CCCD/CMND Hành khách <span className="text-red-500">*</span></label>
                   <input 
                      type="text" 
                      className="search-input-lg w-full"
                      placeholder="Ví dụ: 0123456789 (để xác định đúng ghế cần đổi)"
                      value={passengerCCCD}
                      onChange={(e) => setPassengerCCCD(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   />
                </div>

                {/* Thông báo lỗi */}
                {errorMsg && (
                  <div className="error-msg mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 flex items-center gap-2 text-sm">
                    <AlertCircle size={16}/> {errorMsg}
                  </div>
                )}

                {/* Buttons Action */}
                <div className="flex gap-3">
                   <button className="btn-search-lg flex-1" onClick={handleSearch}>
                      <Search size={18}/> Tra cứu vé
                   </button>
                   <button className="btn-back-outline w-32" onClick={() => navigate(-1)}>Quay lại</button>
                </div>
              </div>
              
              {/* Note Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-sm text-slate-600 rounded-b-lg">
                <strong>Lưu ý:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Chỉ có thể đổi vé trong trạng thái "Đã thanh toán".</li>
                  <li>Phí đổi vé sẽ được tính theo quy định hiện hành.</li>
                  <li>Kiểm tra kỹ thông tin vé trước khi xác nhận đổi.</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CHI TIẾT VÉ (Hiển thị khi ĐÃ tìm thấy vé)         */}
        {/* ========================================================= */}
        {foundResult && (
          <div className="detail-card-lg animate-fade-in border border-slate-200 shadow-sm mt-4">
            
            {/* Header Card */}
            <div className="detail-header flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
               <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <Ticket className="text-blue-600" size={24}/> Thông tin vé hiện tại
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Kiểm tra thông tin vé trước khi đổi sang chuyến mới</p>
               </div>
               <span className="badge-status-paid">Đã thanh toán</span>
            </div>

            {/* Section 1: Thông tin cơ bản */}
            <div className="grid grid-cols-2 gap-12 mb-8">
               <div>
                  <label className="text-xs text-slate-500 uppercase font-semibold mb-1 block">Mã vé</label>
                  <p className="text-lg font-bold text-slate-800">{foundResult.ticket.maVe}</p>
               </div>
               <div>
                  <label className="text-xs text-slate-500 uppercase font-semibold mb-1 block">Ngày mua</label>
                  <p className="text-lg font-bold text-slate-800">
                     {new Date(foundResult.ticket.ngayDat).toLocaleDateString('vi-VN')}
                  </p>
               </div>
            </div>

            {/* Section 2: Thông tin khách hàng */}
            <div className="info-section mb-8">
               <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm">
                  <User size={16}/> THÔNG TIN KHÁCH HÀNG
               </h4>
               <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-8">
                  <div>
                     <label className="text-xs text-slate-500 block mb-1">Họ tên</label>
                     <p className="font-bold text-slate-800">{foundResult.seat.passengerName || "Khách lẻ"}</p>
                  </div>
                  <div>
                     <label className="text-xs text-slate-500 block mb-1">Số điện thoại</label>
                     <p className="font-bold text-slate-800">{foundResult.ticket.customerInfo?.sdt || "---"}</p>
                  </div>
                  <div>
                     <label className="text-xs text-slate-500 block mb-1">CMND/CCCD</label>
                     <p className="font-bold text-slate-800">{foundResult.seat.passengerID}</p>
                  </div>
               </div>
            </div>

            {/* Section 3: Thông tin chuyến tàu */}
            <div className="info-section mb-8">
               <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm">
                  <Train size={16}/> THÔNG TIN CHUYẾN TÀU
               </h4>
               <div className="bg-slate-50 p-6 rounded-lg relative overflow-hidden">
                  <div className="flex justify-between mb-4">
                     <span className="text-xl font-bold text-slate-800">{foundResult.ticket.tripInfo.tenTau}</span>
                     <span className="bg-white border px-2 py-1 rounded text-xs font-semibold text-slate-500 shadow-sm">Thống Nhất</span>
                  </div>
                  <div className="flex justify-between items-center">
                     {/* Ga Đi */}
                     <div className="text-left">
                        <span className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin size={12}/> Ga đi</span>
                        <strong className="block text-lg text-slate-800">{foundResult.ticket.tripInfo.gaDi}</strong>
                        <div className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                           <Clock size={14}/> {foundResult.ticket.tripInfo.gioDi}
                        </div>
                     </div>

                     {/* Mũi tên & Thời gian */}
                     <div className="flex-1 px-8 text-center relative">
                        <div className="border-t-2 border-dashed border-slate-300 w-full absolute top-1/2 left-0 -z-0"></div>
                        <span className="bg-slate-50 px-2 text-xs text-slate-400 relative z-10">
                           <ArrowRight size={16} className="inline"/>
                        </span>
                        <p className="text-xs text-slate-400 mt-2">{foundResult.ticket.tripInfo.thoiGianChay}</p>
                     </div>

                     {/* Ga Đến */}
                     <div className="text-right">
                        <span className="text-xs text-slate-500 flex items-center gap-1 justify-end mb-1"><MapPin size={12}/> Ga đến</span>
                        <strong className="block text-lg text-slate-800">{foundResult.ticket.tripInfo.gaDen}</strong>
                        <div className="text-slate-500 text-sm mt-1 flex items-center gap-1 justify-end">
                           <Clock size={14}/> {foundResult.ticket.tripInfo.gioDen}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Section 4: Thông tin chỗ ngồi & Giá */}
            <div className="info-section mb-8">
               <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm">
                  <Armchair size={16}/> THÔNG TIN CHỖ NGỒI
               </h4>
               <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-lg">
                  <div>
                     <span className="block font-bold text-slate-800 text-lg mb-1">
                        {foundResult.seat.tenToa} - Ghế {foundResult.seat.seatNum}
                     </span>
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {foundResult.seat.loaiToa}
                     </span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                     {foundResult.seat.price.toLocaleString()}đ
                  </span>
               </div>
            </div>

            {/* Footer: Tổng tiền & Action Buttons */}
            <div className="footer-section bg-blue-50 p-6 rounded-lg flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <CreditCard size={24} className="text-blue-600"/>
                  <div>
                     <span className="block text-sm text-slate-500">Tổng giá trị vé</span>
                     <span className="text-2xl font-bold text-blue-700">{foundResult.seat.price.toLocaleString()}đ</span>
                  </div>
               </div>
               
               <div className="flex gap-3">
                  <button className="btn-back-outline bg-white" onClick={handleReset}>
                     Quay lại
                  </button>
                  <button className="btn-primary-action" onClick={handleProceedExchange}>
                     Tiếp tục đổi vé
                  </button>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TicketExchangePage;  