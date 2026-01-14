import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import '../../styles/pages/TrainManagementPage.css'; // Import CSS

// Cấu hình các loại toa và sức chứa mặc định
const COACH_CONFIG = {
    'Ngồi mềm điều hòa': { capacity: 64, amenities: ['Điều hòa', 'Ổ cắm điện'] },
    'Giường nằm khoang 6': { capacity: 42, amenities: ['Điều hòa', 'Gối chăn', 'Đèn đọc sách'] },
    'Giường nằm khoang 4': { capacity: 28, amenities: ['Điều hòa', 'WiFi', 'Gối chăn VIP', 'Đèn đọc sách'] },
    'Giường nằm khoang 2 (VIP)': { capacity: 14, amenities: ['Điều hòa', 'WiFi', 'TV', 'Tủ lạnh', 'Suất ăn'] },
};

const COACH_TYPES = Object.keys(COACH_CONFIG);

const AddCoachModal = ({ isOpen, onClose, onSave, targetTrainId, currentCoachesCount }) => {
  // State form chỉ cần Loại toa, các thông tin khác tự động
  const [coachType, setCoachType] = useState(COACH_TYPES[0]);
  const [formData, setFormData] = useState({
    seatNum: '', 
    type: COACH_TYPES[0], 
    capacity: COACH_CONFIG[COACH_TYPES[0]].capacity, 
    amenities: COACH_CONFIG[COACH_TYPES[0]].amenities
  });

  // Khi mở modal, tự động tính số thứ tự toa tiếp theo
  useEffect(() => {
    if (isOpen) {
        const nextSeatNum = currentCoachesCount + 1;
        const defaultType = COACH_TYPES[0];
        setCoachType(defaultType);
        setFormData({
            seatNum: nextSeatNum,
            type: defaultType,
            capacity: COACH_CONFIG[defaultType].capacity,
            amenities: COACH_CONFIG[defaultType].amenities
        });
    }
  }, [isOpen, currentCoachesCount]);

  // Khi thay đổi loại toa -> Tự động update sức chứa & tiện nghi
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setCoachType(newType);
    setFormData(prev => ({
        ...prev,
        type: newType,
        capacity: COACH_CONFIG[newType].capacity,
        amenities: COACH_CONFIG[newType].amenities
    }));
  };

  const handleSave = () => {
    // Save dữ liệu đã tự động tính toán
    onSave(targetTrainId, { 
        ...formData, 
        id: `c_${new Date().getTime()}` 
    });
  };

  const modalActions = (
    <>
      <button onClick={onClose} className="modal-btn-cancel">Hủy</button>
      <button onClick={handleSave} className="modal-btn-save">Thêm mới</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Thêm toa tàu mới cho ${targetTrainId}`} actions={modalActions}>
      <p className="form-description">Chọn loại toa để thêm vào đoàn tàu</p>
      <div className="form-stack">
        
        {/* Số toa tự động (Readonly) */}
        <div className="form-group">
          <label>Số toa (Tự động)</label>
          <div className="bg-gray-100 p-2 rounded border border-gray-300 font-bold text-gray-600">
            Toa số {formData.seatNum}
          </div>
        </div>

        {/* Chọn loại toa */}
        <div className="form-group">
          <label>Loại toa <span className="text-red-500">*</span></label>
          <select name="type" value={coachType} onChange={handleTypeChange} className="form-select">
            {COACH_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {/* Thông tin tự động hiển thị (Readonly để review) */}
        <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div>
                <span className="text-xs text-blue-500 font-bold uppercase block mb-1">Sức chứa</span>
                <span className="text-sm font-bold text-gray-800">{formData.capacity} chỗ</span>
            </div>
            <div>
                <span className="text-xs text-blue-500 font-bold uppercase block mb-1">Tiện nghi có sẵn</span>
                <div className="flex flex-wrap gap-1">
                    {formData.amenities.map(am => (
                        <span key={am} className="text-[10px] bg-white text-gray-600 px-1 rounded border border-gray-200">{am}</span>
                    ))}
                </div>
            </div>
        </div>
        
      </div>
    </Modal>
  );
};

export default AddCoachModal;