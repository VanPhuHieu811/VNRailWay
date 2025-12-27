import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Trang giới thiệu
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard'; // Trang tìm vé

// --- BỔ SUNG ĐOẠN NÀY ---
// Component bảo vệ: Nếu chưa có token thì đá về trang Login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Nếu có token thì cho vào (children), không thì chuyển hướng sang /login
  return token ? children : <Navigate to="/login" />;
};
// ------------------------

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ công khai */}
        <Route path="/" element={<HomePage />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/customer/dashboard" 
          element={
            <PrivateRoute>
              <CustomerDashboard />
            </PrivateRoute>
          } 
        />

        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/manager/dashboard" element={<div>Manager Dashboard</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;