import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { REPORT_DATA } from '../../services/db_mock'; // Import mock data
import '../../styles/pages/RevenueReport.css'; // Import CSS

const RevenueReportPage = () => {
  // State quản lý bộ lọc thời gian
  const [timeFilter, setTimeFilter] = useState('today'); // 'today', 'week', 'month'

  // Lấy dữ liệu tương ứng (Fallback về today nếu chưa có data khác)
  const currentData = REPORT_DATA[timeFilter] || REPORT_DATA['today'];
  const { summary, chartData, routes } = currentData;

  // Hàm xử lý xuất Excel (Giả lập)
  const handleExport = () => {
    alert(`Đang xuất báo cáo doanh thu (${timeFilter}) ra file Excel...`);
  };

  return (
    <div className="report-container">
      
      {/* 1. Header & Filter */}
      <div className="report-header">
        <div>
          <h1 className="report-title">Báo cáo doanh thu</h1>
          <p className="report-desc">Xem chi tiết thống kê doanh thu theo ngày/tuần/tháng</p>
          
          <div className="filter-bar">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2">
                <Calendar size={16} className="text-gray-500"/>
                <span className="text-sm font-medium text-gray-600">Xem theo:</span>
                <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="outline-none text-sm font-bold text-gray-800 bg-transparent cursor-pointer"
                >
                    <option value="today">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                </select>
            </div>
          </div>
        </div>

        <button className="btn-export" onClick={handleExport}>
          <Download size={18} /> Xuất Excel
        </button>
      </div>

      {/* 2. Summary Cards (3 Cards) */}
      <div className="summary-grid">
        {/* Card 1: Tổng doanh thu */}
        <div className="summary-card">
          <div className="card-label">Tổng doanh thu</div>
          <div className="card-value">
            {summary.revenue > 1000000000 
                ? (summary.revenue / 1000000000).toFixed(1) + ' tỷ' 
                : (summary.revenue / 1000000).toFixed(0) + ' triệu'}
          </div>
          <div className={`card-trend ${summary.growthRevenue >= 0 ? 'trend-up' : 'trend-down'}`}>
            {summary.growthRevenue > 0 ? '+' : ''}{summary.growthRevenue}% so với kỳ trước
          </div>
        </div>

        {/* Card 2: Tổng vé bán ra */}
        <div className="summary-card">
          <div className="card-label">Tổng vé bán ra</div>
          <div className="card-value" style={{color: '#374151'}}>
            {summary.tickets.toLocaleString()}
          </div>
          <div className={`card-trend ${summary.growthTickets >= 0 ? 'trend-up' : 'trend-down'}`}>
            {summary.growthTickets > 0 ? '+' : ''}{summary.growthTickets}% so với kỳ trước
          </div>
        </div>

        {/* Card 3: Doanh thu trung bình/vé */}
        <div className="summary-card">
          <div className="card-label">Doanh thu trung bình/vé</div>
          <div className="card-value" style={{color: '#374151'}}>
            {summary.avgPrice.toLocaleString()}đ
          </div>
          <div className="card-trend trend-neutral">Không đổi</div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="charts-grid">
        
        {/* Biểu đồ cột: Doanh thu theo thời gian */}
        <div className="chart-card">
          <h3 className="chart-title">Doanh thu theo thời gian (Triệu VNĐ)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    formatter={(value) => [`${value} triệu`, 'Doanh thu']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ đường: Số lượng vé bán ra */}
        <div className="chart-card">
          <h3 className="chart-title">Số lượng vé bán ra</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#16a34a" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Table Section: Doanh thu theo tuyến */}
      <div className="table-card">
        <div className="table-header">
            <h3 className="table-title">Doanh thu theo tuyến</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Tuyến đường</th>
                        <th>Số vé bán</th>
                        <th>Doanh thu</th>
                        <th>So với kỳ trước</th>
                    </tr>
                </thead>
                <tbody>
                    {routes && routes.map((route, index) => (
                        <tr key={index}>
                            <td className="font-medium">{route.route}</td>
                            <td>{route.tickets.toLocaleString()}</td>
                            <td className="font-bold text-gray-700">
                                {route.revenue >= 1000000 
                                    ? (route.revenue / 1000000).toFixed(1) + ' triệu' 
                                    : route.revenue.toLocaleString()}
                            </td>
                            <td>
                                <span className={`growth-badge ${route.growth >= 0 ? 'trend-up' : 'trend-down'}`}>
                                    {route.growth >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                    {Math.abs(route.growth)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default RevenueReportPage;