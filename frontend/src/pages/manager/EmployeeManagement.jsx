import React, { useState } from 'react';
import { Search, Plus, Edit, X, User } from 'lucide-react';

const EmployeeManagement = () => {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null); // Null = Thêm mới, Có ID = Chỉnh sửa

  // Dữ liệu mẫu (Giống trong hình 1)
  const [employees, setEmployees] = useState([
    {
      id: "NV001",
      name: "Nguyễn Văn An",
      phone: "0901234567",
      identityCard: "012345678901",
      role: "Lái tàu",
      salary: 15000000,
      status: "Đang làm"
    },
    {
      id: "NV002",
      name: "Trần Thị Bình",
      phone: "0912345678",
      identityCard: "012345678902",
      role: "Trưởng tàu",
      salary: 12000000,
      status: "Đang làm"
    },
    {
      id: "NV003",
      name: "Lê Hoàng Cường",
      phone: "0923456789",
      identityCard: "012345678903",
      role: "Nhân viên toa",
      salary: 10000000,
      status: "Nghỉ phép"
    },
    {
      id: "NV004",
      name: "Phạm Minh Đức",
      phone: "0934567890",
      identityCard: "012345678904",
      role: "Lái tàu",
      salary: 15000000,
      status: "Đang làm"
    },
    {
      id: "NV005",
      name: "Hoàng Thị Em",
      phone: "0945678901",
      identityCard: "012345678905",
      role: "Nhân viên toa",
      salary: 10000000,
      status: "Nghỉ việc"
    }
  ]);

  // Form State
  const initialFormState = {
    name: '',
    phone: '',
    identityCard: '',
    role: 'Lái tàu',
    salary: '',
  };
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
  const handleOpenEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      phone: employee.phone,
      identityCard: employee.identityCard,
      role: employee.role,
      salary: employee.salary
    });
    setError('');
    setIsModalOpen(true);
  };

  // 3. Xử lý Lưu (Thêm mới hoặc Cập nhật)
  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.name || !formData.phone || !formData.identityCard || !formData.salary) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    // Validate CMND trùng (Luồng phụ 4.2)
    const isDuplicateIdentity = employees.some(emp => 
      emp.identityCard === formData.identityCard && emp.id !== editingId
    );
    if (isDuplicateIdentity) {
      setError('Số CMND/CCCD đã tồn tại trên hệ thống!');
      return;
    }

    if (editingId) {
      // Logic Sửa
      setEmployees(employees.map(emp => 
        emp.id === editingId ? { ...emp, ...formData, salary: Number(formData.salary) } : emp
      ));
    } else {
      // Logic Thêm mới
      const newId = `NV00${employees.length + 1}`;
      const newEmployee = {
        id: newId,
        ...formData,
        salary: Number(formData.salary),
        status: "Đang làm" // Mặc định trạng thái mới là Đang làm
      };
      setEmployees([...employees, newEmployee]);
    }

    setIsModalOpen(false);
  };

  // Helper: Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(value);
  };

  // Helper: Màu trạng thái
  const getStatusColor = (status) => {
    switch(status) {
      case 'Đang làm': return 'bg-green-100 text-green-700';
      case 'Nghỉ phép': return 'bg-yellow-100 text-yellow-700';
      case 'Nghỉ việc': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1>
          <p className="text-gray-500 mt-1">Thêm, sửa, xóa thông tin nhân viên</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm nhân viên
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã nhân viên..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <th className="p-4 font-medium">Lương cơ bản</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.filter(emp => 
              emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              emp.id.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-700 font-medium">{emp.id}</td>
                <td className="p-4 text-gray-800 font-medium">{emp.name}</td>
                <td className="p-4 text-gray-600">{emp.phone}</td>
                <td className="p-4 text-gray-600">{emp.identityCard}</td>
                <td className="p-4 text-gray-600">{emp.role}</td>
                <td className="p-4 text-gray-600">{formatCurrency(emp.salary)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(emp.status)}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleOpenEdit(emp)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {/* Đã ẩn nút Xóa theo yêu cầu */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (FORM) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin nhân viên bên dưới</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500"
                  placeholder="09xx..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500"
                  placeholder="Số CMND/CCCD"
                  value={formData.identityCard}
                  onChange={(e) => setFormData({...formData, identityCard: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhân viên</label>
                <div className="relative">
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500 appearance-none bg-white"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Lái tàu">Lái tàu</option>
                    <option value="Trưởng tàu">Trưởng tàu</option>
                    <option value="Nhân viên toa">Nhân viên toa</option>
                    <option value="Bảo vệ">Bảo vệ</option>
                    <option value="Kỹ thuật">Kỹ thuật</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản (VND)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500"
                  placeholder="Nhập mức lương"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors shadow-sm"
                >
                  {editingId ? 'Lưu thay đổi' : 'Lưu nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;