import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, QrCode, Train, CheckCircle, User, Loader2 } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import { bookingApi } from '../../services/bookingApi'; // 
import '../../styles/pages/BookingFlow.css';

const PaymentPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Dữ liệu nhận được từ trang trước:", location.state?.passengers);

  // 1. Lấy dữ liệu từ state chuyển trang
  // contactInfo được truyền từ PassengerInfoPage (lấy từ Login hoặc Form)
  const { selectedSeats, tripId, totalPrice, passengers, contactInfo } = location.state || {};

  // 2. Fallback thông tin tàu (Tránh crash nếu user reload trang)
  const tripInfo = location.state?.tripInfo  || {
    tenTau: '---', gaDi: '---', gaDen: '---', gioDi: '--:--', gioDen: '--:--'
  };

  // State
  const [paymentMethod, setPaymentMethod] = useState(isEmployee ? 'cash' : 'qr');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- LOGIC QUAN TRỌNG: CHUẨN BỊ THÔNG TIN NGƯỜI THANH TOÁN ---
  // Nếu contactInfo thiếu dữ liệu (ví dụ: thiếu NgaySinh do Login chưa trả về)
  // Thì lấy thông tin của Hành khách đầu tiên đắp vào -> Đảm bảo DB không lỗi
  const getSafeBuyerInfo = () => {
    const buyer = { ...contactInfo }; 
    const firstPassenger = passengers && passengers.length > 0 ? passengers[0] : {};

    if (!buyer.fullName) buyer.fullName = firstPassenger.fullName;
    if (!buyer.cmnd) buyer.cmnd = firstPassenger.cmnd;
    if (!buyer.phone) buyer.phone = firstPassenger.phone;
    if (!buyer.email) buyer.email = firstPassenger.email; // Có thể lấy email hành khách nếu có
    if (!buyer.address) buyer.address = firstPassenger.address;
    
    // [FIX LỖI NULL NGÀY SINH]
    if (!buyer.dob) buyer.dob = firstPassenger.dob;

    return buyer;
  };

  const finalBuyerInfo = getSafeBuyerInfo();

  // --- HÀM THANH TOÁN (GỌI API) ---
  const handleConfirmPayment = async () => {
    // Validate cơ bản
    if (!passengers || passengers.length === 0) {
        alert("Dữ liệu không hợp lệ. Vui lòng quay lại chọn ghế.");
        return;
    }

    setIsProcessing(true); // Bật loading
    
    try {
        // Chuẩn bị Payload gửi lên Backend
        const payload = {
            tripId,
            paymentMethod: paymentMethod === 'cash' ? 'Tiền mặt' : (paymentMethod === 'qr' ? 'VNPAY' : 'Thẻ ngân hàng'),
            
            // Thông tin người đặt (đã xử lý an toàn)
            buyerInfo: {
                HoTen: finalBuyerInfo.fullName,
                CCCD: finalBuyerInfo.cmnd,
                SoDienThoai: finalBuyerInfo.phone,
                Email: finalBuyerInfo.email,
                DiaChi: finalBuyerInfo.address,
                NgaySinh: finalBuyerInfo.dob 
            },
            
            // Danh sách vé
            passengers: passengers.map(p => ({
                MaViTri: p.maViTri, // ID ghế trong DB
                GiaCoBan: p.price,
                DoiTuong: p.type || 'Người lớn',
                HoTen: p.fullName,
                CCCD: p.cmnd,
                NgaySinh: p.dob,
                tenTau: tripInfo.tenTau
            })),
            
            // Thông tin hành trình (để lưu vào vé)
            gaDi: tripInfo.maGaDi,
            gaDen: tripInfo.maGaDen
        };

        console.log("🚀 Đang gửi thanh toán:", payload);

        // Gọi API
        const res = await bookingApi.submitPayment(payload);
        console.log("🚀 Kết quả thanh toán:", res);
        if (res.success) {
            const basePath = isEmployee ? '/employee/sales' : '/booking';
            const updatedPasengers=passengers.map(p => ({
                MaViTri: p.maViTri, // ID ghế trong DB
                GiaCoBan: p.price,
                DoiTuong: p.type || 'Người lớn',
                HoTen: p.fullName,
                CCCD: p.cmnd,
                NgaySinh: p.dob,
                tenTau: tripInfo.tenTau,
                loaiToa: p.loaiToa
            }));
            // Chuyển sang trang Thành công kèm kết quả trả về
            navigate(`${basePath}/success`, {
                state: { 
                    resultData: res.data, // Mã Đặt Vé, Mã Hóa Đơn...
                    tripInfo, 
                    totalPrice, 
                    paymentMethod,
                    passengers: updatedPasengers
                }
            });
        } else {
            alert("Thanh toán thất bại: " + res.message);
        }

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Có lỗi xảy ra khi kết nối server. Vui lòng thử lại.");
    } finally {
        setIsProcessing(false); 
    }
  };

  const handleBack = () => navigate(-1);

  // Bảo vệ trang khi không có dữ liệu
  if (!selectedSeats) return <div className="p-10 text-center">Dữ liệu phiên làm việc đã hết hạn.</div>;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      
      {!isEmployee && (
        <>
          <CustomerNavbar />
          <BookingSteps currentStep={5} /> 
        </>
      )}

      <div className="booking-content">
        <div onClick={handleBack} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="seat-layout-container">
          
          {/* --- CỘT TRÁI: REVIEW THÔNG TIN --- */}
          <div className="payment-review-section">
            
            {/* 1. Thông tin chuyến tàu */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2">
                <Train size={20}/> Thông tin chuyến tàu
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{tripInfo.tenTau}</h3>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{tripInfo.loaiTau || 'Thống nhất'}</span>
                </div>
                <div className="bg-slate-50 border px-3 py-1 rounded-full text-sm font-medium text-slate-600">
                  Thời gian: {tripInfo.thoiGianChay}
                </div>
              </div>

              <div className="trip-summary-row">
                <div className="station-time-group">
                  <div className="station-label">Ga đi</div>
                  <div className="station-name">{tripInfo.gaDi}</div>
                  <div className="time-big">{tripInfo.gioDi}</div>
                </div>
                
                <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-6 mt-6 relative">
                    <div className="absolute -top-1.5 right-0 w-3 h-3 bg-slate-300 rounded-full"></div>
                    <div className="absolute -top-1.5 left-0 w-3 h-3 bg-slate-300 rounded-full"></div>
                </div>

                <div className="station-time-group right">
                  <div className="station-label text-right">Ga đến</div>
                  <div className="station-name text-right">{tripInfo.gaDen}</div>
                  <div className="time-big text-right">{tripInfo.gioDen}</div>
                </div>
              </div>
            </div>

            {/* 2. Người thanh toán (Tự động hiển thị) */}
            <div className="review-card">
                <div className="review-header flex items-center gap-2">
                    <User size={20}/> Người thanh toán
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div><span className="text-gray-500">Họ tên:</span> <span className="font-medium ml-2 uppercase">{finalBuyerInfo.fullName || '---'}</span></div>
                    <div><span className="text-gray-500">SĐT:</span> <span className="font-medium ml-2">{finalBuyerInfo.phone || '---'}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-2">{finalBuyerInfo.email || '---'}</span></div>
                    <div><span className="text-gray-500">CCCD:</span> <span className="font-medium ml-2">{finalBuyerInfo.cmnd || '---'}</span></div>
                </div>
                <p className="text-xs text-gray-400 mt-3 italic">* Thông tin được đồng bộ từ tài khoản hoặc hành khách đại diện.</p>
            </div>

            {/* 3. Chi tiết vé */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2">
                <CheckCircle size={20}/> Chi tiết vé đặt ({passengers.length} vé)
              </div>
              <div className="space-y-3">
                {passengers.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <div>
                            <div className="font-bold text-slate-800 uppercase">{p.fullName}</div>
                            <div className="text-sm text-slate-500">{p.tenToa} - Ghế {p.seatNum} <span className="text-xs ml-1 bg-gray-200 px-1 rounded">{p.type}</span></div>
                        </div>
                        <div className="font-bold text-orange-600">{p.price.toLocaleString()} ₫</div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: SIDEBAR THANH TOÁN --- */}
          <div className="booking-sidebar">
            <h3 className="sidebar-title">Thanh toán</h3>
            <p className="text-sm text-slate-500 mb-4">
                {isEmployee ? "Chọn hình thức thu tiền" : "Chọn phương thức thanh toán"}
            </p>
            
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-600">Tạm tính:</span>
              <span className="font-medium">{totalPrice.toLocaleString()} đ</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()} đ</span>
            </div>


            <button 
                className="btn-continue mt-4 flex justify-center items-center gap-2"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
            >
              {isProcessing ? <><Loader2 className="animate-spin" size={20}/> Đang xử lý...</> : (isEmployee ? "Xác nhận & In vé" : "Thanh toán ngay")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;