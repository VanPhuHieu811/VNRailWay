import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Download, Loader } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMyPayslipsService } from '../../services/staffApi'; 
import '../../styles/pages/employee/MySalaryPage.css';

const MySalaryPage = () => {
  // Lấy thời gian hiện tại
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // State
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper: Format ngày hiển thị
  const convertDateToDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper: Format tiền tệ VND
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Hàm gọi API lấy lương
  const fetchEmployeeSalary = async (month, year) => {
    if (!month || !year) return;
    
    try {
      setLoading(true);
      
      const res = await getMyPayslipsService(month, year);

      if (res && res.success) {
        setSalaryData(res.data || null);
        
        // --- ĐÃ XÓA ĐOẠN TOAST INFO Ở ĐÂY ---
        // Lý do: UI bên dưới đã hiển thị thông báo "Chưa có thông tin lương" rồi
        // nên không cần hiện Toast nữa để tránh bị lặp lại 2 lần khó chịu.
        
      } else {
        setSalaryData(null);
        // Chỉ hiện toast nếu lỗi hệ thống thực sự, còn không tìm thấy thì thôi
        // toast.warning("Không tìm thấy dữ liệu lương."); 
      }
    } catch (err) {
      console.error("Lỗi khi tải phiếu lương: ", err);
      setSalaryData(null);
      
      const msg = err.response?.data?.message || err.message || "Lỗi kết nối server";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeSalary(selectedMonth, selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchEmployeeSalary(selectedMonth, selectedYear);
  };

  return (
    <div className="salary-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
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
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <button className="btn-view-salary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Đang tải...' : 'Xem phiếu lương'}
        </button>
      </div>

      {/* --- LOADING STATE --- */}
      {loading && (
          <div className="flex justify-center py-10">
              <Loader className="animate-spin text-blue-600" size={32} />
          </div>
      )}

      {/* --- PAYSLIP RESULT --- */}
      {!loading && salaryData ? (
        <div className="payslip-card animate-fade-in">
          
          {/* 1. Header Card */}
          <div className="payslip-header">
            <div>
              <h2 className="payslip-title">Phiếu lương tháng {salaryData.Thang}/{salaryData.Nam}</h2>
            </div>
            <div className="text-right">
              <p className="payment-date">Ngày thanh toán: {convertDateToDisplay(salaryData.NgayThanhToan)}</p>
            </div>
          </div>

          {/* 2. Body Grid */}
          <div className="payslip-body">
            
            {/* Cột Trái: Thu Nhập */}
            <div className="section-box">
              <h3 className="section-title text-blue-700">Thu nhập</h3>
              <div className="row-item">
                <span>Lương cơ bản</span>
                <span>{formatCurrency(salaryData.LuongCoBan)}</span>
              </div>
              <div className="row-item">
                <span>Phụ cấp chức vụ (Trách nhiệm)</span>
                <span>{formatCurrency(salaryData.PhuCapTrachNhiem)}</span>
              </div>
              <div className="row-item">
                <span>Phụ cấp đi lại</span>
                <span>{formatCurrency(salaryData.PhuCapDiLai)}</span>
              </div>
              <div className="row-item">
                <span>Thù lao tăng ca / Ăn ca</span>
                <span>{formatCurrency(salaryData.ThuLaoTangCa)}</span>
              </div>
              <div className="row-item total">
                <span>Tổng thu nhập</span>
                <span>{formatCurrency(salaryData.TongLuongThucNhan + (salaryData.KhoanKhauTruKhac || 0))}</span> 
              </div>
            </div>

            {/* Cột Phải: Chứa 2 box (Khấu trừ & Thống kê) */}
            <div className="flex flex-col gap-6">
              
              {/* Khấu Trừ */}
              <div className="section-box">
                <h3 className="section-title text-red-700">Các khoản khấu trừ</h3>
                <div className="row-item">
                  <span>Khấu trừ khác / Bảo hiểm / Thuế</span>
                  <span className="text-red-600">- {formatCurrency(salaryData.KhoanKhauTruKhac)}</span>
                </div>
              </div>

              {/* Thống kê công việc */}
              <div className="section-box bg-slate-50 border-none">
                <h3 className="section-title">Thống kê công việc</h3>
                <div className="row-item">
                  <span>Số chuyến làm việc</span>
                  <span className="font-bold bg-blue-100 text-blue-800 px-2 rounded">{salaryData.SoChuyenLamViec}</span>
                </div>
                <div className="row-item">
                  <span>Số ca thay thế</span>
                  <span className="font-bold bg-green-100 text-green-800 px-2 rounded">{salaryData.SoCaThayThe}</span>
                </div>
                <div className="row-item">
                  <span>Số ngày nghỉ</span>
                  <span className="font-bold bg-orange-100 text-orange-800 px-2 rounded">{salaryData.SoNgayNghi}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Footer: Tổng lương & Action */}
          <div className="payslip-footer">
            <div>
              <span className="net-pay-label">Tổng lương thực nhận</span>
              <span className="net-pay-value">{formatCurrency(salaryData.TongLuongThucNhan)}</span>
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
        // Không có dữ liệu
        !loading && (
            <div className="no-data-msg">
            <p>Chưa có thông tin lương cho Tháng {selectedMonth}/{selectedYear}.</p>
            <p className="text-sm mt-1">Vui lòng kiểm tra lại thời gian hoặc liên hệ bộ phận kế toán.</p>
            </div>
        )
      )}
    </div>
  );
};

export default MySalaryPage;