import { useState, useMemo } from 'react'; 
import TicketDetailModal from '../components/common/TicketDetailModal'; 
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import { VE_DA_DAT_DB } from '../services/db_mock';
import '../styles/pages/MyTickets.css';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  // 1. Lấy ngày hiện tại (Reset giờ về 00:00:00 để so sánh ngày)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Xử lý danh sách vé: Sắp xếp Mới nhất -> Cũ nhất
  const sortedTickets = useMemo(() => {
    return [...VE_DA_DAT_DB].sort((a, b) => {
      // Sắp xếp giảm dần theo ngày đặt vé
      return new Date(b.ngayDat) - new Date(a.ngayDat);
    });
  }, []);

  // Hàm render trạng thái
  const renderStatus = (ticket) => {
    // Nếu status trong DB là used hoặc cancelled thì hiển thị luôn
    if (ticket.status === 'cancelled') {
      return <span className="status-badge cancelled">Đã hủy</span>;
    }
    if (ticket.status === 'used') {
      return <span className="status-badge used">Đã sử dụng</span>;
    }
    
    // Nếu status là active, kiểm tra xem đã quá hạn chưa
    const tripDate = new Date(ticket.tripInfo.ngayDi);
    if (tripDate < today) {
      return <span className="status-badge used">Đã hoàn thành</span>; // Đã đi rồi
    }
    
    return <span className="status-badge active">Sắp khởi hành</span>;
  };

  // Hàm kiểm tra có được đổi vé không
  const checkExchangeable = (ticket) => {
    if (ticket.status !== 'active') return false; // Đã hủy hoặc dùng rồi thì không đổi
    
    const tripDate = new Date(ticket.tripInfo.ngayDi);
    // Chỉ đổi được nếu Ngày đi >= Hôm nay
    return tripDate >= today;
  };

  return (
    <div className="my-tickets-container">
      <CustomerNavbar />

      <div className="tickets-content">
        <h1 className="page-title">
          <Ticket className="text-blue-500" /> Vé của tôi
        </h1>

        {sortedTickets.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Bạn chưa có vé nào. <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/')}>Đặt vé ngay</span>
          </div>
        ) : (
          <div className="ticket-list">
            {sortedTickets.map((ticket) => {
              const isExchangeable = checkExchangeable(ticket);
              
              // Xác định class màu sắc cho border
              const tripDate = new Date(ticket.tripInfo.ngayDi);
              let cardClass = "active";
              if (ticket.status === 'cancelled') cardClass = "cancelled";
              else if (ticket.status === 'used' || tripDate < today) cardClass = "used";

              return (
                <div key={ticket.maVe} className={`ticket-history-card ${cardClass}`}>
                  
                  {/* 1. Header: Mã vé + Trạng thái */}
                  <div className="ticket-card-header">
                    <span className="ticket-id-tag">#{ticket.maVe}</span>
                    {renderStatus(ticket)}
                  </div>

                  {/* 2. Body: Thông tin chuyến */}
                  <div className="ticket-card-body">
                    <div className="route-info">
                      <div className="text-sm text-slate-500 font-bold uppercase mb-1">
                        {ticket.tripInfo.tenTau} - {ticket.tripInfo.ngayDi}
                      </div>
                      <div className="route-stations">
                        <span>{ticket.tripInfo.gaDi}</span>
                        <ArrowRight size={18} className="text-slate-400" />
                        <span>{ticket.tripInfo.gaDen}</span>
                      </div>
                      <div className="route-time">
                        <Clock size={14} />
                        {ticket.tripInfo.gioDi} - {ticket.tripInfo.gioDen}
                      </div>
                      <div className="seat-list-text">
                        Ghế: {ticket.seats.map(s => `${s.maToa}-${s.seatNum}`).join(', ')}
                      </div>
                    </div>

                    {/* Giá vé (Hiển thị bên phải trên desktop) */}
                    <div className="text-right hidden sm:block">
                       <span className="block text-xs text-slate-400">Tổng thanh toán</span>
                       <span className="text-xl font-bold text-slate-700">{ticket.totalPrice.toLocaleString()} đ</span>
                    </div>
                  </div>

                  {/* 3. Footer: Hành động */}
                  <div className="ticket-card-footer">
                    <span className="total-price-text sm:hidden">
                      {ticket.totalPrice.toLocaleString()} đ
                    </span>
                    
                    <button 
                      className="btn-detail" 
                      onClick={() => setSelectedTicket(ticket)} // Set vé vào state để mở Modal
                    >
                      Xem chi tiết
                    </button>

                    {/* Chỉ hiện nút Đổi vé nếu thỏa mãn điều kiện */}
                    {isExchangeable ? (
                      <button 
                        className="btn-exchange"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn mở popup chi tiết
                          navigate('/exchange/select-seats', { state: { ticket } });
                        }}
                      >
                        <RefreshCw size={14} /> Đổi vé
                      </button>
                    ) : (
                      // Nếu không đổi được thì không hiện gì hoặc hiện icon info
                      <span className="text-xs text-slate-400 italic flex items-center gap-1">
                         <AlertCircle size={12}/> Không thể đổi
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
        {selectedTicket && (
          <TicketDetailModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} // Đóng Modal set về null
          />
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;