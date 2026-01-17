import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User, Loader2, Train, Tag } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import { bookingApi } from '../../services/bookingApi'; 
import { LICH_TRINH_DB } from '../../services/db_mock';
import '../../styles/pages/BookingFlow.css';

// [MỚI] Danh sách ưu đãi (Giả lập lấy từ DB - Bảng UU_DAI_GIA)
const AVAILABLE_PROMOTIONS = [
    { code: '', name: 'Vé thường (Không giảm)' },
    { code: 'UD01', name: 'Sinh viên (-10%)' },
    { code: 'UD02', name: 'Người cao tuổi (-15%)' },
    // UD03 Tạm ngưng, UD04 Hết hạn (Không hiển thị)
];

const PaymentPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Lấy dữ liệu từ trang trước
  const { tripId, contactInfo, passengers: initialPassengers } = location.state || {};
  
  // [MỚI] State quản lý danh sách hành khách (để update giá khi chọn ưu đãi)
  const [passengerList, setPassengerList] = useState(initialPassengers || []);
  const [isRecalculating, setIsRecalculating] = useState(false); // Loading khi tính lại tiền

  const tripInfo = location.state?.tripInfo || LICH_TRINH_DB.find(t => t.id === tripId) || {
    tenTau: '---', gaDi: '---', gaDen: '---', gioDi: '--:--', gioDen: '--:--'
  };

  const [paymentMethod, setPaymentMethod] = useState(isEmployee ? 'cash' : 'qr');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- TÍNH TỔNG TIỀN ĐỘNG ---
  const dynamicTotalPrice = passengerList.reduce((sum, p) => sum + (p.price || 0), 0);

  // --- HÀM XỬ LÝ CHỌN ƯU ĐÃI ---
  const handlePromotionChange = async (index, promoCode) => {
    setIsRecalculating(true);
    
    // Lấy thông tin hành khách đang chỉnh sửa
    const currentPassenger = passengerList[index];

    try {
        // Gọi API tính lại giá cho vé này
        const res = await bookingApi.calculatePrice({
            tripId: tripId,
            fromStationId: tripInfo.maGaDi, 
            toStationId: tripInfo.maGaDen,
            seatId: currentPassenger.maViTri, // Cần ID ghế để tính
            promotionCode: promoCode || null
        });

        if (res.success) {
            const priceData = res.data;
            
            // Cập nhật lại state cho hành khách này
            const updatedList = [...passengerList];
            updatedList[index] = {
                ...currentPassenger,
                price: priceData.GiaThucTe,      // Giá mới sau giảm
                originalPrice: priceData.GiaGoc, // Giá gốc
                discount: priceData.SoTienGiam,  // Tiền giảm
                promotionCode: promoCode         // Lưu mã đã chọn
            };
            setPassengerList(updatedList);
        }
    } catch (error) {
        console.error("Lỗi tính lại giá:", error);
        alert("Không thể áp dụng ưu đãi này. Vui lòng thử lại.");
    } finally {
        setIsRecalculating(false);
    }
  };

  const getSafeBuyerInfo = () => {
    const buyer = { ...contactInfo }; 
    const firstPassenger = passengerList.length > 0 ? passengerList[0] : {};
    if (!buyer.fullName) buyer.fullName = firstPassenger.fullName;
    if (!buyer.cmnd) buyer.cmnd = firstPassenger.cmnd;
    if (!buyer.phone) buyer.phone = firstPassenger.phone;
    if (!buyer.email) buyer.email = firstPassenger.email;
    if (!buyer.address) buyer.address = firstPassenger.address;
    if (!buyer.dob) buyer.dob = firstPassenger.dob;
    return buyer;
  };
  const finalBuyerInfo = getSafeBuyerInfo();

  const handleConfirmPayment = async () => {
    if (!passengerList || passengerList.length === 0) {
        alert("Dữ liệu không hợp lệ."); return;
    }
    setIsProcessing(true);
    try {
        const payload = {
            tripId,
            paymentMethod: paymentMethod === 'cash' ? 'Tiền mặt' : (paymentMethod === 'qr' ? 'VNPAY' : 'Thẻ ngân hàng'),
            buyerInfo: {
                HoTen: finalBuyerInfo.fullName,
                CCCD: finalBuyerInfo.cmnd,
                SoDienThoai: finalBuyerInfo.phone,
                Email: finalBuyerInfo.email,
                DiaChi: finalBuyerInfo.address,
                NgaySinh: finalBuyerInfo.dob 
            },
            // [QUAN TRỌNG] Gửi kèm MaUuDai
            passengers: passengerList.map(p => ({
                MaViTri: p.maViTri,
                GiaCoBan: p.price,      // Giá thực trả
                DoiTuong: p.type || 'Người lớn',
                HoTen: p.fullName,
                CCCD: p.cmnd,
                NgaySinh: p.dob,
                MaUuDai: p.promotionCode || null // Gửi mã ưu đãi về BE
            })),
            gaDi: tripInfo.maGaDi,
            gaDen: tripInfo.maGaDen
        };

        const res = await bookingApi.submitPayment(payload);
        if (res.success) {
            const basePath = isEmployee ? '/employee/sales' : '/booking';
            navigate(`${basePath}/success`, {
                state: { 
                    resultData: res.data, 
                    tripInfo, 
                    totalPrice: dynamicTotalPrice, 
                    passengers: passengerList 
                }
            });
        } else {
            alert("Thanh toán thất bại: " + res.message);
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối server.");
    } finally {
        setIsProcessing(false); 
    }
  };

  if (!passengerList) return <div className="p-10 text-center">Hết phiên làm việc.</div>;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      {!isEmployee && (<><CustomerNavbar /><BookingSteps currentStep={5} /></>)}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back"><ArrowLeft size={18} /> Quay lại</div>

        <div className="seat-layout-container">
          
          {/* CỘT TRÁI: REVIEW & CHỌN ƯU ĐÃI */}
          <div className="payment-review-section">
            
            {/* Thông tin chuyến */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2"><Train size={20}/> Thông tin chuyến tàu</div>
              <div className="trip-summary-row mt-4">
                <div className="station-time-group">
                  <div className="station-label">Ga đi</div>
                  <div className="station-name">{tripInfo.gaDi}</div>
                  <div className="time-big">{tripInfo.gioDi}</div>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-6 mt-6"></div>
                <div className="station-time-group right">
                  <div className="station-label text-right">Ga đến</div>
                  <div className="station-name text-right">{tripInfo.gaDen}</div>
                  <div className="time-big text-right">{tripInfo.gioDen}</div>
                </div>
              </div>
            </div>

            {/* Người thanh toán */}
            <div className="review-card">
                <div className="review-header flex items-center gap-2"><User size={20}/> Người thanh toán</div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div><span className="text-gray-500">Họ tên:</span> <span className="font-medium ml-2 uppercase">{finalBuyerInfo.fullName}</span></div>
                    <div><span className="text-gray-500">SĐT:</span> <span className="font-medium ml-2">{finalBuyerInfo.phone}</span></div>
                </div>
            </div>

            {/* [QUAN TRỌNG] Danh sách vé & Chọn ưu đãi */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2 mb-4">
                <CheckCircle size={20}/> Chi tiết vé & Ưu đãi
                {isRecalculating && <Loader2 className="animate-spin ml-auto text-blue-600" size={18}/>}
              </div>
              
              <div className="space-y-4">
                {passengerList.map((p, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-slate-800 uppercase text-lg">{p.fullName}</div>
                                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-300">
                                        {p.tenToa} - Ghế {p.seatNum}
                                    </span>
                                    <span>• CCCD: {p.cmnd}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                {p.discount > 0 && (
                                    <div className="text-sm text-gray-400 line-through mb-0.5">
                                        {(p.originalPrice || p.price).toLocaleString()} ₫
                                    </div>
                                )}
                                <div className="font-bold text-xl text-orange-600">
                                    {p.price.toLocaleString()} ₫
                                </div>
                                {p.discount > 0 && (
                                    <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded mt-1 inline-block">
                                        Tiết kiệm {p.discount.toLocaleString()}đ
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dropdown chọn ưu đãi */}
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 flex items-center gap-3">
                            <Tag size={16} className="text-blue-600 shrink-0"/>
                            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Đối tượng ưu đãi:</label>
                            <select 
                                className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                                value={p.promotionCode || ''}
                                onChange={(e) => handlePromotionChange(idx, e.target.value)}
                                disabled={isRecalculating}
                            >
                                {AVAILABLE_PROMOTIONS.map((promo) => (
                                    <option key={promo.code} value={promo.code}>
                                        {promo.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG TIỀN */}
          <div className="booking-sidebar">
            <h3 className="sidebar-title">Thanh toán</h3>
            
            <div className="flex justify-between items-center mb-2 text-sm mt-4">
              <span className="text-slate-600">Số lượng vé:</span>
              <span className="font-medium">{passengerList.length}</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">{dynamicTotalPrice.toLocaleString()} đ</span>
            </div>

            <button 
                className="btn-continue mt-4 flex justify-center items-center gap-2"
                onClick={handleConfirmPayment}
                disabled={isProcessing || isRecalculating}
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