import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import '../../styles/pages/TrainManagementPage.css'; // Import CSS

const AddTrainModal = ({ isOpen, isEdit, initialData, onClose, onSave }) => {
  // State form
  const [formData, setFormData] = useState({
    id: '', 
    name: '', 
    company: 'Đường sắt Việt Nam', 
    operationDate: '', 
    trainType: 'Thường', // Thường / VIP
    status: 'active'
  });

  // Effect: Reset form hoặc Fill data khi mở modal
  useEffect(() => {
    if (isOpen) {
        if (isEdit && initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.name,
                company: initialData.company,
                operationDate: initialData.operationDate || '',
                trainType: initialData.type || 'Thường',
                status: initialData.status
            });
        } else {
            // Reset form for add new
            setFormData({
                id: '', 
                name: '', 
                company: 'Đường sắt Việt Nam', 
                operationDate: '', 
                trainType: 'Thường', 
                status: 'active'
            });
        }
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!formData.id || !formData.name) {
      alert("Vui lòng nhập đủ thông tin bắt buộc (*)!");
      return;
    }
    
    // Chuẩn bị object để save
    const dataToSave = {
        ...formData,
        // Nếu là edit thì giữ nguyên coaches, nếu mới thì mảng rỗng (được xử lý ở parent)
        type: formData.trainType 
    };
    
    onSave(dataToSave); 
  };

  const modalActions = (
    <>
      <button onClick={onClose} className="modal-btn-cancel">Hủy</button>
      <button onClick={handleSave} className="modal-btn-save">{isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Cập nhật đoàn tàu" : "Thêm đoàn tàu mới"} actions={modalActions}>
      <p className="form-description">{isEdit ? "Chỉnh sửa thông tin đoàn tàu" : "Nhập thông tin đoàn tàu mới"}</p>
      <div className="form-stack">
        <div className="form-group">
          <label>Mã đoàn tàu <span className="text-red-500">*</span></label>
          {/* Mã tàu không được sửa khi Edit */}
          <input 
            type="text" name="id" value={formData.id} onChange={handleChange} 
            placeholder="VD: SE1" className="form-input" 
            readOnly={isEdit} 
            style={isEdit ? {backgroundColor: '#f3f4f6'} : {}}
          />
        </div>
        
        <div className="form-group">
          <label>Tên đoàn tàu <span className="text-red-500">*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Tàu thống nhất SE1" className="form-input" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label>Hãng tàu</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
                <label>Ngày vận hành</label>
                <input type="date" name="operationDate" value={formData.operationDate} onChange={handleChange} className="form-input" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label>Loại tàu</label>
                <select name="trainType" value={formData.trainType} onChange={handleChange} className="form-select">
                    <option value="Thường">Tàu Thường</option>
                    <option value="VIP">Tàu VIP (Chất lượng cao)</option>
                </select>
            </div>
            <div className="form-group">
                <label>Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                    <option value="active">Hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                </select>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddTrainModal;