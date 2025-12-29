import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';         // Trang chủ (Landing page)
import LoginPage from './pages/LoginPage';       // Trang đăng nhập
import RegisterPage from './pages/RegisterPage'; // Trang đăng ký
import CustomerDashboard from './pages/CustomerDashboard'; // Trang tìm vé (Dashboard khách)
import SearchResultsPage from './pages/SearchResultsPage'; // Trang kết quả tìm kiếm (Mới thêm)
import SeatSelectionPage from './pages/SeatSelectionPage'; // Trang chọn ghế (Mới thêm)
import PassengerInfoPage from './pages/PassengerInfoPage'; // Trang thông tin hành khách
import PaymentPage from './pages/PaymentPage'; // Trang thanh toán
import BookingSuccessPage from './pages/BookingSuccessPage'; // Trang hoàn tất đặt vé
import MyTicketsPage from './pages/MyTicketsPage'; // Trang vé của tôi
import ProfilePage from './pages/ProfilePage'; // Trang hồ sơ cá nhân
import ExchangeSelectSeatsPage from './pages/ExchangeSelectSeatsPage'; // Trang chọn ghế đổi vé
import ExchangeSearchPage from './pages/ExchangeSearchPage'; // Trang tìm chuyến đổi vé
import ExchangeConfirmPage from './pages/ExchangeConfirmPage'; // Trang xác nhận đổi vé
import ExchangeSuccessPage from './pages/ExchangeSuccessPage'; // Trang hoàn tất đổi vé


// --- COMPONENT BẢO VỆ (Private Route) ---
// Kiểm tra nếu có token thì cho vào, không có thì đá về Login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes (Ai cũng xem được) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Private Routes (Phải đăng nhập mới vào được) --- */}
        
        {/* 1. Dashboard Khách hàng */}
        <Route path="/customer/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
        {/* 2. Trang Kết quả tìm kiếm (Luồng đặt vé) */}
        <Route path="/booking/search-results" element={<PrivateRoute><SearchResultsPage /></PrivateRoute>} />
        {/* 3. Trang Chọn ghế (Đã hoàn thiện) */}
        <Route path="/booking/seats/:tripId" element={<PrivateRoute><SeatSelectionPage /></PrivateRoute>} />
        {/* 4. Trang Thông tin khách hàng (MỚI) */}
        <Route path="/booking/passengers" element={<PrivateRoute><PassengerInfoPage /></PrivateRoute>} />
        {/* 5. Trang Thanh toán (MỚI) */}
        <Route path="/booking/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        {/* 6. Trang Hoàn tất (ĐÃ XONG) */}
        <Route path="/booking/success" element={<PrivateRoute><BookingSuccessPage /></PrivateRoute>} />

        {/* Route trang Vé của tôi */}
        <Route path="/my-tickets" element={<PrivateRoute><MyTicketsPage /></PrivateRoute>} />

        {/* Luồng Đổi Vé */}
        <Route path="/exchange/select-seats" element={<PrivateRoute><ExchangeSelectSeatsPage /></PrivateRoute>} />
        <Route path="/exchange/search" element={<PrivateRoute><ExchangeSearchPage /></PrivateRoute>} /> 
        <Route path="/exchange/confirm" element={<PrivateRoute><ExchangeConfirmPage /></PrivateRoute>} />
        <Route path="/exchange/success" element={<PrivateRoute><ExchangeSuccessPage /></PrivateRoute>} />

        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        {/* --- Admin & Manager Routes (Placeholder) --- */}
        <Route path="/admin/dashboard" element={<div className="p-10 text-red-600 font-bold">Admin Dashboard</div>} />
        <Route path="/manager/dashboard" element={<div className="p-10 text-blue-600 font-bold">Manager Dashboard (Nhân viên)</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;