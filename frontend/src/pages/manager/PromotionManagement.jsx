import React, { useState } from 'react';
import { 
  Search, Bell, Plus, Tag, Calendar, 
  Power, Trash2, Eye, Gift, Percent, X 
} from 'lucide-react';

const PromotionManagement = () => {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dữ liệu mẫu ban đầu (Giống trong hình ảnh)
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      name: "Tết Nguyên Đán 2024",
      value: "20%",
      type: "percent", // percent hoặc fixed
      description: "Giảm giá 20% cho tất cả các chuyến tàu trong dịp Tết",
      startDate: "2024-01-20",
      endDate: "2024-02-15",
      used: 456,
      limit: 1000,
      status: "active" // active hoặc expired
    },
    {
      id: 2,
      name: "Sinh viên ưu đãi",
      value: "50.000đ",
      type: "fixed",
      description: "Giảm 50,000đ cho sinh viên có thẻ sinh viên hợp lệ",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      used: 2341,
      limit: 5000,
      status: "active"
    },
    {
      id: 3,
      name: "Khách hàng thân thiết",
      value: "15%",
      type: "percent",
      description: "Giảm 15% cho khách hàng có từ 5 chuyến trở lên",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      used: 0,
      limit: 1000,
      status: "active"
    },
    {
      id: 4,
      name: "Giáng sinh 2023",
      value: "25%",
      type: "percent",
      description: "Ưu đãi đặc biệt mùa Giáng sinh",
      startDate: "2023-12-15",
      endDate: "2023-12-31",
      used: 500,
      limit: 500,
      status: "expired"
    }
  ]);

  // State cho form tạo mới
  const [newPromo, setNewPromo] = useState({
    name: '',
    value: '',
    description: '',
    startDate: '',
    endDate: '',
    limit: 1000
  });

  // --- HANDLERS (Xử lý Use Case 8) ---

  // 1. Tạo ưu đãi mới
  const handleCreatePromotion = (e) => {
    e.preventDefault();
    const newId = promotions.length + 1;
    const newItem = {
      id: newId,
      ...newPromo,
      type: newPromo.value.includes('%') ? 'percent' : 'fixed',
      used: 0,
      status: 'active'
    };
    setPromotions([newItem, ...promotions]);
    setIsModalOpen(false); // Đóng modal
    // Reset form
    setNewPromo({ name: '', value: '', description: '', startDate: '', endDate: '', limit: 1000 });
  };

  // 2. Kết thúc sớm / Ngưng hoạt động (Toggle Status)
  const handleToggleStatus = (id) => {
    setPromotions(promotions.map(promo => {
      if (promo.id === id) {
        return { 
          ...promo, 
          status: promo.status === 'active' ? 'expired' : 'active' 
        };
      }
      return promo;
    }));
  };

  // 3. Xóa ưu đãi
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa ưu đãi này?")) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  // Tính toán số lượng đang hoạt động
  const activeCount = promotions.filter(p => p.status === 'active').length;

  // --- RENDER COMPONENTS ---

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý ưu đãi</h1>
          <p className="text-gray-500 text-sm">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        </div>
      </div>

      {/* ACTION BAR */}
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

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo ưu đãi mới
        </button>
      </div>

      {/* PROMOTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group hover:shadow-md transition-shadow">
            {/* Top Border Accent */}
            <div className={`h-1 w-full ${item.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            
            <div className="p-6">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.type === 'percent' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {item.type === 'percent' ? <Percent className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                    <div className="text-2xl font-bold text-blue-600 my-1">{item.value}</div>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {item.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                {item.description}
              </p>

              {/* Date & Usage */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>{item.startDate} → {item.endDate}</span>
              </div>


              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleToggleStatus(item.id)}
                  title={item.status === 'active' ? "Kết thúc ưu đãi" : "Kích hoạt lại"}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <Power className={`w-4 h-4 ${item.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                </button>
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  title="Xóa ưu đãi"
                  className="p-2 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CREATE MODAL (Use Case: Tạo ưu đãi mới) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Tạo ưu đãi mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePromotion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="VD: Khuyến mãi mùa hè"
                    value={newPromo.name}
                    onChange={e => setNewPromo({...newPromo, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm</label>
                    <input 
                      required
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="VD: 20% hoặc 50.000đ"
                      value={newPromo.value}
                      onChange={e => setNewPromo({...newPromo, value: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lượng</label>
                    <input 
                      required
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newPromo.limit}
                      onChange={e => setNewPromo({...newPromo, limit: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung / Điều kiện</label>
                  <textarea 
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Mô tả chi tiết ưu đãi..."
                    value={newPromo.description}
                    onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                    <input 
                      required
                      type="date" 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newPromo.startDate}
                      onChange={e => setNewPromo({...newPromo, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                    <input 
                      required
                      type="date" 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newPromo.endDate}
                      onChange={e => setNewPromo({...newPromo, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Xác nhận tạo
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