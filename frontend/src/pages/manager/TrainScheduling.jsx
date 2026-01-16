import React, { useState, useEffect } from 'react';
import { 
  Train, Calendar, Clock, MapPin, Users, 
  Plus, Check, X, ArrowRight, User, 
  Filter, Briefcase, Save, AlertCircle 
} from 'lucide-react';
import { scheduleApi } from '../../services/scheduleApi';

// Icon nhỏ dùng cho trạng thái
const CheckCircle2 = ({className}) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

const TrainScheduling = () => {
  // --- 1. STATE DỮ LIỆU TỪ API (MASTER DATA) ---
  const [routesList, setRoutesList] = useState([]); // Danh sách Tuyến
  const [trainFleet, setTrainFleet] = useState([]); // Danh sách Tàu
  // [QUAN TRỌNG] Danh sách Ga sẽ thay đổi tùy theo Tuyến được chọn
  const [stations, setStations] = useState([]);     
  
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải danh mục chung
  const [isLoadingStations, setIsLoadingStations] = useState(false); // Trạng thái tải ga

  // --- 2. STATE UI & MODAL ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // State quản lý Tab & Filter
  const [activeMainTab, setActiveMainTab] = useState('schedule'); // 'schedule' | 'unassigned'
  const [filterStatus, setFilterStatus] = useState('all'); 
  
  // State quản lý Selection
  const [selectedTrip, setSelectedTrip] = useState(null); // Dùng cho Modal Chi tiết
  const [selectedAssignTrip, setSelectedAssignTrip] = useState(null); // Dùng cho Modal Phân công

  // --- 3. DỮ LIỆU MẪU NHÂN SỰ (HARDCODE VÌ CHƯA CÓ API) ---
  const drivers = [
    { id: 'D1', name: 'Nguyễn Văn An', status: 'available' },
    { id: 'D2', name: 'Trần Văn Bình', status: 'available' },
    { id: 'D3', name: 'Lê Văn Cường', status: 'leave' },
    { id: 'D4', name: 'Phạm Văn Dũng', status: 'busy' },
  ];
  const managers = [
    { id: 'M1', name: 'Nguyễn Thị Hương', status: 'available' },
    { id: 'M2', name: 'Trần Thị Lan', status: 'available' },
    { id: 'M3', name: 'Lê Thị Mai', status: 'busy' },
    { id: 'M4', name: 'Ngô Thị Thảo', status: 'available' },
  ];
  const staffList = [
    { id: 'S1', name: 'Nguyễn Văn Hải', status: 'available' },
    { id: 'S2', name: 'Trần Văn Hùng', status: 'available' },
    { id: 'S3', name: 'Lê Văn Khoa', status: 'available' },
    { id: 'S4', name: 'Vũ Văn Nam', status: 'available' },
    { id: 'S5', name: 'Phạm Văn Long', status: 'leave' },
    { id: 'S6', name: 'Hoàng Văn Minh', status: 'busy' },
    { id: 'S7', name: 'Đỗ Văn Tú', status: 'available' },
    { id: 'S8', name: 'Bùi Thị Dung', status: 'available' },
  ];

  // --- 4. STATE DỮ LIỆU CHUYẾN TÀU (TRIPS) ---
  const [trips, setTrips] = useState([
    {
      id: "TRIP01",
      route: "Hà Nội - Sài Gòn",
      departureStation: "Hà Nội",
      arrivalStation: "Sài Gòn",
      trainCode: "SE7 (Thống Nhất)",
      date: "2026-05-20",
      time: "06:00",
      driver: "Phạm Văn Dũng",
      manager: "Lê Thị Mai",
      carriages: { 1: "Nguyễn Văn Hải", 2: "Trần Văn Hùng" },
      status: "running",
      timeline: []
    }
  ]);

  // State Form Tạo mới
  const [formData, setFormData] = useState({
    route: '', trainCode: '', departureStation: '', arrivalStation: '', 
    date: '', time: ''
  });

  // State Form Phân công (Tạm thời)
  const [assignmentState, setAssignmentState] = useState({
    driverId: '',
    managerId: '',
    carriageStaffs: {}
  });

  // --- 5. USE EFFECT: LOAD DỮ LIỆU ---

  // A. LOAD DANH MỤC CHUNG (Tuyến, Tàu) KHI MỞ TRANG
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoading(true);
        const [routesRes, trainsRes] = await Promise.all([
           scheduleApi.getRoutes(),
           scheduleApi.getTrains()
        ]);

        if(routesRes.success) setRoutesList(routesRes.data);
        if(trainsRes.success) setTrainFleet(trainsRes.data);

      } catch (error) {
        console.error("Lỗi tải dữ liệu danh mục:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // B. [QUAN TRỌNG] LOAD GA KHI CHỌN TUYẾN
  useEffect(() => {
    const fetchStationsByRoute = async () => {
        // Nếu chưa chọn tuyến hoặc chọn về rỗng -> Reset danh sách ga
        if (!formData.route) {
            setStations([]);
            return;
        }

        try {
            setIsLoadingStations(true);
            // Gọi API lấy ga theo mã tuyến
            const res = await scheduleApi.getStationsByRoute(formData.route);
            if (res.success) {
                setStations(res.data);
            }
        } catch (error) {
            console.error("Lỗi tải ga theo tuyến:", error);
        } finally {
            setIsLoadingStations(false);
        }
    };

    fetchStationsByRoute();
  }, [formData.route]); // Chạy lại mỗi khi formData.route thay đổi


  // --- 6. LOGIC XỬ LÝ (HANDLERS) ---

  // A. XỬ LÝ TẠO CHUYẾN TÀU (GỌI API CREATE)
  const handleCreateSubmit = async () => {
    // 1. Validate dữ liệu
    if (!formData.route || !formData.trainCode || !formData.departureStation || !formData.arrivalStation || !formData.date || !formData.time) { 
        alert("Vui lòng nhập đủ thông tin!"); 
        return; 
    }

    try {
        // 2. Chuẩn bị Payload gửi xuống Backend
        const dateTimeString = `${formData.date} ${formData.time}:00`;

        const payload = {
            maTuyenTau: formData.route,
            maDoanTau: formData.trainCode,
            ngayKhoiHanh: dateTimeString,
            gaXuatPhat: formData.departureStation,
            gaKetThuc: formData.arrivalStation
        };

        // 3. Gọi API
        const response = await scheduleApi.createSchedule(payload);

        if (response.success) {
            alert("✅ Thêm chuyến tàu thành công!");

            // 4. Cập nhật UI (Optimistic Update)
            const routeObj = routesList.find(r => r.MaTuyenTau === formData.route);
            const trainObj = trainFleet.find(t => t.MaDoanTau === formData.trainCode);
            const depStationObj = stations.find(s => s.MaGaTau === formData.departureStation);
            const arrStationObj = stations.find(s => s.MaGaTau === formData.arrivalStation);

            const newTrip = {
                id: response.data?.MaMoi || `NEW${Date.now()}`,
                route: routeObj ? routeObj.TenTuyen : formData.route,
                trainCode: trainObj ? trainObj.TenTau : formData.trainCode,
                departureStation: depStationObj ? depStationObj.TenGa : formData.departureStation,
                arrivalStation: arrStationObj ? arrStationObj.TenGa : formData.arrivalStation,
                date: formData.date,
                time: formData.time,
                status: "scheduled",
                driver: null, 
                manager: null, 
                carriages: {},
                timeline: []
            };

            setTrips([newTrip, ...trips]); 
            setIsCreateModalOpen(false);
            
            // Reset form
            setFormData({ route: '', trainCode: '', departureStation: '', arrivalStation: '', date: '', time: '' });
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert(`❌ Lỗi: ${error.message || "Không thể thêm chuyến tàu. Kiểm tra lại dữ liệu!"}`);
    }
  };

  // B. XỬ LÝ MODAL CHI TIẾT
  const handleOpenDetail = (trip) => {
    setSelectedTrip(JSON.parse(JSON.stringify(trip))); 
    setIsDetailModalOpen(true);
  };

  // C. XỬ LÝ MODAL PHÂN CÔNG
  const handleOpenAssignModal = (trip) => {
    setSelectedAssignTrip(trip);
    setAssignmentState({
      driverId: '',
      managerId: '',
      carriageStaffs: { ...trip.carriages }
    });
    setIsAssignModalOpen(true);
  };

  const confirmAssignment = (type, index = null) => {
    if (!selectedAssignTrip) return;
    let updatedTrip = { ...selectedAssignTrip };
    
    if (type === 'driver') {
      const person = drivers.find(d => d.id === assignmentState.driverId);
      if (person) updatedTrip.driver = person.name;
    } else if (type === 'manager') {
      const person = managers.find(m => m.id === assignmentState.managerId);
      if (person) updatedTrip.manager = person.name;
    } else if (type === 'carriage') {
      const staffId = assignmentState.carriageStaffs[index];
      const person = staffList.find(s => s.id === staffId);
      if (person) updatedTrip.carriages = { ...updatedTrip.carriages, [index]: person.name };
    }

    setTrips(trips.map(t => t.id === selectedAssignTrip.id ? updatedTrip : t));
    setSelectedAssignTrip(updatedTrip);
  };

  // D. LOGIC FILTER DANH SÁCH
  const scheduleTrips = trips.filter(trip => filterStatus === 'all' ? true : trip.status === filterStatus);
  const unassignedTrips = trips.filter(trip => trip.status === 'scheduled' && (!trip.driver || !trip.manager));
  
  const getCarriageCount = (codeName) => {
    return 6; // Mock tạm thời
  };

  // --- 7. RENDER GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý điều hành</h1>
          <p className="text-gray-500 text-sm mt-1">Phân công và theo dõi các chuyến tàu</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Lập chuyến mới
        </button>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveMainTab('schedule')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeMainTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar className="w-4 h-4" /> Lịch trình chạy tàu
        </button>
        <button 
          onClick={() => setActiveMainTab('unassigned')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors relative ${activeMainTab === 'unassigned' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Briefcase className="w-4 h-4" /> Chuyến chưa phân công
          {unassignedTrips.length > 0 && <span className="ml-1 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{unassignedTrips.length}</span>}
        </button>
      </div>

      {/* --- TAB 1: DANH SÁCH LỊCH TRÌNH --- */}
      {activeMainTab === 'schedule' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-end mb-4">
            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              {[{ id: 'all', label: 'Tất cả' }, { id: 'running', label: 'Đang chạy' }, { id: 'scheduled', label: 'Sắp chạy' }, { id: 'completed', label: 'Hoàn thành' }].map(tab => (
                <button
                  key={tab.id} onClick={() => setFilterStatus(tab.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {scheduleTrips.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">Chưa có chuyến tàu nào phù hợp bộ lọc.</div>
            ) : (
                scheduleTrips.map((trip) => (
                <div 
                    key={trip.id} 
                    onClick={() => handleOpenDetail(trip)}
                    className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                    <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                    <div className={`p-3 rounded-lg shrink-0 ${trip.status === 'running' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Train className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{trip.route}</h3>
                        <div className="text-gray-500 text-sm flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-1 font-medium">{trip.departureStation} <ArrowRight className="w-3 h-3" /> {trip.arrivalStation}</span>
                        <span className="flex items-center gap-1">{trip.trainCode} • {trip.time} • {trip.date}</span>
                        </div>
                    </div>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                        <div>
                        <div className="text-xs text-gray-400 mb-1">Lái tàu</div>
                        <div className={`text-sm font-medium ${trip.driver ? 'text-gray-700' : 'text-orange-500 italic'}`}>{trip.driver || "Chưa có"}</div>
                        </div>
                        <div>
                        <div className="text-xs text-gray-400 mb-1">Trưởng tàu</div>
                        <div className={`text-sm font-medium ${trip.manager ? 'text-gray-700' : 'text-orange-500 italic'}`}>{trip.manager || "Chưa có"}</div>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: CHUYẾN CHƯA PHÂN CÔNG --- */}
      {activeMainTab === 'unassigned' && (
        <div className="animate-in fade-in duration-300">
           <div className="grid grid-cols-1 gap-4">
            {unassignedTrips.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                <Check className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Tất cả các chuyến đã được phân công đầy đủ nhân sự!</p>
              </div>
            ) : (
              unassignedTrips.map(trip => (
                <div 
                  key={trip.id}
                  onClick={() => handleOpenAssignModal(trip)} 
                  className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-bl-lg">Cần phân công</div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Users className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">{trip.route} <span className="text-sm font-normal text-gray-500">({trip.trainCode})</span></h3>
                      <p className="text-sm text-gray-500 mt-1 flex gap-4"><span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {trip.date}</span> <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {trip.time}</span></p>
                    </div>
                    <button className="hidden md:block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg">Phân công ngay</button>
                  </div>
                </div>
              ))
            )}
           </div>
        </div>
      )}

      {/* --- MODAL 1: TẠO CHUYẾN MỚI --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Lập lịch chuyến tàu mới</h2>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {isLoading && <div className="text-center text-blue-600 text-sm animate-pulse">Đang tải dữ liệu danh mục...</div>}
              
              <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <div>Thông tin nhân sự sẽ được phân công sau tại mục "Chuyến chưa phân công".</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 {/* SELECT TUYẾN (Thay đổi sẽ load lại Ga) */}
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến đường</label>
                    <select 
                        className="w-full border p-2.5 rounded-lg" 
                        onChange={(e) => {
                            setFormData({
                                ...formData, 
                                route: e.target.value,
                                departureStation: '', // Reset ga cũ khi đổi tuyến
                                arrivalStation: ''
                            });
                        }}
                        value={formData.route}
                        disabled={isLoading}
                    >
                       <option value="">-- Chọn tuyến --</option>
                       {routesList.map(r => (
                           <option key={r.MaTuyenTau} value={r.MaTuyenTau}>{r.TenTuyen}</option>
                       ))}
                    </select>
                 </div>

                 {/* SELECT TÀU */}
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đoàn tàu</label>
                    <select 
                        className="w-full border p-2.5 rounded-lg" 
                        onChange={(e) => setFormData({...formData, trainCode: e.target.value})}
                        value={formData.trainCode}
                        disabled={isLoading}
                    >
                       <option value="">-- Chọn tàu --</option>
                       {trainFleet.map(t => (
                           <option key={t.MaDoanTau} value={t.MaDoanTau}>{t.TenTau}</option>
                       ))}
                    </select>
                 </div>

                 {/* SELECT GA ĐI (Phụ thuộc Tuyến) */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ga đi {isLoadingStations && <span className="text-xs text-blue-500">(Đang tải...)</span>}
                    </label>
                    <select 
                        className="w-full border p-2.5 rounded-lg" 
                        onChange={(e) => setFormData({...formData, departureStation: e.target.value})}
                        value={formData.departureStation}
                        disabled={isLoading || !formData.route} // Khóa nếu chưa chọn tuyến
                    >
                       <option value="">{formData.route ? "Chọn ga đi" : "-- Chọn tuyến trước --"}</option>
                       {stations.map(s => (
                           <option key={s.MaGaTau} value={s.MaGaTau}>{s.TenGa}</option>
                       ))}
                    </select>
                 </div>

                 {/* SELECT GA ĐẾN (Phụ thuộc Tuyến) */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ga đến {isLoadingStations && <span className="text-xs text-blue-500">(Đang tải...)</span>}
                    </label>
                    <select 
                        className="w-full border p-2.5 rounded-lg" 
                        onChange={(e) => setFormData({...formData, arrivalStation: e.target.value})}
                        value={formData.arrivalStation}
                        disabled={isLoading || !formData.route} // Khóa nếu chưa chọn tuyến
                    >
                       <option value="">{formData.route ? "Chọn ga đến" : "-- Chọn tuyến trước --"}</option>
                       {stations.map(s => (
                           <option key={s.MaGaTau} value={s.MaGaTau}>{s.TenGa}</option>
                       ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đi</label>
                    <input 
                        type="date" 
                        className="w-full border p-2.5 rounded-lg" 
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        value={formData.date}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đi</label>
                    <input 
                        type="time" 
                        className="w-full border p-2.5 rounded-lg" 
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        value={formData.time}
                    />
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
               <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600">Hủy</button>
               <button onClick={handleCreateSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Tạo chuyến</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CHI TIẾT --- */}
      {isDetailModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{selectedTrip.route}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                        {selectedTrip.trainCode} • {selectedTrip.date} 
                        {selectedTrip.status === 'running' && <span className="text-green-600 font-bold bg-green-50 px-2 rounded-full">Đang chạy</span>}
                        </p>
                    </div>
                    <button onClick={() => setIsDetailModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <h3 className="font-bold text-gray-800 mb-6">Chi tiết hành trình thực tế</h3>
                    <div className="text-gray-500 text-sm">Tính năng đang cập nhật (Hiển thị dữ liệu từ bảng lịch trình)...</div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Đóng</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 3: PHÂN CÔNG --- */}
      {isAssignModalOpen && selectedAssignTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
               <div><h2 className="text-xl font-bold text-gray-800">Phân công nhân sự</h2><p className="text-sm text-gray-600">{selectedAssignTrip.route} - {selectedAssignTrip.trainCode}</p></div>
               <button onClick={() => setIsAssignModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
            </div>
            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
               {/* Mục 1: Lái tàu & Trưởng tàu */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><User className="w-5 h-5 text-blue-600" /> Vị trí chủ chốt</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between gap-4">
                        <div className="w-1/3"><label className="font-medium text-sm text-gray-700">Lái tàu</label>{selectedAssignTrip.driver && <div className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Đã chốt: {selectedAssignTrip.driver}</div>}</div>
                        <div className="flex-1 flex gap-2">
                           <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" value={assignmentState.driverId} onChange={(e) => setAssignmentState({...assignmentState, driverId: e.target.value})}>
                              <option value="">-- Chọn lái tàu --</option>{drivers.map(d => <option key={d.id} value={d.id} disabled={d.status !== 'available'}>{d.name} {d.status !== 'available' ? '(Bận)' : ''}</option>)}
                           </select>
                           <button onClick={() => confirmAssignment('driver')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg flex items-center justify-center"><Check className="w-5 h-5" /></button>
                        </div>
                     </div>
                     <div className="flex items-center justify-between gap-4">
                        <div className="w-1/3"><label className="font-medium text-sm text-gray-700">Trưởng tàu</label>{selectedAssignTrip.manager && <div className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Đã chốt: {selectedAssignTrip.manager}</div>}</div>
                        <div className="flex-1 flex gap-2">
                           <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" value={assignmentState.managerId} onChange={(e) => setAssignmentState({...assignmentState, managerId: e.target.value})}>
                              <option value="">-- Chọn trưởng tàu --</option>{managers.map(m => <option key={m.id} value={m.id} disabled={m.status !== 'available'}>{m.name} {m.status !== 'available' ? '(Bận)' : ''}</option>)}
                           </select>
                           <button onClick={() => confirmAssignment('manager')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg flex items-center justify-center"><Check className="w-5 h-5" /></button>
                        </div>
                     </div>
                  </div>
               </div>
               {/* Mục 2: Phụ trách từng toa */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><Users className="w-5 h-5 text-orange-600" /> Phụ trách toa xe</h3>
                  <div className="space-y-3">
                     {Array.from({ length: getCarriageCount(selectedAssignTrip.trainCode) }).map((_, idx) => {
                        const carriageNum = idx + 1;
                        const currentStaffName = selectedAssignTrip.carriages ? selectedAssignTrip.carriages[carriageNum] : null;
                        return (
                           <div key={carriageNum} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                              <div className="w-1/3 flex flex-col"><span className="font-medium text-sm text-gray-700">Toa số {carriageNum}</span>{currentStaffName ? <span className="text-xs text-green-600 font-bold">✓ {currentStaffName}</span> : <span className="text-xs text-gray-400">Chưa phân công</span>}</div>
                              <div className="flex-1 flex gap-2">
                                 <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" value={assignmentState.carriageStaffs[carriageNum] || ''} onChange={(e) => setAssignmentState({...assignmentState, carriageStaffs: { ...assignmentState.carriageStaffs, [carriageNum]: e.target.value }})}>
                                    <option value="">-- Chọn nhân viên --</option>{staffList.map(s => <option key={s.id} value={s.id} disabled={s.status !== 'available'}>{s.name}</option>)}
                                 </select>
                                 <button onClick={() => confirmAssignment('carriage', carriageNum)} className={`px-3 rounded-lg flex items-center justify-center ${currentStaffName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white'}`}><Check className="w-5 h-5" /></button>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end"><button onClick={() => setIsAssignModalOpen(false)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700">Đóng</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainScheduling;