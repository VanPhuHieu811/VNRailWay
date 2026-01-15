USE VNRAILWAY;
GO

-- =============================================
-- 1. XÓA DỮ LIỆU CŨ (THEO THỨ TỰ KHÓA NGOẠI)
-- =============================================
DELETE FROM HOA_DON;
DELETE FROM DOI_VE;
DELETE FROM VE_TAU;
DELETE FROM DAT_VE;
DELETE FROM DON_NGHI_PHEP;
DELETE FROM PHAN_CONG_CHUYEN_TAU;
DELETE FROM THOI_GIAN_CHUYEN_TAU;
DELETE FROM CHUYEN_TAU;
DELETE FROM PHAN_CONG_BAN_VE;
DELETE FROM TAI_KHOAN;
DELETE FROM GIUONG;
DELETE FROM VI_TRI_TREN_TOA;
DELETE FROM TOA_TAU;
DELETE FROM GIA_THEO_TANG; 
DELETE FROM GIA_THEO_LOAI_TOA; 
DELETE FROM GIA_THEO_LOAI_TAU; 
DELETE FROM DOAN_TAU;
DELETE FROM DANH_SACH_GA;
DELETE FROM TUYEN_TAU;
DELETE FROM GA_TAU;
DELETE FROM UU_DAI_GIA;
DELETE FROM BANG_LUONG;
DELETE FROM NHAN_VIEN;
DELETE FROM KHACH_HANG;
DELETE FROM THAM_SO;
GO

-- =============================================
-- 2. DỮ LIỆU CẤU HÌNH & DANH MỤC CƠ BẢN
-- =============================================

-- THAM_SO
INSERT INTO THAM_SO (MaThamSo, TenThamSo, GiaTriSo, GiaTriChuoi, NgayHieuLuc, NgayHetHieuLuc, MoTa) VALUES
('TS01', N'Thời gian giữ vé', 24, NULL, '2025-01-01', NULL, N'Giờ'),
('TS02', N'Phí đổi vé', 20000, NULL, '2025-01-01', NULL, N'VND'),
('TS03', N'Phí hủy vé', 10, NULL, '2025-01-01', NULL, N'% Giá vé');

-- GA_TAU (12 Ga)
INSERT INTO GA_TAU (MaGaTau, TenGa, DiaChi) VALUES
('GA01', N'Ga Hà Nội', N'120 Lê Duẩn, Hà Nội'),
('GA02', N'Ga Phủ Lý', N'Hà Nam'),
('GA03', N'Ga Nam Định', N'Nam Định'),
('GA04', N'Ga Ninh Bình', N'Ninh Bình'),
('GA05', N'Ga Thanh Hóa', N'Thanh Hóa'),
('GA06', N'Ga Vinh', N'Nghệ An'),
('GA07', N'Ga Đồng Hới', N'Quảng Bình'),
('GA08', N'Ga Huế', N'Thừa Thiên Huế'),
('GA09', N'Ga Đà Nẵng', N'Đà Nẵng'),
('GA10', N'Ga Quảng Ngãi', N'Quảng Ngãi'),
('GA11', N'Ga Nha Trang', N'Khánh Hòa'),
('GA12', N'Ga Sài Gòn', N'TP.HCM');

-- TUYEN_TAU (4 Tuyến)
INSERT INTO TUYEN_TAU (MaTuyenTau, TenTuyen, KhoangCach) VALUES
('TT01', N'Thống Nhất (Hà Nội - Sài Gòn)', 1726),
('TT02', N'Thống Nhất (Sài Gòn - Hà Nội)', 1726),
('TT03', N'Miền Trung (Huế - Đà Nẵng)', 103),
('TT04', N'Vinh - Đà Nẵng', 472);

-- DANH_SACH_GA
INSERT INTO DANH_SACH_GA (MaTuyenTau, MaGaTau, ThuTu, KhoangCach) VALUES
('TT01', 'GA01', 1, 0), ('TT01', 'GA05', 2, 175), ('TT01', 'GA06', 3, 319), ('TT01', 'GA08', 4, 688), ('TT01', 'GA09', 5, 791), ('TT01', 'GA11', 6, 1315), ('TT01', 'GA12', 7, 1726),
('TT02', 'GA12', 1, 0), ('TT02', 'GA11', 2, 411), ('TT02', 'GA09', 3, 935), ('TT02', 'GA08', 4, 1038), ('TT02', 'GA06', 5, 1407), ('TT02', 'GA01', 6, 1726),
('TT03', 'GA08', 1, 0), ('TT03', 'GA09', 2, 103);

-- UU_DAI_GIA
INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram) VALUES
('UD01', N'Sinh Viên', N'Giảm giá thẻ SV', N'Sinh viên', 10),
('UD02', N'Trẻ Em', N'Dưới 10 tuổi', N'Trẻ em', 25),
('UD03', N'Người Cao Tuổi', N'Trên 60 tuổi', N'Người cao tuổi', 15),
('UD04', N'Thương Binh', N'Có thẻ thương binh', N'Thương binh', 20),
('UD05', N'Khách VIP', N'Thẻ thành viên', N'Khách hàng', 5);

-- DOAN_TAU (12 Tàu - Đổi mã thành SExx theo yêu cầu)
INSERT INTO DOAN_TAU (MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai) VALUES
('SE01', N'SE1 Express', N'Việt Nam', '2020-01-01', N'Hạng sang', N'Hoạt động'),
('SE02', N'SE2 Express', N'Việt Nam', '2020-01-01', N'Hạng sang', N'Hoạt động'),
('SE03', N'SE3 Premium', N'Nhật Bản', '2021-06-15', N'Hạng sang', N'Hoạt động'),
('SE04', N'SE4 Premium', N'Nhật Bản', '2021-06-15', N'Hạng sang', N'Bảo trì'),
('SE05', N'SE5 Fast',    N'Việt Nam', '2019-01-01', N'Hạng sang', N'Hoạt động'),
('SE06', N'SE6 Fast',    N'Việt Nam', '2019-01-01', N'Hạng sang', N'Hoạt động'),
('SE07', N'SE7 Luxury',  N'Đức',      '2022-01-01', N'Hạng sang', N'Hoạt động'),
('SE08', N'TN1 Thống Nhất', N'Việt Nam', '2015-05-20', N'Bình thường', N'Hoạt động'),
('SE09', N'TN2 Thống Nhất', N'Việt Nam', '2015-05-20', N'Bình thường', N'Hoạt động'),
('SE10', N'TN3 Local',   N'Trung Quốc', '2010-01-01', N'Bình thường', N'Bảo trì'),
('SE11', N'SE20 Luxury', N'Hàn Quốc',   '2023-05-10', N'Hạng sang', N'Hoạt động'), -- Tàu mới thêm
('SE12', N'SE21 Express',N'Việt Nam',   '2023-06-01', N'Bình thường', N'Hoạt động'); -- Tàu mới thêm

-- =============================================
-- 3. CẤU HÌNH GIÁ (3 Bảng lẻ)
-- =============================================

INSERT INTO GIA_THEO_LOAI_TAU (MaGiaTau, LoaiTau, GiaTien) VALUES
('GT01', N'Hạng sang', 150000),
('GT02', N'Bình thường', 0);

INSERT INTO GIA_THEO_LOAI_TOA (MaGiaToa, LoaiToa, GiaTien) VALUES
('GTA01', N'Ghế', 50000),
('GTA02', N'Giường', 200000);

INSERT INTO GIA_THEO_TANG (MaGiaTang, SoTang, GiaTien) VALUES
('GTT01', 1, 100000), 
('GTT02', 2, 50000), 
('GTT03', 3, 0);

-- =============================================
-- 4. NHÂN SỰ & KHÁCH HÀNG (12 Dòng mỗi bảng)
-- =============================================

-- NHAN_VIEN
INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai, LoaiNhanVien, NVQuanLy) VALUES
('NV01', N'Nguyễn Quản Lý', '0010900001', '1975-01-01', N'Nam', N'Hà Nội', '0901000001', N'Quản lý', NULL),
('NV02', N'Trần Bán Vé A',  '0010900002', '1995-02-02', N'Nữ',  N'Hà Nội', '0901000002', N'Bán vé', 'NV01'),
('NV03', N'Lê Bán Vé B',    '0010900003', '1996-03-03', N'Nam', N'Sài Gòn','0901000003', N'Bán vé', 'NV01'),
('NV04', N'Phạm Lái Tàu A', '0010900004', '1985-04-04', N'Nam', N'Vinh',   '0901000004', N'Lái tàu', 'NV01'),
('NV05', N'Hoàng Lái Tàu B','0010900005', '1988-05-05', N'Nam', N'Đà Nẵng','0901000005', N'Lái tàu', 'NV01'),
('NV06', N'Vũ Lái Tàu C',   '0010900006', '1982-06-06', N'Nam', N'Huế',    '0901000006', N'Lái tàu', 'NV01'),
('NV07', N'Đặng Toa Tàu A', '0010900007', '1990-07-07', N'Nữ',  N'Hà Nội', '0901000007', N'Toa tàu', 'NV01'), 
('NV08', N'Bùi Toa Tàu B',  '0010900008', '1992-08-08', N'Nam', N'Sài Gòn','0901000008', N'Toa tàu', 'NV01'), 
('NV09', N'Ngô Toa Tàu C',  '0010900009', '1993-09-09', N'Nữ',  N'Nha Trang','0901000009', N'Toa tàu', 'NV01'),
('NV10', N'Đỗ Toa Tàu D',   '0010900010', '1994-10-10', N'Nam', N'Vinh',   '0901000010', N'Toa tàu', 'NV01'),
('NV11', N'Hồ Quản Trị',    '0010900011', '1980-11-11', N'Nam', N'Hà Nội', '0901000011', N'Quản trị', 'NV01'),
('NV12', N'Dương Lái Tàu D','0010900012', '1989-12-12', N'Nam', N'Sài Gòn','0901000012', N'Lái tàu', 'NV01');

-- KHACH_HANG
INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai) VALUES
('KH01', N'Nguyễn Văn A', '03409001', '1990-01-01', N'Nam', N'HN', '0912345678'),
('KH02', N'Trần Thị B',   '03409002', '2000-02-02', N'Nữ',  N'SG', '0912345679'),
('KH03', N'Lê Văn C',     '03409003', '1985-03-03', N'Nam', N'DN', '0912345680'),
('KH04', N'Phạm Thị D',   '03409004', '1995-04-04', N'Nữ',  N'UE', '0912345681'),
('KH05', N'Hoàng Văn E',  '03409005', '1960-05-05', N'Nam', N'TH', '0912345682'), 
('KH06', N'Vũ Thị F',     '03409006', '2018-06-06', N'Nữ',  N'NA', '0912345683'), 
('KH07', N'Đặng Văn G',   '03409007', '1999-07-07', N'Nam', N'QN', '0912345684'),
('KH08', N'Bùi Thị H',    '03409008', '2002-08-08', N'Nữ',  N'KH', '0912345685'), 
('KH09', N'Ngô Văn I',    '03409009', '1988-09-09', N'Nam', N'BD', '0912345686'),
('KH10', N'Đỗ Thị K',     '03409010', '1991-10-10', N'Nữ',  N'PT', '0912345687'),
('KH11', N'Lý Văn L',     '03409011', '1993-11-11', N'Nam', N'LA', '0912345688'),
('KH12', N'Mai Thị M',    '03409012', '1997-12-12', N'Nữ',  N'DT', '0912345689');

-- TAI_KHOAN
INSERT INTO TAI_KHOAN (Email, MaKH, MaNV, TenTaiKhoan, MatKhau, TrangThai, VaiTro) VALUES
('quanly@rail.vn', NULL, 'NV11', 'quanly', '123', 1, N'Quản lý'),
('ticket@rail.vn',NULL, 'NV02', 'banve','123', 1, N'Bán vé'),
('LaiTau@rail.vn', NULL, 'NV04', 'laitau','123', 1, N'Nhân viên'),
('user1@mail.com', 'KH01', NULL, 'user_a', '123', 1, N'Khách hàng'),
('user2@mail.com', 'KH02', NULL, 'user_b', '123', 1, N'Khách hàng');

-- =============================================
-- 5. CHI TIẾT TOA & GHẾ
-- =============================================

-- Tàu SE01 (Cũ)
INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES
('T01_01', 'SE01', 1, N'Ghế', 20),
('T01_02', 'SE01', 2, N'Ghế', 20),
('T01_03', 'SE01', 3, N'Giường', 4),
('T01_04', 'SE01', 4, N'Giường', 4);

-- Tàu SE02 (Cũ)
INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES
('T02_01', 'SE02', 1, N'Ghế', 20);

-- Tàu SE08 (Cũ - TN1)
INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES
('T08_01', 'SE08', 1, N'Ghế', 40);

-- Tàu SE11 (MỚI - Tàu SE20 Luxury)
-- Toa T11_01: Giường nằm VIP có đúng 24 vị trí (6 phòng x 4 giường)
INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES
('T11_01', 'SE11', 1, N'Giường', 24);

-- Tàu SE12 (MỚI - Tàu SE21 Express)
INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES
('T12_01', 'SE12', 1, N'Ghế', 56);


-- =============================================
-- INSERT VI TRI (GHẾ/GIƯỜNG)
-- =============================================

-- 1. Toa T01_01 (SE01 - Ghế)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT010101', 'T01_01', 1, N'Ghế'), ('VT010102', 'T01_01', 2, N'Ghế'), ('VT010103', 'T01_01', 3, N'Ghế'),
('VT010104', 'T01_01', 4, N'Ghế'), ('VT010105', 'T01_01', 5, N'Ghế'), ('VT010106', 'T01_01', 6, N'Ghế');

-- 2. Toa T01_03 (SE01 - Giường)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT010301', 'T01_03', 1, N'Giường'), ('VT010302', 'T01_03', 2, N'Giường'),
('VT010303', 'T01_03', 3, N'Giường'), ('VT010304', 'T01_03', 4, N'Giường');
-- Chi tiết giường SE01
INSERT INTO GIUONG (MaViTri, Tang, Phong) VALUES
('VT010301', 1, 1), ('VT010302', 2, 1), ('VT010303', 1, 2), ('VT010304', 2, 2); 

-- 3. Toa T08_01 (SE08 - Ghế)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT080101', 'T08_01', 1, N'Ghế'), ('VT080102', 'T08_01', 2, N'Ghế');

-- 4. Toa T11_01 (SE11 - MỚI - 24 GIƯỜNG)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT110101', 'T11_01', 1, N'Giường'), ('VT110102', 'T11_01', 2, N'Giường'), ('VT110103', 'T11_01', 3, N'Giường'), ('VT110104', 'T11_01', 4, N'Giường'),
('VT110105', 'T11_01', 5, N'Giường'), ('VT110106', 'T11_01', 6, N'Giường'), ('VT110107', 'T11_01', 7, N'Giường'), ('VT110108', 'T11_01', 8, N'Giường'),
('VT110109', 'T11_01', 9, N'Giường'), ('VT110110', 'T11_01', 10, N'Giường'), ('VT110111', 'T11_01', 11, N'Giường'), ('VT110112', 'T11_01', 12, N'Giường'),
('VT110113', 'T11_01', 13, N'Giường'), ('VT110114', 'T11_01', 14, N'Giường'), ('VT110115', 'T11_01', 15, N'Giường'), ('VT110116', 'T11_01', 16, N'Giường'),
('VT110117', 'T11_01', 17, N'Giường'), ('VT110118', 'T11_01', 18, N'Giường'), ('VT110119', 'T11_01', 19, N'Giường'), ('VT110120', 'T11_01', 20, N'Giường'),
('VT110121', 'T11_01', 21, N'Giường'), ('VT110122', 'T11_01', 22, N'Giường'), ('VT110123', 'T11_01', 23, N'Giường'), ('VT110124', 'T11_01', 24, N'Giường');

-- Chi tiết giường SE11 (6 phòng x 4 giường)
INSERT INTO GIUONG (MaViTri, Tang, Phong) VALUES
('VT110101', 1, 1), ('VT110102', 2, 1), ('VT110103', 1, 1), ('VT110104', 2, 1),
('VT110105', 1, 2), ('VT110106', 2, 2), ('VT110107', 1, 2), ('VT110108', 2, 2),
('VT110109', 1, 3), ('VT110110', 2, 3), ('VT110111', 1, 3), ('VT110112', 2, 3),
('VT110113', 1, 4), ('VT110114', 2, 4), ('VT110115', 1, 4), ('VT110116', 2, 4),
('VT110117', 1, 5), ('VT110118', 2, 5), ('VT110119', 1, 5), ('VT110120', 2, 5),
('VT110121', 1, 6), ('VT110122', 2, 6), ('VT110123', 1, 6), ('VT110124', 2, 6);

-- 5. Toa T12_01 (SE12 - Ghế mẫu)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT120101', 'T12_01', 1, N'Ghế'), ('VT120102', 'T12_01', 2, N'Ghế');

-- =============================================
-- 6. VẬN HÀNH: CHUYẾN TÀU (Cập nhật mã tàu SE)
-- =============================================

INSERT INTO CHUYEN_TAU (MaChuyenTau, MaTuyenTau, MaDoanTau, GaXuatPhat, GaKetThuc, TrangThai) VALUES
('CT01', 'TT01', 'SE01', 'GA01', 'GA12', N'Hoàn thành'), -- Đã chạy
('CT02', 'TT02', 'SE02', 'GA12', 'GA01', N'Hoàn thành'),
('CT03', 'TT01', 'SE08', 'GA01', 'GA09', N'Đang chạy'),  -- Đang chạy
('CT04', 'TT01', 'SE01', 'GA01', 'GA12', N'Chuẩn bị'), 
('CT05', 'TT02', 'SE02', 'GA12', 'GA01', N'Chuẩn bị'),
('CT06', 'TT03', 'SE03', 'GA08', 'GA09', N'Chuẩn bị'),
('CT07', 'TT01', 'SE05', 'GA01', 'GA11', N'Chuẩn bị'),
('CT08', 'TT01', 'SE04', 'GA01', 'GA12', N'Hủy'),        -- Hủy do bảo trì
('CT09', 'TT03', 'SE10', 'GA09', 'GA08', N'Hủy');

-- THOI_GIAN_CHUYEN_TAU

INSERT INTO THOI_GIAN_CHUYEN_TAU (MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen, ThucTeXuatPhat, ThucTeDen) VALUES
('CT01', 'GA01', '2025-12-01 06:00', '2025-12-01 06:00', '2025-12-01 06:05', '2025-12-01 06:00'),
('CT01', 'GA12', '2025-12-02 18:00', '2025-12-02 18:00', '2025-12-02 18:15', '2025-12-02 18:15'),

('CT04', 'GA01', '2026-02-01 06:00', '2026-02-01 06:00', NULL, NULL),
('CT04', 'GA12', '2026-02-02 18:00', '2026-02-02 18:00', NULL, NULL),
('CT05', 'GA12', '2026-02-01 08:00', '2026-02-01 08:00', NULL, NULL),
('CT05', 'GA01', '2026-02-02 20:00', '2026-02-02 20:00', NULL, NULL);
GO

-- PHAN_CONG_CHUYEN_TAU
INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, VaiTro, MaChuyenTau, MaToa, TrangThai) VALUES
('PC01', 'NV04', N'Nhân viên phụ trách lái', 'CT01', NULL, N'Xong'),
('PC02', 'NV07', N'Nhân viên trưởng',        'CT01', NULL, N'Xong'),
('PC03', 'NV08', N'Nhân viên phụ trách toa', 'CT01', 'T01_01', N'Xong'),
('PC04', 'NV05', N'Nhân viên phụ trách lái', 'CT04', NULL, N'Nhận việc'),
('PC05', 'NV07', N'Nhân viên trưởng',        'CT04', NULL, N'Nhận việc'),
('PC06', 'NV09', N'Nhân viên phụ trách toa', 'CT04', 'T01_03', N'Nhận việc');

-- DON_NGHI_PHEP
INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, LyDo, NVGuiDon, NVDuyetDon, NVThayThe, TrangThai) VALUES
('DNP01', 'PC04', '2026-01-28', N'Ốm', 'NV05', 'NV01', 'NV06', N'Chấp nhận');

-- =============================================
-- 7. GIAO DỊCH
-- =============================================

-- DAT_VE
INSERT INTO DAT_VE (MaDatVe, Email, MaChuyenTau, ThoiGianDat, HanThanhToan, TongTienDuKien, KenhDat, TrangThai) VALUES
('DV01', 'user1@mail.com', 'CT01', '2025-11-20', '2025-11-20', 1000000, N'Online', N'Đã thanh toán'),
('DV02', 'user2@mail.com', 'CT04', '2026-01-15', '2026-01-15', 1500000, N'Online', N'Đã thanh toán'),
('DV03', 'user1@mail.com', 'CT04', '2026-01-28', '2026-01-29', 500000,  N'Tại quầy', N'Đang chờ'), -- Giữ chỗ
('DV04', 'user2@mail.com', 'CT08', '2026-01-10', '2026-01-10', 800000,  N'Online', N'Hủy'),         -- Tàu hủy
('DV05', 'user1@mail.com', 'CT04', '2026-01-20', '2026-01-20', 1200000, N'Online', N'Đã thanh toán');

-- VE_TAU (Mã ghế phải khớp với VI_TRI_TREN_TOA)
-- Vé 1: Đã đi (Quá khứ)
INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
('VE01', 'KH01', 'CT01', 'DV01', NULL, '2025-11-20', 'GA01', 'GA12', 0, 1000000, N'Đã dùng', 'VT010101');

-- Vé 2: Đã đặt tương lai
INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
('VE02', 'KH02', 'CT04', 'DV02', NULL, '2026-01-15', 'GA01', 'GA12', 0, 1500000, N'Đã đặt', 'VT010301');

-- Vé 3: Giữ chỗ
INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
('VE03', 'KH01', 'CT04', 'DV03', NULL, NULL, 'GA01', 'GA09', 0, 500000, N'Giữ chỗ', 'VT010105');

-- Vé 4: Hủy vé
INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
('VE04', 'KH01', 'CT04', 'DV05', NULL, '2026-01-20', 'GA01', 'GA09', 0, 1200000, N'Hủy vé', 'VT010302');

-- Vé 5: Đổi vé (Từ vé 4 đổi sang vé này)
INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
('VE05', 'KH01', 'CT04', 'DV05', NULL, '2026-01-21', 'GA01', 'GA09', 0, 1200000, N'Đã đặt', 'VT010303');

-- DOI_VE
INSERT INTO DOI_VE (MaDoiVe, NVThucHien, MaVeCu, MaVeMoi, ThoiGianDoi, PhiPhat, TrangThai) VALUES
('DVE01', 'NV02', 'VE04', 'VE05', '2026-01-21', 20000, N'Đã đổi');

-- HOA_DON
INSERT INTO HOA_DON (MaHoaDon, MaDatVe, MaDoiVe, MaNVLap, ThoiGianThanhToan, HinhThucThanhToan, GiaTien) VALUES
('HD01', 'DV01', NULL, NULL, '2025-11-20', N'Online', 1000000),
('HD02', 'DV02', NULL, NULL, '2026-01-15', N'Online', 1500000),
('HD03', NULL, 'DVE01', 'NV02', '2026-01-21', N'Tại quầy', 20000);

-- PHAN_CONG_BAN_VE
INSERT INTO PHAN_CONG_BAN_VE (MaNV, MaGa, NgayBatDau, NgayKetThuc) VALUES
('NV02', 'GA01', '2025-01-01', NULL),
('NV03', 'GA12', '2025-01-01', NULL);

-- BANG_LUONG
INSERT INTO BANG_LUONG (MaBangLuong, NgayNhanLuong, MaNV, LuongChinh, PhuCap, TienPhat, ThuLaoChuyenTau, ThuLaoThayCa, TongLuong) VALUES
('BL01', '2025-12-31', 'NV04', 10000000, 2000000, 0, 3000000, 0, 15000000),
('BL02', '2025-12-31', 'NV07', 8000000,  1500000, 0, 2000000, 0, 11500000);

GO
PRINT N'=== ĐÃ CẬP NHẬT FULL DỮ LIỆU (MÃ TÀU SExx + 24 GIƯỜNG) ===';
GO