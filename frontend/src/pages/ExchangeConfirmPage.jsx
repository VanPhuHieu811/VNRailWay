import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowDown, CreditCard, Wallet, Edit3, QrCode, Smartphone, 
  Train, Calendar, Banknote, ArrowRight 
} from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import ExchangeSteps from '../components/common/ExchangeSteps';
import EditPassengerModal from '../components/common/EditPassengerModal';
import '../styles/pages/ExchangeConfirmPage.css'; // Import CSS mới

const FEE_PERCENT = 0.0; 

const ExchangeConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // --- LẤY DỮ LIỆU ---
  let { newSeats, newTotalPrice, newTripInfo, isEmployee } = state;

  let exchangeData = state.exchangeData || {
      originalTicketCode: state.originalTicketCode,
      seatsToExchange: state.seatsToExchange
  };
  let exchangeValue = state.exchangeValue || exchangeData.exchangeValue || 0;

  const displayTripInfo = newTripInfo || {
    tenTau: "---", ngayDi: new Date().toISOString(), gioDi: "--:--", gioDen: "--:--", gaDi: "---", gaDen: "---"
  };

  const [newPassengers, setNewPassengers] = useState([]);
  const [editingPassengerIndex, setEditingPassengerIndex] = useState(null);
  const [refundInfo, setRefundInfo] = useState({ bankName: '', bankAccount: '' });
  
  // Xác định phương thức thanh toán mặc định
  const [paymentMethod, setPaymentMethod] = useState(isEmployee ? 'cash' : 'atm');

  // --- CẤU HÌNH PHƯƠNG THỨC THANH TOÁN ---
  const paymentOptions = isEmployee 
    ? [
        { id: 'cash', label: 'Tiền mặt', sub: 'Thanh toán tại quầy', icon: Banknote },
        { id: 'qr_transfer', label: 'Chuyển khoản', sub: 'Quét mã QR Ngân hàng', icon: QrCode }
      ]
    : [
        { id: 'atm', label: 'Thẻ ATM/Visa', sub: 'Cổng Napas', icon: CreditCard },
        { id: 'qr', label: 'QR Code App', sub: 'Momo/ZaloPay/VNPAY', icon: QrCode },
        { id: 'wallet', label: 'Ví điện tử', sub: 'Liên kết ví', icon: Wallet }
      ];

  // Mapping hành khách
  useEffect(() => {
    if (newSeats) {
        const mapped = newSeats.map((seat, index) => ({
            ...seat,
            fullName: `Khách đổi vé ${index + 1}`,
            passengerID: "---"
        }));
        setNewPassengers(mapped);
    }
  }, [newSeats]);

  const handleUpdatePassenger = (updatedData) => {
    const updatedList = [...newPassengers];
    updatedList[editingPassengerIndex] = { ...updatedList[editingPassengerIndex], ...updatedData };
    setNewPassengers(updatedList);
  };

  // Tính toán
  const exchangeFee = exchangeValue * FEE_PERCENT;
  const finalAmount = (newTotalPrice + exchangeFee) - exchangeValue;
  const isRefund = finalAmount < 0;

  const handleConfirm = () => {
    if (isRefund && !isEmployee && (!refundInfo.bankName.trim() || !refundInfo.bankAccount.trim())) {
      alert("Vui lòng nhập đầy đủ thông tin hoàn tiền!");
      return;
    }

    const successPath = isEmployee 
        ? '/employee/sales/exchange/success' 
        : '/exchange/success';

    navigate(successPath, { 
        state: { 
            isRefund, 
            finalAmount,
            newTicketCode: "TK-NEW-" + Math.floor(Math.random() * 1000000),
            oldTicketCode: exchangeData?.originalTicketCode,
            isEmployee,
            paymentMethod // Lưu phương thức đã chọn
        } 
    });
  };

  if (!exchangeData || !newSeats) {
      return (
        <div className="p-10 text-center">
            <p>Không tìm thấy thông tin giao dịch.</p>
            <button onClick={() => navigate(-1)} className="text-blue-600 underline">Quay lại</button>
        </div>
      );
  }

  const currentStepNum = isEmployee ? 6 : 5;

  return (
    <div className="exchange-confirm-wrapper">
      
      {/* 1. Navbar Full Width */}
      <div className="bg-white shadow-sm w-full">
         {!isEmployee && <CustomerNavbar />}
      </div>
      
      {/* 2. Steps Full Width */}
      <div className="bg-white border-b border-slate-100 w-full">
         <ExchangeSteps currentStep={currentStepNum} isEmployee={isEmployee} />
      </div>

      {/* 3. Main Content Centered */}
      <div className="exchange-confirm-content">
        
        <div onClick={() => navigate(-1)} className="inline-flex items-center gap-2 cursor-pointer text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors">
          <ArrowLeft size={20} /> Quay lại
        </div>

        <h2 className="page-heading">Xác nhận đổi vé</h2>

        {/* --- KHU VỰC SO SÁNH VÉ --- */}
        <div className="comparison-container">
          
          {/* VÉ CŨ */}
          <div className="ticket-review-card old">
            <span className="card-badge">VÉ CŨ</span>
            <div className="ticket-card-content">
                <div className="ticket-route-header">
                    <span className="train-badge bg-slate-200 text-slate-700">Vé cũ</span>
                    <div className="route-date">
                        <span className="font-bold text-slate-700">Mã vé: {exchangeData.originalTicketCode}</span>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="text-xs uppercase text-slate-500 font-bold mb-1">Ghế đã chọn:</div>
                    <div className="text-sm text-slate-700 font-medium">
                        {exchangeData.seatsToExchange?.map(s => `Toa ${s.maToa || '?'} - Ghế ${s.seatNum}`).join(', ') || '...'}
                    </div>
                </div>
            </div>
            <div className="ticket-card-footer">
                <span className="price-label">Giá trị hoàn</span>
                <span className="price-value">{exchangeValue.toLocaleString()} đ</span>
            </div>
          </div>

          {/* MŨI TÊN */}
          <div className="exchange-arrow-wrapper">
            <div className="icon-arrow-circle">
                <ArrowRight size={20} className="hidden md:block" />
                <ArrowDown size={20} className="md:hidden" />
            </div>
          </div>

          {/* VÉ MỚI */}
          <div className="ticket-review-card new">
            <span className="card-badge">VÉ MỚI</span>
            
            <div className="ticket-card-content">
                <div className="ticket-route-header">
                    <span className="train-badge">{displayTripInfo.tenTau}</span>
                    <div className="route-date">
                        <Calendar size={14}/> {new Date(displayTripInfo.ngayDi).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                <div className="time-station-row">
                    <div className="ts-item text-left">
                        <div className="ts-time">{displayTripInfo.gioDi}</div>
                        <div className="ts-station">{displayTripInfo.gaDi}</div>
                    </div>
                    <div className="ts-arrow">
                        <Train size={16} className="absolute top-[-8px] left-1/2 -translate-x-1/2 text-slate-300 bg-white px-1"/>
                    </div>
                    <div className="ts-item text-right">
                        <div className="ts-time">{displayTripInfo.gioDen}</div>
                        <div className="ts-station">{displayTripInfo.gaDen}</div>
                    </div>
                </div>

                {/* List ghế mới */}
                <div className="new-seats-list">
                    {newPassengers.map((p, idx) => (
                        <div key={idx} className="seat-mini-item">
                            <div className="flex items-center gap-3">
                                <span className="seat-badge">{p.seatNum}</span>
                                <div>
                                    <div className="text-sm font-bold text-slate-700">{p.tenToa}</div>
                                    <div className="text-xs text-slate-400">{p.loaiToa}</div>
                                </div>
                            </div>
                            <div 
                                className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                                onClick={() => setEditingPassengerIndex(idx)}
                            >
                                <Edit3 size={12} /> Sửa tên
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ticket-card-footer">
                <span className="price-label">Giá vé mới</span>
                <span className="price-value">{newTotalPrice.toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {/* --- CHI TIẾT TÀI CHÍNH --- */}
        <div className="calculation-section">
          <div className="calc-header">Chi tiết tài chính</div>
          <div className="calc-body">
            <div className="calc-row">
                <span>Giá trị vé cũ (được hoàn)</span>
                <span className="font-medium text-slate-500">- {exchangeValue.toLocaleString()} đ</span>
            </div>
            <div className="calc-row">
                <span>Giá vé mới (phải trả)</span>
                <span className="font-medium text-blue-600">+ {newTotalPrice.toLocaleString()} đ</span>
            </div>
            {exchangeFee > 0 && (
                <div className="calc-row">
                    <span>Phí đổi vé ({FEE_PERCENT * 100}%)</span>
                    <span className="font-medium text-red-500">+ {exchangeFee.toLocaleString()} đ</span>
                </div>
            )}
            
            <div className="calc-divider"></div>
            
            <div className="calc-total">
                <span className="total-label">
                    {isRefund ? "TIỀN HOÀN LẠI:" : "THANH TOÁN THÊM:"}
                </span>
                <span className={`total-amount ${isRefund ? "text-green" : "text-red"}`}>
                    {Math.abs(finalAmount).toLocaleString()} đ
                </span>
            </div>
          </div>
        </div>

        {/* --- KHU VỰC THANH TOÁN HOẶC HOÀN TIỀN --- */}
        <div className="action-section">
            {isRefund ? (
                // TRƯỜNG HỢP HOÀN TIỀN
                <div className="refund-area">
                    <div className="section-title text-green-700">
                        <Wallet size={20}/> Thông tin hoàn tiền
                    </div>
                    
                    {isEmployee ? (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-sm text-green-800">
                            Vui lòng hoàn lại <b>{Math.abs(finalAmount).toLocaleString()} đ</b> cho khách hàng bằng tiền mặt.
                        </div>
                    ) : (
                        <div className="refund-form">
                            <input 
                                className="form-input" 
                                placeholder="Tên Ngân hàng (VD: MBBank, Vietcombank...)" 
                                value={refundInfo.bankName} 
                                onChange={(e) => setRefundInfo({...refundInfo, bankName: e.target.value})}
                            />
                            <input 
                                className="form-input" 
                                placeholder="Số tài khoản thụ hưởng" 
                                value={refundInfo.bankAccount} 
                                onChange={(e) => setRefundInfo({...refundInfo, bankAccount: e.target.value})}
                            />
                            <p className="text-xs text-slate-400 italic">* Tiền sẽ được hoàn trong 3-5 ngày làm việc.</p>
                        </div>
                    )}
                </div>
            ) : (
                // TRƯỜNG HỢP THANH TOÁN THÊM
                <div className="payment-area">
                    <div className="section-title text-blue-700">
                        <CreditCard size={20}/> Phương thức thanh toán
                    </div>
                    
                    <div className="payment-methods-grid">
                        {paymentOptions.map((option) => (
                            <div 
                                key={option.id}
                                className={`payment-option ${paymentMethod === option.id ? 'active' : ''}`}
                                onClick={() => setPaymentMethod(option.id)}
                            >
                                <option.icon className="pay-icon" strokeWidth={1.5} />
                                <span className="pay-label">{option.label}</span>
                                <span className="pay-sub">{option.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* --- BUTTONS --- */}
        <div className="button-group">
          <button 
            className={`btn-confirm ${isRefund ? 'refund' : 'pay'}`} 
            onClick={handleConfirm}
          >
            {isRefund ? "Xác nhận & Hoàn tiền" : "Thanh toán & Xác nhận"}
          </button>
        </div>

      </div>

      {editingPassengerIndex !== null && (
        <EditPassengerModal 
          passenger={newPassengers[editingPassengerIndex]}
          onClose={() => setEditingPassengerIndex(null)}
          onSave={handleUpdatePassenger}
        />
      )}
    </div>
  );
};

export default ExchangeConfirmPage;