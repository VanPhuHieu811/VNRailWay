// src/services/db_mock.js
// --- 1. BẢNG TÀI KHOẢN (Authentication) ---
// VaiTro ở đây chỉ là loại người dùng cấp cao (NHAN_VIEN hoặc KHACH_HANG)
export const TAI_KHOAN_DB = [
  // --- NHÂN VIÊN ---
  {
    email: "admin@vnr.vn",
    username: "admin",
    password: "123",
    vaiTro: "NHAN_VIEN",
    refID: "NV001" // Khóa ngoại trỏ sang bảng NHAN_VIEN
  },
  {
    email: "sales@vnr.vn",
    username: "sales",
    password: "123",
    vaiTro: "NHAN_VIEN",
    refID: "NV002"
  },
  {
    email: "crew@vnr.vn",
    username: "crew",
    password: "123",
    vaiTro: "NHAN_VIEN",
    refID: "NV003"
  },
  // --- KHÁCH HÀNG ---
  {
    email: "khachhang@gmail.com",
    username: "khachhang",
    password: "123",
    vaiTro: "KHACH_HANG",
    refID: "KH001" // Khóa ngoại trỏ sang bảng KHACH_HANG
  }
];

// --- 2. BẢNG NHÂN VIÊN (Thông tin chi tiết & Phân quyền nội bộ) ---
export const NHAN_VIEN_DB = [
  {
    maNhanVien: "NV001",
    hoTen: "Trần Quản Lý",
    cccd: "079090000001",
    ngaySinh: "1985-05-15",
    gioTinh: "Nam",
    diaChi: "Quận 1, TP. Hồ Chí Minh",
    soDienThoai: "0901111111",
    loaiNhanVien: "MANAGER"
  },
  {
    maNhanVien: "NV002",
    hoTen: "Lê Bán Vé",
    cccd: "079090000002",
    ngaySinh: "1995-08-20",
    gioTinh: "Nữ",
    diaChi: "Đống Đa, Hà Nội",
    soDienThoai: "0902222222",
    loaiNhanVien: "SALES"
  },
  {
    maNhanVien: "NV003",
    hoTen: "Nguyễn Lái Tàu",
    cccd: "079090000003",
    ngaySinh: "1990-12-12",
    gioTinh: "Nam",
    diaChi: "Thanh Khê, Đà Nẵng",
    soDienThoai: "0903333333",
    loaiNhanVien: "CREW"
  }
];

// --- 3. BẢNG KHÁCH HÀNG ---
export const KHACH_HANG_DB = [
  {
    maKhachHang: "KH001",
    hoTen: "Phạm Văn Khách",
    loaiThanhVien: "Vàng",
    sdt: "0912345678",
    cccd: "012345678999"
  }
];
// 2. Dữ liệu Ga tàu
export const GA_TAU_DB = [
  { maGa: "HN", tenGa: "Hà Nội" },
  { maGa: "SG", tenGa: "TP.Hồ Chí Minh" },
  { maGa: "DN", tenGa: "Đà Nẵng" },
  { maGa: "HUE", tenGa: "Huế" },
  { maGa: "NT", tenGa: "Nha Trang" },
  { maGa: "VINH", tenGa: "Vinh" },
  { maGa: "HP", tenGa: "Hải Phòng" }
];

// 3. Dữ liệu Lịch trình (FULL DATA để test Date Line)
// Lưu ý: Tôi tạo dữ liệu xung quanh ngày 27/12/2025 để bạn test
export const LICH_TRINH_DB = [
  // --- NGÀY 26/12/2025 ---
  {
    id: "SE1-26",
    tenTau: "SE1",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-26",
    gioDi: "06:00",
    gioDen: "18:30",
    thoiGianChay: "36h 30m",
    choTrong: 50,
    giaVe: 890000
  },

  // --- NGÀY 27/12/2025 (Ngày mặc định tìm kiếm) ---
  {
    id: "SE1-27",
    tenTau: "SE1",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-27",
    gioDi: "06:00",
    gioDen: "18:30",
    thoiGianChay: "36h 30m",
    choTrong: 45,
    giaVe: 890000
  },
  {
    id: "SE3-27",
    tenTau: "SE3",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-27",
    gioDi: "19:00",
    gioDen: "07:30",
    thoiGianChay: "36h 30m",
    choTrong: 28,
    giaVe: 850000
  },
  {
    id: "SE7-27",
    tenTau: "SE7",
    loaiTau: "Bắc Nam",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-27",
    gioDi: "22:00",
    gioDen: "10:00",
    thoiGianChay: "36h 00m",
    choTrong: 60,
    giaVe: 720000
  },

  // --- NGÀY 28/12/2025 ---
  {
    id: "SE1-28",
    tenTau: "SE1",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-28",
    gioDi: "06:00",
    gioDen: "18:30",
    thoiGianChay: "36h 30m",
    choTrong: 12,
    giaVe: 920000 // Giá cao hơn xíu
  },
  {
    id: "TN1-28",
    tenTau: "TN1",
    loaiTau: "Thường",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-28",
    gioDi: "14:00",
    gioDen: "05:00",
    thoiGianChay: "39h 00m",
    choTrong: 80,
    giaVe: 650000
  },

  // --- NGÀY 29/12/2025 ---
  {
    id: "SE3-29",
    tenTau: "SE3",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-12-29",
    gioDi: "19:00",
    gioDen: "07:30",
    thoiGianChay: "36h 30m",
    choTrong: 5,
    giaVe: 850000
  }
];

// 4. Hàm sinh dữ liệu ghế (Mock Seats)
export const getGheByTauId = (tripId) => {
  // Logic giả: Tàu SE1 thì ghế đẹp hơn, tàu TN1 thì ghế thường
  // Ở đây trả về cố định để test cho dễ
  return [
    {
      maToa: "A",
      tenToa: "Toa 1 (VIP)",
      loaiToa: "Giường nằm mềm",
      giaCoBan: 1200000,
      soGhe: 20, 
      gheDaDat: [2, 5, 6, 18, 19] // Ghế đã bán
    },
    {
      maToa: "B",
      tenToa: "Toa 2 (Standard)",
      loaiToa: "Ghế mềm điều hòa",
      giaCoBan: 890000,
      soGhe: 30,
      gheDaDat: [10, 11, 12, 25, 26, 1, 2, 3]
    },
    {
      maToa: "C",
      tenToa: "Toa 3 (Economy)",
      loaiToa: "Ghế cứng", 
      giaCoBan: 650000,
      soGhe: 40,
      gheDaDat: [1, 5, 8, 9, 20, 21]
    }
  ];
};

// 5. Dữ liệu Lịch sử vé đã đặt
export const VE_DA_DAT_DB = [
  {
    maVe: "TK1763952793154",
    ngayDat: "2025-12-25T10:30:00",
    tripInfo: {
      tenTau: "SE1",
      gaDi: "Hà Nội",
      gaDen: "TP.Hồ Chí Minh",
      ngayDi: "2025-12-28",
      gioDi: "06:00",
      gioDen: "18:30"
    },
    seats: [
      { 
        id: "B-4", 
        maToa: "B", 
        seatNum: 4, 
        loaiToa: "Standard", 
        price: 890000,
        passengerName: "Nguyễn Văn A", // Thêm tên khách
        passengerID: "0123456789"      // Thêm CMND
      },
      { 
        id: "B-5", 
        maToa: "B", 
        seatNum: 5, 
        loaiToa: "Standard", 
        price: 890000,
        passengerName: "Trần Thị B", 
        passengerID: "9876543210"
      }
    ],
    totalPrice: 1780000,
    status: "active"
  },
  {
    maVe: "TK998877665544",
    ngayDat: "2025-11-20T08:00:00",
    tripInfo: {
      tenTau: "SE3",
      gaDi: "Đà Nẵng",
      gaDen: "Huế",
      ngayDi: "2025-12-30", // Tương lai -> Có thể đổi
      gioDi: "14:00",
      gioDen: "16:30"
    },
    seats: [
      { maToa: "A", seatNum: 12, loaiToa: "VIP", price: 150000 }
    ],
    totalPrice: 150000,
    status: "active"
  },
  {
    maVe: "TK112233445566",
    ngayDat: "2024-01-15T09:00:00",
    tripInfo: {
      tenTau: "TN1",
      gaDi: "Sài Gòn",
      gaDen: "Nha Trang",
      ngayDi: "2024-02-01", // Quá khứ -> Không thể đổi
      gioDi: "20:00",
      gioDen: "05:00"
    },
    seats: [
      { maToa: "C", seatNum: 20, loaiToa: "Ghế cứng", price: 250000 },
      { maToa: "C", seatNum: 21, loaiToa: "Ghế cứng", price: 250000 }
    ],
    totalPrice: 500000,
    status: "used" // Đã sử dụng
  }
];

// ... (Các dữ liệu cũ giữ nguyên)
// src/services/db_mock.js

// 6. Dữ liệu Lương Nhân viên (Mock Salary) - ĐÃ CẬP NHẬT
export const LUONG_DB = [
  // --- 1. NHÂN VIÊN QUẢN LÝ (NV001) ---
  {
    id: "SAL-2024-03-NV001",
    maNhanVien: "NV001",
    thang: 3,
    nam: 2024,
    trangThai: "Đã thanh toán",
    ngayThanhToan: "05/04/2024",
    luongCoBan: 12000000,
    phuCapChucVu: 2000000,
    phuCapDiLai: 1000000,
    phuCapAnCa: 800000,
    phuCapKhac: 500000,
    thuong: 1800000,
    baoHiem: 1200000,
    thueTNCN: 900000,
    khauTruKhac: 200000,
    soChuyen: 26, // Số ngày công
    soCaThay: 2,
    soNgayNghi: 0
  },
  {
    id: "SAL-2024-02-NV001",
    maNhanVien: "NV001",
    thang: 2,
    nam: 2024,
    trangThai: "Đã thanh toán",
    ngayThanhToan: "05/03/2024",
    luongCoBan: 12000000,
    phuCapChucVu: 2000000,
    phuCapDiLai: 1000000,
    phuCapAnCa: 750000,
    phuCapKhac: 500000,
    thuong: 500000,
    baoHiem: 1200000,
    thueTNCN: 850000,
    khauTruKhac: 0,
    soChuyen: 20,
    soCaThay: 0,
    soNgayNghi: 2
  },

  // --- 2. NHÂN VIÊN BÁN VÉ (NV002) ---
  {
    id: "SAL-2024-03-NV002",
    maNhanVien: "NV002",
    thang: 3,
    nam: 2024,
    trangThai: "Đã thanh toán",
    ngayThanhToan: "05/04/2024",
    // Sales lương cứng thấp hơn, phụ cấp chức vụ ít hơn
    luongCoBan: 8000000,
    phuCapChucVu: 500000,
    phuCapDiLai: 500000,
    phuCapAnCa: 1000000, // Ăn ca tại quầy
    phuCapKhac: 200000,
    thuong: 3000000, // Thưởng doanh số cao
    baoHiem: 850000,
    thueTNCN: 500000,
    khauTruKhac: 0,
    soChuyen: 28, // Làm việc theo ca (shifts)
    soCaThay: 4,
    soNgayNghi: 0
  },
  {
    id: "SAL-2024-02-NV002",
    maNhanVien: "NV002",
    thang: 2,
    nam: 2024,
    trangThai: "Đã thanh toán",
    ngayThanhToan: "05/03/2024",
    luongCoBan: 8000000,
    phuCapChucVu: 500000,
    phuCapDiLai: 500000,
    phuCapAnCa: 900000,
    phuCapKhac: 200000,
    thuong: 4500000, // Tháng tết thưởng cao
    baoHiem: 850000,
    thueTNCN: 750000,
    khauTruKhac: 100000, // Phạt đi muộn
    soChuyen: 24,
    soCaThay: 0,
    soNgayNghi: 1
  },

  // --- 3. NHÂN VIÊN LÁI TÀU (NV003) ---
  {
    id: "SAL-2024-03-NV003",
    maNhanVien: "NV003",
    thang: 3,
    nam: 2024,
    trangThai: "Đã thanh toán",
    ngayThanhToan: "05/04/2024",
    // Lái tàu lương cứng khá, phụ cấp độc hại/đi lại cao
    luongCoBan: 11000000,
    phuCapChucVu: 1000000, // Trưởng tàu/Lái chính
    phuCapDiLai: 2000000, // Di chuyển liên tục
    phuCapAnCa: 2500000, // Ăn uống trên tàu
    phuCapKhac: 1000000, // Phụ cấp độc hại
    thuong: 1000000, // Thưởng an toàn
    baoHiem: 1100000,
    thueTNCN: 1200000,
    khauTruKhac: 0,
    soChuyen: 12, // Số chuyến tàu Bắc Nam (dài ngày)
    soCaThay: 1,
    soNgayNghi: 3
  },
  {
    id: "SAL-2024-02-NV003",
    maNhanVien: "NV003",
    thang: 2,
    nam: 2024,
    trangThai: "Đã thanh toán",
    ngayThanhToan: "05/03/2024",
    luongCoBan: 11000000,
    phuCapChucVu: 1000000,
    phuCapDiLai: 2200000,
    phuCapAnCa: 2800000, // Tháng Tết chạy nhiều
    phuCapKhac: 1000000,
    thuong: 3000000, // Thưởng Tết
    baoHiem: 1100000,
    thueTNCN: 2000000, // Thuế cao do tổng thu nhập cao
    khauTruKhac: 0,
    soChuyen: 15,
    soCaThay: 0,
    soNgayNghi: 0
  }
];

