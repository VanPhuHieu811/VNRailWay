-- =============================================
-- 1. TẠO DATABASE & THIẾT LẬP MÔI TRƯỜNG
-- =============================================
USE master
GO
IF DB_ID(N'VNRAILWAY') IS NOT NULL
BEGIN
    ALTER DATABASE VNRAILWAY SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE VNRAILWAY;
END;
GO
CREATE DATABASE VNRAILWAY;
GO
USE VNRAILWAY;
GO

-- =============================================
-- PHẦN 1: CÁC BẢNG DANH MỤC & THAM SỐ
-- =============================================

-- 1. Bảng THAM_SO
CREATE TABLE THAM_SO (
    MaThamSo VARCHAR(10) NOT NULL,
    TenThamSo NVARCHAR(100),
    GiaTriSo FLOAT,
    GiaTriChuoi NVARCHAR(255),
    NgayHieuLuc DATETIME,
    NgayHetHieuLuc DATETIME,
    MoTa NVARCHAR(255),
    CONSTRAINT PK_THAM_SO PRIMARY KEY (MaThamSo)
);

-- 2. Bảng GA_TAU
CREATE TABLE GA_TAU (
    MaGaTau VARCHAR(10) NOT NULL,
    TenGa NVARCHAR(100) NOT NULL,
    DiaChi NVARCHAR(255) NOT NULL,
    CONSTRAINT PK_GA_TAU PRIMARY KEY (MaGaTau)
);

-- 3. Bảng UU_DAI_GIA
CREATE TABLE UU_DAI_GIA (
    MaUuDai VARCHAR(10) NOT NULL,
    LoaiUuDai NVARCHAR(50),
    MoTa NVARCHAR(255),
    DoiTuong NVARCHAR(50),
    PhanTram INT,
    CONSTRAINT PK_UU_DAI_GIA PRIMARY KEY (MaUuDai),
    CONSTRAINT CK_PhanTramUuDai CHECK (PhanTram >= 0 AND PhanTram <= 100)
);

-- =============================================
-- PHẦN 2: QUẢN LÝ TÀU & TUYẾN
-- =============================================

-- 4. Bảng DOAN_TAU
CREATE TABLE DOAN_TAU (
    MaDoanTau VARCHAR(10) NOT NULL,
    TenTau NVARCHAR(100) NOT NULL,
    HangSanXuat NVARCHAR(100),
    NgayVanHanh DATE NOT NULL,
    LoaiTau NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_DOAN_TAU PRIMARY KEY (MaDoanTau),
    CONSTRAINT CK_LoaiTau CHECK (LoaiTau IN (N'Hạng sang', N'Bình thường'))
);
-- [Trigger Note]: Cần Trigger kiểm tra "Tổng số km chạy trong tuần [0;5000]" (RB-161) nếu lưu lịch sử chạy ở bảng khác.

-- 5. Bảng TOA_TAU
CREATE TABLE TOA_TAU (
    MaToaTau VARCHAR(10) NOT NULL,
    MaDoanTau VARCHAR(10) NOT NULL,
    STT INT NOT NULL,
    LoaiToa NVARCHAR(10) NOT NULL,
    SLViTri INT,
    CONSTRAINT PK_TOA_TAU PRIMARY KEY (MaToaTau),
    CONSTRAINT FK_TOA_TAU_DOAN_TAU FOREIGN KEY (MaDoanTau) REFERENCES DOAN_TAU(MaDoanTau),
    CONSTRAINT CK_LoaiToa CHECK (LoaiToa IN (N'Ghế', N'Giường'))
);

-- 6. Bảng VI_TRI_TREN_TOA
CREATE TABLE VI_TRI_TREN_TOA (
    MaViTri VARCHAR(10) NOT NULL,
    MaToaTau VARCHAR(10) NOT NULL,
    STT INT,
    LoaiVT NVARCHAR(10) NOT NULL,
    CONSTRAINT PK_VI_TRI_TREN_TOA PRIMARY KEY (MaViTri),
    CONSTRAINT FK_VITRI_TOATAU FOREIGN KEY (MaToaTau) REFERENCES TOA_TAU(MaToaTau),
    CONSTRAINT CK_LoaiVT CHECK (LoaiVT IN (N'Ghế', N'Giường'))
);

-- 7. Bảng GIUONG
CREATE TABLE GIUONG (
    MaViTri VARCHAR(10) NOT NULL,
    Tang INT,
    Phong INT,
    CONSTRAINT PK_GIUONG PRIMARY KEY (MaViTri),
    CONSTRAINT FK_GIUONG_VITRI FOREIGN KEY (MaViTri) REFERENCES VI_TRI_TREN_TOA(MaViTri)
);
-- [Trigger Note]: Cần Trigger kiểm tra "Giường tầng thấp giá > Giường tầng cao" (RB-152) khi nhập giá vào bảng CHINH_SACH_GIA.

-- 8. Bảng TUYEN_TAU
CREATE TABLE TUYEN_TAU (
    MaTuyenTau VARCHAR(10) NOT NULL,
    TenTuyen NVARCHAR(50),
    KhoangCach FLOAT,
    CONSTRAINT PK_TUYEN_TAU PRIMARY KEY (MaTuyenTau)
);

-- 9. Bảng DANH_SACH_GA
CREATE TABLE DANH_SACH_GA (
    MaTuyenTau VARCHAR(10) NOT NULL,
    MaGaTau VARCHAR(10) NOT NULL,
    ThuTu INT,
    KhoangCach FLOAT,
    CONSTRAINT PK_DANH_SACH_GA PRIMARY KEY (MaTuyenTau, MaGaTau),
    CONSTRAINT FK_DSGA_TUYENTAU FOREIGN KEY (MaTuyenTau) REFERENCES TUYEN_TAU(MaTuyenTau),
    CONSTRAINT FK_DSGA_GATAU FOREIGN KEY (MaGaTau) REFERENCES GA_TAU(MaGaTau)
);

-- =============================================
-- PHẦN 3: NHÂN SỰ & KHÁCH HÀNG
-- =============================================

-- 10. Bảng NHAN_VIEN
CREATE TABLE NHAN_VIEN (
    MaNV VARCHAR(10) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    CCCD VARCHAR(12) NOT NULL,
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    DiaChi NVARCHAR(255),
    SoDienThoai VARCHAR(10),
    LoaiNhanVien NVARCHAR(20) NOT NULL,
    NVQuanLy VARCHAR(10),
    CONSTRAINT PK_NHAN_VIEN PRIMARY KEY (MaNV),
    CONSTRAINT FK_NHANVIEN_QUANLY FOREIGN KEY (NVQuanLy) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT UQ_NHANVIEN_CCCD UNIQUE (CCCD),
    CONSTRAINT CK_GioiTinhNV CHECK (GioiTinh IN (N'Nam', N'Nữ')),
    CONSTRAINT CK_LoaiNhanVien CHECK (LoaiNhanVien IN (N'Quản lý', N'Bán vé', N'Lái tàu', N'Toa tàu', N'Quản trị')),
    CONSTRAINT CK_TuQuanLy CHECK (MaNV <> NVQuanLy)
);

-- 11. Bảng KHACH_HANG
CREATE TABLE KHACH_HANG (
    MaKhachHang VARCHAR(10) NOT NULL,
    HoTen NVARCHAR(50) NOT NULL,
    CCCD VARCHAR(12) NOT NULL,
    NgaySinh DATE NOT NULL,
    GioiTinh NVARCHAR(10) NOT NULL,
    DiaChi NVARCHAR(255) NOT NULL,
    SoDienThoai VARCHAR(10) NOT NULL,
    CONSTRAINT PK_KHACH_HANG PRIMARY KEY (MaKhachHang),
    CONSTRAINT UQ_KHACHHANG_CCCD UNIQUE (CCCD),
    CONSTRAINT CK_GioiTinhKH CHECK (GioiTinh IN (N'Nam', N'Nữ'))
);

-- 12. Bảng TAI_KHOAN
CREATE TABLE TAI_KHOAN (
    Email VARCHAR(255) NOT NULL,
    MaKH VARCHAR(10),
    MaNV VARCHAR(10),
    TenTaiKhoan VARCHAR(50), 
    MatKhau VARCHAR(50) NOT NULL,
    TrangThai BIT NOT NULL,
    VaiTro VARCHAR(20),
    CONSTRAINT PK_TAI_KHOAN PRIMARY KEY (Email),
    CONSTRAINT FK_TAIKHOAN_KHACHHANG FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKhachHang),
    CONSTRAINT FK_TAIKHOAN_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT UQ_TenTaiKhoan UNIQUE (TenTaiKhoan)
);

-- 13. Bảng DON_NGHI_PHEP
CREATE TABLE DON_NGHI_PHEP (
    MaDon VARCHAR(10) NOT NULL,
    NgayGui DATETIME NOT NULL,
    LyDo NVARCHAR(255),
    NVGuiDon VARCHAR(10) NOT NULL,
    NVQuanLy VARCHAR(10),
    NVThayThe VARCHAR(10),
    TrangThai NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_DON_NGHI_PHEP PRIMARY KEY (MaDon),
    CONSTRAINT FK_DNP_NVGUI FOREIGN KEY (NVGuiDon) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT FK_DNP_NVQUANLY FOREIGN KEY (NVQuanLy) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT FK_DNP_NVTHAYTHE FOREIGN KEY (NVThayThe) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT CK_TrangThaiDon CHECK (TrangThai IN (N'Đang chờ', N'Chấp nhận', N'Từ chối'))
);
-- [Trigger/SP Note]: 
-- 1. NV thay thế chưa được phân công vào ngày nghỉ (RB-141).
-- 2. Ngày gửi đơn < Ngày xuất phát chuyến tàu - 1 (RB-140).

-- 14. Bảng PHAN_CONG_BAN_VE
CREATE TABLE PHAN_CONG_BAN_VE (
    MaNV VARCHAR(10) NOT NULL,
    MaGa VARCHAR(10) NOT NULL,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME,
    CONSTRAINT PK_PHAN_CONG_BAN_VE PRIMARY KEY (MaNV, MaGa, NgayBatDau),
    CONSTRAINT FK_PCBV_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT FK_PCBV_GATAU FOREIGN KEY (MaGa) REFERENCES GA_TAU(MaGaTau),
    CONSTRAINT CK_NgayLamViec CHECK (NgayKetThuc IS NULL OR NgayBatDau < NgayKetThuc)
);

-- =============================================
-- PHẦN 4: VẬN HÀNH
-- =============================================

-- 15. Bảng CHUYEN_TAU
CREATE TABLE CHUYEN_TAU (
    MaChuyenTau VARCHAR(10) NOT NULL,
    MaTuyenTau VARCHAR(10),
    MaDoanTau VARCHAR(10),
    GaXuatPhat VARCHAR(10),
    GaKetThuc VARCHAR(10),
    TrangThai NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_CHUYEN_TAU PRIMARY KEY (MaChuyenTau),
    CONSTRAINT FK_CHUYENTAU_TUYENTAU FOREIGN KEY (MaTuyenTau) REFERENCES TUYEN_TAU(MaTuyenTau),
    CONSTRAINT FK_CHUYENTAU_DOANTAU FOREIGN KEY (MaDoanTau) REFERENCES DOAN_TAU(MaDoanTau),
    CONSTRAINT FK_CHUYENTAU_GAXP FOREIGN KEY (GaXuatPhat) REFERENCES GA_TAU(MaGaTau),
    CONSTRAINT FK_CHUYENTAU_GAKT FOREIGN KEY (GaKetThuc) REFERENCES GA_TAU(MaGaTau),
    CONSTRAINT CK_TrangThaiChuyenTau CHECK (TrangThai IN (N'Chuẩn bị', N'Đang chạy', N'Hoàn thành', N'Hủy'))
);
-- [Trigger Note]: "Đoàn tàu không tham gia 2 chuyến chồng lấn thời gian" (RB-164).

-- 16. Bảng THOI_GIAN_CHUYEN_TAU
CREATE TABLE THOI_GIAN_CHUYEN_TAU (
    MaChuyenTau VARCHAR(10) NOT NULL,
    MaGaTau VARCHAR(10) NOT NULL,
    DuKienXuatPhat DATETIME NOT NULL,
    DuKienDen DATETIME NOT NULL,
    ThucTeXuatPhat DATETIME,
    ThucTeDen DATETIME,
    CONSTRAINT PK_THOI_GIAN_CHUYEN_TAU PRIMARY KEY (MaChuyenTau, MaGaTau),
    CONSTRAINT FK_TGCT_CHUYENTAU FOREIGN KEY (MaChuyenTau) REFERENCES CHUYEN_TAU(MaChuyenTau),
    CONSTRAINT FK_TGCT_GATAU FOREIGN KEY (MaGaTau) REFERENCES GA_TAU(MaGaTau)
);
-- [Trigger Note]: "Dự kiến đến < Dự kiến xuất phát tại 1 ga (thời gian dừng) & Logic giữa các ga liên tiếp" (RB-149 sửa đổi).

-- 17. Bảng PHAN_CONG_CHUYEN_TAU
CREATE TABLE PHAN_CONG_CHUYEN_TAU (
    MaPhanCong VARCHAR(10) NOT NULL,
    MaNV VARCHAR(10) NOT NULL,
    VaiTro NVARCHAR(30) NOT NULL,
    MaChuyenTau VARCHAR(10) NOT NULL,
    MaToa VARCHAR(10),
    TrangThai NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_PHAN_CONG_CHUYEN_TAU PRIMARY KEY (MaPhanCong),
    CONSTRAINT FK_PCCT_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT FK_PCCT_CHUYENTAU FOREIGN KEY (MaChuyenTau) REFERENCES CHUYEN_TAU(MaChuyenTau),
    CONSTRAINT FK_PCCT_TOATAU FOREIGN KEY (MaToa) REFERENCES TOA_TAU(MaToaTau),
    CONSTRAINT CK_VaiTroPC CHECK (VaiTro IN (N'Nhân viên phụ trách lái', N'Nhân viên trưởng', N'Nhân viên phụ trách toa')),
    CONSTRAINT CK_TrangThaiPC CHECK (TrangThai IN (N'Nhận việc', N'Nghỉ', N'Đang làm', N'Xong'))
);
-- [Trigger Note]: 
-- 1. Mỗi chuyến chỉ 1 lái tàu, 1 trưởng tàu (RB-145).
-- 2. MaToa is NULL nếu không phải "Phụ trách toa".
-- 3. Nhân viên không chạy 2 chuyến chồng lấn (RB-165).

-- 18. Bảng BANG_LUONG
CREATE TABLE BANG_LUONG (
    MaBangLuong VARCHAR(10) NOT NULL,
    MaNV VARCHAR(10) NOT NULL,
    LuongChinh DECIMAL(18, 0) NOT NULL,
    PhuCap DECIMAL(18, 0),
    TienPhat DECIMAL(18, 0),
    ThuLaoChuyenTau DECIMAL(18, 0),
    ThuLaoThayCa DECIMAL(18, 0),
    TongLuong DECIMAL(18, 0),
    CONSTRAINT PK_BANG_LUONG PRIMARY KEY (MaBangLuong),
    CONSTRAINT FK_BANGLUONG_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV)
);
-- [Stored Procedure Note]: Tính TongLuong = LuongChinh + PhuCap + ... (RB-138).

-- =============================================
-- PHẦN 5: BÁN VÉ & THANH TOÁN
-- =============================================

-- 19. Bảng CHINH_SACH_GIA
CREATE TABLE CHINH_SACH_GIA (
    MaBangGia VARCHAR(10) NOT NULL,
    NgayApDung DATETIME,
    NgayKetThuc DATETIME,
    LoaiTau NVARCHAR(20),
    LoaiVT NVARCHAR(10),
    Tang INT,
    MaDoanTau VARCHAR(10) NOT NULL,
    SoKm FLOAT,
    GiaTien DECIMAL(18, 0),
    CONSTRAINT PK_CHINH_SACH_GIA PRIMARY KEY (MaBangGia),
    CONSTRAINT FK_CSGIA_DOANTAU FOREIGN KEY (MaDoanTau) REFERENCES DOAN_TAU(MaDoanTau),
    CONSTRAINT CK_ThoiHanGia CHECK (NgayApDung < NgayKetThuc)
);

-- 20. Bảng DAT_VE
CREATE TABLE DAT_VE (
    MaDatVe VARCHAR(10) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    MaChuyenTau VARCHAR(10) NOT NULL,
    ThoiGianDat DATETIME NOT NULL,
    HanThanhToan DATETIME NOT NULL,
    TongTienDuKien DECIMAL(18, 0),
    KenhDat NVARCHAR(20),
    TrangThai NVARCHAR(20),
    CONSTRAINT PK_DAT_VE PRIMARY KEY (MaDatVe),
    CONSTRAINT FK_DATVE_TAIKHOAN FOREIGN KEY (Email) REFERENCES TAI_KHOAN(Email),
    CONSTRAINT FK_DATVE_CHUYENTAU FOREIGN KEY (MaChuyenTau) REFERENCES CHUYEN_TAU(MaChuyenTau),
    CONSTRAINT CK_KenhDat CHECK (KenhDat IN (N'Online', N'Tại quầy')),
    CONSTRAINT CK_TrangThaiDatVe CHECK (TrangThai IN (N'Đang chờ', N'Đã thanh toán', N'Hủy'))
);
-- [Trigger/App Check Note]: Không đặt vé trước 5 phút tàu chạy (RB-157).

-- 21. Bảng VE_TAU
CREATE TABLE VE_TAU (
    MaVe VARCHAR(10) NOT NULL,
    MaKhachHang VARCHAR(10) NOT NULL,
    MaChuyenTau VARCHAR(10) NOT NULL,
    MaDatVe VARCHAR(10) NOT NULL,
    MaBangGia VARCHAR(10) NOT NULL,
    MaUuDai VARCHAR(10),
    ThoiGianXuatVe DATETIME,
    GaXuatPhat VARCHAR(10),
    GaDen VARCHAR(10),
    SoTienGiam DECIMAL(18, 0),
    GiaThuc DECIMAL(18, 0),
    TrangThai NVARCHAR(20) NOT NULL,
    MaViTri VARCHAR(10) NOT NULL,
    CONSTRAINT PK_VE_TAU PRIMARY KEY (MaVe),
    CONSTRAINT FK_VETAU_KHACHHANG FOREIGN KEY (MaKhachHang) REFERENCES KHACH_HANG(MaKhachHang),
    CONSTRAINT FK_VETAU_CHUYENTAU FOREIGN KEY (MaChuyenTau) REFERENCES CHUYEN_TAU(MaChuyenTau),
    CONSTRAINT FK_VETAU_DATVE FOREIGN KEY (MaDatVe) REFERENCES DAT_VE(MaDatVe),
    CONSTRAINT FK_VETAU_BANGGIA FOREIGN KEY (MaBangGia) REFERENCES CHINH_SACH_GIA(MaBangGia),
    CONSTRAINT FK_VETAU_UUDAI FOREIGN KEY (MaUuDai) REFERENCES UU_DAI_GIA(MaUuDai),
    CONSTRAINT FK_VETAU_GAXP FOREIGN KEY (GaXuatPhat) REFERENCES GA_TAU(MaGaTau),
    CONSTRAINT FK_VETAU_GADEN FOREIGN KEY (GaDen) REFERENCES GA_TAU(MaGaTau),
    CONSTRAINT FK_VETAU_VITRI FOREIGN KEY (MaViTri) REFERENCES VI_TRI_TREN_TOA(MaViTri),
    CONSTRAINT CK_TrangThaiVe CHECK (TrangThai IN (N'Giữ chỗ', N'Đã đặt', "Đã dùng", N'Hủy vé', N'Đổi vé'))
);
-- [Trigger Note]: 
-- 1. Kiểm tra vị trí đã có người đặt chưa (Quan trọng - RB-166).
-- 2. MaDoanTau của ChuyenTau phải trùng MaDoanTau của MaViTri (RB-163).
-- 3. Ngày xuất vé < Thời gian tàu chạy (RB-146).
-- 4. Vé chỉ được dùng 1 lần (RB-153).
-- 22. Bảng DOI_VE
CREATE TABLE DOI_VE (
    MaDoiVe VARCHAR(10) NOT NULL,
    NVThucHien VARCHAR(10),
    MaVeCu VARCHAR(10) NOT NULL,
    MaVeMoi VARCHAR(10) NOT NULL,
    ThoiGianDoi DATETIME NOT NULL,
    PhiPhat DECIMAL(18, 0),
    TrangThai VARCHAR(20) NOT NULL,
    CONSTRAINT PK_DOI_VE PRIMARY KEY (MaDoiVe),
    CONSTRAINT FK_DOIVE_NHANVIEN FOREIGN KEY (NVThucHien) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT FK_DOIVE_VECU FOREIGN KEY (MaVeCu) REFERENCES VE_TAU(MaVe),
    CONSTRAINT FK_DOIVE_VEMOI FOREIGN KEY (MaVeMoi) REFERENCES VE_TAU(MaVe),
    CONSTRAINT CK_TrangThaiDoiVe CHECK (TrangThai IN ('Đang chờ', 'Đã đổi', 'Hủy'))
);
-- [Trigger Note]: Đổi trước giờ chạy 3 tiếng (RB-158).

-- 23. Bảng HOA_DON
CREATE TABLE HOA_DON (
    MaHoaDon VARCHAR(10) NOT NULL,
    MaDatVe VARCHAR(10),
    MaDoiVe VARCHAR(10),
    MaNVLap VARCHAR(10),
    ThoiGianThanhToan DATETIME NOT NULL,
    HinhThucThanhToan NVARCHAR(20) NOT NULL,
    GiaTien DECIMAL(18, 0) NOT NULL,
    CONSTRAINT PK_HOA_DON PRIMARY KEY (MaHoaDon),
    CONSTRAINT FK_HOADON_DATVE FOREIGN KEY (MaDatVe) REFERENCES DAT_VE(MaDatVe),
    CONSTRAINT FK_HOADON_DOIVE FOREIGN KEY (MaDoiVe) REFERENCES DOI_VE(MaDoiVe),
    CONSTRAINT FK_HOADON_NHANVIEN FOREIGN KEY (MaNVLap) REFERENCES NHAN_VIEN(MaNV),
    CONSTRAINT CK_HinhThucTT CHECK (HinhThucThanhToan IN (N'Online', N'Tại quầy'))
);
GO