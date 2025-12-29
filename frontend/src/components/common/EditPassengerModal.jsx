import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import '../../styles/pages/BookingFlow.css'; // Dùng lại CSS cũ

const EditPassengerModal = ({ passenger, onClose, onSave }) => {
  // Khởi tạo state với đầy đủ trường thông tin (giống form đặt vé)
  const [formData, setFormData] = useState({
    fullName: passenger.fullName || '',
    passengerID: passenger.passengerID || '',
    type: passenger.type || 'Người lớn',
    dob: passenger.dob || '',
    phone: passenger.phone || '',
    address: passenger.address || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validate cơ bản
    if (!formData.fullName.trim() || !formData.passengerID.trim()) {
      alert("Vui lòng nhập Họ tên và Số giấy tờ tùy thân!");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{zIndex: 2000}}>
      {/* Tăng chiều rộng modal lên để chứa form 2 cột */}
      <div className="modal-ticket-card" style={{maxWidth: '700px', height: 'auto', overflow: 'visible'}}>
        
        {/* Header */}
        <div className="modal-header" style={{padding: '15px 20px'}}>
          <h3 className="text-white font-bold text-lg">Sửa thông tin hành khách</h3>
          <button className="text-white hover:bg-blue-700 p-1 rounded" onClick={onClose}>
            <X size={20}/>
          </button>
        </div>

        {/* Body Form */}
        <div className="modal-body" style={{padding: '24px'}}>
          
          <div className="form-row-2"> {/* Class CSS grid 2 cột đã có sẵn trong BookingFlow.css */}
            
            {/* Hàng 1: Họ tên + Đối tượng */}
            <div className="form-group-sm">
              <label className="label-sm">Họ và tên <span className="text-red-500">*</span></label>
              <input 
                className="input-sm"
                placeholder="VD: NGUYEN VAN A"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>

            <div className="form-group-sm">
              <label className="label-sm">Đối tượng</label>
              <select 
                className="input-sm"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="Người lớn">Người lớn</option>
                <option value="Sinh viên">Sinh viên (Giảm 10%)</option>
                <option value="Trẻ em">Trẻ em (Giảm 25%)</option>
                <option value="Người cao tuổi">Người cao tuổi (Giảm 15%)</option>
              </select>
            </div>

            {/* Hàng 2: CMND + Ngày sinh */}
            <div className="form-group-sm">
              <label className="label-sm">Số CMND/CCCD/Hộ chiếu <span className="text-red-500">*</span></label>
              <input 
                className="input-sm"
                placeholder="Nhập số giấy tờ tùy thân"
                value={formData.passengerID}
                onChange={(e) => handleChange('passengerID', e.target.value)}
              />
            </div>

            <div className="form-group-sm">
              <label className="label-sm">Ngày sinh <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                className="input-sm"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
              />
            </div>

            {/* Hàng 3: SĐT + Địa chỉ */}
            <div className="form-group-sm">
              <label className="label-sm">Số điện thoại</label>
              <input 
                className="input-sm"
                placeholder="Nhập SĐT hành khách"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group-sm">
              <label className="label-sm">Địa chỉ</label>
              <input 
                className="input-sm"
                placeholder="Tỉnh/Thành phố"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 font-semibold hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18}/> Lưu thay đổi
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditPassengerModal;