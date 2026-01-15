import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const SalesPassengerInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSeats, tripId } = location.state || { selectedSeats: [] };

  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      setPassengers(selectedSeats.map(seat => ({
        seatId: seat.id,
        seatLabel: `${seat.tenToa} - Số ${seat.seatNum}`,
        fullName: '',
        type: 'Người lớn',
        cmnd: '',
        dob: ''
      })));
    }
  }, [selectedSeats]);

  const handleChange = (index, field, value) => {
    const newPass = [...passengers];
    newPass[index][field] = value;
    setPassengers(newPass);
  };

  const handleSubmit = () => {
    // Validate nhanh
    const isValid = passengers.every(p => p.fullName && p.cmnd);
    if (!isValid) return alert("Thiếu tên hoặc CMND hành khách!");

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    navigate('/employee/sales/payment', {
      state: { selectedSeats, tripId, passengers, totalPrice }
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-slate-600 hover:text-blue-600">
        <ArrowLeft size={18} className="mr-1"/> Quay lại chọn ghế
      </button>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Nhập thông tin hành khách (Nhân viên nhập)</h1>

      <div className="space-y-4">
        {passengers.map((p, index) => (
          <div key={p.seatId} className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between mb-3 border-b pb-2">
              <span className="font-bold text-slate-700">Khách #{index + 1}</span>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded">{p.seatLabel}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border rounded p-2 text-sm uppercase" 
                  placeholder="NGUYỄN VĂN A"
                  value={p.fullName}
                  onChange={e => handleChange(index, 'fullName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">CMND/CCCD <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border rounded p-2 text-sm" 
                  placeholder="Số giấy tờ"
                  value={p.cmnd}
                  onChange={e => handleChange(index, 'cmnd', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Đối tượng</label>
                <select 
                  className="w-full border rounded p-2 text-sm"
                  value={p.type}
                  onChange={e => handleChange(index, 'type', e.target.value)}
                >
                  <option>Người lớn</option>
                  <option>Trẻ em</option>
                  <option>Sinh viên</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Năm sinh</label>
                <input 
                  type="date"
                  className="w-full border rounded p-2 text-sm"
                  value={p.dob}
                  onChange={e => handleChange(index, 'dob', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg"
        >
          <Save size={18}/> Tiếp tục thanh toán
        </button>
      </div>
    </div>
  );
};
export default SalesPassengerInfoPage;