// 7. Dữ liệu Phân công Lịch làm việc (Work Schedule)
export const PHAN_CONG_DB = [
  {
    id: "PC-001",
    maNhanVien: "NV003", // Lái tàu
    maChuyenTau: "SE1",
    tenTau: "SE1",
    tuyen: "Hà Nội - Sài Gòn",
    ngayKhoiHanh: "2025-11-24", // Thứ Hai
    gioDi: "19:00",
    gioDen: "04:30",
    doanTau: "DT-001",
    toa: "",
    vaiTro: "Trưởng tàu",
    trangThai: "SapKhoiHanh" // SapKhoiHanh, DangChay, DaHoanThanh
  },
  {
    id: "PC-002",
    maNhanVien: "NV003",
    maChuyenTau: "SE3",
    tenTau: "SE3",
    tuyen: "Hà Nội - Đà Nẵng",
    ngayKhoiHanh: "2025-11-25", // Thứ Ba
    gioDi: "06:00",
    gioDen: "18:30",
    doanTau: "DT-002",
    toa: "Toa 5",
    vaiTro: "Phụ tàu",
    trangThai: "SapKhoiHanh"
  },
  {
    id: "PC-003",
    maNhanVien: "NV003",
    maChuyenTau: "SE7",
    tenTau: "SE7",
    tuyen: "Sài Gòn - Nha Trang",
    ngayKhoiHanh: "2025-11-26", // Thứ Tư
    gioDi: "22:00",
    gioDen: "07:30",
    doanTau: "DT-003",
    toa: "",
    vaiTro: "Trưởng tàu",
    trangThai: "SapKhoiHanh"
  },
  {
    id: "PC-004",
    maNhanVien: "NV003",
    maChuyenTau: "SE2",
    tenTau: "SE2",
    tuyen: "Sài Gòn - Hà Nội",
    ngayKhoiHanh: "2025-11-23", // Chủ Nhật
    gioDi: "19:30",
    gioDen: "05:00",
    doanTau: "DT-005",
    toa: "",
    vaiTro: "Trưởng tàu",
    trangThai: "DangChay"
  },
  {
    id: "PC-005",
    maNhanVien: "NV003",
    maChuyenTau: "SE4",
    tenTau: "SE4",
    tuyen: "Đà Nẵng - Hà Nội",
    ngayKhoiHanh: "2025-11-22", // Thứ Bảy
    gioDi: "08:00",
    gioDen: "20:30",
    doanTau: "DT-006",
    toa: "Toa 4",
    vaiTro: "Phụ tàu",
    trangThai: "DaHoanThanh"
  },
  {
    id: "PC-006", // Chuyến này để test xin nghỉ
    maNhanVien: "NV003",
    maChuyenTau: "SE5",
    tenTau: "SE5",
    tuyen: "Hà Nội - Sài Gòn",
    ngayKhoiHanh: "2026-02-15", // Tương lai xa
    gioDi: "09:00",
    gioDen: "19:30",
    doanTau: "DT-002",
    toa: "",
    vaiTro: "Lái tàu",
    trangThai: "SapKhoiHanh"
  },
  {
    id: "PC-007", // Chuyến này để test xin nghỉ
    maNhanVien: "NV003",
    maChuyenTau: "TN1",
    tenTau: "TN1",
    tuyen: "Hà Nội - Vinh",
    ngayKhoiHanh: "2026-02-20", 
    gioDi: "14:00",
    gioDen: "20:00",
    doanTau: "DT-004",
    toa: "",
    vaiTro: "Lái tàu",
    trangThai: "SapKhoiHanh"
  }
];

// 8. MỚI: Dữ liệu Đơn nghỉ phép (History)
export const DON_NGHI_PHEP_DB = [
  {
    id: "DNP-001",
    maNhanVien: "NV003",
    maPhanCong: "PC-004", // Link tới mã phân công cũ
    tenTau: "SE4",
    tuyen: "TP. Hồ Chí Minh - Hà Nội",
    ngayKhoiHanh: "2025-01-05",
    gioDi: "06:00",
    gioDen: "05:00",
    lyDo: "Lý do gia đình - có việc quan trọng cần giải quyết",
    trangThai: "ChoDuyet", // ChoDuyet, DaDuyet, TuChoi
    ngayTao: "28/12/2024"
  },
  {
    id: "DNP-002",
    maNhanVien: "NV003",
    tenTau: "SE1",
    tuyen: "Hà Nội - TP. Hồ Chí Minh",
    ngayKhoiHanh: "2024-12-20",
    gioDi: "19:30",
    gioDen: "04:30",
    lyDo: "Khám sức khỏe định kỳ",
    trangThai: "DaDuyet",
    ngayTao: "15/12/2024"
  }
];