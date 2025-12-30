import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT TRANG KHÁCH HÀNG ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import SearchResultsPage from './pages/SearchResultsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PassengerInfoPage from './pages/PassengerInfoPage';
import PaymentPage from './pages/PaymentPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyTicketsPage from './pages/MyTicketsPage';
import ProfilePage from './pages/ProfilePage';

// --- IMPORT LUỒNG ĐỔI VÉ ---
import ExchangeSelectSeatsPage from './pages/ExchangeSelectSeatsPage';
import ExchangeSearchPage from './pages/ExchangeSearchPage';
import ExchangeConfirmPage from './pages/ExchangeConfirmPage';
import ExchangeSuccessPage from './pages/ExchangeSuccessPage';

// --- IMPORT NHÂN VIÊN ---
import EmployeeLayout from './components/layout/EmployeeLayout';
import EmployeeSalary from './pages/employee/MySalaryPage';
import EmployeeSchedulePage from './pages/employee/EmployeeSchedulePage'; // Đã đổi tên file cho khớp
import LeaveRequestPage from './pages/employee/LeaveRequestPage';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage';

// --- PLACEHOLDER COMPONENTS (Các trang đang phát triển) ---
const CounterSalesPage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Bán vé tại quầy (Đang phát triển)</div>;
const TicketExchangePage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Đổi/Hoàn vé (Đang phát triển)</div>;
const CustomerHistoryPage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Tra cứu khách hàng (Đang phát triển)</div>;

const RevenueReportPage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Báo cáo doanh thu (Đang phát triển)</div>;
const ManageStaffPage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Quản lý nhân sự (Đang phát triển)</div>;
const ApproveLeavePage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Duyệt nghỉ phép (Đang phát triển)</div>;
const ManageTrainsPage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Quản lý Đoàn tàu & Toa (Đang phát triển)</div>;
const ManagePricingPage = () => <div className="p-10 text-2xl font-bold text-slate-600">Trang Quản lý Giá & Ưu đãi (Đang phát triển)</div>;

// --- BẢO VỆ ROUTE ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// --- COMPONENT ĐIỀU HƯỚNG THÔNG MINH CHO NHÂN VIÊN ---
// Logic: Khi vào /employee, kiểm tra quyền và đẩy sang trang chức năng chính
const EmployeeHomeRedirect = () => {
  const employeeData = localStorage.getItem('employee');
  const user = employeeData ? JSON.parse(employeeData) : null;
  const role = user?.role; // Ví dụ: 'CREW', 'SALES', 'MANAGER'

  if (!role) return <Navigate to="/employee/login" replace />;

  switch (role) {
    case 'CREW':
      return <Navigate to="schedule" replace />; // Lái tàu -> Xem lịch
    case 'SALES':
      return <Navigate to="sales/counter" replace />; // Bán vé -> Màn hình bán vé
    case 'MANAGER':
      return <Navigate to="manager/revenue" replace />; // Quản lý -> Thống kê
    default:
      return <Navigate to="salary" replace />; // Mặc định -> Xem lương
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- KHÁCH HÀNG --- */}
        <Route path="/customer/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
        <Route path="/booking/search-results" element={<PrivateRoute><SearchResultsPage /></PrivateRoute>} />
        <Route path="/booking/seats/:tripId" element={<PrivateRoute><SeatSelectionPage /></PrivateRoute>} />
        <Route path="/booking/passengers" element={<PrivateRoute><PassengerInfoPage /></PrivateRoute>} />
        <Route path="/booking/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/booking/success" element={<PrivateRoute><BookingSuccessPage /></PrivateRoute>} />
        <Route path="/my-tickets" element={<PrivateRoute><MyTicketsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Luồng Đổi Vé */}
        <Route path="/exchange/select-seats" element={<PrivateRoute><ExchangeSelectSeatsPage /></PrivateRoute>} />
        <Route path="/exchange/search" element={<PrivateRoute><ExchangeSearchPage /></PrivateRoute>} /> 
        <Route path="/exchange/confirm" element={<PrivateRoute><ExchangeConfirmPage /></PrivateRoute>} />
        <Route path="/exchange/success" element={<PrivateRoute><ExchangeSuccessPage /></PrivateRoute>} />

        {/* --- NHÂN VIÊN (EMPLOYEE) --- */}
        <Route path="/employee" element={<EmployeeLayout />}>
          
          {/* 👇 Sử dụng component điều hướng thông minh ở đây */}
          <Route index element={<EmployeeHomeRedirect />} />
          
          {/* Fallback cho các đường dẫn cũ nếu có */}
          <Route path="dashboard" element={<Navigate to="." replace />} />
          <Route path="crew/dashboard" element={<Navigate to="." replace />} />

          {/* --- CHỨC NĂNG CHUNG --- */}
          <Route path="salary" element={<EmployeeSalary />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
          {/* --- NHÓM CREW (Tổ tàu) --- */}
          <Route path="schedule" element={<EmployeeSchedulePage />} />
          <Route path="leave-request" element={<LeaveRequestPage />} />

          {/* --- NHÓM SALES (Bán vé) --- */}
          <Route path="sales/counter" element={<CounterSalesPage />} />
          <Route path="sales/exchange" element={<TicketExchangePage />} />
          <Route path="sales/history" element={<CustomerHistoryPage />} />

          {/* --- NHÓM MANAGER (Quản lý) --- */}
          <Route path="manager/revenue" element={<RevenueReportPage />} />
          <Route path="manager/staff" element={<ManageStaffPage />} />
          <Route path="manager/approve-leave" element={<ApproveLeavePage />} />
          <Route path="manager/trains" element={<ManageTrainsPage />} />
          <Route path="manager/pricing" element={<ManagePricingPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;