import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User, Loader2, Train, Tag, AlertTriangle, X } from 'lucide-react'; // Thêm icon AlertTriangle, X
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import { bookingApi } from '../../services/bookingApi'; 
import '../../styles/pages/BookingFlow.css';

const PaymentPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Lấy dữ liệu từ trang trước
  const { tripId, contactInfo, passengers: initialPassengers } = location.state || {};
  
  // State quản lý danh sách hành khách
  const [passengerList, setPassengerList] = useState(initialPassengers || []);
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  // State lưu danh sách ưu đãi từ API
  const [promotions, setPromotions] = useState([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(true);

  // [MỚI] State quản lý thông báo cảnh báo (thay cho alert)
  const [notification, setNotification] = useState(null); 

  // Thông tin chuyến tàu
  const tripInfo = location.state?.tripInfo || {
    tenTau: '---', gaDi: '---', gaDen: '---', gioDi: '--:--', gioDen: '--:--'
  };

  const [paymentMethod, setPaymentMethod] = useState(isEmployee ? 'cash' : 'qr');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- USE EFFECT: GỌI API LẤY DANH SÁCH ƯU ĐÃI ---
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await bookingApi.getPromotions();
        const rawData = res.success ? res.data : (res.data?.data || res.data || []);
        
        let processedData = rawData;
        if (Array.isArray(rawData) && Array.isArray(rawData[0])) {
            processedData = rawData[0]; 
        }

        const activePromos = Array.isArray(processedData) ? processedData.filter(p => p.TrangThai === 'Đang áp dụng') : [];

        const formattedPromos = [
          { MaUuDai: '', LoaiUuDai: 'Vé thường (Không giảm)', PhanTram: 0 },
          ...activePromos
        ];
        
        setPromotions(formattedPromos);
      } catch (error) {
        console.error("Lỗi lấy danh sách ưu đãi:", error);
        setPromotions([{ MaUuDai: '', LoaiUuDai: 'Vé thường (Không giảm)', PhanTram: 0 }]);
      } finally {
        setIsLoadingPromos(false);
      }
    };

    fetchPromotions();
  }, []);

  // --- TỰ ĐỘNG TẮT THÔNG BÁO SAU 5 GIÂY ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // 5 giây sau tự mất
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const dynamicTotalPrice = passengerList.reduce((sum, p) => sum + (p.price || 0), 0);

  // --- [LOGIC CHÍNH] HÀM XỬ LÝ CHỌN ƯU ĐÃI ---
  const handlePromotionChange = async (index, promoCode) => {
    setIsRecalculating(true);
    setNotification(null); // Reset thông báo cũ khi thao tác mới
    const currentPassenger = passengerList[index];

    // TRƯỜNG HỢP 1: Bỏ chọn mã
    if (!promoCode) {
        const updatedList = [...passengerList];
        updatedList[index] = {
            ...currentPassenger,
            price: currentPassenger.originalPrice || currentPassenger.price,
            discount: 0,
            promotionCode: ''
        };
        setPassengerList(updatedList);
        setIsRecalculating(false);
        return;
    }

    // TRƯỜNG HỢP 2: Áp dụng mã -> Gọi API Demo
    try {
        const rawRes = await bookingApi.applyPromotion({ maUuDai: promoCode });
        const res = rawRes.success ? rawRes : (rawRes.data || {});

        if (res.success) {
            // [THAY ĐỔI QUAN TRỌNG]: Thay alert bằng setNotification
            // Code sẽ KHÔNG DỪNG LẠI, nó sẽ chạy tiếp xuống dưới để cập nhật giá ngay lập tức
            if (res.isUnrepeatableRead) {
                setNotification({
                    type: 'warning',
                    message: res.message
                });
            }

            // Cập nhật giá ngay lập tức (Không cần đợi user bấm OK)
            const data = res.data || {};
            const giaGoc = currentPassenger.originalPrice || currentPassenger.price;
            
            let phanTramMoi = data.phanTramMoi;
            if (Array.isArray(phanTramMoi) && phanTramMoi.length > 0) {
                 phanTramMoi = phanTramMoi[0].PhanTram;
            }
            phanTramMoi = Number(phanTramMoi) || 0;

            const tienGiam = Math.round((giaGoc * phanTramMoi) / 100);
            const giaMoi = giaGoc - tienGiam;

            const updatedList = [...passengerList];
            updatedList[index] = {
                ...currentPassenger,
                price: giaMoi,      
                originalPrice: giaGoc,
                discount: tienGiam,
                promotionCode: promoCode
            };
            setPassengerList(updatedList);

        } else {
            setNotification({
                type: 'error',
                message: "Lỗi áp dụng ưu đãi: " + (res.message || "Không xác định")
            });
        }
    } catch (error) {
        console.error("Lỗi API Demo:", error);
        const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi kết nối server.";
        setNotification({ type: 'error', message: errorMsg });
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
        setNotification({ type: 'error', message: "Dữ liệu không hợp lệ." }); return;
    }
    setIsProcessing(true);
    setNotification(null);

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
            passengers: passengerList.map(p => ({
                MaViTri: p.maViTri,
                GiaCoBan: p.price,
                DoiTuong: p.type || 'Người lớn',
                HoTen: p.fullName,
                CCCD: p.cmnd,
                NgaySinh: p.dob,
                tenTau: tripInfo.tenTau,
                MaUuDai: p.promotionCode || null 
            })),
            gaDi: tripInfo.maGaDi,
            gaDen: tripInfo.maGaDen
        };
        
        const rawRes = await bookingApi.submitPayment(payload);
        const res = rawRes.success ? rawRes : (rawRes.data || {});

        if (res.success) {
            const basePath = isEmployee ? '/employee/sales' : '/booking';
            const updatedPasengers = passengerList.map(p => ({
                MaViTri: p.maViTri, 
                GiaCoBan: p.price,
                DoiTuong: p.type || 'Người lớn',
                HoTen: p.fullName,
                CCCD: p.cmnd,
                NgaySinh: p.dob,
                tenTau: tripInfo.tenTau,
                loaiToa: p.loaiToa
            }));
            
            navigate(`${basePath}/success`, {
                state: { 
                    resultData: res.data, 
                    tripInfo,  
                    paymentMethod,
                    passengers: updatedPasengers,
                    totalPrice: dynamicTotalPrice
                }
            });
        } else {
            setNotification({ type: 'error', message: "Thanh toán thất bại: " + (res.message || "Lỗi server") });
        }
    } catch (error) {
        console.error("Lỗi:", error);
        setNotification({ type: 'error', message: "Lỗi kết nối server." });
    } finally {
        setIsProcessing(false); 
    }
  };

  if (!passengerList) return <div className="p-10 text-center">Hết phiên làm việc.</div>;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      {!isEmployee && (<><CustomerNavbar /><BookingSteps currentStep={5} /></>)}

      <div className="booking-content relative">
        <div onClick={() => navigate(-1)} className="btn-back"><ArrowLeft size={18} /> Quay lại</div>

        {/* --- [MỚI] PHẦN HIỂN THỊ THÔNG BÁO (NOTIFICATION BANNER) --- */}
        {notification && (
            <div className={`
                fixed top-20 right-5 z-50 max-w-md w-full shadow-lg rounded-lg p-4 flex items-start gap-3 border-l-4 animation-slide-in
                ${notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-yellow-50 border-yellow-500 text-yellow-800'}
            `}>
                {notification.type === 'error' ? <X className="shrink-0" size={20}/> : <AlertTriangle className="shrink-0" size={20}/>}
                <div className="flex-1">
                    <h4 className="font-bold text-sm uppercase mb-1">
                        {notification.type === 'error' ? 'Lỗi' : 'Cảnh báo hệ thống'}
                    </h4>
                    <p className="text-sm">{notification.message}</p>
                </div>
                <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100">
                    <X size={16}/>
                </button>
            </div>
        )}

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
                  <div className="station-name">{tripInfo.gaDen}</div>
                  <div className="time-big">{tripInfo.gioDen}</div>
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

            {/* DANH SÁCH VÉ & CHỌN ƯU ĐÃI */}
            <div className="review-card">
              <div className="review-header flex items-center gap-2 mb-4">
                <CheckCircle size={20}/> Chi tiết vé & Ưu đãi
                {(isRecalculating || isLoadingPromos) && <Loader2 className="animate-spin ml-auto text-blue-600" size={18}/>}
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
                                disabled={isRecalculating || isLoadingPromos}
                            >
                                {promotions.map((promo) => (
                                    <option key={promo.MaUuDai || 'default'} value={promo.MaUuDai}>
                                        {promo.LoaiUuDai} {promo.PhanTram > 0 ? `(-${promo.PhanTram}%)` : ''}
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