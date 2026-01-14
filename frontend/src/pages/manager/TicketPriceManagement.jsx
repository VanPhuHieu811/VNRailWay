import React, { useState } from 'react';
import { 
  DollarSign, Train, Armchair, Bed, 
  Save, RotateCcw, Search, Bell, Calculator, Layers 
} from 'lucide-react';

const TicketPriceManagement = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('base');

  // Dữ liệu giá đã cập nhật theo yêu cầu
  const [prices, setPrices] = useState({
    base: 1000, // VNĐ/km

    // 1. Loại tàu: Hạng sang vs Thường
    trainTypes: [
      { id: 't1', name: 'Tàu Hạng Sang', surcharge: 50000, desc: 'Tàu chất lượng cao, dịch vụ 5 sao' },
      { id: 't2', name: 'Tàu Thường', surcharge: 0, desc: 'Tàu tiêu chuẩn, giá phổ thông' },
    ],

    // 2. Loại toa: Toa Giường vs Toa Ghế
    carriageTypes: [
      { id: 'c1', name: 'Toa Giường Nằm', surcharge: 100000, desc: 'Toa có khoang ngủ (4 hoặc 6 giường)' },
      { id: 'c2', name: 'Toa Ghế Ngồi', surcharge: 20000, desc: 'Toa ghế ngồi mềm điều hòa' },
    ],

    // 3. Loại giường (Tầng) & Ghế
    seatTypes: [
      { id: 'b1', name: 'Giường Tầng 1', price: 150000, desc: 'Tầng thấp nhất, tiện lợi di chuyển' },
      { id: 'b2', name: 'Giường Tầng 2', price: 120000, desc: 'Tầng giữa, không gian vừa phải' },
      { id: 'b3', name: 'Giường Tầng 3', price: 100000, desc: 'Tầng cao nhất, giá tiết kiệm' },
      { id: 's1', name: 'Ghế ngồi', price: 80000, desc: 'Vé ghế ngồi tiêu chuẩn (Áp dụng cho Toa ghế)' },
    ]
  });

  // --- HELPERS ---
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (activeTab) {
      case 'base':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" /> Giá vé cơ bản
            </h3>
            <p className="text-sm text-gray-500 mb-6">Đơn giá gốc tính trên mỗi Kilomet (km). Giá vé cuối cùng sẽ cộng thêm các phụ phí bên dưới.</p>
            
            <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-lg max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700">Đơn giá / km</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="text-right font-bold text-lg p-2 border border-gray-300 rounded-lg w-40 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={prices.base}
                />
                <span className="text-gray-500 font-medium">VNĐ</span>
              </div>
            </div>
          </div>
        );

      case 'train':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Phụ phí theo loại tàu</h3>
            {prices.trainTypes.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Train className="w-5 h-5 text-gray-400" /> {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-500 mr-2">Phụ phí:</span>
                   <div className="relative">
                      <input 
                        type="number" 
                        defaultValue={item.surcharge}
                        className="text-right font-bold p-2 border border-gray-300 rounded-lg w-40 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">đ</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'carriage':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Phụ phí theo loại toa</h3>
            {prices.carriageTypes.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    {item.id === 'c1' ? <Bed className="w-5 h-5 text-blue-500" /> : <Armchair className="w-5 h-5 text-green-500" />}
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-500 mr-2">Phụ phí:</span>
                   <div className="relative">
                      <input 
                        type="number" 
                        defaultValue={item.surcharge}
                        className="text-right font-bold p-2 border border-gray-300 rounded-lg w-40 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">đ</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'seat':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in duration-200">
             <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Giá vị trí (Tầng / Ghế)</h3>
             {prices.seatTypes.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    {item.name.includes('Giường') ? <Layers className="w-5 h-5 text-indigo-500" /> : <Armchair className="w-5 h-5 text-gray-400" />}
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-500 mr-2">Giá niêm yết:</span>
                   <div className="relative">
                      <input 
                        type="number" 
                        defaultValue={item.price}
                        className="text-right font-bold p-2 border border-gray-300 rounded-lg w-40 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">đ</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý giá vé</h1>
          <p className="text-gray-500 text-sm mt-1">Cấu hình giá cước vận tải hành khách</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button className="relative p-2 bg-white rounded-full border hover:bg-gray-50">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">1</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'base', label: '1. Giá cơ bản', icon: DollarSign },
          { id: 'train', label: '2. Loại tàu', icon: Train },
          { id: 'carriage', label: '3. Loại toa', icon: Armchair }, 
          { id: 'seat', label: '4. Loại giường/ghế', icon: Layers }, // Icon Layers đại diện cho Tầng
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="mb-8 min-h-[300px]">
        {renderContent()}
      </div>

      {/* CALCULATION DEMO FOOTER */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
           <Calculator className="w-5 h-5 text-blue-700" />
           <h3 className="text-lg font-bold text-blue-800">Ví dụ tính giá vé (Mô phỏng)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột 1: Chi tiết phép tính */}
          <div className="space-y-3 text-sm text-gray-700 bg-white/50 p-4 rounded-lg">
             <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="text-gray-500">Quãng đường (Ví dụ)</span>
                <span className="font-bold">100 km</span>
             </div>
             
             {/* Giá cơ bản */}
             <div className="flex justify-between">
                <span>Giá cơ bản ({prices.base}đ x 100km)</span>
                <span className="font-medium">{formatCurrency(100 * prices.base)}</span>
             </div>
             
             {/* Loại tàu */}
             <div className="flex justify-between text-blue-600">
                <span>+ Phụ phí {prices.trainTypes[0].name}</span>
                <span className="font-medium">{formatCurrency(prices.trainTypes[0].surcharge)}</span>
             </div>

             {/* Loại toa */}
             <div className="flex justify-between text-blue-600">
                <span>+ Phụ phí {prices.carriageTypes[0].name}</span>
                <span className="font-medium">{formatCurrency(prices.carriageTypes[0].surcharge)}</span>
             </div>

             {/* Loại giường */}
             <div className="flex justify-between text-indigo-600 font-semibold bg-indigo-50 p-1 rounded">
                <span>+ Giá {prices.seatTypes[0].name}</span>
                <span className="font-medium">{formatCurrency(prices.seatTypes[0].price)}</span>
             </div>
          </div>

          {/* Cột 2: Tổng kết */}
          <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-8">
             <span className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Tổng cộng giá vé</span>
             <span className="text-4xl font-bold text-blue-700">
                {formatCurrency(
                  (100 * prices.base) + 
                  prices.trainTypes[0].surcharge + 
                  prices.carriageTypes[0].surcharge + 
                  prices.seatTypes[0].price
                )}
             </span>
             <p className="text-xs text-gray-400 mt-2 italic">
               * Ví dụ đang chọn cấu hình cao nhất: Tàu Hạng Sang + Toa Giường + Tầng 1
             </p>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 mt-6">
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          <RotateCcw className="w-4 h-4" /> Khôi phục
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-colors">
          <Save className="w-4 h-4" /> Lưu cấu hình giá
        </button>
      </div>

    </div>
  );
};

export default TicketPriceManagement;