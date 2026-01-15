import React, { useState } from 'react';
import { Search, Plus, Edit, X, User, Calendar, MapPin, Clock, Train } from 'lucide-react';

const EmployeeManagement = () => {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // State cho modal lịch
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Nhân viên đang xem lịch

  // Dữ liệu nhân viên mẫu
  const [employees, setEmployees] = useState([
    { id: "NV001", name: "Nguyễn Văn An", phone: "0901234567", identityCard: "012345678901", role: "Lái tàu", salary: 15000000, status: "Đang làm" },
    { id: "NV002", name: "Trần Thị Bình", phone: "0912345678", identityCard: "012345678902", role: "Trưởng tàu", salary: 12000000, status: "Đang làm" },
    { id: "NV003", name: "Lê Hoàng Cường", phone: "0923456789", identityCard: "012345678903", role: "Nhân viên toa", salary: 10000000, status: "Nghỉ phép" },
    { id: "NV004", name: "Phạm Minh Đức", phone: "0934567890", identityCard: "012345678904", role: "Lái tàu", salary: 15000000, status: "Đang làm" },
    { id: "NV005", name: "Hoàng Thị Em", phone: "0945678901", identityCard: "012345678905", role: "Nhân viên toa", salary: 10000000, status: "Nghỉ việc" }
  ]);

  // Dữ liệu mẫu Lịch Trình (Mới thêm)
  const mockSchedules = [
    { id: 1, empId: "NV001", trainCode: "SE1", route: "Hà Nội - Đà Nẵng", date: "2023-10-26", time: "06:00 - 18:30", status: "Running" },
    { id: 2, empId: "NV001", trainCode: "SE2", route: "Đà Nẵng - Hà Nội", date: "2023-10-28", time: "19:00 - 07:30", status: "Upcoming" },
    { id: 3, empId: "NV002", trainCode: "TN1", route: "Sài Gòn - Nha Trang", date: "2023-10-26", time: "08:00 - 16:00", status: "Running" },
    { id: 4, empId: "NV004", trainCode: "SE3", route: "Hà Nội - Vinh", date: "2023-10-30", time: "09:00 - 14:00", status: "Upcoming" },
    { id: 5, empId: "NV001", trainCode: "SE5", route: "Hà Nội - Sài Gòn", date: "2023-11-05", time: "06:00 - 14:00 (+1)", status: "Upcoming" },
  ];

  // Form State
  const initialFormState = { name: '', phone: '', identityCard: '', role: 'Lái tàu', salary: '', };
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  // --- HANDLERS ---

  // 1. Mở Modal Thêm mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setError('');
    setIsModalOpen(true);
  };

  // 2. Mở Modal Chỉnh sửa
  const handleOpenEdit = (employee, e) => {
    e.stopPropagation(); // Ngăn sự kiện click row
    setEditingId(employee.id);
    setFormData({
      name: employee.name, phone: employee.phone, identityCard: employee.identityCard,
      role: employee.role, salary: employee.salary
    });
    setError('');
    setIsModalOpen(true);
  };

  // 3. Mở Modal Xem Lịch (Mới thêm)
  const handleViewSchedule = (employee) => {
    setSelectedEmployee(employee);
    setIsScheduleModalOpen(true);
  };

  // 4. Xử lý Lưu
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.identityCard || !formData.salary) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    const isDuplicateIdentity = employees.some(emp => emp.identityCard === formData.identityCard && emp.id !== editingId);
    if (isDuplicateIdentity) {
      setError('Số CMND/CCCD đã tồn tại trên hệ thống!');
      return;
    }

    if (editingId) {
      setEmployees(employees.map(emp => emp.id === editingId ? { ...emp, ...formData, salary: Number(formData.salary) } : emp));
    } else {
      const newId = `NV00${employees.length + 1}`;
      const newEmployee = { id: newId, ...formData, salary: Number(formData.salary), status: "Đang làm" };
      setEmployees([...employees, newEmployee]);
    }
    setIsModalOpen(false);
  };

  // Helper: Format tiền tệ
  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(value);

  // Helper: Màu trạng thái nhân viên
  const getStatusColor = (status) => {
    switch(status) {
      case 'Đang làm': return 'bg-green-100 text-green-700';
      case 'Nghỉ phép': return 'bg-yellow-100 text-yellow-700';
      case 'Nghỉ việc': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper: Lấy lịch trình của nhân viên đang chọn
  const getEmployeeSchedules = () => {
    if (!selectedEmployee) return { running: [], upcoming: [] };
    const empSchedules = mockSchedules.filter(s => s.empId === selectedEmployee.id);
    return {
      running: empSchedules.filter(s => s.status === 'Running'),
      upcoming: empSchedules.filter(s => s.status === 'Upcoming')
    };
  };

  // --- RENDER ---
  const { running, upcoming } = getEmployeeSchedules();

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div><h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1></div>
        <button onClick={handleOpenAdd} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Thêm nhân viên
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" placeholder="Tìm theo tên hoặc mã nhân viên..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200 border-t-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Mã NV</th>
              <th className="p-4 font-medium">Họ tên</th>
              <th className="p-4 font-medium">Số điện thoại</th>
              <th className="p-4 font-medium">CMND/CCCD</th>
              <th className="p-4 font-medium">Loại nhân viên</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.id.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
              <tr 
                key={emp.id} 
                onClick={() => handleViewSchedule(emp)} // Click vào hàng để xem lịch
                className="hover:bg-sky-50 transition-colors cursor-pointer group"
                title="Nhấn để xem lịch làm việc"
              >
                <td className="p-4 text-sky-600 font-medium group-hover:underline">{emp.id}</td>
                <td className="p-4 text-gray-800 font-medium">{emp.name}</td>
                <td className="p-4 text-gray-600">{emp.phone}</td>
                <td className="p-4 text-gray-600">{emp.identityCard}</td>
                <td className="p-4 text-gray-600">{emp.role}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(emp.status)}`}>{emp.status}</span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleViewSchedule(emp); }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      title="Xem lịch"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleOpenEdit(emp, e)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL 1: FORM NHẬP LIỆU (Giữ nguyên) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
                <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin nhân viên bên dưới</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-6 h-6" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
               {/* (Giữ nguyên các trường input form như cũ) */}
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label><input type="text" className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label><input type="text" className="w-full border p-2 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">CMND</label><input type="text" className="w-full border p-2 rounded-lg" value={formData.identityCard} onChange={e => setFormData({...formData, identityCard: e.target.value})}/></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                    <select className="w-full border p-2 rounded-lg bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option>Lái tàu</option><option>Trưởng tàu</option><option>Nhân viên toa</option><option>Bảo vệ</option><option>Kỹ thuật</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Lương</label><input type="number" className="w-full border p-2 rounded-lg" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})}/></div>
               </div>
               <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg">Hủy</button>
                  <button type="submit" className="px-5 py-2 bg-sky-500 text-white rounded-lg">Lưu</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: XEM LỊCH TRÌNH (Mới thêm) --- */}
      {isScheduleModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-sky-600 p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6"/> {selectedEmployee.name}
                </h2>
                <p className="text-sky-100 mt-1 flex gap-4 text-sm">
                  <span>Mã: {selectedEmployee.id}</span>
                  <span>|</span>
                  <span>Chức vụ: {selectedEmployee.role}</span>
                </p>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-white hover:bg-sky-700 rounded-full p-1 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-50 max-h-[70vh] overflow-y-auto">
              
              {/* Section: Chuyến đang chạy */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  Chuyến đang chạy
                </h3>
                {running.length > 0 ? (
                  <div className="space-y-3">
                    {running.map(trip => (
                      <div key={trip.id} className="bg-white p-4 rounded-lg border border-green-200 shadow-sm flex justify-between items-center relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg text-green-700">{trip.trainCode}</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">Đang vận hành</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                             <MapPin className="w-4 h-4"/> {trip.route}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-gray-800 font-medium">
                            <Clock className="w-4 h-4"/> {trip.time}
                          </div>
                          <div className="text-sm text-gray-500">{trip.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-500 italic text-center">
                    Hiện không có chuyến đang chạy.
                  </div>
                )}
              </div>

              {/* Section: Các chuyến sắp tới */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600"/>
                  Các chuyến sắp tới
                </h3>
                {upcoming.length > 0 ? (
                  <div className="space-y-3">
                    {upcoming.map(trip => (
                      <div key={trip.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-sky-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Train className="w-5 h-5 text-sky-600"/>
                              <span className="font-bold text-gray-800">{trip.trainCode}</span>
                            </div>
                            <div className="text-gray-600 text-sm">{trip.route}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-800">{trip.date}</div>
                            <div className="text-sm text-gray-500">{trip.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-500 italic text-center">
                    Chưa có lịch trình sắp tới.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeManagement;