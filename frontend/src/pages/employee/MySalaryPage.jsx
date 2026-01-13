import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Download } from 'lucide-react';
import { LUONG_DB } from '../../services/db_mock';
import '../../styles/pages/employee/MySalaryPage.css';

const MySalaryPage = () => {
  // Lấy năm hiện tại
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // State
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [salaryData, setSalaryData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. Load user khi vào trang
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('employee')) || JSON.parse(localStorage.getItem('user'));
    setCurrentUser(storedUser);
    
    // Auto load lương tháng hiện tại nếu có
    if (storedUser) {
        // Giả lập ID để test là NV001 nếu không có trong localStorage
        const userId = storedUser.maNhanVien || "NV001"; 
        findSalary(userId, currentMonth, currentYear);
    }
  }, []);

  // Hàm tìm kiếm lương trong Mock DB
  const findSalary = (userId, month, year) => {
    const record = LUONG_DB.find(
      s => s.maNhanVien === userId && s.thang == month && s.nam == year
    );
    setSalaryData(record || null);
  };

  const handleSearch = () => {
    if (!currentUser) return;
    const userId = currentUser.maNhanVien || "NV001"; // Fallback NV001 để test
    findSalary(userId, selectedMonth, selectedYear);
  };

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Tính tổng thu nhập & Khấu trừ (Dựa trên data tìm được)
  const totalIncome = salaryData ? (
    salaryData.luongCoBan + 
    salaryData.phuCapChucVu + 
    salaryData.phuCapDiLai + 
    salaryData.phuCapAnCa + 
    salaryData.phuCapKhac + 
    salaryData.thuong
  ) : 0;

  const totalDeduction = salaryData ? (
    salaryData.baoHiem + 
    salaryData.thueTNCN + 
    salaryData.khauTruKhac
  ) : 0;

  const netPay = totalIncome - totalDeduction;

  return (
    <div className="salary-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Thông tin lương</h1>
        <p className="page-subtitle">Xem chi tiết phiếu lương theo tháng</p>
      </div>

      {/* --- FILTER SECTION --- */}
      <div className="filter-card">
        <div className="filter-group">
          <label className="filter-label"><Calendar size={14} className="inline mr-1"/> Chọn tháng</label>
          <select 
            className="filter-select" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Năm</label>
          <select 
            className="filter-select"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <button className="btn-view-salary" onClick={handleSearch}>
          Xem phiếu lương
        </button>
      </div>

      {/* --- PAYSLIP RESULT --- */}
      {salaryData ? (
        <div className="payslip-card">
          
          {/* 1. Header Card */}
          <div className="payslip-header">
            <div>
              <h2 className="payslip-title">Phiếu lương tháng {salaryData.thang}/{salaryData.nam}</h2>
              <p className="payslip-employee-info">
                Mã phiếu: {salaryData.id} • Nhân viên: {currentUser?.fullName || currentUser?.hoTen || 'Nguyễn Văn A'}
              </p>
            </div>
            <div className="text-right">
              <span className="status-badge">{salaryData.trangThai}</span>
              <p className="payment-date">Ngày thanh toán: {salaryData.ngayThanhToan}</p>
            </div>
          </div>

          {/* 2. Body Grid */}
          <div className="payslip-body">
            
            {/* Cột Trái: Thu Nhập */}
            <div className="section-box">
              <h3 className="section-title text-blue-700">Thu nhập</h3>
              <div className="row-item">
                <span>Lương cơ bản</span>
                <span>{formatCurrency(salaryData.luongCoBan)}</span>
              </div>
              <div className="row-item">
                <span>Phụ cấp chức vụ</span>
                <span>{formatCurrency(salaryData.phuCapChucVu)}</span>
              </div>
              <div className="row-item">
                <span>Phụ cấp đi lại</span>
                <span>{formatCurrency(salaryData.phuCapDiLai)}</span>
              </div>
              <div className="row-item">
                <span>Phụ cấp ăn ca</span>
                <span>{formatCurrency(salaryData.phuCapAnCa)}</span>
              </div>
              <div className="row-item">
                <span>Phụ cấp khác</span>
                <span>{formatCurrency(salaryData.phuCapKhac)}</span>
              </div>
              <div className="row-item">
                <span>Thưởng</span>
                <span>{formatCurrency(salaryData.thuong)}</span>
              </div>
              <div className="row-item total">
                <span>Tổng thu nhập</span>
                <span>{formatCurrency(totalIncome)}</span>
              </div>
            </div>

            {/* Cột Phải: Chứa 2 box (Khấu trừ & Thống kê) */}
            <div className="flex flex-col gap-6">
              
              {/* Khấu Trừ */}
              <div className="section-box">
                <h3 className="section-title text-red-700">Các khoản khấu trừ</h3>
                <div className="row-item">
                  <span>Bảo hiểm</span>
                  <span>- {formatCurrency(salaryData.baoHiem)}</span>
                </div>
                <div className="row-item">
                  <span>Thuế TNCN</span>
                  <span>- {formatCurrency(salaryData.thueTNCN)}</span>
                </div>
                <div className="row-item">
                  <span>Khác</span>
                  <span>- {formatCurrency(salaryData.khauTruKhac)}</span>
                </div>
              </div>

              {/* Thống kê công việc */}
              <div className="section-box bg-slate-50 border-none">
                <h3 className="section-title">Thống kê công việc</h3>
                <div className="row-item">
                  <span>Số chuyến làm việc</span>
                  <span className="font-bold bg-blue-100 text-blue-800 px-2 rounded">{salaryData.soChuyen}</span>
                </div>
                <div className="row-item">
                  <span>Số ca thay thế</span>
                  <span className="font-bold bg-green-100 text-green-800 px-2 rounded">{salaryData.soCaThay}</span>
                </div>
                <div className="row-item">
                  <span>Số ngày nghỉ</span>
                  <span className="font-bold bg-orange-100 text-orange-800 px-2 rounded">{salaryData.soNgayNghi}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Footer: Tổng lương & Action */}
          <div className="payslip-footer">
            <div>
              <span className="net-pay-label">Tổng lương thực nhận</span>
              <span className="net-pay-value">{formatCurrency(netPay)}</span>
            </div>
            <div className="footer-actions">
              <button className="btn-action" onClick={() => window.print()}>
                <Printer size={16}/> In phiếu
              </button>
              <button className="btn-action primary">
                <Download size={16}/> Tải PDF
              </button>
            </div>
          </div>

        </div>
      ) : (
        // Use Case 2.2.1: Không có dữ liệu
        <div className="no-data-msg">
          <p>Chưa có thông tin lương cho Tháng {selectedMonth}/{selectedYear}.</p>
          <p className="text-sm mt-1">Vui lòng liên hệ bộ phận kế toán nếu có thắc mắc.</p>
        </div>
      )}
    </div>
  );
};

export default MySalaryPage;