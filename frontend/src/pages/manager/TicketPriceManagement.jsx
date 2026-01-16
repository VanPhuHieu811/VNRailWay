import React, { useState, useEffect } from 'react';
import {
  DollarSign, Train, Armchair, Bed,
  Save, RotateCcw, Search, Bell, Calculator, Layers
} from 'lucide-react';
import * as priceApi from '../../services/priceApi';

const TicketPriceManagement = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('base');
  const [loading, setLoading] = useState(true);

  const [prices, setPrices] = useState({
    base: 0,
    baseId: '',
    trainTypes: [],
    carriageTypes: [],
    seatTypes: []
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const [baseRes, trainRes, carriageRes, floorRes] = await Promise.all([
        priceApi.getKilometerPrice(),
        priceApi.getTrainTypePrices(),
        priceApi.getTrainCarriagePrices(),
        priceApi.getTrainFloorPrices()
      ]);

      const baseData = baseRes.data.find(x => x.MaThamSo === 'TS004') || (baseRes.data.length > 0 ? baseRes.data[0] : { GiaTriSo: 0, MaThamSo: '' });

      // 2. Train Types
      const trainTypes = trainRes.data.map(item => ({
        id: item.MaGiaTau,
        name: item.LoaiTau,
        surcharge: item.GiaTien,
        desc: getTrainDesc(item.LoaiTau)
      }));

      // 3. Carriage Types
      const carriageTypes = carriageRes.data.map(item => ({
        id: item.MaGiaToa,
        name: item.LoaiToa === 'Ghế' ? 'Toa Ghế Ngồi' : 'Toa Giường Nằm',
        type: item.LoaiToa, // ghe/giuong
        surcharge: item.GiaTien,
        desc: getCarriageDesc(item.LoaiToa)
      }));

      // 4. Seat Types (Floors)
      const seatTypes = floorRes.data.map(item => ({
        id: item.MaGiaTang,
        name: `Giường Tầng ${item.SoTang}`,
        price: item.GiaTien,
        desc: `Tầng ${item.SoTang}`
      }));

      setPrices({
        base: baseData.GiaTriSo,
        baseId: baseData.MaThamSo,
        trainTypes,
        carriageTypes,
        seatTypes
      });
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      alert("Không thể tải dữ liệu giá vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getTrainDesc = (type) => {
    if (type?.toLowerCase().includes('sang')) return 'Tàu chất lượng cao, dịch vụ 5 sao';
    return 'Tàu tiêu chuẩn, giá phổ thông';
  };

  const getCarriageDesc = (type) => {
    if (type === 'Giường') return 'Toa có khoang ngủ (4 hoặc 6 giường)';
    return 'Toa ghế ngồi mềm điều hòa';
  };

  // --- HANDLERS ---
  const handlePriceChange = (category, id, newValue) => {
    const value = parseFloat(newValue) || 0;
    setPrices(prev => {
      const newPrices = { ...prev };
      if (category === 'base') {
        newPrices.base = value;
      } else if (category === 'trainTypes') {
        newPrices.trainTypes = prev.trainTypes.map(item =>
          item.id === id ? { ...item, surcharge: value } : item
        );
      } else if (category === 'carriageTypes') {
        newPrices.carriageTypes = prev.carriageTypes.map(item =>
          item.id === id ? { ...item, surcharge: value } : item
        );
      } else if (category === 'seatTypes') {
        newPrices.seatTypes = prev.seatTypes.map(item =>
          item.id === id ? { ...item, price: value } : item
        );
      }
      return newPrices;
    });
  };

  const handleSave = async () => {
    try {
      const promises = [];

      // Update Base Price
      if (prices.baseId) {
        promises.push(priceApi.updateKilometerPrice(prices.baseId, prices.base));
      }

      // Update Train Types
      prices.trainTypes.forEach(t => {
        promises.push(priceApi.updateTrainTypePrice(t.id, t.surcharge));
      });

      // Update Carriage Types
      prices.carriageTypes.forEach(c => {
        promises.push(priceApi.updateTrainCarriagePrice(c.id, c.surcharge));
      });

      // Update Seat Types
      prices.seatTypes.forEach(s => {
        promises.push(priceApi.updateTrainFloorPrice(s.id, s.price));
      });

      await Promise.all(promises);
      alert('Cập nhật giá vé thành công!');
      fetchPrices(); // Refresh data
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu giá vé.');
    }
  };

  const handleReset = () => {
    fetchPrices();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (loading) return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;

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
                  value={prices.base}
                  onChange={(e) => handlePriceChange('base', null, e.target.value)}
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
                      value={item.surcharge}
                      onChange={(e) => handlePriceChange('trainTypes', item.id, e.target.value)}
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
                    {item.type === 'Giường' ? <Bed className="w-5 h-5 text-blue-500" /> : <Armchair className="w-5 h-5 text-green-500" />}
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 mr-2">Phụ phí:</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={item.surcharge}
                      onChange={(e) => handlePriceChange('carriageTypes', item.id, e.target.value)}
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
            {prices.seatTypes.length === 0 && <p className="text-gray-400 italic">Không có dữ liệu giá tầng/ghế.</p>}
            {prices.seatTypes.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 mr-2">Giá niêm yết:</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceChange('seatTypes', item.id, e.target.value)}
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
          { id: 'seat', label: '4. Loại giường/ghế', icon: Layers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
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
            {prices.trainTypes.length > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>+ Phụ phí {prices.trainTypes[0].name}</span>
                <span className="font-medium">{formatCurrency(prices.trainTypes[0].surcharge)}</span>
              </div>
            )}

            {/* Loại toa */}
            {prices.carriageTypes.length > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>+ Phụ phí {prices.carriageTypes[0].name}</span>
                <span className="font-medium">{formatCurrency(prices.carriageTypes[0].surcharge)}</span>
              </div>
            )}

            {/* Loại giường */}
            {prices.seatTypes.length > 0 && (
              <div className="flex justify-between text-indigo-600 font-semibold bg-indigo-50 p-1 rounded">
                <span>+ Giá {prices.seatTypes[0].name}</span>
                <span className="font-medium">{formatCurrency(prices.seatTypes[0].price)}</span>
              </div>
            )}
          </div>

          {/* Cột 2: Tổng kết */}
          <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-8">
            <span className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Tổng cộng giá vé</span>
            <span className="text-4xl font-bold text-blue-700">
              {formatCurrency(
                (100 * prices.base) +
                (prices.trainTypes[0]?.surcharge || 0) +
                (prices.carriageTypes[0]?.surcharge || 0) +
                (prices.seatTypes[0]?.price || 0)
              )}
            </span>
            <p className="text-xs text-gray-400 mt-2 italic">
              * Ví dụ đang chọn cấu hình đầu tiên của mỗi danh mục.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          <RotateCcw className="w-4 h-4" /> Khôi phục
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-colors">
          <Save className="w-4 h-4" /> Lưu cấu hình giá
        </button>
      </div>

    </div>
  );
};

export default TicketPriceManagement;