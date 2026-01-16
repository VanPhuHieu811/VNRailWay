import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Tag, Calendar, 
  Power, Trash2, Edit, Percent, X, Filter, Info 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the service we created in Step 1
import { 
  getPromotions, 
  createPromotion, 
  updatePromotion 
} from '../../services/promotionApi.js';


const PromotionManagement = () => {
  // --- STATE ---
  const [promotions, setPromotions] = useState([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [hasExistingEndDate, setHasExistingEndDate] = useState(false); 

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('default');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
    startDate: '',
    endDate: '',
    limit: 1000
  });

  // --- HELPER: GET TODAY STRING (YYYY-MM-DD) ---
  const getTodayString = () => {
    const d = new Date();
    // 'en-CA' outputs YYYY-MM-DD format based on local time
    return d.toLocaleDateString('en-CA'); 
  };

  const notifySuccess = (message) => {
    toast.success(message, {
      icon: <Info className="text-white" size={20} />, 
    });
  };

  // --- DATA MAPPING ---
  const mapBackendToFrontend = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rawData.map((item, index) => {
      let status = 'expired';
      const backendStatus = item.TrangThai || '';
      
      let isDateExpired = false;
      if (item.NgayKetThuc) {
        const endDate = new Date(item.NgayKetThuc);
        // Normalize time for comparison
        endDate.setHours(0, 0, 0, 0); 
        if (endDate < today) isDateExpired = true;
      }

      if (isDateExpired) {
        status = 'expired';
      } else {
        if (backendStatus === 'Đang áp dụng' || backendStatus.toLowerCase() === 'active') {
          status = 'active';
        } else if (backendStatus === 'Tạm ngưng') {
          status = 'suspended';
        } else {
          status = 'expired';
        }
      }

      return {
        id: item.MaUuDai || item._id || item.id || `promo-${index}`,
        name: item.LoaiUuDai || "",
        description: item.MoTa || "",
        value: item.PhanTram ? `${item.PhanTram}%` : '0%',
        numericValue: item.PhanTram || 0,
        startDate: item.NgayBatDau ? item.NgayBatDau.split('T')[0] : '',
        endDate: item.NgayKetThuc ? item.NgayKetThuc.split('T')[0] : '',
        status: status,
        originalStatus: item.TrangThai,
      };
    });
  };

  // --- FETCH DATA ---
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const response = await getPromotions(''); 
      let dataLocation = response.data || response;
      
      if (dataLocation?.data && Array.isArray(dataLocation.data)) {
        dataLocation = dataLocation.data;
      }
      if (Array.isArray(dataLocation) && Array.isArray(dataLocation[0])) {
        dataLocation = dataLocation[0];
      }
      if (!Array.isArray(dataLocation)) dataLocation = [];

      setPromotions(mapBackendToFrontend(dataLocation));
    } catch (error) {
      console.error("Failed to fetch", error);
      toast.error("Không thể tải dữ liệu"); 
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTERING ---
  const filteredPromotions = promotions.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(term) ||
      item.value.includes(term) || 
      item.startDate.includes(term) || 
      item.endDate.includes(term);

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'default') return item.status === 'active' || item.status === 'suspended';
    return item.status === filterStatus;
  });

  // --- HANDLERS ---

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setHasExistingEndDate(false);
    setFormData({ name: '', value: '', description: '', startDate: '', endDate: '', limit: 1000 });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setHasExistingEndDate(!!item.endDate); 

    setFormData({
      name: item.name,
      value: item.numericValue,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      limit: 1000
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Percentage Validation
    const percentValue = parseInt(String(formData.value).replace(/\D/g, '')) || 0;
    if (percentValue <= 0 || percentValue > 100) {
      toast.error("Giá trị phần trăm không hợp lệ (1-100%)");
      return;
    }

    // 2. Date Validation Preparation
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const start = new Date(formData.startDate);
    start.setHours(0,0,0,0);

    // 3. Start Date Logic: Must be Today or Future (Only for Create Mode)
    // In Edit mode, start date is locked, so we skip this check to avoid errors on old promotions.
    if (!isEditMode) {
        if (start < today) {
            toast.error("Ngày bắt đầu không được ở trong quá khứ");
            return;
        }
    }

    // 4. End Date Logic: Must be > Start Date
    if (formData.endDate) {
        const end = new Date(formData.endDate);
        end.setHours(0,0,0,0);

        if (end < today) {
            toast.error("Ngày kết thúc không được ở trong quá khứ");
            return;
        }

        if (end <= start) {
            toast.error("Ngày kết thúc phải sau ngày bắt đầu");
            return;
        }
    }

    try {
      if (isEditMode) {
        // UPDATE
        const updatePayload = {
          loaiUuDai: formData.name,
          moTa: formData.description,
          phanTram: percentValue,
          ...(formData.endDate ? { ngayKetThuc: formData.endDate } : {})
        };

        await updatePromotion(editingId, updatePayload);
        notifySuccess("Cập nhật ưu đãi thành công!"); 
      } else {
        // CREATE
        const createPayload = {
          loaiUuDai: formData.name,
          moTa: formData.description,
          doiTuong: "Tất cả", 
          phanTram: percentValue,
          ngayBatDau: formData.startDate,
          ngayKetThuc: formData.endDate || null,
          trangThai: "Đang áp dụng"
        };
        await createPromotion(createPayload);
        notifySuccess("Tạo ưu đãi mới thành công!"); 
      }

      setIsModalOpen(false);
      fetchData(true);
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? "Lỗi khi cập nhật" : "Lỗi khi tạo mới");
    }
  };

  const handleToggleStatus = async (item) => {
    if (item.status === 'expired') return;

    const newStatusString = item.status === 'active' ? 'Tạm ngưng' : 'Đang áp dụng';
    const msg = item.status === 'active' ? 'Đã tạm ngưng ưu đãi' : 'Đã kích hoạt ưu đãi';

    try {
      await updatePromotion(item.id, { trangThai: newStatusString });
      notifySuccess(msg); 
      fetchData(true); 
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (item) => {
    if (item.status === 'expired') return;

    if (window.confirm(`Bạn có chắc muốn xóa ưu đãi "${item.name}"?`)) {
      try {
        await updatePromotion(item.id, { trangThai: 'Hết hạn' }); 
        notifySuccess("Đã xóa ưu đãi thành công"); 
        fetchData(true);
      } catch (error) {
        toast.error("Lỗi khi xóa ưu đãi");
      }
    }
  };

  const activeCount = promotions.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý ưu đãi</h1>
          <p className="text-gray-500 text-sm">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-medium"
                >
                    <option value="default">Mặc định</option>
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="suspended">Tạm ngưng</option>
                    <option value="expired">Đã hết hạn</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* DASHBOARD STATS */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Tag className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{activeCount}</h2>
            <p className="text-xs text-gray-500">Đang hoạt động</p>
          </div>
        </div>

        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all">
          <Plus className="w-5 h-5" />
          Tạo ưu đãi mới
        </button>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPromotions.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden relative transition-all hover:shadow-md ${item.status === 'expired' ? 'opacity-75 bg-gray-50 border-gray-200' : 'border-gray-200'}`}>
              
              <div className={`h-1 w-full ${
                  item.status === 'active' ? 'bg-blue-500' : 
                  item.status === 'suspended' ? 'bg-yellow-400' : 'bg-gray-400'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        item.status === 'expired' ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600'
                    }`}>
                       <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${item.status === 'expired' ? 'text-gray-500' : 'text-gray-800'}`}>{item.name}</h3>
                      <div className={`text-2xl font-bold my-1 ${item.status === 'expired' ? 'text-gray-400' : 'text-blue-600'}`}>{item.value}</div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    item.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 
                    item.status === 'suspended' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                    'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {item.status === 'active' ? 'Đang hoạt động' : 
                     item.status === 'suspended' ? 'Tạm ngưng' : 'Đã hết hạn'}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{item.startDate} {item.endDate ? `→ ${item.endDate}` : '(Vô thời hạn)'}</span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => openEditModal(item)}
                    disabled={item.status === 'expired'}
                    title="Chỉnh sửa thông tin"
                    className={`p-2 border rounded-lg transition-colors ${
                        item.status === 'expired' 
                        ? 'cursor-not-allowed bg-gray-100 text-gray-300 border-gray-200' 
                        : 'hover:bg-blue-50 text-blue-600 border-blue-100 bg-blue-50'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleToggleStatus(item)} 
                    disabled={item.status === 'expired'}
                    title="Bật/Tắt trạng thái"
                    className={`p-2 border rounded-lg transition-colors ${
                        item.status === 'expired' ? 'cursor-not-allowed bg-gray-100 text-gray-300 border-gray-200' : 
                        'hover:bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    <Power className={`w-4 h-4 ${
                        item.status === 'active' ? 'text-green-600' : 
                        item.status === 'suspended' ? 'text-yellow-500' : 'text-gray-300'
                    }`} />
                  </button>

                  <button 
                    onClick={() => handleDelete(item)} 
                    disabled={item.status === 'expired'}
                    title="Xóa ưu đãi"
                    className={`p-2 border rounded-lg transition-colors ${
                        item.status === 'expired' 
                        ? 'cursor-not-allowed bg-gray-100 text-gray-300 border-gray-200' 
                        : 'border-red-100 bg-red-50 hover:bg-red-100 text-red-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UNIFIED MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Cập nhật ưu đãi' : 'Tạo ưu đãi mới'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Tên ưu đãi</label>
                      <input 
                        required 
                        className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 ring-blue-500 outline-none" 
                        placeholder="VD: Khách hàng VIP" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Mô tả</label>
                      <input 
                        required 
                        className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 ring-blue-500 outline-none" 
                        placeholder="VD: Giảm giá trọn đời cho thẻ VIP" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Percentage */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Giảm giá (%)</label>
                        <input 
                            required 
                            type="number" 
                            min="1"
                            max="100"
                            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 ring-blue-500 outline-none" 
                            placeholder="VD: 1" 
                            value={formData.value} 
                            onChange={e => setFormData({...formData, value: e.target.value})} 
                        />
                      </div>
                      
                      {/* Start Date */}
                      <div>
                         <label className="block text-sm font-medium mb-1 text-gray-700">
                             Ngày bắt đầu {isEditMode && "(Không thể thay đổi)"}
                         </label>
                         <input 
                            required 
                            type="date"
                            min={!isEditMode ? getTodayString() : undefined} // UI Constraint: Cannot pick past dates
                            disabled={isEditMode} 
                            className={`border border-gray-300 p-2 rounded-lg w-full focus:ring-2 ring-blue-500 outline-none ${
                                isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                            }`}
                            value={formData.startDate} 
                            onChange={e => setFormData({...formData, startDate: e.target.value})} 
                        />
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                         <label className="block text-sm font-medium mb-1 text-gray-700">
                             Ngày kết thúc {isEditMode && hasExistingEndDate && "(Không thể thay đổi)"}
                         </label>
                         <input 
                            type="date" 
                            // UI Constraint: Cannot pick date before start date
                            min={formData.startDate || getTodayString()}
                            disabled={isEditMode && hasExistingEndDate}
                            className={`border border-gray-300 p-2 rounded-lg w-full focus:ring-2 ring-blue-500 outline-none ${
                                isEditMode && hasExistingEndDate ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                            }`}
                            value={formData.endDate} 
                            onChange={e => setFormData({...formData, endDate: e.target.value})} 
                         />
                         {!isEditMode && <p className="text-xs text-gray-500 mt-1">Để trống nếu không có thời hạn.</p>}
                         {isEditMode && !hasExistingEndDate && <p className="text-xs text-blue-500 mt-1">Bạn có thể thiết lập ngày kết thúc ngay bây giờ.</p>}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Hủy bỏ</button>
                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                            {isEditMode ? 'Lưu thay đổi' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default PromotionManagement;