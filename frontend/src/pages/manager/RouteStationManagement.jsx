import React, { useState } from 'react';
import { 
  MapPin, Plus, Edit, Trash2, Train, 
  ArrowRight, Search, Save, X, Navigation 
} from 'lucide-react';

const RouteStationManagement = () => {
  // --- 1. STATE & DATA ---
  
  // Danh sách các Ga có sẵn trong hệ thống (Master Data)
  const masterStations = [
    { code: "HN", name: "Hà Nội" },
    { code: "PL", name: "Phủ Lý" },
    { code: "ND", name: "Nam Định" },
    { code: "NB", name: "Ninh Bình" },
    { code: "TH", name: "Thanh Hóa" },
    { code: "V",  name: "Vinh" },
    { code: "DH", name: "Đồng Hới" },
    { code: "HUE",name: "Huế" },
    { code: "DN", name: "Đà Nẵng" },
    { code: "NT", name: "Nha Trang" },
    { code: "SG", name: "Sài Gòn" },
  ];

  // Dữ liệu mẫu các Tuyến
  const [routes, setRoutes] = useState([
    {
      id: "R01",
      name: "Hà Nội - Sài Gòn",
      code: "HN-SG",
      totalStations: 9,
      stations: [
        { id: 1, code: "HN", name: "Hà Nội", km: 0 },
        { id: 2, code: "NB", name: "Ninh Bình", km: 90 },
        { id: 3, code: "TH", name: "Thanh Hóa", km: 176 },
        { id: 4, code: "V",  name: "Vinh", km: 341 },
        { id: 5, code: "DH", name: "Đồng Hới", km: 521 },
        { id: 6, code: "HUE",name: "Huế", km: 687 },
        { id: 7, code: "DN", name: "Đà Nẵng", km: 790 },
        { id: 8, code: "NT", name: "Nha Trang", km: 1320 },
        { id: 9, code: "SG", name: "Sài Gòn", km: 1726 },
      ]
    },
    {
      id: "R02",
      name: "Hà Nội - Đà Nẵng",
      code: "HN-DN",
      totalStations: 5,
      stations: [
        { id: 1, code: "HN", name: "Hà Nội", km: 0 },
        { id: 2, code: "ND", name: "Nam Định", km: 87 },
        { id: 3, code: "TH", name: "Thanh Hóa", km: 176 },
        { id: 4, code: "V",  name: "Vinh", km: 341 },
        { id: 5, code: "DN", name: "Đà Nẵng", km: 790 },
      ]
    }
  ]);

  const [selectedRouteId, setSelectedRouteId] = useState("R01");
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);

  // Form State
  const [newStationData, setNewStationData] = useState({ stationCode: "", distanceFromPrev: "" });
  const [newRouteData, setNewRouteData] = useState({ name: "", code: "" });

  // --- 2. LOGIC & HELPERS ---

  // Lấy tuyến đang chọn
  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  // Tính tổng chiều dài (dựa vào Km của ga cuối cùng)
  const totalLength = selectedRoute?.stations[selectedRoute.stations.length - 1]?.km || 0;

  // Xử lý Thêm Tuyến mới
  const handleAddRoute = () => {
    if (!newRouteData.name || !newRouteData.code) return alert("Vui lòng nhập đủ thông tin tuyến!");
    
    const newRoute = {
      id: `R${routes.length + 1}`,
      name: newRouteData.name,
      code: newRouteData.code,
      totalStations: 0,
      stations: []
    };
    setRoutes([...routes, newRoute]);
    setIsAddRouteModalOpen(false);
    setNewRouteData({ name: "", code: "" });
    setSelectedRouteId(newRoute.id); // Chuyển sang tuyến mới tạo
  };

  // Xử lý Thêm Ga vào Tuyến
  const handleAddStation = () => {
    if (!newStationData.stationCode || newStationData.distanceFromPrev === "") return alert("Vui lòng chọn ga và nhập khoảng cách!");
    
    const dist = parseInt(newStationData.distanceFromPrev);
    if (dist < 0) return alert("Khoảng cách không thể âm!");

    // Check ga đã tồn tại trong tuyến chưa (Luồng phụ)
    if (selectedRoute.stations.some(s => s.code === newStationData.stationCode)) {
      return alert("Ga này đã tồn tại trong tuyến!");
    }

    const stationInfo = masterStations.find(s => s.code === newStationData.stationCode);
    
    // Tính Km cộng dồn: Lấy Km của ga cuối cùng + khoảng cách mới nhập
    const lastStationKm = selectedRoute.stations.length > 0 
      ? selectedRoute.stations[selectedRoute.stations.length - 1].km 
      : 0;
    
    // Nếu là ga đầu tiên, khoảng cách nhập vào coi như Km 0 (hoặc logic khác tùy nghiệp vụ, ở đây giả sử ga đầu luôn là km0 nếu list rỗng)
    const newKm = selectedRoute.stations.length === 0 ? 0 : lastStationKm + dist;

    const newStationObj = {
      id: Date.now(), // Fake ID
      code: stationInfo.code,
      name: stationInfo.name,
      km: newKm
    };

    const updatedRoutes = routes.map(r => {
      if (r.id === selectedRouteId) {
        return { ...r, stations: [...r.stations, newStationObj], totalStations: r.stations.length + 1 };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    setIsAddStationModalOpen(false);
    setNewStationData({ stationCode: "", distanceFromPrev: "" });
  };

  // Xử lý Xóa Ga
  const handleDeleteStation = (stationId) => {
    if(!window.confirm("Bạn có chắc muốn xóa ga này khỏi tuyến?")) return;

    // Khi xóa ga giữa, cần tính toán lại Km cho các ga phía sau? 
    // Ở bản đơn giản này ta chỉ xóa, trong thực tế cần logic phức tạp hơn để re-calculate.
    // Để đơn giản cho UI Demo: Ta chỉ filter bỏ đi.
    const updatedRoutes = routes.map(r => {
      if (r.id === selectedRouteId) {
        return { ...r, stations: r.stations.filter(s => s.id !== stationId) };
      }
      return r;
    });
    setRoutes(updatedRoutes);
  };

  // --- 3. RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyến & ga</h1>
          <p className="text-gray-500 text-sm mt-1">Thêm, sửa tuyến tàu và danh sách ga</p>
        </div>
        <button 
          onClick={() => setIsAddRouteModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Thêm tuyến
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR: ROUTE LIST */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Danh sách tuyến</h3>
            <div className="space-y-2">
              {routes.map(route => (
                <div 
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                    selectedRouteId === route.id 
                      ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500' 
                      : 'bg-white border-gray-200 hover:border-sky-300'
                  }`}
                >
                  <div>
                    <h4 className={`font-bold ${selectedRouteId === route.id ? 'text-sky-700' : 'text-gray-800'}`}>
                      {route.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {route.code} • {route.stations.length} ga • {route.stations[route.stations.length-1]?.km || 0} km
                    </p>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400 hover:text-sky-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT: STATION DETAILS */}
        <div className="w-full lg:w-2/3">
          {selectedRoute ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedRoute.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Tổng chiều dài: <span className="font-bold text-sky-600">{totalLength} km</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddStationModalOpen(true)}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm ga
                </button>
              </div>

              {/* Station List */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                {selectedRoute.stations.length === 0 && (
                  <div className="text-center text-gray-400 py-10">Chưa có ga nào trong tuyến này.</div>
                )}

                {selectedRoute.stations.map((station, index) => {
                  const isFirst = index === 0;
                  const isLast = index === selectedRoute.stations.length - 1;
                  const prevStation = index > 0 ? selectedRoute.stations[index - 1] : null;
                  const distFromPrev = prevStation ? station.km - prevStation.km : 0;

                  // Màu sắc icon dựa trên vị trí (Giống hình mẫu)
                  let iconColorClass = "bg-sky-500 text-white"; // Mặc định xanh dương (Giữa)
                  if (isFirst) iconColorClass = "bg-green-500 text-white"; // Đầu: Xanh lá
                  if (isLast) iconColorClass = "bg-red-500 text-white";   // Cuối: Đỏ

                  return (
                    <div key={station.id} className="relative group">
                      {/* Vertical Line Connector */}
                      {!isLast && (
                        <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
                      )}

                      <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all bg-white z-10 relative">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${iconColorClass}`}>
                          <MapPin className="w-5 h-5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-lg">{station.name}</h4>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded uppercase tracking-wider">
                              {station.code}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
                            {!isFirst && (
                              <span className="text-sky-600 font-medium">+{distFromPrev} km từ ga trước</span>
                            )}
                            <span className="text-gray-400">•</span>
                            <span>Km {station.km}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button 
                          onClick={() => handleDeleteStation(station.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: Summary Distance */}
              {selectedRoute.stations.length > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Khoảng cách giữa các ga</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoute.stations.map((station, index) => {
                      if (index === 0) return null;
                      const prev = selectedRoute.stations[index - 1];
                      const dist = station.km - prev.km;
                      return (
                        <div key={`dist-${index}`} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
                          <span className="font-bold">{prev.code}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="font-bold">{station.code}</span>
                          <span className="text-sky-600 font-bold ml-1">{dist} km</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 bg-white rounded-xl border border-gray-200">
              Chọn một tuyến để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: THÊM TUYẾN --- */}
      {isAddRouteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Thêm tuyến mới</h3>
              <button onClick={() => setIsAddRouteModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tuyến</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="VD: Hà Nội - Hải Phòng"
                  value={newRouteData.name}
                  onChange={e => setNewRouteData({...newRouteData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã tuyến</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="VD: HN-HP"
                  value={newRouteData.code}
                  onChange={e => setNewRouteData({...newRouteData, code: e.target.value})}
                />
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setIsAddRouteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg">Hủy</button>
              <button onClick={handleAddRoute} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium">Lưu tuyến</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: THÊM GA --- */}
      {isAddStationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Thêm ga vào tuyến</h3>
              <button onClick={() => setIsAddStationModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn ga</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  value={newStationData.stationCode}
                  onChange={e => setNewStationData({...newStationData, stationCode: e.target.value})}
                >
                  <option value="">-- Chọn ga --</option>
                  {masterStations.map(s => (
                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedRoute?.stations.length === 0 ? "Khoảng cách từ điểm xuất phát (km)" : "Khoảng cách từ ga trước (km)"}
                </label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="Nhập số km..."
                  value={newStationData.distanceFromPrev}
                  onChange={e => setNewStationData({...newStationData, distanceFromPrev: e.target.value})}
                />
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setIsAddStationModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg">Hủy</button>
              <button onClick={handleAddStation} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium">Thêm ga</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RouteStationManagement;