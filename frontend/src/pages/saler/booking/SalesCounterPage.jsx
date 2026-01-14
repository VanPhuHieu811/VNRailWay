import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, User } from 'lucide-react';
import { GA_TAU_DB, LICH_TRINH_DB } from '../../../services/db_mock';

const SalesCounterPage = () => {
  const navigate = useNavigate();
  
  // State tìm kiếm đơn giản cho nhân viên
  const [criteria, setCriteria] = useState({
    from: 'HN',
    to: 'SG',
    date: '2026-01-02' // Default mock date
  });

  // Tìm trực tiếp khi render (hoặc dùng useEffect nếu gọi API)
  const displayTrains = LICH_TRINH_DB.filter(t => 
    t.gaDi === criteria.from && 
    t.gaDen === criteria.to && 
    t.ngayDi === criteria.date
  );

  const handleSelectTrip = (tripId) => {
    // Điều hướng sang trang chọn ghế dành riêng cho Sales
    navigate(`/employee/sales/seats/${tripId}`, {
      state: { tripId, searchParams: criteria }
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Search className="text-blue-600"/> Bán vé tại quầy
      </h1>

      {/* --- THANH TÌM KIẾM COMPACT --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ga đi</label>
          <select className="w-full p-2 border rounded font-semibold"
            value={criteria.from} onChange={e => setCriteria({...criteria, from: e.target.value})}>
            {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ga đến</label>
          <select className="w-full p-2 border rounded font-semibold"
            value={criteria.to} onChange={e => setCriteria({...criteria, to: e.target.value})}>
            {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ngày đi</label>
          <input type="date" className="w-full p-2 border rounded font-semibold"
            value={criteria.date} onChange={e => setCriteria({...criteria, date: e.target.value})} />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 h-[42px]">
          Tìm chuyến
        </button>
      </div>

      {/* --- KẾT QUẢ DẠNG BẢNG (Gọn hơn Card của khách) --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4">Mác tàu</th>
              <th className="p-4">Giờ chạy</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Chỗ trống</th>
              <th className="p-4">Giá cơ bản</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayTrains.length > 0 ? displayTrains.map(train => (
              <tr key={train.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-bold text-blue-700">{train.tenTau}</td>
                <td className="p-4">
                  <div className="font-semibold">{train.gioDi}</div>
                  <div className="text-xs text-slate-500">Đến: {train.gioDen}</div>
                </td>
                <td className="p-4 text-sm">{train.thoiGianChay}</td>
                <td className="p-4 text-sm font-medium text-green-600">{train.choTrong} chỗ</td>
                <td className="p-4 font-bold">{train.giaVe.toLocaleString()} đ</td>
                <td className="p-4">
                  <button 
                    onClick={() => handleSelectTrip(train.id)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5 rounded text-sm font-bold"
                  >
                    Chọn bán
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">Không tìm thấy tàu chạy ngày này.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SalesCounterPage;