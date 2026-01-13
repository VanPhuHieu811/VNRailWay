import React, { useState } from 'react';
import { Plus, TrainFront, Edit, Trash2, Users, Wifi, Wind, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { MOCK_TRAINS } from '../../services/db_mock';
import AddTrainModal from '../../components/trains/AddTrainModal';
import AddCoachModal from '../../components/trains/AddCoachModal';
import '../../styles/pages/TrainManagementPage.css'; // Import CSS

const TrainManagementPage = () => {
  const [trainsList, setTrainsList] = useState(MOCK_TRAINS);
  
  // State quản lý Modal Tàu
  const [trainModal, setTrainModal] = useState({ isOpen: false, isEdit: false, data: null });
  
  // State quản lý Modal Toa
  const [addCoachModalState, setAddCoachModalState] = useState({ isOpen: false, trainId: null });

  // State quản lý việc mở rộng/thu gọn danh sách toa (Accordion)
  const [expandedTrainId, setExpandedTrainId] = useState(null);

  // --- LOGIC TÀU ---
  const toggleExpand = (id) => {
    setExpandedTrainId(expandedTrainId === id ? null : id);
  };

  const handleOpenAddTrain = () => {
    setTrainModal({ isOpen: true, isEdit: false, data: null });
  };

  const handleOpenEditTrain = (e, train) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (để không toggle accordion)
    setTrainModal({ isOpen: true, isEdit: true, data: train });
  };

  const handleDeleteTrain = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa đoàn tàu này?')) {
        setTrainsList(trainsList.filter(t => t.id !== id));
    }
  };

  const handleSaveTrain = (trainData) => {
    if (trainModal.isEdit) {
        // Update existing train
        setTrainsList(trainsList.map(t => t.id === trainData.id ? { ...t, ...trainData } : t));
    } else {
        // Create new train
        if (trainsList.some(t => t.id === trainData.id)) {
            alert("Mã đoàn tàu đã tồn tại!");
            return;
        }
        setTrainsList([trainData, ...trainsList]);
    }
    setTrainModal({ ...trainModal, isOpen: false });
  };

  // --- LOGIC TOA ---
  const openAddCoachModal = (trainId) => {
    setAddCoachModalState({ isOpen: true, trainId: trainId });
  };

  const handleSaveCoach = (trainId, newCoachData) => {
    const updatedList = trainsList.map(train => {
      if (train.id === trainId) {
        return { ...train, coaches: [...train.coaches, newCoachData] };
      }
      return train;
    });
    setTrainsList(updatedList);
    setAddCoachModalState({ isOpen: false, trainId: null });
  };

  const handleDeleteCoach = (trainId, coachId) => {
    if(!window.confirm("Xóa toa này?")) return;
    const updatedList = trainsList.map(train => {
        if (train.id === trainId) {
            return { ...train, coaches: train.coaches.filter(c => c.id !== coachId) };
        }
        return train;
    });
    setTrainsList(updatedList);
  };

  const renderAmenityIcon = (amenity) => {
    switch(amenity) {
        case 'Điều hòa': return <Wind size={14} className="mr-1 inline"/>;
        case 'WiFi': return <Wifi size={14} className="mr-1 inline"/>;
        default: return null;
    }
  };

  return (
    <div className="train-mgmt-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý đoàn tàu</h1>
          <p className="page-subtitle">Thêm, sửa, xóa đoàn tàu và toa tàu</p>
        </div>
        <button onClick={handleOpenAddTrain} className="btn-primary-add">
          <Plus size={20} /> Thêm đoàn tàu
        </button>
      </div>

      {/* Danh sách tàu */}
      <div className="train-list-container">
        {trainsList.map(train => (
          <div key={train.id} className={`train-card ${expandedTrainId === train.id ? 'expanded' : ''}`}>
            
            {/* Header Tàu (Click để mở rộng) */}
            <div className="train-card-header cursor-pointer hover:bg-gray-50 transition" onClick={() => toggleExpand(train.id)}>
              <div className="train-info-group flex-1">
                <div className={`train-icon-box ${train.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <TrainFront size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="train-name text-lg font-bold">{train.id}</h2> {/* Mã tàu làm tiêu đề chính như hình mẫu */}
                    <span className={`status-badge ${train.status === 'active' ? 'active' : 'maintenance'}`}>
                        {train.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                    </span>
                    {train.type === 'VIP' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold border border-yellow-200">VIP</span>}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{train.name}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Hãng: {train.company}</span>
                    <span>• {train.coaches.length} toa</span>
                    {train.operationDate && <span className="flex items-center gap-1">• <Calendar size={12}/> {new Date(train.operationDate).toLocaleDateString('vi-VN')}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="action-btn-group">
                    <button className="btn-icon-action edit" onClick={(e) => handleOpenEditTrain(e, train)}><Edit size={18}/></button>
                    <button className="btn-icon-action delete" onClick={(e) => handleDeleteTrain(e, train.id)}><Trash2 size={18}/></button>
                </div>
                {expandedTrainId === train.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
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
                    {train.coaches.length === 0 ? (<p className="text-sm text-gray-400 italic col-span-full text-center py-4">Chưa có toa nào. Hãy thêm toa mới.</p>) : (
                    train.coaches.map(coach => (
                        <div key={coach.id} className="coach-card-item bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800 text-sm">Toa {coach.seatNum}</h4>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{coach.type?.split(' ')[0] || 'Toa'}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    <span className="block mb-1">{coach.type}</span>
                                    <span className="flex items-center gap-1"><Users size={12}/> {coach.capacity} chỗ</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-gray-100">
                                <div className="flex gap-1 flex-wrap">
                                    {coach.amenities.slice(0, 2).map(am => (
                                        <span key={am} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                            {am}
                                        </span>
                                    ))}
                                    {coach.amenities.length > 2 && <span className="text-[10px] text-gray-400">+{coach.amenities.length - 2}</span>}
                                </div>
                                <button className="text-red-400 hover:text-red-600" onClick={() => handleDeleteCoach(train.id, coach.id)}><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))
                    )}
                </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Thêm/Sửa Tàu */}
      <AddTrainModal 
        isOpen={trainModal.isOpen} 
        isEdit={trainModal.isEdit}
        initialData={trainModal.data}
        onClose={() => setTrainModal({ ...trainModal, isOpen: false })} 
        onSave={handleSaveTrain} 
      />

      {/* Modal Thêm Toa (Cần truyền danh sách toa hiện tại để tính số thứ tự) */}
      <AddCoachModal 
        isOpen={addCoachModalState.isOpen} 
        targetTrainId={addCoachModalState.trainId} 
        currentCoachesCount={trainsList.find(t => t.id === addCoachModalState.trainId)?.coaches?.length || 0}
        onClose={() => setAddCoachModalState({ isOpen: false, trainId: null })} 
        onSave={handleSaveCoach} 
      />
    </div>
  );
};

export default TrainManagementPage;