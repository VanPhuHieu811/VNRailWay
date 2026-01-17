import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Ticket, Loader2 } from 'lucide-react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BookingSteps from '../../components/common/BookingSteps';
import '../../styles/pages/BookingFlow.css';

// [QUAN TRỌNG] Import đúng hàm từ file chứa đoạn code bạn vừa gửi
// Hãy đảm bảo đường dẫn '../services/authApi' là đúng với cấu trúc thư mục của bạn
import { getCurrentUserInfo } from '../../services/authApi'; 

const PassengerInfoPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu ghế đã chọn từ trang trước
  const { selectedSeats, tripId, searchParams, tripInfo } = location.state || { selectedSeats: [], tripId: '' };

  // State thông tin người đặt (Sẽ được điền tự động từ API)
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    cmnd: '',
    dob: '',
    address: ''
  });

  const [passengers, setPassengers] = useState([]);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    // 1. GỌI API LẤY THÔNG TIN USER
const fetchUserData = async () => {
        if (isEmployee || !localStorage.getItem('token')) return;

        try {
            setIsLoadingUser(true);
            const response = await getCurrentUserInfo();
            console.log("✅ Kết quả API User:", response);

            // 1. Lấy cục data chính
            const responseData = response.data || response; 

            // 2. [QUAN TRỌNG] Kiểm tra xem có cục 'khachHang' bên trong không?
            // Nếu có thì lấy nó, nếu không thì dùng chính responseData (fallback)
            const actualUser = responseData.khachHang || responseData;

            if (actualUser) {
                setContactInfo({
                    // Map đúng các trường (API trả về camelCase: hoTen, soDienThoai...)
                    fullName: actualUser.hoTen || actualUser.HoTen,
                    phone: actualUser.soDienThoai || actualUser.SoDienThoai,
                    email: actualUser.email || actualUser.Email, // Email có thể nằm ở account hoặc khachHang
                    cmnd: actualUser.cccd || actualUser.CCCD,
                    dob: actualUser.ngaySinh || actualUser.NgaySinh,
                    address: actualUser.diaChi || actualUser.DiaChi
                });
                
                // Nếu email nằm ở object account (bên ngoài khachHang), ta lấy thêm
                if (responseData.account && responseData.account.email) {
                     setContactInfo(prev => ({ ...prev, email: responseData.account.email }));
                }
            }
        } catch (error) {
            console.error("❌ Lỗi lấy thông tin:", error);
        } finally {
            setIsLoadingUser(false);
        }
    };

    fetchUserData();

    // 2. Khởi tạo form hành khách (Logic cũ giữ nguyên)
    if (selectedSeats && selectedSeats.length > 0) {
      const initialPassengers = selectedSeats.map(seat => ({
        seatId: seat.id,
        maViTri: seat.maViTri,
        tenToa: seat.maToaTau,
        loaiToa: seat.loaiToa,
        fullName: '',
        type: 'Người lớn', // Mặc định
        cmnd: '',
        dob: '',
        phone: '', 
        address: '',
        price: seat.price
      }));
      setPassengers(initialPassengers);
    }
  }, [selectedSeats, isEmployee]);

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const totalPrice = passengers.reduce((sum, p) => sum + p.price, 0);

  const handleContinue = () => {
    // Validate thông tin Hành khách
    const isValidPassengers = passengers.every(p => 
      p.fullName.trim() !== '' && 
      p.dob !== '' &&
      p.cmnd.trim() !== ''
    );
    
    if (!isValidPassengers) {
      alert("Vui lòng nhập đầy đủ Họ tên, Ngày sinh và Số giấy tờ cho tất cả hành khách!");
      return;
    }

    // Điều hướng sang trang thanh toán
    const basePath = isEmployee ? '/employee/sales' : '/booking';
    navigate(`${basePath}/payment`, { 
      state: { 
        selectedSeats, 
        tripId, 
        tripInfo, 
        passengers, 
        contactInfo, // Truyền thông tin đã lấy từ API sang bước sau
        totalPrice, 
        searchParams 
      } 
    });
  };

  if (!selectedSeats || selectedSeats.length === 0) return <div>Không có dữ liệu ghế. Vui lòng quay lại.</div>;

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      {!isEmployee && (
        <>
          <CustomerNavbar />
          <BookingSteps currentStep={4} />
        </>
      )}

      <div className="booking-content">
        <div onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} /> Quay lại
        </div>

        <div className="seat-layout-container">
          
          {/* --- CỘT TRÁI: FORM HÀNH KHÁCH --- */}
          <div className="passenger-section">
            
            {/* Hiển thị trạng thái Loading hoặc Thông tin người đặt */}
            {!isEmployee && (
                <div className="mb-6">
                    {isLoadingUser ? (
                        <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <Loader2 className="animate-spin" size={16}/> 
                            Đang đồng bộ thông tin tài khoản...
                        </div>
                    ) : (
                        <div className="bg-green-50 text-green-800 p-3 rounded-lg border border-green-200 text-sm flex items-center gap-2">
                            <User size={16} />
                            Người đặt vé: <b>{contactInfo.fullName || 'Khách vãng lai'}</b> 
                            {contactInfo.phone && <span>- {contactInfo.phone}</span>}
                        </div>
                    )}
                </div>
            )}

            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                Thông tin hành khách
            </h2>
            <p className="text-sm text-slate-500 italic mb-4">Vui lòng nhập thông tin chính xác như trên giấy tờ tùy thân.</p>
            
            {passengers.map((passenger, index) => (
                <div key={passenger.seatId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative mb-4">
                    <div className="absolute top-4 right-4 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {passenger.tenToa} - Ghế {passenger.seatNum}
                    </div>
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Hành khách {index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                                value={passenger.fullName} onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)} placeholder="VD: NGUYEN VAN A" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số giấy tờ tùy thân <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={passenger.cmnd} onChange={(e) => handlePassengerChange(index, 'cmnd', e.target.value)} placeholder="CCCD / CMND" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                            <input type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={passenger.dob} onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input type="tel" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={passenger.phone} onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)} placeholder="Không bắt buộc" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={passenger.address} onChange={(e) => handlePassengerChange(index, 'address', e.target.value)} placeholder="Không bắt buộc" />
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* --- CỘT PHẢI: SIDEBAR --- */}
          <div className="booking-sidebar">
            <h3 className="sidebar-title">Tóm tắt đặt chỗ</h3>
            <div className="selected-list">
              {selectedSeats && selectedSeats.map(seat => (
                <div key={seat.id} className="selected-seat-tag">
                  <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-blue-500"/>
                    <span className="font-semibold text-slate-700">{seat.tenToa} - Ghế {seat.seatNum}</span>
                  </div>
                  <span className="text-blue-600 font-bold">{seat.price.toLocaleString()}đ</span>
                </div>
              ))}
            </div>
            <div className="total-section">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-800 font-bold text-lg">Tổng tiền</span>
                <span className="text-xl font-bold text-red-600">{totalPrice.toLocaleString()} đ</span>
              </div>
              <button className="btn-continue" onClick={handleContinue}>
                Tiếp tục
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PassengerInfoPage;