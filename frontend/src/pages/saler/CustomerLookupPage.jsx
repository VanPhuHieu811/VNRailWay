import React, { useState } from 'react';
import { 
  Search, User, Phone, Mail, CreditCard, Train, MapPin, 
  Clock, Armchair, AlertCircle, ArrowLeft, Printer, CheckCircle, RotateCcw, XCircle 
} from 'lucide-react';
import { KHACH_HANG_DB, LICH_SU_VE_DB } from '../../services/db_mock';
import '../../styles/pages/employee/CustomerLookupPage.css';

const CustomerLookupPage = () => {
  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);

  // State xem chi tiết vé
  const [selectedTicket, setSelectedTicket] = useState(null);

  // --- LOGIC TÌM KIẾM (Giữ nguyên) ---
  const normalizeCustomerData = (rawCustomer) => {
    return {
      id: rawCustomer.id || rawCustomer.maKhachHang,
      hoTen: rawCustomer.hoTen,
      sdt: rawCustomer.soDienThoai || rawCustomer.sdt,
      email: rawCustomer.email || 'Chưa cập nhật',
      cccd: rawCustomer.cccd,
      diaChi: rawCustomer.diaChi,
      hangThanhVien: rawCustomer.hangThanhVien || rawCustomer.loaiThanhVien
    };
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setHasSearched(true);
    setSelectedTicket(null); // Reset view chi tiết nếu tìm mới

    const term = searchTerm.toLowerCase().trim();
    const rawCustomer = KHACH_HANG_DB.find(k => {
      const id = (k.id || k.maKhachHang || '').toLowerCase();
      const phone = (k.soDienThoai || k.sdt || '').toLowerCase();
      const cccd = (k.cccd || '').toLowerCase();
      const name = (k.hoTen || '').toLowerCase();
      return id === term || phone === term || cccd === term || name.includes(term);
    });

    if (rawCustomer) {
      const standardizedCustomer = normalizeCustomerData(rawCustomer);
      setCustomer(standardizedCustomer);
      const foundHistory = LICH_SU_VE_DB.filter(v => v.khachHangId === standardizedCustomer.id);
      setHistory(foundHistory);
    } else {
      setCustomer(null);
      setHistory([]);
    }
  };

  // --- LOGIC STATUS ---
  const getStatusInfo = (status) => {
    switch (status) {
      case 'DaDi': return { text: 'Đã đi', class: 'dadi', bannerClass: 'success', icon: <CheckCircle size={20}/>, msg: 'Vé đã hoàn thành hành trình.' };
      case 'SapDi': return { text: 'Sắp đi', class: 'sapdi', bannerClass: 'warning', icon: <Clock size={20}/>, msg: 'Vé đã thanh toán. Sẵn sàng khởi hành.' };
      case 'DaHuy': return { text: 'Đã hủy', class: 'dahuy', bannerClass: 'danger', icon: <XCircle size={20}/>, msg: 'Vé đã bị hủy. Không còn hiệu lực.' };
      default: return { text: status, class: '', bannerClass: 'gray', icon: null, msg: '' };
    }
  };

  // --- LOGIC XỬ LÝ VIEW ---
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    // Scroll lên đầu trang cho đẹp
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // =========================================================
  // VIEW 1: CHI TIẾT VÉ (Render khi có selectedTicket)
  // =========================================================
  if (selectedTicket && customer) {
    const status = getStatusInfo(selectedTicket.trangThai);

    return (
      <div className="lookup-container">
        {/* Nút quay lại (ẩn khi in) */}
        <button className="btn-secondary btn-back-lookup mb-4 w-fit flex items-center gap-2 px-4 py-2" onClick={handleBackToList}>
          <ArrowLeft size={18}/> Quay lại danh sách
        </button>

        <div className="ticket-detail-container">
          
          {/* Banner trạng thái */}
          <div className={`status-banner ${status.bannerClass}`}>
            {status.icon}
            <span>{status.msg}</span>
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <h2>Thông tin vé</h2>
              <span className="text-slate-500 text-sm">Mã vé: {selectedTicket.maVe}</span>
            </div>

            {/* Thông tin khách hàng */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Thông tin khách hàng</h4>
              <div className="detail-row">
                <div className="detail-field">
                  <label>Họ và tên</label>
                  <p>{customer.hoTen}</p>
                </div>
                <div className="detail-field">
                  <label>Số điện thoại</label>
                  <p>{customer.sdt}</p>
                </div>
                <div className="detail-field">
                  <label>CMND/CCCD</label>
                  <p>{customer.cccd}</p>
                </div>
                <div className="detail-field">
                  <label>Ngày đặt vé</label>
                  <p>{selectedTicket.ngayDat}</p>
                </div>
              </div>
            </div>

            {/* Thông tin chuyến tàu */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Thông tin chuyến tàu</h4>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="block text-xl font-bold text-blue-700">{selectedTicket.tenTau}</span>
                  <span className="text-sm text-slate-500">Thống nhất</span>
                </div>
              </div>

              <div className="trip-route-display">
                <div className="station-point">
                  <span className="city">{selectedTicket.tuyen.split('→')[0].trim()}</span>
                  {/* Mock giờ đi dựa trên ngày khởi hành */}
                  <span className="time">{selectedTicket.thoiGianKhoiHanh.split(' ')[1]}</span>
                  <span className="text-xs text-slate-500">{selectedTicket.thoiGianKhoiHanh.split(' ')[0]}</span>
                </div>
                <div className="route-arrow">➝</div>
                <div className="station-point">
                  <span className="city">{selectedTicket.tuyen.split('→')[1].trim()}</span>
                  <span className="time">--:--</span>
                </div>
              </div>
            </div>

            {/* Thông tin ghế & Giá */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Thông tin chỗ ngồi</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-700">{selectedTicket.ghe}</p>
                  <span className="text-xs text-slate-500">Ghế mềm điều hòa</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-800">{selectedTicket.giaVe.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="detail-footer">
              <span className="text-lg font-bold text-slate-600">Tổng tiền</span>
              <span className="total-price">{selectedTicket.giaVe.toLocaleString()} ₫</span>
            </div>

            {/* Nút bấm (Ẩn khi in) */}
            <div className="action-bar">
              <button className="btn-print" onClick={handlePrint}>
                <Printer size={18}/> In vé
              </button>
              <button className="btn-secondary" onClick={handleBackToList}>
                <RotateCcw size={18} className="inline mr-2"/> Giao dịch khác
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: TÌM KIẾM & DANH SÁCH (Mặc định)
  // =========================================================
  return (
    <div className="lookup-container">
      <div className="page-header">
        <h1>Tra cứu lịch sử khách hàng</h1>
      </div>

      <div className="search-card">
        <label className="search-label">Thông tin tìm kiếm</label>
        <div className="search-input-group">
            <input 
            type="text" 
            className="search-input"
            placeholder="Nhập Mã KH, SĐT, CCCD hoặc Họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-search-lookup" onClick={handleSearch}>
            <Search size={18} /> Tìm kiếm
            </button>
        </div>
        <span className="search-hint">Gợi ý test: KH001, 0901234567, hoặc 0909999999</span>
      </div>

      {hasSearched && (
        customer ? (
          <div className="result-section animate-fade-in">
            
            {/* THÔNG TIN KHÁCH HÀNG */}
            <h3 className="info-section-title">Hồ sơ khách hàng: {customer.hoTen}</h3>
            <div className="customer-info-card">
              <div className="info-column space-y-4">
                <div className="info-group">
                  <div className="info-icon"><User size={20}/></div>
                  <div className="info-content">
                    <label>Mã khách hàng</label>
                    <p>{customer.id}</p>
                  </div>
                </div>
                <div className="info-group">
                  <div className="info-icon"><Phone size={20}/></div>
                  <div className="info-content">
                    <label>Số điện thoại</label>
                    <p>{customer.sdt}</p>
                  </div>
                </div>
                <div className="info-group">
                  <div className="info-icon"><CreditCard size={20}/></div>
                  <div className="info-content">
                    <label>CMND/CCCD</label>
                    <p>{customer.cccd}</p>
                  </div>
                </div>
              </div>

              <div className="info-column space-y-4">
                <div className="info-group">
                  <div className="info-icon"><Mail size={20}/></div>
                  <div className="info-content">
                    <label>Email</label>
                    <p>{customer.email}</p>
                  </div>
                </div>
                <div className="info-group">
                  <div className="info-icon"><MapPin size={20}/></div>
                  <div className="info-content">
                    <label>Địa chỉ</label>
                    <p>{customer.diaChi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LỊCH SỬ ĐẶT VÉ */}
            <h3 className="info-section-title">Lịch sử giao dịch ({history.length} vé)</h3>
            <div className="history-card">
              {history.length > 0 ? (
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Mã vé</th>
                        <th>Chuyến tàu</th>
                        <th>Hành trình</th>
                        <th>Khởi hành</th>
                        <th>Ghế</th>
                        <th>Giá vé</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th> {/* Thêm cột hành động */}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(item => {
                        const status = getStatusInfo(item.trangThai);
                        return (
                          <tr key={item.maVe} className="hover:bg-slate-50 transition">
                            <td><b className="text-blue-600">{item.maVe}</b></td>
                            <td>
                              <div className="train-badge">
                                <Train size={16} /> {item.tenTau}
                              </div>
                            </td>
                            <td>
                              <div className="flex flex-col text-sm">
                                <span>{item.tuyen}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1 text-slate-600 text-sm">
                                <Clock size={14}/> {item.thoiGianKhoiHanh}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1 text-slate-600 text-sm">
                                <Armchair size={14}/> {item.ghe}
                              </div>
                            </td>
                            <td className="price-text">{item.giaVe.toLocaleString()} đ</td>
                            <td>
                              <span className={`status-badge ${status.class}`}>
                                {status.text}
                              </span>
                            </td>
                            {/* Nút Xem chi tiết */}
                            <td>
                                <button 
                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                                    onClick={() => handleViewTicket(item)}
                                >
                                    Chi tiết
                                </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-result">
                    <p>Khách hàng này chưa có lịch sử đặt vé nào trong hệ thống.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="empty-result">
            <div className="mb-2 text-4xl">⚠️</div>
            <p className="text-lg font-semibold text-slate-700">Không tìm thấy khách hàng</p>
            <p className="text-sm">Vui lòng kiểm tra lại Số điện thoại, CCCD hoặc Mã khách hàng.</p>
          </div>
        )
      )}
    </div>
  );
};

export default CustomerLookupPage;