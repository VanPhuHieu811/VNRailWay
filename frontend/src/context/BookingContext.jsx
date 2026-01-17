import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  // 1. Khởi tạo state: Ưu tiên lấy từ SessionStorage nếu có (để chống F5 mất dữ liệu)
  const [bookingData, setBookingData] = useState(() => {
    const savedData = sessionStorage.getItem('bookingSession');
    return savedData ? JSON.parse(savedData) : {
      tripInfo: null,      // Thông tin tàu
      searchParams: null,  // Tiêu chí tìm kiếm
      selectedSeats: [],   // Danh sách ghế đã chọn
      passengers: [],      // Danh sách hành khách
      totalPrice: 0,
      isExchange: false,   // Cờ đổi vé
      exchangeData: null   // Dữ liệu vé cũ nếu đổi
    };
  });

  // 2. Tự động lưu vào SessionStorage mỗi khi bookingData thay đổi
  useEffect(() => {
    sessionStorage.setItem('bookingSession', JSON.stringify(bookingData));
  }, [bookingData]);

  // Hàm update helper để code gọn hơn
  const updateBooking = (newData) => {
    setBookingData(prev => ({ ...prev, ...newData }));
  };

  // Hàm reset khi hoàn tất đặt vé
  const resetBooking = () => {
    sessionStorage.removeItem('bookingSession');
    setBookingData({
      tripInfo: null,
      searchParams: null,
      selectedSeats: [],
      passengers: [],
      totalPrice: 0,
      isExchange: false,
      exchangeData: null
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

// Hook để dùng nhanh ở các trang
export const useBooking = () => useContext(BookingContext);