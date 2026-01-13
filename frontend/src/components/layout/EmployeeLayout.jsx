import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';

const EmployeeLayout = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  // Kiểm tra đăng nhập khi vào Layout
  useEffect(() => {
    const storedData = localStorage.getItem('employee');
    if (!storedData) {
      navigate('/login'); // Chưa đăng nhập -> Đá về Login
    } else {
      setEmployee(JSON.parse(storedData));
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống nhân viên?")) {
      localStorage.removeItem('employee');
      navigate('/login');
    }
  };

  // Chưa load xong dữ liệu user thì không hiện gì (tránh nháy)
  if (!employee) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar cố định bên trái */}
      <EmployeeSidebar userRole={employee.role} onLogout={handleLogout} />

      {/* Nội dung chính bên phải */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {/* Outlet là nơi nội dung các trang con (Dashboard, Bán vé...) hiển thị */}
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeLayout;