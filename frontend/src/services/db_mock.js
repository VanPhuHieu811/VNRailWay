// src/services/db_mock.js

// 1. Dữ liệu Tài khoản (Mô phỏng bảng TaiKhoan trong SQL)
export const TAI_KHOAN_DB = [
  {
    MaTK: 1,
    TenDangNhap: "admin",
    MatKhau: "123", // Trong thực tế sẽ là hash, ở đây để plain text test cho dễ
    HoTen: "Trần Văn Quản Trị",
    CMND: "0123456789",
    SDT: "0988888888",
    Email: "admin@vnrailway.com",
    VaiTro: "Quản trị" // Theo đúng yêu cầu của bạn
  },
  {
    MaTK: 2,
    TenDangNhap: "nhanvien",
    MatKhau: "123",
    HoTen: "Nguyễn Thị Nhân Viên",
    CMND: "9876543210",
    SDT: "0977777777",
    Email: "staff@vnrailway.com",
    VaiTro: "Nhân viên" // Theo đúng yêu cầu của bạn
  },
  {
    MaTK: 3,
    TenDangNhap: "khachhang",
    MatKhau: "123",
    HoTen: "Lê Văn Khách",
    CMND: "111222333",
    SDT: "0912345678",
    Email: "khach@gmail.com",
    VaiTro: "Khách hàng" // Theo đúng yêu cầu của bạn
  }
];

export const GA_TAU_DB = [
  { maGa: "HN", tenGa: "Hà Nội" },
  { maGa: "SG", tenGa: "Sài Gòn" },
  { maGa: "DN", tenGa: "Đà Nẵng" },
  { maGa: "HUE", tenGa: "Huế" },
  { maGa: "NT", tenGa: "Nha Trang" },
  { maGa: "VINH", tenGa: "Vinh" },
  { maGa: "HP", tenGa: "Hải Phòng" }
];


export const LICH_TRINH_DB = [
  {
    id: "SE1",
    tenTau: "SE1",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-11-24", // Giả sử trùng ngày tìm kiếm
    gioDi: "06:00",
    gioDen: "18:30",
    thoiGianChay: "12h 30m",
    choTrong: 45,
    giaVe: 890000
  },
  {
    id: "SE3",
    tenTau: "SE3",
    loaiTau: "Thống nhất",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-11-24",
    gioDi: "19:00",
    gioDen: "07:30",
    thoiGianChay: "12h 30m",
    choTrong: 28,
    giaVe: 850000
  },
  {
    id: "SE7",
    tenTau: "SE7",
    loaiTau: "Bắc Nam",
    gaDi: "HN",
    gaDen: "SG",
    ngayDi: "2025-11-24",
    gioDi: "20:00",
    gioDen: "09:00",
    thoiGianChay: "13h 00m",
    choTrong: 50,
    giaVe: 720000
  }
];