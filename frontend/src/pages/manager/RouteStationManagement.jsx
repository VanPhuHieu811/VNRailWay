// import React, { useState } from 'react';
// import { 
//   MapPin, ArrowRight
// } from 'lucide-react';

// const RouteStationManagement = () => {
//   // --- 1. STATE & DATA ---
  
//   const [routes, setRoutes] = useState([
//     {
//       id: "R01",
//       name: "Hà Nội - Sài Gòn",
//       code: "HN-SG",
//       stations: [
//         { id: 1, code: "HN", name: "Hà Nội", km: 0 },
//         { id: 2, code: "NB", name: "Ninh Bình", km: 90 },
//         { id: 3, code: "TH", name: "Thanh Hóa", km: 176 },
//         { id: 4, code: "V",  name: "Vinh", km: 341 },
//         { id: 5, code: "DH", name: "Đồng Hới", km: 521 },
//         { id: 6, code: "HUE",name: "Huế", km: 687 },
//         { id: 7, code: "DN", name: "Đà Nẵng", km: 790 },
//         { id: 8, code: "NT", name: "Nha Trang", km: 1320 },
//         { id: 9, code: "SG", name: "Sài Gòn", km: 1726 },
//       ]
//     },
//     {
//       id: "R02",
//       name: "Hà Nội - Đà Nẵng",
//       code: "HN-DN",
//       stations: [
//         { id: 1, code: "HN", name: "Hà Nội", km: 0 },
//         { id: 2, code: "ND", name: "Nam Định", km: 87 },
//         { id: 3, code: "TH", name: "Thanh Hóa", km: 176 },
//         { id: 4, code: "V",  name: "Vinh", km: 341 },
//         { id: 5, code: "DN", name: "Đà Nẵng", km: 790 },
//       ]
//     }
//   ]);

//   const [selectedRouteId, setSelectedRouteId] = useState("R01");

//   // --- 2. LOGIC & HELPERS ---

//   const selectedRoute = routes.find(r => r.id === selectedRouteId);
//   const totalLength = selectedRoute?.stations[selectedRoute.stations.length - 1]?.km || 0;

//   // --- 3. RENDER ---
//   return (
//     <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
//       {/* HEADER */}
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyến & ga</h1>
//           <p className="text-gray-500 text-sm mt-1">Xem thông tin chi tiết các ga tàu trong tuyến</p>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
        
//         {/* LEFT SIDEBAR: ROUTE LIST */}
//         <div className="w-full lg:w-1/3 space-y-4">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
//             <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Chọn tuyến tàu</h3>
//             <div className="space-y-2">
//               {routes.map(route => (
//                 <div 
//                   key={route.id}
//                   onClick={() => setSelectedRouteId(route.id)}
//                   className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
//                     selectedRouteId === route.id 
//                       ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500' 
//                       : 'bg-white border-gray-200 hover:border-sky-300'
//                   }`}
//                 >
//                   <div>
//                     <h4 className={`font-bold ${selectedRouteId === route.id ? 'text-sky-700' : 'text-gray-800'}`}>
//                       {route.name}
//                     </h4>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {route.code} • {route.stations.length} ga • {route.stations[route.stations.length-1]?.km || 0} km
//                     </p>
//                   </div>
//                   {selectedRouteId === route.id && <div className="w-2 h-2 rounded-full bg-sky-500"></div>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* RIGHT CONTENT: STATION DETAILS */}
//         <div className="w-full lg:w-2/3">
//           {selectedRoute ? (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              
//               {/* Card Header */}
//               <div className="p-6 border-b border-gray-100">
//                 <h2 className="text-xl font-bold text-gray-800">{selectedRoute.name}</h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Tổng chiều dài tuyến: <span className="font-bold text-sky-600">{totalLength} km</span>
//                 </p>
//               </div>

//               {/* Station List */}
//               <div className="p-6 space-y-4 flex-1 overflow-y-auto">
//                 {selectedRoute.stations.length === 0 && (
//                   <div className="text-center text-gray-400 py-10">Chưa có ga nào trong tuyến này.</div>
//                 )}

//                 {selectedRoute.stations.map((station, index) => {
//                   const isFirst = index === 0;
//                   const isLast = index === selectedRoute.stations.length - 1;
//                   const prevStation = index > 0 ? selectedRoute.stations[index - 1] : null;
//                   const distFromPrev = prevStation ? station.km - prevStation.km : 0;

//                   // Màu sắc icon
//                   let iconColorClass = "bg-sky-500 text-white"; 
//                   if (isFirst) iconColorClass = "bg-green-500 text-white"; 
//                   if (isLast) iconColorClass = "bg-red-500 text-white";

//                   return (
//                     <div key={station.id} className="relative group">
//                       {/* Vertical Line Connector */}
//                       {!isLast && (
//                         <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
//                       )}

//                       <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-all bg-white z-10 relative">
                        
//                         {/* Icon */}
//                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${iconColorClass}`}>
//                           <MapPin className="w-5 h-5" />
//                         </div>

//                         {/* Info */}
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2">
//                             <h4 className="font-bold text-gray-800 text-lg">{station.name}</h4>
//                             <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded uppercase tracking-wider">
//                               {station.code}
//                             </span>
//                           </div>
//                           <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
//                             {!isFirst && (
//                               <span className="text-sky-600 font-medium">+{distFromPrev} km từ ga trước</span>
//                             )}
//                             <span className="text-gray-400">•</span>
//                             <span>Km {station.km}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Footer: Summary Distance */}
//               {selectedRoute.stations.length > 1 && (
//                 <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
//                   <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Tóm tắt lộ trình</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedRoute.stations.map((station, index) => {
//                       if (index === 0) return null;
//                       const prev = selectedRoute.stations[index - 1];
//                       const dist = station.km - prev.km;
//                       return (
//                         <div key={`dist-${index}`} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
//                           <span className="font-bold">{prev.code}</span>
//                           <ArrowRight className="w-3 h-3 text-gray-400" />
//                           <span className="font-bold">{station.code}</span>
//                           <span className="text-sky-600 font-bold ml-1">{dist} km</span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-400 bg-white rounded-xl border border-gray-200">
//               Chọn một tuyến để xem chi tiết
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RouteStationManagement;


import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

// Cấu hình đường dẫn API
const API_BASE_URL = 'http://localhost:3000/api/v1/routes';

const RouteStationManagement = () => {
  // --- 1. STATE & DATA ---
  const [routes, setRoutes] = useState([]); // Khởi tạo mảng rỗng
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // --- 2. API CALLS ---

  // A. Lấy danh sách tuyến khi mới vào trang
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Map dữ liệu từ SQL (Tiếng Việt/PascalCase) sang cấu trúc State (CamelCase)
          const mappedRoutes = result.data.map(r => ({
            id: r.id,          // MaTuyenTau
            name: r.name,      // TenTuyen
            code: r.code,      // MaTuyenTau (Code)
            totalStations: r.totalStations,
            totalLength: r.totalLength,
            stations: []       // Khởi tạo mảng ga rỗng, sẽ load sau
          }));

          setRoutes(mappedRoutes);
          
          // Mặc định chọn tuyến đầu tiên nếu có
          if (mappedRoutes.length > 0) {
            setSelectedRouteId(mappedRoutes[0].id);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách tuyến:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // B. Lấy chi tiết Ga khi chọn Tuyến (Lazy Load)
  useEffect(() => {
    if (!selectedRouteId) return;

    const fetchRouteDetails = async () => {
      try {
        // Kiểm tra xem tuyến này đã có dữ liệu ga chưa, nếu có rồi thì không gọi API nữa
        const currentRoute = routes.find(r => r.id === selectedRouteId);
        if (currentRoute && currentRoute.stations && currentRoute.stations.length > 0) {
          return; 
        }

        setLoadingDetails(true);
        const response = await fetch(`${API_BASE_URL}/${selectedRouteId}`);
        const result = await response.json();

        console.log(result);

        if (result.success && result.data) {
          // Map dữ liệu Chi tiết từ Backend trả về
          const stationsData = result.data.stations.map((s, index) => ({
            id: index + 1,        // Frontend cần ID duy nhất để làm key
            code: s.maGaTau,      // Backend trả về maGaTau
            name: s.tenGa,        // Backend trả về tenGa
            km: s.khoangCachTuGaDau // Backend trả về khoangCachTuGaDau
          }));

          // Cập nhật lại state routes với dữ liệu ga vừa lấy được
          setRoutes(prevRoutes => prevRoutes.map(r => {
            if (r.id === selectedRouteId) {
              return { ...r, stations: stationsData };
            }
            return r;
          }));
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết tuyến:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchRouteDetails();
  }, [selectedRouteId]); // Chạy lại mỗi khi selectedRouteId thay đổi

  // --- 3. LOGIC & HELPERS ---
  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const totalLength = selectedRoute?.totalLength || selectedRoute?.stations[selectedRoute?.stations?.length - 1]?.km || 0;

  // --- 4. RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-sky-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyến & ga</h1>
          <p className="text-gray-500 text-sm mt-1">Xem thông tin chi tiết các ga tàu trong tuyến</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR: ROUTE LIST */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Chọn tuyến tàu</h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
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
                      {route.code} • {route.totalStations || 0} ga • {route.totalLength || 0} km
                    </p>
                  </div>
                  {selectedRouteId === route.id && <div className="w-2 h-2 rounded-full bg-sky-500"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT: STATION DETAILS */}
        <div className="w-full lg:w-2/3">
          {selectedRoute ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[500px]">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">{selectedRoute.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tổng chiều dài tuyến: <span className="font-bold text-sky-600">{totalLength} km</span>
                </p>
              </div>

              {/* Station List */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
                {loadingDetails ? (
                   <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-sky-500" />
                      <p>Đang tải danh sách ga...</p>
                   </div>
                ) : selectedRoute.stations.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">Chưa có ga nào trong tuyến này.</div>
                ) : (
                  selectedRoute.stations.map((station, index) => {
                    const isFirst = index === 0;
                    const isLast = index === selectedRoute.stations.length - 1;
                    const prevStation = index > 0 ? selectedRoute.stations[index - 1] : null;
                    const distFromPrev = prevStation ? (station.km - prevStation.km).toFixed(1) : 0;

                    // Màu sắc icon
                    let iconColorClass = "bg-sky-500 text-white"; 
                    if (isFirst) iconColorClass = "bg-green-500 text-white"; 
                    if (isLast) iconColorClass = "bg-red-500 text-white";

                    return (
                      <div key={station.id || index} className="relative group">
                        {/* Vertical Line Connector */}
                        {!isLast && (
                          <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
                        )}

                        <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-all bg-white z-10 relative">
                          
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
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer: Summary Distance (Chỉ hiện khi đã tải xong và có > 1 ga) */}
              {!loadingDetails && selectedRoute.stations.length > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Tóm tắt lộ trình</h4>
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
                          <span className="text-sky-600 font-bold ml-1">{Number(dist).toFixed(0)} km</span>
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
    </div>
  );
};

export default RouteStationManagement;