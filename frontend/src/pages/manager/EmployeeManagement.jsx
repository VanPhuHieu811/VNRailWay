import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, X, User, Calendar, MapPin, Clock, Train, Loader, Filter } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllStaffService, getStaffScheduleService } from '../../services/staffApi'; 

const EmployeeManagement = () => {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Data
  const [employees, setEmployees] = useState([]);
  
  // State cho Modal Lịch trình
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeSchedules, setEmployeeSchedules] = useState({ running: [], upcoming: [], history: [] });
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Form State (Thêm/Sửa - Giữ nguyên logic UI của bạn)
  const initialFormState = { name: '', phone: '', identityCard: '', role: 'Lái tàu', salary: '', status: 'Đang làm' };
  const [formData, setFormData] = useState(initialFormState);

  // --- 1. GỌI API LẤY DANH SÁCH NHÂN VIÊN ---
  const fetchAllStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaffService();
      if (res && res.success) {
        const mappedData = res.data.map(item => ({
          id: item.MaNV_NV || item.MaNV_TK, 
          name: item.HoTenNV || item.TenTaiKhoan,
          phone: item.SoDienThoaiNV || '---',
          identityCard: item.CCCD_NV || '---',
          role: item.LoaiNhanVien || item.VaiTro, 
          status: item.TrangThai ? 'Đang làm' : 'Nghỉ việc', 
          salary: 0 
        }));
        setEmployees(mappedData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error("Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, []);

  const fetchStaffSchedule = async (empId, start, end) => {
    if (!empId) return;
    try {
      setScheduleLoading(true);
      
      const res = await getStaffScheduleService(empId, start, end);

      if (res && res.success) {
        const schedules = res.data || [];
        
        const now = new Date();
        const runningList = [];
        const upcomingList = [];
        const historyList = [];

        schedules.forEach(s => {
          const trip = {
            id: s.MaPhanCong,
            trainCode: s.MaChuyenTau,
            route: s.TenTuyen,
            date: new Date(s.NgayKhoiHanh).toLocaleDateString('vi-VN'),
            time: `${s.GioDi?.substring(0,5)} - ${s.GioDen?.substring(0,5)}`,
            status: s.TrangThaiChuyenTau,
            rawDate: new Date(s.NgayKhoiHanh)
          };

          if (s.TrangThaiChuyenTau === 'Đang chạy') {
             runningList.push(trip);
          } else if (trip.rawDate >= now && s.TrangThaiChuyenTau !== 'Hoàn thành') {
             upcomingList.push(trip);
          } else {
             historyList.push(trip);
          }
        });

        setEmployeeSchedules({ 
            running: runningList, 
            upcoming: upcomingList,
            history: historyList // Có thể hiển thị thêm tab Lịch sử nếu cần
        });
      }
    } catch (error) {
      console.error("Lỗi tải lịch:", error);
      toast.error("Không thể tải lịch làm việc.");
    } finally {
      setScheduleLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employee, e) => {
    e.stopPropagation();
    setEditingId(employee.id);
    setFormData({
      name: employee.name, phone: employee.phone, identityCard: employee.identityCard,
      role: employee.role, salary: employee.salary, status: employee.status
    });
    setIsModalOpen(true);
  };

  // Mở Modal Xem Lịch
  const handleViewSchedule = (employee) => {
    setSelectedEmployee(employee);
    setFilterStartDate(''); // Reset ngày lọc
    setFilterEndDate('');
    
    // Mặc định load lịch không cần ngày (Backend tự xử lý hoặc trả về hết)
    fetchStaffSchedule(employee.id, '', ''); 
    
    setIsScheduleModalOpen(true);
  };

  // Xử lý nút Lọc Lịch
  const handleFilterSchedule = () => {
      if(!selectedEmployee) return;
      fetchStaffSchedule(selectedEmployee.id, filterStartDate, filterEndDate);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.info("Tính năng Lưu đang phát triển...");
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    if (status === 'Đang làm') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <ToastContainer position="top-right" autoClose={2000}/>
      
      {/* HEADER & SEARCH (Giữ nguyên) */}
      <div className="flex justify-between items-end mb-6">
        <div><h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1></div>
        <button onClick={handleOpenAdd} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Thêm nhân viên
        </button>
      </div>

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
        {loading ? (
            <div className="flex justify-center py-10"><Loader className="animate-spin text-sky-500"/></div>
        ) : (
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">Mã NV</th>
                <th className="p-4 font-medium">Họ tên</th>
                <th className="p-4 font-medium">Số điện thoại</th>
                <th className="p-4 font-medium">CMND/CCCD</th>
                <th className="p-4 font-medium">Chức vụ</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-center">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {employees.filter(emp => 
                    (emp.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                    (emp.id?.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((emp) => (
                <tr 
                    key={emp.id} 
                    onClick={() => handleViewSchedule(emp)} 
                    className="hover:bg-sky-50 transition-colors cursor-pointer group"
                >
                    <td className="p-4 text-sky-600 font-medium group-hover:underline">{emp.id}</td>
                    <td className="p-4 text-gray-800 font-medium">{emp.name}</td>
                    <td className="p-4 text-gray-600">{emp.phone}</td>
                    <td className="p-4 text-gray-600">{emp.identityCard}</td>
                    <td className="p-4 text-gray-600">{emp.role}</td>
                    <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(emp.status)}`}>
                        {emp.status}
                    </span>
                    </td>
                    <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleViewSchedule(emp); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                           <Calendar className="w-4 h-4" />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
                {employees.length === 0 && <tr><td colSpan="7" className="p-6 text-center text-gray-500">Không tìm thấy dữ liệu.</td></tr>}
            </tbody>
            </table>
        )}
      </div>

      {/* --- MODAL 1: FORM NHẬP LIỆU (Giữ nguyên UI của bạn) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
           {/* ... Code Form Nhập liệu giữ nguyên ... */}
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex justify-between items-start mb-6">
                 <h2 className="text-xl font-bold text-gray-800">Thông tin nhân viên</h2>
                 <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400"/></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                 <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded">Form Demo UI</div>
                 {/* Các input giữ nguyên */}
                 <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Đóng</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL 2: XEM LỊCH TRÌNH --- */}
      {isScheduleModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-sky-600 p-6 text-white flex justify-between items-start shrink-0 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6"/> {selectedEmployee.name}
                </h2>
                <div className="text-sky-100 mt-2 flex gap-4 text-sm">
                  <span className="bg-sky-700 px-2 py-0.5 rounded">MNV: {selectedEmployee.id}</span>
                  <span>Chức vụ: {selectedEmployee.role}</span>
                </div>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-white hover:bg-sky-700 rounded-full p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* --- LINE CHỌN KHOẢNG THỜI GIAN (MỚI THÊM) --- */}
            <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-3 items-end shrink-0">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Từ ngày</label>
                    <input 
                        type="date" 
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Đến ngày</label>
                    <input 
                        type="date" 
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleFilterSchedule}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 h-[34px]"
                >
                    <Filter className="w-4 h-4"/> Lọc lịch
                </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto grow">
              {scheduleLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                      <Loader className="w-8 h-8 animate-spin mb-2 text-sky-600"/>
                      <p>Đang tải lịch trình...</p>
                  </div>
              ) : (
                <>
                  {/* Chuyến đang chạy */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      Chuyến đang chạy
                    </h3>
                    {employeeSchedules.running.length > 0 ? (
                      <div className="space-y-3">
                        {employeeSchedules.running.map(trip => (
                          <div key={trip.id} className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-green-700">{trip.trainCode}</span>
                                <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded font-bold">LIVE</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 mb-1 font-medium">
                                 <MapPin className="w-4 h-4 text-green-600"/> {trip.route}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">{trip.time}</div>
                              <div className="text-sm text-gray-600">{trip.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm border border-dashed border-gray-300 rounded p-3 text-center">Nhân viên hiện không trong ca làm việc.</p>
                    )}
                  </div>

                  {/* Chuyến sắp tới & Lịch sử (Gộp chung để hiển thị) */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-sky-600"/>
                      Lịch trình tìm thấy ({employeeSchedules.upcoming.length + employeeSchedules.history.length})
                    </h3>
                    
                    {[...employeeSchedules.upcoming, ...employeeSchedules.history].length > 0 ? (
                      <div className="space-y-3">
                        {[...employeeSchedules.upcoming, ...employeeSchedules.history].map(trip => (
                          <div key={trip.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-sky-300 transition-colors flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Train className="w-5 h-5 text-gray-400"/>
                                    <span className="font-bold text-gray-800">{trip.trainCode}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${trip.status === 'Hoàn thành' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                                        {trip.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1 ml-7">{trip.route}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-gray-800">{trip.date}</div>
                                <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                                    <Clock className="w-3 h-3"/> {trip.time}
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-lg border border-gray-200 text-gray-500 flex flex-col items-center justify-center gap-2">
                        <Calendar className="w-10 h-10 text-gray-300"/>
                        <p>Không tìm thấy lịch trình nào trong khoảng thời gian này.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeManagement;