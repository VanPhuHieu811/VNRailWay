import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import '../../styles/pages/TrainManagementPage.css';

const AddTrainModal = ({ isOpen, isEdit, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tenTau: '',
    hangSanXuat: '',
    ngayVanHanh: '',
    loaiTau: 'Hạng sang',
    trangThai: 'Hoạt động'
  });

  useEffect(() => {
    if (isOpen) {
        if (isEdit && initialData) {
            setFormData({
                tenTau: initialData.trainName || initialData.tenTau || '',
                hangSanXuat: initialData.company || initialData.hangSanXuat || '',
                ngayVanHanh: initialData.operationDate 
                  ? new Date(initialData.operationDate).toISOString().split('T')[0] 
                  : '',
                loaiTau: initialData.type === 'VIP' ? 'Hạng sang' : 'Bình thường',
                trangThai: initialData.status === 'active' ? 'Hoạt động' : 'Bảo trì'
            });
        } else {
            setFormData({
                tenTau: '',
                hangSanXuat: 'Đường sắt Việt Nam',
                ngayVanHanh: new Date().toISOString().split('T')[0],
                loaiTau: 'Hạng sang',
                trangThai: 'Hoạt động'
            });
        }
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Modified: Accept isDeadlock flag (defaults to false)
  const handleSave = (isDeadlock = false) => {
    if (!formData.tenTau) {
      alert("Vui lòng nhập Tên đoàn tàu!");
      return;
    }
    
    const dataToSave = {
        ...formData,
        id: isEdit ? initialData.id : undefined,
        // Pass the flag back to the parent component
        isDeadlock: isDeadlock 
    };
    
    onSave(dataToSave); 
  };

  const modalActions = (
    <>
      <button onClick={onClose} className="modal-btn-cancel">Hủy</button>
      
      {/* NEW: Deadlock Button - Only visible when Editing */}
      {isEdit && (
        <button 
          onClick={() => handleSave(true)} 
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium mr-2"
        >
          Cập nhật (Deadlock)
        </button>
      )}

      {/* Standard Save Button */}
      <button onClick={() => handleSave(false)} className="modal-btn-save">
        {isEdit ? 'Cập nhật' : 'Thêm mới'}
      </button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? "Cập nhật đoàn tàu" : "Thêm đoàn tàu mới"} 
      actions={modalActions}
    >
      <p className="form-description">
        {isEdit ? "Chỉnh sửa thông tin đoàn tàu" : "Nhập thông tin để tạo đoàn tàu mới"}
      </p>
      
      <div className="form-stack">
        <div className="form-group">
          <label>Tên đoàn tàu <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="tenTau" 
            value={formData.tenTau} 
            onChange={handleChange} 
            placeholder="VD: SE1 Thống Nhất" 
            className="form-input" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label>Hãng tàu</label>
                <input 
                  type="text" 
                  name="hangSanXuat" 
                  value={formData.hangSanXuat} 
                  onChange={handleChange} 
                  placeholder="VD: Gia Lam Railway"
                  className="form-input" 
                />
            </div>
            <div className="form-group">
                <label>Ngày vận hành</label>
                <input 
                  type="date" 
                  name="ngayVanHanh" 
                  value={formData.ngayVanHanh} 
                  onChange={handleChange} 
                  className="form-input" 
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label>Loại tàu</label>
                <select 
                  name="loaiTau" 
                  value={formData.loaiTau} 
                  onChange={handleChange} 
                  className="form-select"
                >
                    <option value="Hạng sang">Hạng sang (VIP)</option>
                    <option value="Bình thường">Bình thường</option>
                </select>
            </div>
            <div className="form-group">
                <label>Trạng thái</label>
                <select 
                  name="trangThai" 
                  value={formData.trangThai} 
                  onChange={handleChange} 
                  className="form-select"
                >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo trì">Bảo trì</option>
                </select>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddTrainModal;