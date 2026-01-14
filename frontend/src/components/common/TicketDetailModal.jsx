import React from 'react';
import { X } from 'lucide-react';
import '../../styles/pages/MyTickets.css'; // Sử dụng chung file CSS vừa sửa

const TicketDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const { tripInfo, seats, totalPrice, maVe, ngayDat } = ticket;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* onClick e.stopPropagation để bấm vào card không bị đóng modal */}
      <div className="modal-ticket-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Nút đóng */}
        <button className="btn-close-modal" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header: Xanh dương */}
        <div className="modal-header">
          <div className="modal-brand">
            <h3>Vé Tàu Hỏa</h3>
            <p>Tổng công ty Đường sắt Việt Nam</p>
          </div>
          <div className="modal-ticket-id">{maVe}</div>
        </div>

        {/* Body: Nội dung vé */}
        <div className="modal-body">
          
          {/* Hàng 1: Tàu & Ngày đi */}
          <div className="ticket-info-row">
            <div className="info-col">
              <label>Tàu số</label>
              <strong>{tripInfo.tenTau}</strong>
              <span>Thống nhất</span>
            </div>
            <div className="info-col text-right">
              <label>Ngày đi</label>
              <strong>{new Date(tripInfo.ngayDi).toLocaleDateString('vi-VN')}</strong>
            </div>
          </div>

          {/* Hàng 2: Ga đi & Ga đến */}
          <div className="ticket-info-row">
            <div className="info-col">
              <label>Ga đi</label>
              <span style={{fontSize: 14, color: '#334155', fontWeight: 600}}>{tripInfo.gaDi}</span>
              <strong className="text-blue-big">{tripInfo.gioDi}</strong>
            </div>
            <div className="info-col text-right">
              <label>Ga đến</label>
              <span style={{fontSize: 14, color: '#334155', fontWeight: 600}}>{tripInfo.gaDen}</span>
              <strong className="text-blue-big">{tripInfo.gioDen}</strong>
            </div>
          </div>

          {/* Hàng 3: Danh sách ghế */}
          <label style={{fontSize: 13, color: '#94a3b8', marginBottom: 10, display: 'block'}}>Thông tin chỗ ngồi</label>
          {seats.map((seat, index) => (
            <div key={index} className="seat-detail-box">
              <div>
                <span className="seat-name">Toa {seat.maToa} - Chỗ {seat.seatNum}</span>
                <span className="seat-class">{seat.loaiToa || 'Standard'}</span>
              </div>
              <div className="seat-price">{seat.price.toLocaleString()} ₫</div>
            </div>
          ))}

          {/* Hàng 4: Tổng tiền */}
          <div className="modal-total-section">
            <span className="total-label">Tổng tiền thanh toán:</span>
            <span className="total-value-big">{totalPrice.toLocaleString()} ₫</span>
          </div>

          {/* Footer: Ghi chú */}
          <div className="modal-footer-notes">
            <div className="note-item">Vui lòng có mặt tại ga trước giờ tàu chạy ít nhất 15 phút.</div>
            <div className="note-item">Mang theo vé và giấy tờ tùy thân khi lên tàu.</div>
            <div className="note-item">Vé đã mua không hoàn trả. Đổi trả theo quy định hiện hành.</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;