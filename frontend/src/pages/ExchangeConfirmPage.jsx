import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDown, CreditCard, Wallet, Edit3, QrCode, Smartphone, Train, Calendar } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import ExchangeSteps from '../components/common/ExchangeSteps';
import EditPassengerModal from '../components/common/EditPassengerModal';
import '../styles/pages/ExchangeFlow.css';

const FEE_PERCENT = 0.2; // Phí đổi vé 20%

const ExchangeConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy đầy đủ dữ liệu từ SeatSelectionPage
  const { oldTicket, seatsToExchange, newSeats, newTotalPrice, exchangeValue, newTripInfo } = location.state || {};

  // Dữ liệu hiển thị (Dùng newTripInfo được truyền sang, fallback nếu lỗi)
  const displayTripInfo = newTripInfo || {
    tenTau: newSeats?.[0]?.tenToa?.split(' ')?.[0] || "---",
    ngayDi: new Date().toISOString(),
    gioDi: "--:--",
    gioDen: "--:--",
    gaDi: "---",
    gaDen: "---"
  };

  const [newPassengers, setNewPassengers] = useState([]);
  const [editingPassengerIndex, setEditingPassengerIndex] = useState(null);
  const [refundInfo, setRefundInfo] = useState({ bankName: '', bankAccount: '' });
  const [paymentMethod, setPaymentMethod] = useState('atm');

  // Mapping hành khách
  useEffect(() => {
    if (oldTicket && newSeats) {
      const oldPassengersInfo = oldTicket.seats
        .filter(s => seatsToExchange.includes(s.id))
        .map(s => ({ fullName: s.passengerName, passengerID: s.passengerID }));

      const mapped = newSeats.map((seat, index) => ({
        ...seat,
        fullName: oldPassengersInfo[index]?.fullName || '',
        passengerID: oldPassengersInfo[index]?.passengerID || ''
      }));
      setNewPassengers(mapped);
    }
  }, [oldTicket, newSeats, seatsToExchange]);

  const handleUpdatePassenger = (updatedData) => {
    const updatedList = [...newPassengers];
    updatedList[editingPassengerIndex] = { ...updatedList[editingPassengerIndex], ...updatedData };
    setNewPassengers(updatedList);
  };

  // Tính toán tiền
  const exchangeFee = exchangeValue * FEE_PERCENT;
  const finalAmount = (newTotalPrice + exchangeFee) - exchangeValue;
  const isRefund = finalAmount < 0;

  const handleConfirm = () => {
    if (isRefund && (!refundInfo.bankName.trim() || !refundInfo.bankAccount.trim())) {
      alert("Vui lòng nhập đầy đủ Tên ngân hàng và Số tài khoản để nhận tiền hoàn!");
      return;
    }
    // Chuyển trang thành công
    navigate('/exchange/success', { state: { isRefund, finalAmount } });
  };

  if (!oldTicket) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="exchange-container">
      <CustomerNavbar />
      <ExchangeSteps currentStep={6} />

      <div className="exchange-content">
        <div onClick={() => navigate(-1)} className="btn-back mb-4 flex items-center gap-2 cursor-pointer text-slate-600">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-6">Xác nhận đổi vé</h2>

        {/* --- SO SÁNH VÉ CŨ & MỚI --- */}
        <div className="comparison-section">
          
          {/* Vé cũ */}
          <div className="ticket-review-card old relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-bl-lg z-10">VÉ CŨ</div>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
              <div className="bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded text-sm">{oldTicket.tripInfo.tenTau}</div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Calendar size={14}/> {new Date(oldTicket.tripInfo.ngayDi).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">{oldTicket.tripInfo.gioDi}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase">{oldTicket.tripInfo.gaDi}</div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-4 relative top-[-5px]"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">{oldTicket.tripInfo.gioDen}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase">{oldTicket.tripInfo.gaDen}</div>
              </div>
            </div>
            <div className="bg-slate-100 -mx-5 -mb-5 p-4 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Ghế: </span>
                {oldTicket.seats.filter(s => seatsToExchange.includes(s.id)).map(s => `Toa ${s.maToa}-${s.seatNum}`).join(', ')}
              </div>
              <div className="font-bold text-slate-500 text-lg">{exchangeValue.toLocaleString()} đ</div>
            </div>
          </div>

          <div className="exchange-arrow-icon shadow-md bg-white text-blue-600 border border-blue-100">
            <ArrowDown size={20} strokeWidth={3} />
          </div>

          {/* Vé mới */}
          <div className="ticket-review-card new relative overflow-hidden border-blue-300 shadow-md">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">VÉ MỚI</div>
            
            <div className="flex items-center gap-3 mb-4 border-b border-blue-100 pb-3">
              <div className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded text-sm">{displayTripInfo.tenTau}</div>
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Calendar size={14}/> {new Date(displayTripInfo.ngayDi).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 px-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{displayTripInfo.gioDi}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase">{displayTripInfo.gaDi}</div>
              </div>
              <div className="flex-1 flex justify-center items-center mx-2">
                 <div className="h-[2px] w-full bg-blue-200"></div>
                 <Train size={16} className="text-blue-300 absolute"/>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{displayTripInfo.gioDen}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase">{displayTripInfo.gaDen}</div>
              </div>
            </div>

            <div className="bg-blue-50 -mx-5 -mb-5 p-4">
              <div className="mb-2 flex justify-between items-center">
                 <span className="text-xs font-bold text-blue-400 uppercase">Hành khách & Vị trí</span>
                 <span className="text-lg font-bold text-blue-700">{newTotalPrice.toLocaleString()} đ</span>
              </div>
              <div className="space-y-2">
                {newPassengers.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded">{p.seatNum}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{p.fullName}</div>
                        <div className="text-xs text-slate-400">{p.passengerID} • Toa {p.maToa}</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline flex items-center gap-1" onClick={() => setEditingPassengerIndex(idx)}>
                      <Edit3 size={12} /> Sửa
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- CHI TIẾT TÀI CHÍNH --- */}
        <div className="calculation-box mt-8">
          <div className="calc-header bg-slate-50">Chi tiết tài chính</div>
          <div className="calc-row credit">
            <span>Giá trị vé cũ (được hoàn)</span>
            <span className="text-slate-500">- {exchangeValue.toLocaleString()} đ</span>
          </div>
          <div className="calc-row debit">
            <span>Giá vé mới (phải trả)</span>
            <span className="text-blue-600 font-medium">+ {newTotalPrice.toLocaleString()} đ</span>
          </div>
          <div className="calc-row fee">
            <span>Phí đổi vé (20%)</span>
            <span className="text-red-500 font-medium">+ {exchangeFee.toLocaleString()} đ</span>
          </div>
          <div className="calc-total-row">
            <span className="flex items-center gap-2">
              {isRefund ? "Số tiền hoàn lại:" : "Số tiền cần thanh toán:"}
            </span>
            <span className={isRefund ? "text-green-600 text-2xl" : "text-blue-700 text-2xl"}>
              {Math.abs(finalAmount).toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* --- ACTION BAR (Thanh toán / Hoàn tiền) --- */}
        <div className="payment-action-section mt-6">
            {isRefund ? (
                <>
                    <div className="section-title text-green-700 mb-4"><Wallet size={20}/> Thông tin nhận tiền hoàn</div>
                    <div className="refund-inputs-grid">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Ngân hàng thụ hưởng</label>
                            <input className="custom-input" placeholder="VD: Vietcombank, MBBank..." value={refundInfo.bankName} onChange={(e) => setRefundInfo({...refundInfo, bankName: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Số tài khoản</label>
                            <input className="custom-input" placeholder="Nhập số tài khoản" value={refundInfo.bankAccount} onChange={(e) => setRefundInfo({...refundInfo, bankAccount: e.target.value})}/>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">* Tiền thừa sẽ được hoàn vào tài khoản trên trong vòng 3-5 ngày làm việc.</p>
                </>
            ) : (
                <>
                    <div className="section-title text-blue-700 mb-4"><CreditCard size={20}/> Chọn phương thức thanh toán</div>
                    <div className="payment-methods-grid">
                        <div className={`payment-option ${paymentMethod === 'atm' ? 'active' : ''}`} onClick={() => setPaymentMethod('atm')}>
                            <CreditCard className="pay-icon" size={24}/>
                            <div className="pay-text"><h4>Thẻ ATM/Visa</h4><p>Cổng Napas</p></div>
                        </div>
                        <div className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`} onClick={() => setPaymentMethod('qr')}>
                            <QrCode className="pay-icon" size={24}/>
                            <div className="pay-text"><h4>QR Code</h4><p>Quét mã App</p></div>
                        </div>
                        <div className={`payment-option ${paymentMethod === 'wallet' ? 'active' : ''}`} onClick={() => setPaymentMethod('wallet')}>
                            <Smartphone className="pay-icon" size={24}/>
                            <div className="pay-text"><h4>Ví điện tử</h4><p>Momo/ZaloPay</p></div>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-8 pb-10">
          <button className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-600 bg-white hover:bg-slate-50 transition" onClick={() => navigate(-1)}>Quay lại</button>
          <button className={`flex-1 py-3 text-white rounded-lg font-bold transition shadow-lg ${isRefund ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-700 hover:bg-blue-800 shadow-blue-200'}`} onClick={handleConfirm}>
            {isRefund ? "Xác nhận & Nhận tiền hoàn" : "Thanh toán & Xác nhận"}
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