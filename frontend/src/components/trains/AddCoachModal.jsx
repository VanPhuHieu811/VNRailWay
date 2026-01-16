import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import '../../styles/pages/TrainManagementPage.css';

const AddCoachModal = ({ isOpen, isEdit, initialData, onClose, onSave, targetTrainId, currentCoachesCount }) => {
  // Default state
  const [formData, setFormData] = useState({
    loaiToa: 'Ghế', 
    soGhe: 40       
  });

  // Reset or Fill form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // --- EDIT MODE: Fill data ---
        setFormData({
            loaiToa: initialData.type,   // Map from your frontend 'type'
            soGhe: initialData.capacity  // Map from your frontend 'capacity'
        });
      } else {
        // --- ADD MODE: Reset defaults ---
        setFormData({
            loaiToa: 'Ghế',
            soGhe: 40
        });
      }
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const seats = parseInt(formData.soGhe, 10);

    // Validations...
    if (isNaN(seats)) { alert("Vui lòng nhập số hợp lệ!"); return; }
    if (seats <= 20) { alert("Số lượng chỗ ngồi phải lớn hơn 20!"); return; }
    if (seats > 1100) { alert("Số lượng chỗ ngồi quá lớn (tối đa 1100)!"); return; }

    // Pass data back
    // If editing, we pass the Coach ID too
    const dataToSubmit = { 
        id: isEdit ? initialData.id : undefined,
        loaiToa: formData.loaiToa,
        soGhe: seats
    };
    
    onSave(targetTrainId, dataToSubmit);
  };

  const modalActions = (
    <>
      <button onClick={onClose} className="modal-btn-cancel">Hủy</button>
      <button onClick={handleSave} className="modal-btn-save">
        {isEdit ? 'Cập nhật' : 'Thêm mới'}
      </button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      // Change title based on mode
      title={isEdit ? `Cập nhật Toa ${initialData?.carriageNumber}` : `Thêm toa tàu mới cho ${targetTrainId}`} 
      actions={modalActions}
    >
      <p className="form-description">{isEdit ? "Chỉnh sửa thông tin toa tàu" : "Nhập thông tin toa tàu mới"}</p>
      <div className="form-stack">
        
        {/* Show Coach Number */}
        <div className="form-group">
          <label>Số toa (Tự động)</label>
          <div className="bg-gray-100 p-2.5 rounded border border-gray-300 font-bold text-gray-600">
            {/* If Edit, show current number. If Add, show next number */}
            Toa số {isEdit ? initialData?.carriageNumber : (currentCoachesCount + 1)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label>Loại toa <span className="text-red-500">*</span></label>
                <select 
                    name="loaiToa" 
                    value={formData.loaiToa} 
                    onChange={handleChange} 
                    className="form-select"
                >
                    <option value="Ghế">Ghế ngồi</option>
                    <option value="Giường">Giường nằm</option>
                </select>
            </div>

            <div className="form-group">
                <label>Số lượng chỗ <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="soGhe" 
                    value={formData.soGhe} 
                    onChange={handleChange}
                    min="21"
                    max="1100" 
                    className="form-input"
                    placeholder="VD: 40"
                />
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCoachModal;