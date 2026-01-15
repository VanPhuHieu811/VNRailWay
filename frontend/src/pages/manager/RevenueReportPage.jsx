import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, Filter, Loader } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import API
import { getRevenueReportService, exportRevenueReportService } from '../../services/reportApi';
import '../../styles/pages/RevenueReport.css'; 

const RevenueReportPage = () => {
  // --- STATE QUẢN LÝ ---
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filterType, setFilterType] = useState('today'); // 'today', 'week', 'month', 'year'
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tạo danh sách năm (Ví dụ: 5 năm gần nhất)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // --- DỮ LIỆU MẶC ĐỊNH (HIỂN THỊ KHI KHÔNG CÓ DATA) ---
  const defaultData = {
    summary: {
      revenue: 0,
      tickets: 0,
      avgPrice: 0,
      growthRevenue: 0,
      growthTickets: 0
    },
    chartData: [], // Biểu đồ trống
    routes: []     // Bảng trống
  };

  // --- 1. GỌI API LẤY DỮ LIỆU ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getRevenueReportService(filterType, selectedMonth, selectedYear);
        
        if (res && res.success) {
          setReportData(res.data);
        } else {
          // Nếu API báo lỗi logic, vẫn giữ null để dùng defaultData
          setReportData(null); 
        }
      } catch (error) {
        console.error("Lỗi tải báo cáo:", error);
        toast.error("Không thể kết nối đến máy chủ.");
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterType, selectedMonth, selectedYear]);

  // --- 2. XỬ LÝ XUẤT EXCEL ---
  const handleExport = async () => {
    try {
        toast.info("Đang tạo file Excel...");
        const response = await exportRevenueReportService(filterType, selectedMonth, selectedYear);
        
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCaoDoanhThu_${filterType}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Lỗi xuất file:", error);
        toast.error("Không thể xuất file Excel lúc này.");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
    if (amount >= 1000000) return (amount / 1000000).toFixed(0) + ' triệu';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
            <Loader className="animate-spin mb-3 text-blue-600" size={40} />
            <p className="font-medium">Đang tổng hợp số liệu...</p>
        </div>
    );
  }

  // --- SỬ DỤNG DỮ LIỆU THẬT HOẶC MẶC ĐỊNH ---
  // Thay vì return null, ta dùng defaultData để render giao diện rỗng
  const displayData = reportData || defaultData;
  const { summary, chartData, routes } = displayData;

  return (
    <div className="report-container">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER & FILTER */}
      <div className="report-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="report-title text-2xl font-bold text-gray-800">Báo cáo doanh thu</h1>
          <p className="report-desc text-gray-500 text-sm mt-1">
             Thống kê chi tiết tình hình kinh doanh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* 1. Chọn Loại Thời Gian */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                <Filter size={16} className="text-gray-500"/>
                <span className="text-sm font-medium text-gray-600">Xem theo:</span>
                <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="outline-none text-sm font-bold text-gray-800 bg-transparent cursor-pointer border-none focus:ring-0"
                >
                    <option value="today">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Theo Tháng</option>
                    <option value="year">Theo Năm</option>
                </select>
            </div>

            {/* 2. Chọn Tháng */}
            {filterType === 'month' && (
                <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="outline-none text-sm font-medium text-gray-700 bg-transparent cursor-pointer"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* 3. Chọn Năm */}
            {(filterType === 'month' || filterType === 'year') && (
                <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="outline-none text-sm font-medium text-gray-700 bg-transparent cursor-pointer"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                        ))}
                    </select>
                </div>
            )}

            <button 
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium text-sm"
                onClick={handleExport}
                // Vô hiệu hóa nút xuất nếu không có dữ liệu thật (đang dùng defaultData)
                disabled={!reportData} 
                style={{ opacity: !reportData ? 0.6 : 1, cursor: !reportData ? 'not-allowed' : 'pointer' }}
            >
                <Download size={16} /> Xuất Excel
            </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="summary-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Tổng doanh thu</div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {formatCurrency(summary.revenue)}
          </div>
          <div className={`flex items-center text-sm font-medium ${summary.growthRevenue >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {summary.growthRevenue >= 0 ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
            {Math.abs(summary.growthRevenue)}% <span className="text-gray-400 ml-1 font-normal">so với kỳ trước</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="summary-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Tổng vé bán ra</div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {summary.tickets.toLocaleString()} <span className="text-base font-normal text-gray-500">vé</span>
          </div>
          <div className={`flex items-center text-sm font-medium ${summary.growthTickets >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {summary.growthTickets >= 0 ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
            {Math.abs(summary.growthTickets)}% <span className="text-gray-400 ml-1 font-normal">so với kỳ trước</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="summary-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Giá trung bình / vé</div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {summary.avgPrice.toLocaleString('vi-VN')} <span className="text-base font-normal text-gray-500">₫</span>
          </div>
          <div className="text-sm text-gray-400">Doanh thu trung bình trên mỗi vé bán ra</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Chart 1: Doanh thu */}
        <div className="chart-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ doanh thu</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                    formatter={(value) => [value.toLocaleString() + ' đ', 'Doanh thu']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f3f4f6'}}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
            {/* Hiển thị thông báo nếu biểu đồ trống */}
            {chartData.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-[-150px]">Chưa có dữ liệu biểu đồ</div>
            )}
          </div>
        </div>

        {/* Chart 2: Số lượng vé */}
        <div className="chart-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Số lượng vé bán ra</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
            {chartData.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-[-150px]">Chưa có dữ liệu biểu đồ</div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Top tuyến đường hiệu quả</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                    <tr>
                        <th className="p-4 font-semibold">Tuyến đường</th>
                        <th className="p-4 font-semibold">Số vé bán</th>
                        <th className="p-4 font-semibold">Doanh thu</th>
                        <th className="p-4 font-semibold">Hiệu suất</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                    {routes && routes.map((route, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-800">{route.route}</td>
                            <td className="p-4 text-gray-600">{route.tickets.toLocaleString()}</td>
                            <td className="p-4 font-bold text-blue-600">
                                {formatCurrency(route.revenue)}
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${route.growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {route.growth >= 0 ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                                    {Math.abs(route.growth)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                    {(!routes || routes.length === 0) && (
                        <tr>
                            <td colSpan="4" className="p-6 text-center text-gray-500 italic">Chưa có dữ liệu tuyến đường trong khoảng thời gian này.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default RevenueReportPage;