// src/services/db_mock.js

// 1. Dữ liệu Tài khoản (Users)
export const TAI_KHOAN_DB = [
  {
    MaTK: 1,
    TenDangNhap: "admin",
    MatKhau: "123",
    HoTen: "Trần Văn Quản Trị",
    CMND: "0123456789",
    SDT: "0988888888",
    Email: "admin@vnrailway.com",
    VaiTro: "quản trị"
  },
  {
    MaTK: 2,
    TenDangNhap: "staff",
    MatKhau: "123",
    HoTen: "Nguyễn Thị Nhân Viên",
    CMND: "9876543210",
    SDT: "0977777777",
    Email: "staff@vnrailway.com",
    VaiTro: "nhân viên"
  },
  {
    MaTK: 3,
    TenDangNhap: "khachhang",
    MatKhau: "123",
    HoTen: "Lê Văn Khách",
    CMND: "111222333",
    SDT: "0912345678",
    Email: "khach@gmail.com",
    VaiTro: "khách hàng"
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