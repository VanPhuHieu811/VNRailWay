import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Edit2, Ticket } from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import BookingSteps from '../components/common/BookingSteps';
import '../styles/pages/BookingFlow.css';

const PassengerInfoPage = ({ isEmployee = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu an toàn
  const { selectedSeats, tripId, searchParams } = location.state || { selectedSeats: [], tripId: '' };

  // Thông tin người liên hệ (Chỉ dùng cho Khách hàng)
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    cmnd: ''
  });

  // State lưu thông tin chi tiết từng hành khách
  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    // 1. Load thông tin người liên hệ (Chỉ load nếu KHÔNG phải nhân viên)
    if (!isEmployee) {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      setContactInfo({
        fullName: user.fullName || 'Nguyễn Văn A',
        phone: user.phone || '0988888888',
        email: user.email || 'email@example.com',
        cmnd: user.cmnd || '0123456789'
      });
    }

    // 2. Khởi tạo form hành khách dựa trên số ghế đã chọn
    if (selectedSeats && selectedSeats.length > 0) {
      const initialPassengers = selectedSeats.map(seat => ({
        seatId: seat.id,
        fullName: '',
        type: 'Người lớn',
        cmnd: '',
        dob: '',
        phone: '',
        address: ''
      }));
      setPassengers(initialPassengers);
    }
  }, [selectedSeats, isEmployee]);

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const totalPrice = selectedSeats ? selectedSeats.reduce((sum, seat) => sum + seat.price, 0) : 0;

  const handleContinue = () => {
    // Validate dữ liệu đầu vào
    const isValid = passengers.every(p => 
      p.fullName.trim() !== '' && 
      p.cmnd.trim() !== '' && 
      p.dob !== ''
    );
    
    if (!isValid) {
      alert("Vui lòng nhập đầy đủ Họ tên, CMND và Ngày sinh cho tất cả hành khách!");
      return;
    }

    // ĐIỀU HƯỚNG ĐỘNG DỰA TRÊN ROLE
    const basePath = isEmployee ? '/employee/sales' : '/booking';
    
    navigate(`${basePath}/payment`, { 
      state: { 
        selectedSeats, 
        tripId, 
        passengers, 
        totalPrice,
        searchParams // Truyền tiếp để nếu user back lại vẫn giữ state
      } 
    });
  };

  return (
    <div className="booking-container" style={isEmployee ? {paddingTop: '20px'} : {}}>
      
      {/* Chỉ hiện Navbar & Steps cho Khách hàng */}
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
          
          {/* --- CỘT TRÁI: Form nhập liệu --- */}
          <div className="passenger-section">
            
            {/* CARD THÔNG TIN NGƯỜI ĐẶT (Chỉ hiện cho Khách hàng) */}
            {!isEmployee && (
              <>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Thông tin người đặt vé</h2>
                <div className="contact-info-card">
                  <div className="contact-details">
                    <h4>{contactInfo.fullName}</h4>
                    <p>Số điện thoại: {contactInfo.phone}</p>
                    <p>Email: {contactInfo.email}</p>
                    <p className="text-sm text-slate-500 mt-2">* Vé điện tử sẽ được gửi tới email này</p>
                  </div>
                  <div className="btn-edit" onClick={() => alert("Chức năng sửa hồ sơ user")}>
                    <Edit2 size={16} /> Sửa
                  </div>
                </div>
              </>
            )}

            <h2 className="text-xl font-bold text-slate-800 mb-4 mt-8">Thông tin hành khách</h2>
            <p className="text-slate-500 mb-4 text-sm">Vui lòng nhập chính xác thông tin in trên giấy tờ tùy thân.</p>

            {/* Loop: Form từng ghế */}
            {selectedSeats && selectedSeats.map((seat, index) => (
              <div key={seat.id} className="passenger-form-card">
                <div className="passenger-header">
                  <span className="font-bold text-slate-700">Hành khách {index + 1}</span>
                  <span className="seat-label">{seat.tenToa} - Ghế {seat.seatNum}</span>
                </div>

                <div className="form-row-2">
                  {/* Hàng 1 */}
                  <div className="form-group-sm">
                    <label className="label-sm">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      type="text" className="input-sm" placeholder="VD: NGUYEN VAN A"
                      value={passengers[index]?.fullName || ''}
                      onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group-sm">
                    <label className="label-sm">Đối tượng</label>
                    <select 
                      className="input-sm"
                      value={passengers[index]?.type || 'Người lớn'}
                      onChange={(e) => handlePassengerChange(index, 'type', e.target.value)}
                    >
                      <option value="Người lớn">Người lớn</option>
                      <option value="Sinh viên">Sinh viên (Giảm 10%)</option>
                      <option value="Trẻ em">Trẻ em (Giảm 25%)</option>
                      <option value="Người cao tuổi">Người cao tuổi (Giảm 15%)</option>
                    </select>
                  </div>

                  {/* Hàng 2 */}
                  <div className="form-group-sm">
                    <label className="label-sm">Số CMND/CCCD/Hộ chiếu <span className="text-red-500">*</span></label>
                    <input 
                      type="text" className="input-sm" placeholder="Nhập số giấy tờ tùy thân"
                      value={passengers[index]?.cmnd || ''}
                      onChange={(e) => handlePassengerChange(index, 'cmnd', e.target.value)}
                    />
                  </div>

                  <div className="form-group-sm">
                    <label className="label-sm">Ngày sinh <span className="text-red-500">*</span></label>
                    <input 
                      type="date" className="input-sm" 
                      value={passengers[index]?.dob || ''}
                      onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)}
                    />
                  </div>

                  {/* Hàng 3 */}
                  <div className="form-group-sm">
                    <label className="label-sm">Số điện thoại</label>
                    <input 
                      type="tel" className="input-sm" placeholder="Nhập SĐT hành khách"
                      value={passengers[index]?.phone || ''}
                      onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                    />
                  </div>

                  <div className="form-group-sm">
                    <label className="label-sm">Địa chỉ</label>
                    <input 
                      type="text" className="input-sm" placeholder="Tỉnh/Thành phố"
                      value={passengers[index]?.address || ''}
                      onChange={(e) => handlePassengerChange(index, 'address', e.target.value)}
                    />
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
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-600">Số lượng vé</span>
                <span className="font-semibold">{selectedSeats ? selectedSeats.length : 0}</span>
              </div>
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