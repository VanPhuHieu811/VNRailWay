import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Ticket, User, Train, ArrowRight, AlertCircle, RefreshCw, 
  CreditCard, Armchair, Clock, MapPin, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

// --- MOCK DATA (MÔ PHỎNG DỮ LIỆU TỪ API/DB) ---
// Giả sử API trả về dữ liệu đã được JOIN từ các bảng VE_TAU, KHACH_HANG, CHUYEN_TAU...
const VE_DA_DAT_DB = [
    {
        // Thông tin bảng VE_TAU
        MaVe: "VE882910",
        MaKhachHang: "KH001",
        MaChuyenTau: "SE7-27",
        MaViTri: "GHE-01-15",
        ThoiGianXuatVe: "2026-01-10T08:30:00",
        GaXuatPhat: "Hà Nội",
        GaDen: "Đà Nẵng",
        GiaThuc: 850000,
        TrangThai: "DA_THANH_TOAN", // active

        // Thông tin JOIN thêm để hiển thị
        TenKhachHang: "Nguyễn Văn A",
        CCCD: "0123456789", // Key để tra cứu
        SDT: "0987654321",
        
        TenTau: "SE7",
        ThoiGianDi: "2026-02-15T19:00:00",
        ThoiGianDen: "2026-02-16T11:30:00",
        
        TenToa: "Toa 1",
        LoaiToa: "Ngồi mềm điều hòa",
        SoGhe: "15"
    },
    {
        MaVe: "VE999999",
        MaKhachHang: "KH002",
        MaChuyenTau: "TN1-05",
        MaViTri: "GHE-03-22",
        ThoiGianXuatVe: "2025-12-20T10:00:00",
        GaXuatPhat: "Sài Gòn",
        GaDen: "Nha Trang",
        GiaThuc: 450000,
        TrangThai: "DA_SU_DUNG", // Đã đi rồi -> Không đổi được

        TenKhachHang: "Trần Thị B",
        CCCD: "9876543210",
        SDT: "0909090909",
        
        TenTau: "TN1",
        ThoiGianDi: "2025-12-25T06:00:00",
        ThoiGianDen: "2025-12-25T14:00:00",
        
        TenToa: "Toa 3",
        LoaiToa: "Giường nằm khoang 6",
        SoGhe: "22"
    }
];

