import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT CÁC TRANG ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MyTicketsPage from './pages/MyTicketsPage';
import ProfilePage from './pages/ProfilePage';

// --- TRANG DÙNG CHUNG ---
import SearchResultsPage from './pages/SearchResultsPage'; 
import SeatSelectionPage from './pages/SeatSelectionPage'; 
import PassengerInfoPage from './pages/PassengerInfoPage'; 
import PaymentPage from './pages/PaymentPage'; 
import BookingSuccessPage from './pages/BookingSuccessPage'; 

// --- TRANG ĐỔI VÉ ---
import ExchangeSelectSeatsPage from './pages/ExchangeSelectSeatsPage';
import ExchangeSearchPage from './pages/ExchangeSearchPage';
import ExchangeConfirmPage from './pages/ExchangeConfirmPage';
import ExchangeSuccessPage from './pages/ExchangeSuccessPage';

// --- EMPLOYEE PAGES ---
import EmployeeLayout from './components/layout/EmployeeLayout';
import EmployeeSalary from './pages/employee/MySalaryPage';
import EmployeeSchedulePage from './pages/employee/EmployeeSchedulePage';
import LeaveRequestPage from './pages/employee/LeaveRequestPage';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage';
import CustomerLookupPage from './pages/employee/CustomerLookupPage';
import TicketExchangePage from './pages/employee/TicketExchangePage';

// Placeholder
const RevenueReportPage = () => <div className="p-10">Báo cáo doanh thu</div>;
const ManageStaffPage = () => <div className="p-10">Quản lý nhân sự</div>;
const ApproveLeavePage = () => <div className="p-10">Duyệt nghỉ phép</div>;
const ManageTrainsPage = () => <div className="p-10">Quản lý tàu</div>;
const ManagePricingPage = () => <div className="p-10">Quản lý giá</div>;

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const EmployeeHomeRedirect = () => {
  const employeeData = localStorage.getItem('employee');
  const user = employeeData ? JSON.parse(employeeData) : null;
  const role = user?.role;
  if (!role) return <Navigate to="/employee/login" replace />;

  switch (role) {
    case 'CREW': return <Navigate to="schedule" replace />;
    case 'SALES': return <Navigate to="sales/counter" replace />;
    case 'MANAGER': return <Navigate to="manager/revenue" replace />;
    default: return <Navigate to="salary" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- KHÁCH HÀNG --- */}
        <Route path="/customer/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
        <Route path="/my-tickets" element={<PrivateRoute><MyTicketsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        
        {/* Luồng Đặt vé & Đổi vé (Khách hàng) */}
        <Route path="/booking/search-results" element={<PrivateRoute><SearchResultsPage /></PrivateRoute>} />
        <Route path="/booking/seats/:tripId" element={<PrivateRoute><SeatSelectionPage /></PrivateRoute>} />
        <Route path="/booking/passengers" element={<PrivateRoute><PassengerInfoPage /></PrivateRoute>} />
        <Route path="/booking/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/booking/success" element={<PrivateRoute><BookingSuccessPage /></PrivateRoute>} />

        {/* Flow Đổi Vé */}
        <Route path="/exchange/select-seats" element={<PrivateRoute><ExchangeSelectSeatsPage /></PrivateRoute>} />
        <Route path="/exchange/search" element={<PrivateRoute><ExchangeSearchPage /></PrivateRoute>} />
        <Route path="/exchange/confirm" element={<PrivateRoute><ExchangeConfirmPage /></PrivateRoute>} />
        <Route path="/exchange/success" element={<PrivateRoute><ExchangeSuccessPage /></PrivateRoute>} />

        {/* --- NHÂN VIÊN --- */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeHomeRedirect />} />
          <Route path="salary" element={<EmployeeSalary />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
          <Route path="schedule" element={<EmployeeSchedulePage />} />
          <Route path="leave-request" element={<LeaveRequestPage />} />

          {/* --- SALES ROLES --- */}
          <Route path="sales/history" element={<CustomerLookupPage />} />
          <Route path="sales/exchange" element={<TicketExchangePage />} />

          {/* Flow Bán vé Mới */}
          <Route path="sales/counter" element={<SearchResultsPage isEmployee={true} />} />
          <Route path="sales/seats/:tripId" element={<SeatSelectionPage isEmployee={true} />} />
          <Route path="sales/passengers" element={<PassengerInfoPage isEmployee={true} />} />
          <Route path="sales/payment" element={<PaymentPage isEmployee={true} />} />
          <Route path="sales/success" element={<BookingSuccessPage isEmployee={true} />} />

          {/* Flow Đổi Vé (Tách riêng route để giữ Sidebar) */}
          <Route path="sales/exchange/search" element={<SearchResultsPage isEmployee={true} />} />
          <Route path="sales/exchange/seats/:tripId" element={<SeatSelectionPage isEmployee={true} />} />
          {/* 👇 QUAN TRỌNG: Route Confirm & Success nằm trong EmployeeLayout */}
          <Route path="sales/exchange/confirm" element={<ExchangeConfirmPage />} />
          <Route path="sales/exchange/success" element={<ExchangeSuccessPage />} />

          {/* Manager Roles */}
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