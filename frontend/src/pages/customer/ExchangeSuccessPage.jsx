import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Check, Home, Ticket, Printer, RotateCcw } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import ExchangeSteps from '../../components/common/ExchangeSteps';
import '../../styles/pages/BookingFlow.css';

const ExchangeSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ trang Confirm
  const { isRefund, finalAmount, isEmployee, newTicketCode } = location.state || {};

  // Xác định bước hiện tại: Sales là 7, Khách là 6
  const currentStepNum = isEmployee ? 6 : 6;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      
      {/* Chỉ hiện Navbar cho Khách hàng */}
      {!isEmployee && <CustomerNavbar />}
      
      {/* Thanh tiến trình */}
      <ExchangeSteps currentStep={currentStepNum} isEmployee={isEmployee} />

      <div className="booking-content">
        <div className="success-container" style={{marginTop: 40}}>
          
          {/* Icon Check xanh */}
          <div className="success-icon-box">
            <Check size={32} strokeWidth={3} />
          </div>

          <h1 className="success-title">Đổi vé thành công!</h1>
          
          {/* Thông báo chính tùy theo Role */}
          <p className="success-desc">
            {isEmployee ? (
                <>
                    Vé mới <strong>{newTicketCode}</strong> đã được xuất thành công trên hệ thống.
                    <br />
                    Vui lòng in vé và giao cho khách hàng.
                </>
            ) : (
                <>
                    Vé mới <strong>{newTicketCode}</strong> đã được cập nhật vào hệ thống.
                    <br />
                    Thông tin chi tiết đã được gửi tới email của bạn.
                </>
            )}
          </p>

          {/* Thông báo tiền hoàn (Nếu có) */}
          {isRefund && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-lg mx-auto mb-8 text-left">
              <h4 className="text-green-800 font-bold mb-2 text-sm uppercase">Thông tin hoàn tiền</h4>
              <p className="text-green-700 text-sm">
                {isEmployee ? (
                    <>
                        Vui lòng hoàn lại số tiền mặt: <strong>{Math.abs(finalAmount).toLocaleString()}đ</strong> cho khách hàng.
                        <br/>
                        <span className="text-xs italic mt-1 block">* Đã ghi nhận giao dịch hoàn tiền vào báo cáo doanh thu.</span>
                    </>
                ) : (
                    <>
                        Số tiền <strong>{Math.abs(finalAmount).toLocaleString()}đ</strong> sẽ được hoàn vào tài khoản ngân hàng bạn đã cung cấp trong vòng 3-5 ngày làm việc.
                    </>
                )}
              </p>
            </div>
          )}

          {/* --- CÁC NÚT ĐIỀU HƯỚNG (PHÂN QUYỀN) --- */}
          <div className="action-buttons-center gap-4">
            {isEmployee ? (
                // GIAO DIỆN SALES
                <>
                    <button 
                        className="btn-home flex items-center justify-center gap-2"
                        onClick={() => navigate('/employee/sales/exchange')}
                    >
                        <RotateCcw size={18} /> Đổi vé khác
                    </button>
                    
                    <button 
                        className="btn-print flex items-center justify-center gap-2"
                        onClick={() => window.print()}
                    >
                        <Printer size={18} /> In vé ngay
                    </button>
                </>
            ) : (
                // GIAO DIỆN KHÁCH HÀNG
                <>
                    <Link to="/customer/dashboard" className="btn-home">
                        <Home size={18} /> Về trang chủ
                    </Link>
                    
                    <Link to="/my-tickets" className="btn-print" style={{textDecoration: 'none'}}>
                        <Ticket size={18} /> Xem vé của tôi
                    </Link>
                </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExchangeSuccessPage;