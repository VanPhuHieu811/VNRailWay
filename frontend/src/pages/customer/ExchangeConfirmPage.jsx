import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, CreditCard, Wallet, Edit3, QrCode, 
  Train, Calendar 
} from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import EditPassengerModal from '../../components/common/EditPassengerModal'; // Giả sử bạn có file này
import '../../styles/pages/ExchangeConfirmPage.css';

const FEE_PERCENT = 0.0; // Phí đổi vé 0%

const ExchangeConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Lấy dữ liệu (Không cần check isEmployee nữa)
  let { newSeats, newTotalPrice, newTripInfo } = state;
  let exchangeData = state.exchangeData || {};
  let exchangeValue = state.exchangeData?.exchangeValue || 0;

  const displayTripInfo = newTripInfo || {
    tenTau: "---", ngayDi: new Date().toISOString(), gioDi: "--:--", gioDen: "--:--", gaDi: "---", gaDen: "---"
  };

  const [newPassengers, setNewPassengers] = useState([]);
  const [editingPassengerIndex, setEditingPassengerIndex] = useState(null);
  const [refundInfo, setRefundInfo] = useState({ bankName: '', bankAccount: '' });
  
  // Mặc định phương thức thanh toán cho khách
  const [paymentMethod, setPaymentMethod] = useState('atm');

  // DANH SÁCH THANH TOÁN CHỈ DÀNH CHO KHÁCH
  const paymentOptions = [
    { id: 'atm', label: 'Thẻ ATM/Visa', sub: 'Cổng Napas', icon: CreditCard },
    { id: 'qr', label: 'QR Code App', sub: 'Momo/ZaloPay/VNPAY', icon: QrCode },
    { id: 'wallet', label: 'Ví điện tử', sub: 'Liên kết ví', icon: Wallet }
  ];

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
    // Validate form hoàn tiền nếu là khách hàng
    if (isRefund && (!refundInfo.bankName.trim() || !refundInfo.bankAccount.trim())) {
      alert("Vui lòng nhập đầy đủ thông tin hoàn tiền!");
      return;
    }

    // Logic giả lập API thanh toán...
    
    // Điều hướng khách hàng luôn sang trang success của customer
    navigate('/exchange/success', { 
        state: { 
            isRefund, 
            finalAmount,
            newTicketCode: "TK-NEW-" + Math.floor(Math.random() * 1000000),
            oldTicketCode: exchangeData?.originalTicketCode,
            paymentMethod 
        } 
    });
  };

  if (!exchangeData || !newSeats) {
      return <div className="p-10 text-center">Không có dữ liệu.</div>;
  }

  return (
    <div className="exchange-confirm-wrapper">
      <div className="bg-white shadow-sm w-full"><CustomerNavbar /></div>
      <div className="bg-white border-b border-slate-100 w-full">
         <ExchangeSteps currentStep={5} /> {/* Luôn là bước 5 với khách */}
      </div>

      <div className="exchange-confirm-content">
        <div onClick={() => navigate(-1)} className="btn-back-link mb-6">
          <ArrowLeft size={20} /> Quay lại
        </div>

        <h2 className="page-heading">Xác nhận đổi vé</h2>

        {/* PHẦN SO SÁNH VÉ (Giữ nguyên UI) */}
        <div className="comparison-container">
          {/* Vé cũ */}
          <div className="ticket-review-card old">
            <span className="card-badge">VÉ CŨ</span>
            <div className="ticket-card-content">
                <div className="ticket-route-header">
                    <span className="train-badge bg-slate-200 text-slate-700">Mã: {exchangeData.originalTicketCode}</span>
                </div>
                <div className="text-sm text-slate-700 font-medium mt-2">
                   Giá trị: {exchangeValue.toLocaleString()} đ
                </div>
            </div>
          </div>
          <div className="exchange-arrow-wrapper"><ArrowRight size={20}/></div>
          {/* Vé mới */}
          <div className="ticket-review-card new">
            <span className="card-badge">VÉ MỚI</span>
            <div className="ticket-card-content">
                <div className="ticket-route-header">
                    <span className="train-badge">{displayTripInfo.tenTau}</span>
                    <div className="route-date"><Calendar size={14}/> {displayTripInfo.ngayDi}</div>
                </div>
                {/* ... (Phần render ghế giữ nguyên như cũ) ... */}
                <div className="new-seats-list mt-2">
                    {newPassengers.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-sm border-b border-dashed py-1">
                            <span>Ghế {p.seatNum} ({p.tenToa})</span>
                            <span className="text-blue-600 cursor-pointer" onClick={() => setEditingPassengerIndex(idx)}><Edit3 size={12}/></span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="ticket-card-footer">
                <span className="price-label">Tổng mới</span>
                <span className="price-value">{newTotalPrice.toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {/* PHẦN THANH TOÁN / HOÀN TIỀN */}
        <div className="action-section mt-6">
            <div className="calc-total mb-4 p-4 bg-slate-50 rounded flex justify-between items-center font-bold">
                <span>{isRefund ? "TIỀN HOÀN LẠI:" : "THANH TOÁN THÊM:"}</span>
                <span className={isRefund ? "text-green-600" : "text-red-600 text-xl"}>
                    {Math.abs(finalAmount).toLocaleString()} đ
                </span>
            </div>

            {isRefund ? (
                <div className="refund-area p-4 border rounded bg-white">
                    <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2"><Wallet size={18}/> Nhập tài khoản nhận tiền hoàn</h4>
                    <input className="form-input w-full border p-2 rounded mb-2" placeholder="Tên Ngân hàng" 
                        value={refundInfo.bankName} onChange={(e) => setRefundInfo({...refundInfo, bankName: e.target.value})} />
                    <input className="form-input w-full border p-2 rounded" placeholder="Số tài khoản" 
                        value={refundInfo.bankAccount} onChange={(e) => setRefundInfo({...refundInfo, bankAccount: e.target.value})} />
                </div>
            ) : (
                <div className="payment-area">
                    <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2"><CreditCard size={18}/> Chọn phương thức thanh toán</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {paymentOptions.map((option) => (
                            <div key={option.id} 
                                className={`p-3 border rounded cursor-pointer flex items-center gap-2 ${paymentMethod === option.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                                onClick={() => setPaymentMethod(option.id)}
                            >
                                <option.icon size={20}/>
                                <span className="text-sm font-semibold">{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <button className="btn-confirm w-full bg-blue-600 text-white py-3 rounded font-bold mt-6 hover:bg-blue-700" onClick={handleConfirm}>
            {isRefund ? "Xác nhận & Yêu cầu hoàn tiền" : "Thanh toán ngay"}
        </button>
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