const TicketExchangePage = () => {
  const navigate = useNavigate();
  
  // State quản lý input
  const [ticketCode, setTicketCode] = useState('');
  const [passengerCCCD, setPassengerCCCD] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // State kết quả tìm kiếm
  const [foundTicket, setFoundTicket] = useState(null);

  // --- LOGIC 1: TRA CỨU VÉ ---
  const handleSearch = () => {
    setErrorMsg('');
    setFoundTicket(null);

    // 1. Validate Input
    if (!ticketCode.trim() || !passengerCCCD.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Mã vé và Số CCCD/CMND.');
      return;
    }

    // 2. Tìm trong DB giả lập
    const ticket = VE_DA_DAT_DB.find(t => 
        t.MaVe === ticketCode.trim() && 
        t.CCCD === passengerCCCD.trim()
    );

    // 3. Xử lý kết quả
    if (!ticket) {
      setErrorMsg('Không tìm thấy vé hoặc thông tin CCCD không khớp.');
      return;
    }

    if (ticket.TrangThai !== 'DA_THANH_TOAN') {
       setErrorMsg(`Vé này đang ở trạng thái "${ticket.TrangThai}", không thể đổi.`);
       return;
    }

    // 4. Thành công -> Hiện chi tiết
    setFoundTicket(ticket);
    toast.success("Đã tìm thấy thông tin vé!");
  };

  // --- LOGIC 2: TIẾP TỤC ĐỔI VÉ ---
  const handleProceedExchange = () => {
    if (!foundTicket) return;

    // Chuẩn bị dữ liệu để đẩy sang trang Search (SalesExchangeSearchPage)
    // Cấu trúc object phải khớp với những gì trang Search đang mong đợi
    const oldTicketData = {
        id: foundTicket.MaVe,             // ID unique
        ticketCode: foundTicket.MaVe,     // Mã hiển thị
        price: foundTicket.GiaThuc,       // Giá để tính chênh lệch
        seatInfo: `${foundTicket.TenToa} - Ghế ${foundTicket.SoGhe}`, // Hiển thị ghế cũ
        passengerName: foundTicket.TenKhachHang,
        identity: foundTicket.CCCD
    };
    const mapStationToCode = (name) => {
        if (name === "Hà Nội") return "HN";
        if (name === "Sài Gòn" || name === "TP.Hồ Chí Minh") return "SG";
        if (name === "Đà Nẵng") return "DN";
        if (name === "Nha Trang") return "NT";
        if (name === "Huế") return "HUE";
        return "HN"; // Mặc định
    };

    const searchDefaults = {
        from: mapStationToCode(foundTicket.GaXuatPhat), 
        to: mapStationToCode(foundTicket.GaDen),     
        date: '2026-01-16'
    };

    navigate('/employee/sales/exchange/search', { 
      state: {
        oldTicketData,
        searchDefaults
      }
    });
  };

  // Hàm reset form
  const handleReset = () => {
    setFoundTicket(null);
    setTicketCode('');
    setPassengerCCCD('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw size={28} className="text-blue-600"/> Nghiệp vụ Đổi vé tàu
          </h1>
          <p className="text-slate-500 mt-1">Tra cứu vé cũ của khách hàng để thực hiện đổi sang chuyến khác.</p>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* ========================================================= */}
        {/* VIEW 1: FORM TRA CỨU (Luôn hiển thị nếu chưa tìm thấy)   */}
        {/* ========================================================= */}
        {!foundTicket && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
             <div className="flex border-b border-gray-100 mb-6 pb-2">
                <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 px-1">Tra cứu vé điện tử</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mã vé <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-700 uppercase"
                            placeholder="VD: VE882910"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value)}
                        />
                        <Ticket className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Nhập chính xác mã vé in trên thẻ lên tàu.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Giấy tờ tùy thân (CCCD) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-700"
                            placeholder="VD: 0123456789"
                            value={passengerCCCD}
                            onChange={(e) => setPassengerCCCD(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <User className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Dùng để xác thực chủ sở hữu vé.</p>
                </div>
             </div>

             {/* Error Message */}
             {errorMsg && (
               <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                 <AlertCircle size={20} className="shrink-0"/>
                 <span className="font-medium">{errorMsg}</span>
               </div>
             )}

             <div className="flex justify-end gap-3">
                 <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-slate-600 rounded-lg font-bold transition-colors" onClick={() => navigate('/employee')}>
                    Hủy bỏ
                 </button>
                 <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2" onClick={handleSearch}>
                    <Search size={18}/> Tra cứu ngay
                 </button>
             </div>

             {/* Hint */}
             <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-sm text-slate-500">
                <strong>Gợi ý tra cứu (Mock Data):</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                   <li>Mã vé: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">VE882910</code> - CCCD: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">0123456789</code> (Hợp lệ)</li>
                   <li>Mã vé: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">VE999999</code> - CCCD: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">9876543210</code> (Đã sử dụng)</li>
                </ul>
             </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: KẾT QUẢ TÌM THẤY (Card Chi tiết)                 */}
        {/* ========================================================= */}
        {foundTicket && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden animate-in zoom-in duration-300">
            
            {/* Header Card */}
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <CheckCircle size={24} className="text-green-300"/>
                    <h2 className="text-lg font-bold">Tìm thấy vé hợp lệ</h2>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">
                    {foundTicket.TrangThai}
                </div>
            </div>

            <div className="p-8">
                {/* Thông tin chính */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    
                    {/* Cột Trái: Thông tin chuyến */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hành trình</label>
                            <div className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                                <span>{foundTicket.GaXuatPhat}</span>
                                <ArrowRight className="text-slate-300"/>
                                <span>{foundTicket.GaDen}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <span className="block text-xs text-slate-500 mb-1">Mác tàu</span>
                                <span className="font-bold text-blue-700 flex items-center gap-1"><Train size={16}/> {foundTicket.TenTau}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <span className="block text-xs text-slate-500 mb-1">Thời gian đi</span>
                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                    <Clock size={16}/> 
                                    {new Date(foundTicket.ThoiGianDi).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                    <span className="text-xs font-normal text-slate-500 ml-1">
                                        {new Date(foundTicket.ThoiGianDi).toLocaleDateString('vi-VN')}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div>
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Vị trí ghế</label>
                             <div className="flex items-center gap-3">
                                 <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg font-bold border border-blue-100">
                                     {foundTicket.TenToa}
                                 </div>
                                 <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg font-bold border border-blue-100">
                                     Ghế {foundTicket.SoGhe}
                                 </div>
                                 <span className="text-sm text-slate-500 italic">({foundTicket.LoaiToa})</span>
                             </div>
                        </div>
                    </div>

                    {/* Cột Phải: Thông tin Khách & Giá */}
                    <div className="flex-1 md:border-l md:border-slate-100 md:pl-8 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <User size={18} className="text-slate-400"/> Thông tin hành khách
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                                    <span className="text-slate-500">Họ tên:</span>
                                    <span className="font-bold text-slate-800 uppercase">{foundTicket.TenKhachHang}</span>
                                </li>
                                <li className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                                    <span className="text-slate-500">CCCD/CMND:</span>
                                    <span className="font-bold text-slate-800">{foundTicket.CCCD}</span>
                                </li>
                                <li className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                                    <span className="text-slate-500">Số điện thoại:</span>
                                    <span className="font-bold text-slate-800">{foundTicket.SDT}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm text-yellow-800 font-medium">Giá trị vé hiện tại</span>
                                 <CreditCard size={20} className="text-yellow-600"/>
                             </div>
                             <div className="text-3xl font-black text-red-600 text-right">
                                 {foundTicket.GiaThuc.toLocaleString()} đ
                             </div>
                             <p className="text-xs text-yellow-700 text-right mt-1 italic">* Số tiền này sẽ được trừ vào vé mới</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                    <button 
                        onClick={handleReset}
                        className="px-6 py-3 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Tra cứu vé khác
                    </button>
                    <button 
                        onClick={handleProceedExchange}
                        className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        Tiếp tục đổi vé <ArrowRight size={20}/>
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