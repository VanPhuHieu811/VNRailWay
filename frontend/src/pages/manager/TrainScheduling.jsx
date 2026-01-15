import React, { useState } from 'react';
import { 
  Train, Calendar, Clock, MapPin, Users, 
  Plus, Check, X, ArrowRight, User, 
  Filter, Briefcase, Save, AlertCircle, Circle
} from 'lucide-react';

// Icon nhỏ dùng cho trạng thái
const CheckCircle2 = ({className}) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

const TrainScheduling = () => {
  // --- 1. DỮ LIỆU MẪU & STATE ---
  
  // State quản lý Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Modal Timeline (Cũ)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); // Modal Phân công (Mới)

  // State quản lý Tab chính
  const [activeMainTab, setActiveMainTab] = useState('schedule'); // 'schedule' | 'unassigned'

  // State quản lý Filter và Selection
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [selectedTrip, setSelectedTrip] = useState(null); // Dùng cho Modal Timeline
  const [selectedAssignTrip, setSelectedAssignTrip] = useState(null); // Dùng cho Modal Phân công

  // Danh sách Ga
  const stations = ["Hà Nội", "Phủ Lý", "Nam Định", "Ninh Bình", "Thanh Hóa", "Vinh", "Huế", "Đà Nẵng", "Nha Trang", "Sài Gòn", "Hải Phòng"];

  // Danh sách Đoàn tàu
  const trainFleet = [
    { code: "SE1 (Thống Nhất)", carriages: 6 },
    { code: "SE7 (Thống Nhất)", carriages: 8 },
    { code: "LP1 (Lạng Sơn)", carriages: 4 },
  ];

  // Danh sách Nhân sự
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
    { id: 'S9', name: 'Phan Văn Kiên', status: 'available' },
    { id: 'S10', name: 'Lý Văn Phúc', status: 'available' },
    { id: 'S11', name: 'Nguyễn Thị Hoa', status: 'available' },
    { id: 'S12', name: 'Đặng Văn Lâm', status: 'available' },
  ];

  // Dữ liệu chuyến tàu (Kèm Timeline chi tiết)
  const [trips, setTrips] = useState([
    {
      id: "TRIP01",
      route: "Hà Nội - Sài Gòn",
      departureStation: "Hà Nội",
      arrivalStation: "Sài Gòn",
      trainCode: "SE7 (Thống Nhất)",
      date: "2024-05-20",
      time: "06:00 - 05:30 (+1)",
      driver: "Phạm Văn Dũng",
      manager: "Lê Thị Mai",
      carriages: { 1: "Nguyễn Văn Hải", 2: "Trần Văn Hùng" },
      status: "running",
      // Dữ liệu Timeline chi tiết
      timeline: [
        { station: "Hà Nội", type: 'departure', expTime: "06:00", actTime: "06:05", status: "passed" },
        { station: "Phủ Lý", type: 'stop', expArr: "07:15", actArr: "07:20", expDep: "07:20", actDep: "07:25", status: "passed" },
        { station: "Nam Định", type: 'stop', expArr: "08:00", actArr: "08:10", expDep: "08:15", actDep: "", status: "current" },
        { station: "Ninh Bình", type: 'stop', expArr: "09:00", actArr: "", expDep: "09:10", actDep: "", status: "waiting" },
        { station: "Thanh Hóa", type: 'stop', expArr: "10:30", actArr: "", expDep: "10:45", actDep: "", status: "waiting" },
      ]
    },
    {
      id: "TRIP04",
      route: "Sài Gòn - Nha Trang",
      departureStation: "Sài Gòn",
      arrivalStation: "Nha Trang",
      trainCode: "SE7 (Thống Nhất)",
      date: "2024-06-01",
      time: "20:30",
      driver: null, // Chưa phân công
      manager: null, // Chưa phân công
      carriages: {}, // Chưa phân công
      status: "scheduled",
      timeline: []
    }
  ]);

  // State Form Tạo mới (Rút gọn)
  const [formData, setFormData] = useState({
    route: '', trainCode: '', departureStation: '', arrivalStation: '', 
    date: '', time: ''
  });

  // State tạm thời cho Modal Phân công
  const [assignmentState, setAssignmentState] = useState({
    driverId: '',
    managerId: '',
    carriageStaffs: {}
  });

  // --- 2. LOGIC XỬ LÝ (HANDLERS) ---

  // A. LOGIC TIMELINE (KHÔI PHỤC LẠI)
  const handleOpenDetail = (trip) => {
    // Deep copy để edit không ảnh hưởng ngay list gốc khi đang nhập
    setSelectedTrip(JSON.parse(JSON.stringify(trip))); 
    setIsDetailModalOpen(true);
  };

  const handleTimelineUpdate = (index, field, value) => {
    if (!selectedTrip) return;
    const updatedTimeline = [...selectedTrip.timeline];
    updatedTimeline[index][field] = value;
    setSelectedTrip({ ...selectedTrip, timeline: updatedTimeline });
  };

  const handleSaveTimeline = () => {
    setTrips(trips.map(t => t.id === selectedTrip.id ? selectedTrip : t));
    setIsDetailModalOpen(false);
  };

  // B. LOGIC TẠO MỚI (ĐƠN GIẢN HÓA)
  const handleCreateSubmit = () => {
    if (!formData.route || !formData.trainCode) { alert("Vui lòng nhập đủ thông tin!"); return; }
    
    // Mock timeline đơn giản
    const mockTimeline = [
       { station: formData.departureStation, type: 'departure', expTime: formData.time, actTime: "", status: "waiting" },
       { station: formData.arrivalStation, type: 'arrival', expTime: "Unknown", actTime: "", status: "waiting" }
    ];

    const newTrip = {
      id: `TRIP${trips.length + 1}`.padStart(6, '0'),
      ...formData,
      driver: null, manager: null, carriages: {},
      status: "scheduled",
      timeline: mockTimeline
    };

    setTrips([newTrip, ...trips]);
    setIsCreateModalOpen(false);
    setFormData({ route: '', trainCode: '', departureStation: '', arrivalStation: '', date: '', time: '' });
  };

  // C. LOGIC PHÂN CÔNG (MỚI)
  const handleOpenAssignModal = (trip) => {
    setSelectedAssignTrip(trip);
    setAssignmentState({
      driverId: '', managerId: '', carriageStaffs: { ...trip.carriages }
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

  // D. LOGIC FILTER
  const scheduleTrips = trips.filter(trip => filterStatus === 'all' ? true : trip.status === filterStatus);
  const unassignedTrips = trips.filter(trip => trip.status === 'scheduled' && (!trip.driver || !trip.manager));
  const getCarriageCount = (code) => {
    const train = trainFleet.find(t => t.code === code);
    return train ? train.carriages : 0;
  };

  // --- 3. RENDER GIAO DIỆN ---
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

      {/* --- TAB 1: LỊCH TRÌNH (BẤM VÀO SẼ RA TIMELINE) --- */}
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
            {scheduleTrips.map((trip) => (
              <div 
                key={trip.id} 
                onClick={() => handleOpenDetail(trip)} // KHÔI PHỤC: Bấm vào mở Detail Modal
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
                      <span className="flex items-center gap-1">{trip.trainCode} • {trip.time}</span>
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
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: CHƯA PHÂN CÔNG (BẤM VÀO SẼ RA ASSIGNMENT) --- */}
      {activeMainTab === 'unassigned' && (
        <div className="animate-in fade-in duration-300">
           {/* ... (Logic hiển thị list unassigned giữ nguyên) ... */}
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
                  onClick={() => handleOpenAssignModal(trip)} // Bấm vào mở Assign Modal
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
              <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <div>Thông tin nhân sự sẽ được phân công sau tại mục "Chuyến chưa phân công".</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến đường</label>
                    <select className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({...formData, route: e.target.value})}>
                       <option value="">-- Chọn tuyến --</option>
                       <option value="Hà Nội - Sài Gòn">Hà Nội - Sài Gòn</option>
                       <option value="Đà Nẵng - Huế">Đà Nẵng - Huế</option>
                       <option value="Hà Nội - Hải Phòng">Hà Nội - Hải Phòng</option>
                    </select>
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đoàn tàu</label>
                    <select className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({...formData, trainCode: e.target.value})}>
                       <option value="">-- Chọn tàu --</option>
                       {trainFleet.map(t => <option key={t.code} value={t.code}>{t.code}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ga đi</label>
                    <select className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({...formData, departureStation: e.target.value})}>
                       <option value="">Chọn...</option>{stations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ga đến</label>
                    <select className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({...formData, arrivalStation: e.target.value})}>
                       <option value="">Chọn...</option>{stations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đi</label>
                    <input type="date" className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({...formData, date: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đi</label>
                    <input type="time" className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({...formData, time: e.target.value})} />
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

      {/* --- MODAL 2: CHI TIẾT TIMELINE (KHÔI PHỤC) --- */}
      {isDetailModalOpen && selectedTrip && (
         <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
               {/* Header */}
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
               
               {/* Body: Timeline List */}
               <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <h3 className="font-bold text-gray-800 mb-6">Chi tiết hành trình thực tế</h3>
                  <div className="relative pl-4 space-y-0">
                     {selectedTrip.timeline && selectedTrip.timeline.length > 0 ? (
                        selectedTrip.timeline.map((point, index) => {
                           const isPassed = point.status === 'passed';
                           const isCurrent = point.status === 'current';
                           const lineColor = isPassed ? 'border-blue-500' : 'border-gray-200';
                           const iconColor = isPassed ? 'bg-blue-500 text-white' : isCurrent ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400';
                           
                           return (
                              <div key={index} className={`relative pl-8 pb-8 ${index !== selectedTrip.timeline.length - 1 ? 'border-l-2 ' + lineColor : ''}`}>
                                 <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full flex items-center justify-center z-10 ${iconColor}`}>
                                    {isPassed ? <Check size={12} /> : isCurrent ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                 </div>
                                 <div className={`p-4 rounded-xl border ${isCurrent ? 'border-orange-200 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'} transition-all`}>
                                    <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold text-gray-800 text-lg">{point.station}</h4>
                                       {isPassed && <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-full">Đã qua</span>}
                                       {isCurrent && <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full animate-pulse">Đang ở đây</span>}
                                       {point.status === 'waiting' && <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Chờ</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                       {point.type !== 'departure' && (
                                          <div>
                                             <div className="text-gray-500 text-xs mb-1">Giờ đến (Dự kiến / Thực tế)</div>
                                             <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-700">{point.expArr || point.expTime}</span>
                                                <span className="text-gray-400">→</span>
                                                <input type="time" className="border border-gray-300 rounded px-2 py-0.5 text-orange-600 font-bold focus:outline-none focus:border-orange-500 bg-white w-28"
                                                   value={point.actArr || point.actTime || ""}
                                                   onChange={(e) => point.type === 'arrival' ? handleTimelineUpdate(index, 'actTime', e.target.value) : handleTimelineUpdate(index, 'actArr', e.target.value)}
                                                />
                                             </div>
                                          </div>
                                       )}
                                       {point.type !== 'arrival' && (
                                          <div>
                                             <div className="text-gray-500 text-xs mb-1">Giờ đi (Dự kiến / Thực tế)</div>
                                             <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-700">{point.expDep || point.expTime}</span>
                                                <span className="text-gray-400">→</span>
                                                <input type="time" className="border border-gray-300 rounded px-2 py-0.5 text-orange-600 font-bold focus:outline-none focus:border-orange-500 bg-white w-28"
                                                   value={point.actDep || point.actTime || ""}
                                                   onChange={(e) => point.type === 'departure' ? handleTimelineUpdate(index, 'actTime', e.target.value) : handleTimelineUpdate(index, 'actDep', e.target.value)}
                                                />
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     ) : (
                        <div className="text-gray-500 text-center py-4">Chưa có thông tin lộ trình chi tiết.</div>
                     )}
                  </div>
               </div>
               
               {/* Footer */}
               <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                  <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white">Đóng</button>
                  <button onClick={handleSaveTimeline} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                     <Save className="w-4 h-4" /> Lưu cập nhật
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL 3: PHÂN CÔNG (NEW) --- */}
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