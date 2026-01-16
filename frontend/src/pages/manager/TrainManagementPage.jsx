import React, { useState, useEffect } from 'react';
import { Plus, TrainFront, Edit, Users, Wifi, Wind, ChevronDown, ChevronUp, Calendar, Loader, Search, Filter } from 'lucide-react';
// import { MOCK_TRAINS } from '../../services/db_mock'; // REMOVED
import AddTrainModal from '../../components/trains/AddTrainModal';
import AddCoachModal from '../../components/trains/AddCoachModal';
import '../../styles/pages/TrainManagementPage.css';

// Import the new services
import {
  getAllTrainsService,
  createTrainService,
  updateTrainService,
  getTrainCarriagesService,
  createCarriageService,
  updateCarriageService
} from '../../services/trainAPI';

const TrainManagementPage = () => {
  const [trainsList, setTrainsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State quản lý Modal Tàu
  const [trainModal, setTrainModal] = useState({ isOpen: false, isEdit: false, data: null });

  // State quản lý Modal Toa
  const [addCoachModalState, setAddCoachModalState] = useState({
    isOpen: false,
    trainId: null,
    isEdit: false,
    data: null
  });

  // State quản lý việc mở rộng/thu gọn danh sách toa (Accordion)
  const [expandedTrainId, setExpandedTrainId] = useState(null);

const filteredTrains = trainsList.filter(train => {
    // Condition A: Text Search (Name or ID)
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (train.trainName?.toLowerCase() || '').includes(term) ||
      (train.id?.toLowerCase() || '').includes(term);

    // Condition B: Status Filter
    const matchesStatus = filterStatus === 'all' || train.status === filterStatus;

    // Both must be true
    return matchesSearch && matchesStatus;
  });

  // --- INITIAL DATA FETCH ---
  // fetching with 'isBackground' prevents the scroll-to-top issue
  const fetchTrains = async (isBackground = false) => {
    try {
      // Only show the big spinner if it's a fresh load (not an update)
      if (!isBackground) {
        setLoading(true);
      }

      const response = await getAllTrainsService();
      // Handle different API response structures safely
      const rawList = response.data?.data || response.data || [];

      // 1. Format the new data from server
      const newTrainData = rawList.map(t => ({
        id: t.MaDoanTau,
        trainName: t.TenTau,
        company: t.HangSanXuat || "Đường sắt VN",
        operationDate: t.NgayVanHanh,
        status: t.TrangThai === 'Hoạt động' ? 'active' : 'maintenance',
        type: t.LoaiTau === 'Hạng sang' ? 'VIP' : 'Normal',
        totalCoaches: t.SoLuongToa || 0,
        coaches: [] // Initially empty from server
      }));

      // 2. THE SAFER FIX: Merge with existing state
      // We use a callback to ensure we are looking at the absolute latest state
      setTrainsList(prevList => {
        // If we have no previous data, just return the new data
        if (!prevList || prevList.length === 0) return newTrainData;

        // Otherwise, map through new data and try to find matching old data
        return newTrainData.map(newTrain => {
          const oldTrain = prevList.find(old => old.id === newTrain.id);

          if (oldTrain) {
            // Found a match! Keep the server updates, but PRESERVE the local coaches
            return {
              ...newTrain,
              coaches: oldTrain.coaches, // Keep existing coaches
              // If the server says coach count changed, we might want to trust the server, 
              // but for now, this prevents the "Loading..." UI glitch.
            };
          }
          // No match (new train), return as is
          return newTrain;
        });
      });

    } catch (err) {
      console.error("Error fetching trains:", err);
      setError("Không thể tải danh sách tàu.");
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  // --- LOGIC TÀU ---

  // Updated: Lazy load carriages when expanding
  const toggleExpand = async (id) => {
    const isExpanding = expandedTrainId !== id;
    setExpandedTrainId(isExpanding ? id : null);


    if (isExpanding) {
      const trainIndex = trainsList.findIndex(t => t.id === id);

      // Only fetch if coaches array is empty
      if (trainIndex !== -1 && trainsList[trainIndex].coaches.length === 0) {
        try {
          const res = await getTrainCarriagesService(id);

          // Handle response structure { success: true, data: [...] }
          const rawCarriages = res.data?.data || res.data || [];

          // --- MAPPING LOGIC STARTS HERE ---
          const formattedCarriages = rawCarriages.map(c => ({
            id: c.MaToaTau,            // Unique ID
            carriageNumber: c.STT,     // Maps to "Toa 1"
            type: c.LoaiToa,           // Maps to "Ghế" or "Giường"
            capacity: c.SLViTri,       // Maps to "40 chỗ"

            // Optional: Create a longer description based on type if needed
            description: c.LoaiToa === 'Giường' ? 'Giường nằm' : 'Ghế ngồi mềm'
          }));
          // ---------------------------------

          setTrainsList(prev => {
            const newList = [...prev];
            newList[trainIndex] = { ...newList[trainIndex], coaches: formattedCarriages };
            return newList;
          });
        } catch (err) {
          console.error("Failed to load carriages:", err);
        }
      }
    }
  };

  const handleOpenAddTrain = () => {
    setTrainModal({ isOpen: true, isEdit: false, data: null });
  };

  const handleOpenEditTrain = (e, train) => {
    e.stopPropagation();
    setTrainModal({ isOpen: true, isEdit: true, data: train });
  };

  const handleSaveTrain = async (trainData) => {
    try {
      if (trainModal.isEdit) {
        // Update logic
        await updateTrainService(trainData.id, trainData);
      } else {
        // Create logic
        await createTrainService(trainData);
      }

      // ✅ Call fetch with true. 
      // Because of the new logic in Step 1, this will update the Train Name/Status
      // WITHOUT wiping out your open coaches list.
      await fetchTrains(true);

      setTrainModal({ ...trainModal, isOpen: false });

    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // --- LOGIC TOA ---
  const openAddCoachModal = (trainId) => {
    setAddCoachModalState({ isOpen: true, trainId: trainId });
  };

  // 1. Function to Open Modal in Edit Mode
  const handleEditCoach = (trainId, coach) => {
    setAddCoachModalState({
      isOpen: true,
      trainId: trainId,
      isEdit: true,
      data: coach
    });
  };

  // 2. Updated Save Handler
  const handleSaveCoach = async (trainId, coachData) => {
    try {
      if (addCoachModalState.isEdit) {
        // --- UPDATE EXISTING CARRIAGE ---
        const payload = {
          loaiToa: coachData.loaiToa,
          slViTri: coachData.soGhe
        };

        // Call API with Carriage ID
        await updateCarriageService(coachData.id, payload);
      } else {
        // --- CREATE NEW CARRIAGE ---
        const payload = {
          maDoanTau: trainId,
          loaiToa: coachData.loaiToa,
          slViTri: coachData.soGhe
        };
        await createCarriageService(payload);
      }

      // --- REFRESH DATA (Common for both) ---
      // Clear coaches to force visual refresh
      setTrainsList(prev => prev.map(t => t.id === trainId ? { ...t, coaches: [] } : t));

      // Fetch fresh data
      const res = await getTrainCarriagesService(trainId);
      const rawCarriages = res.data?.data || res.data || [];

      const formattedCarriages = rawCarriages.map(c => ({
        id: c.MaToaTau || c._id,
        carriageNumber: c.STT,
        type: c.LoaiToa,
        capacity: c.SLViTri,
        description: c.LoaiToa === 'Giường' ? 'Giường nằm' : 'Ghế ngồi'
      }));

      setTrainsList(prev => prev.map(t => {
        if (t.id === trainId) {
          return {
            ...t,
            coaches: formattedCarriages,
            totalCoaches: formattedCarriages.length
          };
        }
        return t;
      }));

      // Close Modal
      setAddCoachModalState({ isOpen: false, trainId: null, isEdit: false, data: null });

    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const renderAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'Điều hòa': return <Wind size={14} className="mr-1 inline" />;
      case 'WiFi': return <Wifi size={14} className="mr-1 inline" />;
      default: return null;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" /></div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="train-mgmt-container">
      {/* Header */}
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title">Quản lý đoàn tàu</h1>
          <p className="page-subtitle">Thêm, sửa, xóa đoàn tàu và toa tàu</p>
        </div>

{/* Right Side: Search + Filter + Add Button */}
  <div className="flex items-center gap-3">
    
    {/* Search Bar */}
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition" size={18} />
      <input 
        type="text"
        placeholder="Tìm kiếm..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm"
      />
    </div>

    {/* NEW: Status Filter Dropdown */}
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="pl-9 pr-8 py-2 border border-gray-200 rounded-full text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-sm cursor-pointer hover:bg-gray-50"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="maintenance">Bảo trì</option>
      </select>
      {/* Custom arrow for appearance-none */}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
    </div>

    {/* Add Button */}
    <button onClick={handleOpenAddTrain} className="btn-primary-add flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
      <Plus size={20} /> Thêm đoàn tàu
    </button>
  </div>
      </div>

      {/* Danh sách tàu */}
      <div className="train-list-container">
        {filteredTrains.length === 0 ? (
     <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-100">
        <p>Không tìm thấy kết quả nào phù hợp.</p>
     </div>
  ) : (filteredTrains.map(train => (
          <div key={train.id} className={`train-card ${expandedTrainId === train.id ? 'expanded' : ''}`}>

            {/* Header Tàu (Click để mở rộng) */}
            <div className="train-card-header cursor-pointer hover:bg-gray-50 transition" onClick={() => toggleExpand(train.id)}>
              <div className="train-info-group flex-1">
                <div className={`train-icon-box ${train.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <TrainFront size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="train-name text-lg font-bold">{train.id}</h2>
                    <span className={`status-badge ${train.status === 'active' ? 'active' : 'maintenance'}`}>
                      {train.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{train.trainName}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Hãng: {train.company}</span>
                    <span>• {train.totalCoaches ?? train.coaches.length} toa</span>
                    {train.operationDate && <span className="flex items-center gap-1">• <Calendar size={12} /> {new Date(train.operationDate).toLocaleDateString('vi-VN')}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="action-btn-group">
                  <button className="btn-icon-action edit" onClick={(e) => handleOpenEditTrain(e, train)}><Edit size={18} /></button>
                </div>
                {expandedTrainId === train.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </div>

            {/* Danh sách Toa (Chỉ hiện khi Expanded) */}
            {expandedTrainId === train.id && (
              <div className="coach-area border-t border-gray-100 animate-slideDown">
                <div className="coach-area-header flex justify-between items-center mb-4 px-4 pt-4">
                  <h3 className="text-sm font-bold text-gray-600">Danh sách toa</h3>
                  <button onClick={() => openAddCoachModal(train.id)} className="btn-add-coach flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded border border-blue-200 bg-white font-semibold">
                    <Plus size={16} /> Thêm toa
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-4">
                  {(!train.coaches || train.coaches.length === 0) ? (
                    <p className="text-sm text-gray-400 italic col-span-full text-center py-4">
                      {train.totalCoaches > 0 ? "Đang tải dữ liệu..." : "Chưa có toa nào."}
                    </p>
                  ) : (
                    train.coaches.map(coach => (
                      <div
                        key={coach.id}
                        // 1. ADDED 'relative' (keeps button inside) and 'group' (for hover effect)
                        className="coach-card-item bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col h-32 justify-between relative group"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents clicking the card background
                            handleEditCoach(train.id, coach);
                          }}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
                          title="Chỉnh sửa toa"
                        >
                          <Edit size={14} />
                        </button>

                        {/* TOP ROW: Toa Name + Badge */}
                        {/* 2. ADDED 'pr-6' to prevent text overlap with button */}
                        <div className="flex justify-between items-start pr-6">
                          <div>
                            <h4 className="font-bold text-gray-800 text-base">Toa {coach.carriageNumber}</h4>
                            <p className="text-xs text-gray-500 mt-1">{coach.description || coach.type}</p>
                          </div>

                          <span className={`text-xs px-2 py-1 rounded border ${coach.type === 'Giường'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {coach.type}
                          </span>
                        </div>

                        {/* BOTTOM ROW: Capacity */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-dashed border-gray-100 mt-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="font-medium">{coach.capacity} chỗ</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )))}
      </div>

      <AddTrainModal
        isOpen={trainModal.isOpen}
        isEdit={trainModal.isEdit}
        initialData={trainModal.data}
        onClose={() => setTrainModal({ ...trainModal, isOpen: false })}
        onSave={handleSaveTrain}
      />

      <AddCoachModal
        isOpen={addCoachModalState.isOpen}
        targetTrainId={addCoachModalState.trainId}
        isEdit={addCoachModalState.isEdit}
        initialData={addCoachModalState.data}
        currentCoachesCount={trainsList.find(t => t.id === addCoachModalState.trainId)?.coaches?.length || 0}
        onClose={() => setAddCoachModalState({ isOpen: false, trainId: null, isEdit: false, data: null })}
        onSave={handleSaveCoach}
      />
    </div>
  );
};

export default TrainManagementPage;