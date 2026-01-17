import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Clock, ArrowRight, RefreshCw, AlertCircle, Loader2, MapPin } from 'lucide-react';

// Components
import TicketDetailModal from '../../components/common/TicketDetailModal';
import CustomerNavbar from '../../components/layout/CustomerNavbar';

// Services
import { bookingApi } from '../../services/bookingApi';
import { getCurrentUserInfo } from '../../services/authApi';

// Styles
import '../../styles/pages/MyTickets.css';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null); // State lưu email người dùng

  // Lấy ngày hiện tại (đặt giờ về 0 để so sánh chính xác theo ngày)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- BƯỚC 1: LẤY THÔNG TIN USER (EMAIL) ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            // Nếu chưa đăng nhập -> Có thể redirect login hoặc để trống
            console.warn("Chưa đăng nhập");
            return; 
        }

        const res = await getCurrentUserInfo();
        if (res.success || res.data) {
            const data = res.data || res;
            // Lấy email từ các vị trí có thể có trong response
            const email = data.account?.email || data.khachHang?.Email || data.email;
            
            if (email) {
                console.log("📧 Đã lấy được email:", email);
                setCurrentUserEmail(email); // Set email -> Kích hoạt Bước 2
            } else {
                console.warn("Không tìm thấy email trong thông tin user");
            }
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
      }
    };

    fetchUser();
  }, []);

  // --- BƯỚC 2: LẤY DANH SÁCH VÉ (KHI ĐÃ CÓ EMAIL) ---
  const fetchTickets = async () => {
    // Ưu tiên email từ API, nếu không có thì thử lấy localStorage (fallback)
    let emailToFetch = currentUserEmail;
    
    if (!emailToFetch) {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        emailToFetch = user?.email;
    }

    if (!emailToFetch) {
        console.warn("Chưa có email để tải vé.");
        setIsLoading(false);
        return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching tickets for:", emailToFetch);
      
      const res = await bookingApi.getMyTickets(emailToFetch);

      if (res.success) {
        // Sắp xếp: Vé mới đặt nhất lên đầu
        const sorted = res.data.sort((a, b) => new Date(b.ngayDat) - new Date(a.ngayDat));
        setTickets(sorted);
      }
    } catch (error) {
      console.error("Lỗi tải vé:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetchTickets khi currentUserEmail thay đổi HOẶC khi user bấm nút refresh
  useEffect(() => {
    if (currentUserEmail) {
        fetchTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserEmail]);

  // Logic hiển thị trạng thái vé
  const renderStatus = (ticket) => {
    if (ticket.status === 'processing') {
      return (
        <span className="status-badge processing border-yellow-400 bg-yellow-50 text-yellow-700 flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" /> Đang xử lý
        </span>
      );
    }
    if (ticket.status === 'cancelled') {
      return <span className="status-badge cancelled bg-red-50 text-red-600 border-red-200">Đã hủy</span>;
    }
    
    const tripDate = new Date(ticket.tripInfo.ngayDi);
    if (ticket.status === 'used' || tripDate < today) {
      return <span className="status-badge used bg-gray-100 text-gray-500 border-gray-300">Đã hoàn thành</span>;
    }

    return <span className="status-badge active bg-green-50 text-green-600 border-green-200">Sắp khởi hành</span>;
  };

  // Logic kiểm tra vé có được đổi không
  const checkExchangeable = (ticket) => {
    if (ticket.status !== 'active') return false;
    const tripDate = new Date(ticket.tripInfo.ngayDi);
    return tripDate >= today;
  };

  return (
    <div className="my-tickets-container bg-slate-50 min-h-screen">
      <CustomerNavbar />

      <div className="tickets-content max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="page-title text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="text-blue-600" /> Vé của tôi
          </h1>
          <button 
            onClick={fetchTickets} 
            className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 size={40} className="animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-slate-500">Đang tải danh sách vé...</p>
          </div>
        ) : tickets.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 mb-4">Bạn chưa có lịch sử đặt vé nào.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đặt vé ngay
            </button>
          </div>
        ) : (
          // Ticket List
          <div className="ticket-list space-y-4">
            {tickets.map((ticket) => {
              const isExchangeable = checkExchangeable(ticket);
              const tripDate = new Date(ticket.tripInfo.ngayDi);

              let cardClass = "active border-l-4 border-l-green-500"; 
              if (ticket.status === 'cancelled') {
                cardClass = "cancelled border-l-4 border-l-red-400 opacity-75";
              } else if (ticket.status === 'processing') {
                cardClass = "processing border-l-4 border-l-yellow-400 bg-yellow-50/30";
              } else if (ticket.status === 'used' || tripDate < today) {
                cardClass = "used border-l-4 border-l-slate-400 grayscale-[0.5]";
              }

              return (
                <div key={ticket.maVe} className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow ${cardClass}`}>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                      #{ticket.maVe}
                    </span>
                    {renderStatus(ticket)}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-blue-900 uppercase mb-2 flex items-center gap-2">
                         {ticket.tripInfo.tenTau} <span className="text-slate-300">|</span> {ticket.tripInfo.ngayDi}
                      </div>
                      
                      <div className="flex items-center gap-3 text-slate-700 mb-3">
                        <span className="font-medium">{ticket.tripInfo.gaDi}</span>
                        <ArrowRight size={16} className="text-slate-400" />
                        <span className="font-medium">{ticket.tripInfo.gaDen}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-blue-500"/>
                          {/* Hiển thị Giờ đi - Giờ đến */}
                          {ticket.tripInfo.gioDi} - {ticket.tripInfo.gioDen || '--:--'}
                        </div>
                        <div className="flex items-center gap-1">
                           <MapPin size={14} className="text-orange-500"/>
                           <span>Toa: {Array.from(new Set(ticket.seats.map(s => s.maToa))).join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="text-slate-500">Ghế: </span>
                        <span className="font-semibold text-slate-800">
                          {ticket.seats.map(s => s.seatNum).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end min-w-[140px]">
                       <div className="text-right">
                          <span className="block text-xs text-slate-400">Tổng thanh toán</span>
                          <span className="text-xl font-bold text-blue-600">
                            {ticket.totalPrice?.toLocaleString('vi-VN')} đ
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-end gap-3">
                    <span className="sm:hidden text-lg font-bold text-blue-600">
                      {ticket.totalPrice?.toLocaleString('vi-VN')} đ
                    </span>

                    <div className="flex gap-2">
                      <button 
                        className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Xem chi tiết
                      </button>

                      {isExchangeable ? (
                        <button 
                          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/exchange/select-seats', { state: { ticket } });
                          }}
                        >
                          <RefreshCw size={14} /> Đổi vé
                        </button>
                      ) : (
                        (ticket.status === 'cancelled' || ticket.status === 'used' || !checkExchangeable(ticket)) && (
                           ticket.status !== 'processing' && (
                             <span className="hidden sm:flex px-3 py-2 text-xs text-slate-400 italic items-center gap-1 cursor-not-allowed select-none">
                               <AlertCircle size={14} /> Không khả dụng
                             </span>
                           )
                        )
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Modal Chi Tiết */}
        {selectedTicket && (
          <TicketDetailModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;