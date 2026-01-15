import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { GA_TAU_DB, LICH_TRINH_DB } from '../../../services/db_mock'; // Điều chỉnh path import tùy cấu trúc

const SalesExchangeSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu vé cũ từ trang trước
  const { oldTicketData, searchDefaults } = location.state || {};

  const [criteria, setCriteria] = useState({
    from: searchDefaults?.from || 'HN',
    to: searchDefaults?.to || 'SG',
    date: searchDefaults?.date || ''
  });

  // Tìm kiếm tàu (Mock)
  const displayTrains = LICH_TRINH_DB.filter(t => 
    t.gaDi === criteria.from && 
    t.gaDen === criteria.to && 
    t.ngayDi === criteria.date
  );

  const handleSelectTrip = (tripId) => {
    navigate(`/employee/sales/exchange/seats/${tripId}`, {
      state: { 
        tripId, 
        oldTicketData // Truyền tiếp dữ liệu vé cũ sang bước chọn ghế
      }
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header thông tin vé cũ */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-yellow-700 uppercase">Đang đổi vé cũ:</span>
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <span>{oldTicketData?.ticketCode}</span>
            <span className="text-slate-400">|</span>
            <span>{oldTicketData?.seatInfo}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Giá trị vé cũ</span>
          <span className="font-bold text-red-600 text-lg">{oldTicketData?.price.toLocaleString()} đ</span>
        </div>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        Tìm chuyến tàu thay thế
      </h1>

      {/* Form tìm kiếm Compact */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ga đi</label>
          <select className="w-full p-2 border rounded" value={criteria.from} onChange={e => setCriteria({...criteria, from: e.target.value})}>
            {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ga đến</label>
          <select className="w-full p-2 border rounded" value={criteria.to} onChange={e => setCriteria({...criteria, to: e.target.value})}>
            {GA_TAU_DB.map(g => <option key={g.maGa} value={g.maGa}>{g.tenGa}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ngày đi</label>
          <input type="date" className="w-full p-2 border rounded" value={criteria.date} onChange={e => setCriteria({...criteria, date: e.target.value})} />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 h-[42px]">
          <Search size={18}/>
        </button>
      </div>

      {/* Kết quả tìm kiếm dạng Bảng */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Tàu</th>
              <th className="p-4">Giờ chạy</th>
              <th className="p-4">Chỗ trống</th>
              <th className="p-4 text-right">Giá từ</th>
              <th className="p-4 text-center">Chọn</th>
            </tr>
          </thead>
          <tbody>
            {displayTrains.length > 0 ? displayTrains.map(t => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-bold text-blue-700">{t.tenTau}</td>
                <td className="p-4">
                  <div className="font-semibold">{t.gioDi}</div>
                  <div className="text-xs text-slate-500">{t.ngayDi}</div>
                </td>
                <td className="p-4 text-green-600 font-medium">{t.choTrong} ghế</td>
                <td className="p-4 text-right font-bold">{t.giaVe.toLocaleString()} đ</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleSelectTrip(t.id)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-bold hover:bg-blue-200">
                    Chọn
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">Không tìm thấy chuyến tàu.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesExchangeSearchPage;