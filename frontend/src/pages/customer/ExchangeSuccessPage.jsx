import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Check, Home, Ticket } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import '../../styles/pages/BookingFlow.css';

const ExchangeSuccessPage = () => {
  const location = useLocation();
  const { isRefund, finalAmount, newTicketCode } = location.state || {};

  return (
    <div className="booking-container">
      <CustomerNavbar />
      <ExchangeSteps currentStep={6} />

      <div className="booking-content">
        <div className="success-container" style={{marginTop: 40}}>
          <div className="success-icon-box">
            <Check size={32} strokeWidth={3} />
          </div>

          <h1 className="success-title">Đổi vé thành công!</h1>
          
          <p className="success-desc">
             Vé mới <strong>{newTicketCode}</strong> đã được cập nhật vào hệ thống.<br />
             Thông tin chi tiết đã được gửi tới email của bạn.
          </p>

          {isRefund && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-lg mx-auto mb-8 text-left">
              <h4 className="text-green-800 font-bold mb-2 text-sm uppercase">Thông tin hoàn tiền</h4>
              <p className="text-green-700 text-sm">
                 Số tiền <strong>{Math.abs(finalAmount).toLocaleString()}đ</strong> sẽ được hoàn vào tài khoản ngân hàng bạn đã cung cấp trong vòng 3-5 ngày làm việc.
              </p>
            </div>
          )}

          <div className="action-buttons-center gap-4">
             <Link to="/customer/dashboard" className="btn-home">
                 <Home size={18} /> Về trang chủ
             </Link>
             <Link to="/my-tickets" className="btn-print" style={{textDecoration: 'none'}}>
                 <Ticket size={18} /> Xem vé của tôi
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeSuccessPage;