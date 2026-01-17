USE VNRAILWAY;
GO

-- =============================================
-- XÓA DỮ LIỆU CŨ (THEO THỨ TỰ FK)
-- =============================================
DELETE FROM HOA_DON;
DELETE FROM DOI_VE;
DELETE FROM VE_TAU;
DELETE FROM DAT_VE;
DELETE FROM BANG_LUONG;
DELETE FROM DON_NGHI_PHEP;
DELETE FROM PHAN_CONG_CHUYEN_TAU;
DELETE FROM THOI_GIAN_CHUYEN_TAU;
DELETE FROM CHUYEN_TAU;
DELETE FROM PHAN_CONG_BAN_VE;
DELETE FROM TAI_KHOAN;
DELETE FROM KHACH_HANG;
DELETE FROM GIUONG;
DELETE FROM VI_TRI_TREN_TOA;
DELETE FROM TOA_TAU;
DELETE FROM DOAN_TAU;
DELETE FROM DANH_SACH_GA;
DELETE FROM TUYEN_TAU;
DELETE FROM GA_TAU;
DELETE FROM UU_DAI_GIA;
DELETE FROM GIA_THEO_TANG;
DELETE FROM GIA_THEO_LOAI_TOA;
DELETE FROM GIA_THEO_LOAI_TAU;
DELETE FROM THAM_SO;
DELETE FROM NHAN_VIEN;
GO

-- =============================================
-- 1. THAM_SO
-- =============================================
INSERT INTO THAM_SO (MaThamSo, TenThamSo, GiaTriSo, GiaTriChuoi, NgayHieuLuc, NgayHetHieuLuc, MoTa) VALUES
('TS001', N'Thời gian giữ vé', 30, NULL, '2026-01-01', NULL, N'Số phút giữ chỗ trước khi hủy'),
('TS002', N'Phí hủy vé', 10, NULL, '2026-01-01', NULL, N'Phần trăm phí hủy vé'),
('TS003', N'Phí đổi vé', 5, NULL, '2026-01-01', NULL, N'Phần trăm phí đổi vé'),
('TS004', N'Giá vé theo km', 5000, NULL, '2026-01-01', NULL, N'Số tiền cho 1 km');
GO

-- =============================================
-- 2. GA_TAU
-- =============================================
INSERT INTO GA_TAU (MaGaTau, TenGa, DiaChi) VALUES
('GA01', N'Ga Hà Nội', N'120 Lê Duẩn, Hoàn Kiếm, Hà Nội'),
('GA02', N'Ga Phủ Lý', N'TP Phủ Lý, Hà Nam'),
('GA03', N'Ga Nam Định', N'TP Nam Định, Nam Định'),
('GA04', N'Ga Thanh Hóa', N'TP Thanh Hóa, Thanh Hóa'),
('GA05', N'Ga Vinh', N'TP Vinh, Nghệ An'),
('GA06', N'Ga Đồng Hới', N'TP Đồng Hới, Quảng Bình'),
('GA07', N'Ga Huế', N'TP Huế, Thừa Thiên Huế'),
('GA08', N'Ga Đà Nẵng', N'TP Đà Nẵng'),
('GA09', N'Ga Quảng Ngãi', N'TP Quảng Ngãi, Quảng Ngãi'),
('GA10', N'Ga Nha Trang', N'TP Nha Trang, Khánh Hòa'),
('GA11', N'Ga Phan Thiết', N'TP Phan Thiết, Bình Thuận'),
('GA12', N'Ga Sài Gòn', N'1 Nguyễn Thông, Q3, TP.HCM');
GO

-- =============================================
-- 3. UU_DAI_GIA
-- =============================================
INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram, NgayBatDau, NgayKetThuc, TrangThai) VALUES
('UD01', N'Sinh viên', N'Giảm giá cho sinh viên có thẻ', N'Sinh viên', 10, '2023-01-01', NULL, N'Đang áp dụng'),
('UD02', N'Người cao tuổi', N'Giảm giá cho người trên 60 tuổi', N'Người cao tuổi', 15, '2023-01-01', NULL, N'Đang áp dụng'),
('UD03', N'Trẻ em', N'Giảm giá cho trẻ em dưới 10 tuổi', N'Trẻ em', 50, '2023-01-01', NULL, N'Tạm ngưng'),
('UD04', N'Thương binh', N'Giảm giá cho thương binh (Chương trình cũ)', N'Thương binh', 20, '2020-01-01', '2024-12-31', N'Hết hạn');
GO

-- =============================================
-- 4. TUYEN_TAU
-- =============================================
INSERT INTO TUYEN_TAU (MaTuyenTau, TenTuyen, KhoangCach) VALUES
('TT01', N'Hà Nội - Sài Gòn', 1726),
('TT02', N'Sài Gòn - Hà Nội', 1726),
('TT03', N'Hà Nội - Đà Nẵng', 791),
('TT04', N'Đà Nẵng - Hà Nội', 791);
GO

-- =============================================
-- 5. DANH_SACH_GA
-- =============================================
INSERT INTO DANH_SACH_GA (MaTuyenTau, MaGaTau, ThuTu, KhoangCach) VALUES
('TT01', 'GA01', 1, 0),
('TT01', 'GA05', 2, 319),
('TT01', 'GA07', 3, 688),
('TT01', 'GA08', 4, 791),
('TT01', 'GA10', 5, 1315),
('TT01', 'GA12', 6, 1726),
('TT02', 'GA12', 1, 0),
('TT02', 'GA10', 2, 411),
('TT02', 'GA08', 3, 935),
('TT02', 'GA07', 4, 1038),
('TT02', 'GA05', 5, 1407),
('TT02', 'GA01', 6, 1726),
('TT03', 'GA01', 1, 0),
('TT03', 'GA05', 2, 319),
('TT03', 'GA07', 3, 688),
('TT03', 'GA08', 4, 791),
('TT04', 'GA08', 1, 0),
('TT04', 'GA07', 2, 103),
('TT04', 'GA05', 3, 472),
('TT04', 'GA01', 4, 791);
GO

-- =============================================
-- 6. DOAN_TAU
-- =============================================
INSERT INTO DOAN_TAU (MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai) VALUES
('DT01', N'SE1', N'Đường sắt Việt Nam', '2020-01-15', N'Hạng sang', N'Hoạt động'),
('DT02', N'SE2', N'Đường sắt Việt Nam', '2020-03-20', N'Hạng sang', N'Hoạt động'),
('DT03', N'TN1', N'Đường sắt Việt Nam', '2015-06-10', N'Bình thường', N'Hoạt động'),
('DT04', N'TN2', N'Đường sắt Việt Nam', '2016-08-25', N'Bình thường', N'Hoạt động');
GO

-- =============================================
-- 7. TOA_TAU
-- =============================================
INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES
('T01_01', 'DT01', 1, N'Ghế', 40),
('T01_02', 'DT01', 2, N'Ghế', 40),
('T01_03', 'DT01', 3, N'Giường', 28),
('T01_04', 'DT01', 4, N'Giường', 28),
('T02_01', 'DT02', 1, N'Ghế', 40),
('T02_02', 'DT02', 2, N'Ghế', 40),
('T02_03', 'DT02', 3, N'Giường', 28),
('T03_01', 'DT03', 1, N'Ghế', 50),
('T03_02', 'DT03', 2, N'Ghế', 50),
('T04_01', 'DT04', 1, N'Ghế', 50),
('T04_02', 'DT04', 2, N'Ghế', 50);
GO

-- =============================================
-- 8. VI_TRI_TREN_TOA (Bulk Insert)
-- =============================================
-- Toa T01_01 (40 ghế)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0101_01','T01_01',1,N'Ghế'),('VT0101_02','T01_01',2,N'Ghế'),('VT0101_03','T01_01',3,N'Ghế'),('VT0101_04','T01_01',4,N'Ghế'),('VT0101_05','T01_01',5,N'Ghế'),
('VT0101_06','T01_01',6,N'Ghế'),('VT0101_07','T01_01',7,N'Ghế'),('VT0101_08','T01_01',8,N'Ghế'),('VT0101_09','T01_01',9,N'Ghế'),('VT0101_10','T01_01',10,N'Ghế'),
('VT0101_11','T01_01',11,N'Ghế'),('VT0101_12','T01_01',12,N'Ghế'),('VT0101_13','T01_01',13,N'Ghế'),('VT0101_14','T01_01',14,N'Ghế'),('VT0101_15','T01_01',15,N'Ghế'),
('VT0101_16','T01_01',16,N'Ghế'),('VT0101_17','T01_01',17,N'Ghế'),('VT0101_18','T01_01',18,N'Ghế'),('VT0101_19','T01_01',19,N'Ghế'),('VT0101_20','T01_01',20,N'Ghế'),
('VT0101_21','T01_01',21,N'Ghế'),('VT0101_22','T01_01',22,N'Ghế'),('VT0101_23','T01_01',23,N'Ghế'),('VT0101_24','T01_01',24,N'Ghế'),('VT0101_25','T01_01',25,N'Ghế'),
('VT0101_26','T01_01',26,N'Ghế'),('VT0101_27','T01_01',27,N'Ghế'),('VT0101_28','T01_01',28,N'Ghế'),('VT0101_29','T01_01',29,N'Ghế'),('VT0101_30','T01_01',30,N'Ghế'),
('VT0101_31','T01_01',31,N'Ghế'),('VT0101_32','T01_01',32,N'Ghế'),('VT0101_33','T01_01',33,N'Ghế'),('VT0101_34','T01_01',34,N'Ghế'),('VT0101_35','T01_01',35,N'Ghế'),
('VT0101_36','T01_01',36,N'Ghế'),('VT0101_37','T01_01',37,N'Ghế'),('VT0101_38','T01_01',38,N'Ghế'),('VT0101_39','T01_01',39,N'Ghế'),('VT0101_40','T01_01',40,N'Ghế');

-- Toa T01_02 (40 ghế)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0102_01','T01_02',1,N'Ghế'),('VT0102_02','T01_02',2,N'Ghế'),('VT0102_03','T01_02',3,N'Ghế'),('VT0102_04','T01_02',4,N'Ghế'),('VT0102_05','T01_02',5,N'Ghế'),
('VT0102_06','T01_02',6,N'Ghế'),('VT0102_07','T01_02',7,N'Ghế'),('VT0102_08','T01_02',8,N'Ghế'),('VT0102_09','T01_02',9,N'Ghế'),('VT0102_10','T01_02',10,N'Ghế'),
('VT0102_11','T01_02',11,N'Ghế'),('VT0102_12','T01_02',12,N'Ghế'),('VT0102_13','T01_02',13,N'Ghế'),('VT0102_14','T01_02',14,N'Ghế'),('VT0102_15','T01_02',15,N'Ghế'),
('VT0102_16','T01_02',16,N'Ghế'),('VT0102_17','T01_02',17,N'Ghế'),('VT0102_18','T01_02',18,N'Ghế'),('VT0102_19','T01_02',19,N'Ghế'),('VT0102_20','T01_02',20,N'Ghế'),
('VT0102_21','T01_02',21,N'Ghế'),('VT0102_22','T01_02',22,N'Ghế'),('VT0102_23','T01_02',23,N'Ghế'),('VT0102_24','T01_02',24,N'Ghế'),('VT0102_25','T01_02',25,N'Ghế'),
('VT0102_26','T01_02',26,N'Ghế'),('VT0102_27','T01_02',27,N'Ghế'),('VT0102_28','T01_02',28,N'Ghế'),('VT0102_29','T01_02',29,N'Ghế'),('VT0102_30','T01_02',30,N'Ghế'),
('VT0102_31','T01_02',31,N'Ghế'),('VT0102_32','T01_02',32,N'Ghế'),('VT0102_33','T01_02',33,N'Ghế'),('VT0102_34','T01_02',34,N'Ghế'),('VT0102_35','T01_02',35,N'Ghế'),
('VT0102_36','T01_02',36,N'Ghế'),('VT0102_37','T01_02',37,N'Ghế'),('VT0102_38','T01_02',38,N'Ghế'),('VT0102_39','T01_02',39,N'Ghế'),('VT0102_40','T01_02',40,N'Ghế');

-- Toa T01_03 (28 giường)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0103_01','T01_03',1,N'Giường'),('VT0103_02','T01_03',2,N'Giường'),('VT0103_03','T01_03',3,N'Giường'),('VT0103_04','T01_03',4,N'Giường'),
('VT0103_05','T01_03',5,N'Giường'),('VT0103_06','T01_03',6,N'Giường'),('VT0103_07','T01_03',7,N'Giường'),('VT0103_08','T01_03',8,N'Giường'),
('VT0103_09','T01_03',9,N'Giường'),('VT0103_10','T01_03',10,N'Giường'),('VT0103_11','T01_03',11,N'Giường'),('VT0103_12','T01_03',12,N'Giường'),
('VT0103_13','T01_03',13,N'Giường'),('VT0103_14','T01_03',14,N'Giường'),('VT0103_15','T01_03',15,N'Giường'),('VT0103_16','T01_03',16,N'Giường'),
('VT0103_17','T01_03',17,N'Giường'),('VT0103_18','T01_03',18,N'Giường'),('VT0103_19','T01_03',19,N'Giường'),('VT0103_20','T01_03',20,N'Giường'),
('VT0103_21','T01_03',21,N'Giường'),('VT0103_22','T01_03',22,N'Giường'),('VT0103_23','T01_03',23,N'Giường'),('VT0103_24','T01_03',24,N'Giường'),
('VT0103_25','T01_03',25,N'Giường'),('VT0103_26','T01_03',26,N'Giường'),('VT0103_27','T01_03',27,N'Giường'),('VT0103_28','T01_03',28,N'Giường');

-- Toa T01_04 (28 giường)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0104_01','T01_04',1,N'Giường'),('VT0104_02','T01_04',2,N'Giường'),('VT0104_03','T01_04',3,N'Giường'),('VT0104_04','T01_04',4,N'Giường'),
('VT0104_05','T01_04',5,N'Giường'),('VT0104_06','T01_04',6,N'Giường'),('VT0104_07','T01_04',7,N'Giường'),('VT0104_08','T01_04',8,N'Giường'),
('VT0104_09','T01_04',9,N'Giường'),('VT0104_10','T01_04',10,N'Giường'),('VT0104_11','T01_04',11,N'Giường'),('VT0104_12','T01_04',12,N'Giường'),
('VT0104_13','T01_04',13,N'Giường'),('VT0104_14','T01_04',14,N'Giường'),('VT0104_15','T01_04',15,N'Giường'),('VT0104_16','T01_04',16,N'Giường'),
('VT0104_17','T01_04',17,N'Giường'),('VT0104_18','T01_04',18,N'Giường'),('VT0104_19','T01_04',19,N'Giường'),('VT0104_20','T01_04',20,N'Giường'),
('VT0104_21','T01_04',21,N'Giường'),('VT0104_22','T01_04',22,N'Giường'),('VT0104_23','T01_04',23,N'Giường'),('VT0104_24','T01_04',24,N'Giường'),
('VT0104_25','T01_04',25,N'Giường'),('VT0104_26','T01_04',26,N'Giường'),('VT0104_27','T01_04',27,N'Giường'),('VT0104_28','T01_04',28,N'Giường');

-- Toa T02_01 (40 ghế)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0201_01','T02_01',1,N'Ghế'),('VT0201_02','T02_01',2,N'Ghế'),('VT0201_03','T02_01',3,N'Ghế'),('VT0201_04','T02_01',4,N'Ghế'),('VT0201_05','T02_01',5,N'Ghế'),
('VT0201_06','T02_01',6,N'Ghế'),('VT0201_07','T02_01',7,N'Ghế'),('VT0201_08','T02_01',8,N'Ghế'),('VT0201_09','T02_01',9,N'Ghế'),('VT0201_10','T02_01',10,N'Ghế'),
('VT0201_11','T02_01',11,N'Ghế'),('VT0201_12','T02_01',12,N'Ghế'),('VT0201_13','T02_01',13,N'Ghế'),('VT0201_14','T02_01',14,N'Ghế'),('VT0201_15','T02_01',15,N'Ghế'),
('VT0201_16','T02_01',16,N'Ghế'),('VT0201_17','T02_01',17,N'Ghế'),('VT0201_18','T02_01',18,N'Ghế'),('VT0201_19','T02_01',19,N'Ghế'),('VT0201_20','T02_01',20,N'Ghế'),
('VT0201_21','T02_01',21,N'Ghế'),('VT0201_22','T02_01',22,N'Ghế'),('VT0201_23','T02_01',23,N'Ghế'),('VT0201_24','T02_01',24,N'Ghế'),('VT0201_25','T02_01',25,N'Ghế'),
('VT0201_26','T02_01',26,N'Ghế'),('VT0201_27','T02_01',27,N'Ghế'),('VT0201_28','T02_01',28,N'Ghế'),('VT0201_29','T02_01',29,N'Ghế'),('VT0201_30','T02_01',30,N'Ghế'),
('VT0201_31','T02_01',31,N'Ghế'),('VT0201_32','T02_01',32,N'Ghế'),('VT0201_33','T02_01',33,N'Ghế'),('VT0201_34','T02_01',34,N'Ghế'),('VT0201_35','T02_01',35,N'Ghế'),
('VT0201_36','T02_01',36,N'Ghế'),('VT0201_37','T02_01',37,N'Ghế'),('VT0201_38','T02_01',38,N'Ghế'),('VT0201_39','T02_01',39,N'Ghế'),('VT0201_40','T02_01',40,N'Ghế');

-- Toa T02_03 (28 giường)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0203_01','T02_03',1,N'Giường'),('VT0203_02','T02_03',2,N'Giường'),('VT0203_03','T02_03',3,N'Giường'),('VT0203_04','T02_03',4,N'Giường'),
('VT0203_05','T02_03',5,N'Giường'),('VT0203_06','T02_03',6,N'Giường'),('VT0203_07','T02_03',7,N'Giường'),('VT0203_08','T02_03',8,N'Giường'),
('VT0203_09','T02_03',9,N'Giường'),('VT0203_10','T02_03',10,N'Giường'),('VT0203_11','T02_03',11,N'Giường'),('VT0203_12','T02_03',12,N'Giường'),
('VT0203_13','T02_03',13,N'Giường'),('VT0203_14','T02_03',14,N'Giường'),('VT0203_15','T02_03',15,N'Giường'),('VT0203_16','T02_03',16,N'Giường'),
('VT0203_17','T02_03',17,N'Giường'),('VT0203_18','T02_03',18,N'Giường'),('VT0203_19','T02_03',19,N'Giường'),('VT0203_20','T02_03',20,N'Giường'),
('VT0203_21','T02_03',21,N'Giường'),('VT0203_22','T02_03',22,N'Giường'),('VT0203_23','T02_03',23,N'Giường'),('VT0203_24','T02_03',24,N'Giường'),
('VT0203_25','T02_03',25,N'Giường'),('VT0203_26','T02_03',26,N'Giường'),('VT0203_27','T02_03',27,N'Giường'),('VT0203_28','T02_03',28,N'Giường');

-- Toa T03_01 (20 ghế mẫu)
INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES
('VT0301_01','T03_01',1,N'Ghế'),('VT0301_02','T03_01',2,N'Ghế'),('VT0301_03','T03_01',3,N'Ghế'),('VT0301_04','T03_01',4,N'Ghế'),('VT0301_05','T03_01',5,N'Ghế'),
('VT0301_06','T03_01',6,N'Ghế'),('VT0301_07','T03_01',7,N'Ghế'),('VT0301_08','T03_01',8,N'Ghế'),('VT0301_09','T03_01',9,N'Ghế'),('VT0301_10','T03_01',10,N'Ghế'),
('VT0301_11','T03_01',11,N'Ghế'),('VT0301_12','T03_01',12,N'Ghế'),('VT0301_13','T03_01',13,N'Ghế'),('VT0301_14','T03_01',14,N'Ghế'),('VT0301_15','T03_01',15,N'Ghế'),
('VT0301_16','T03_01',16,N'Ghế'),('VT0301_17','T03_01',17,N'Ghế'),('VT0301_18','T03_01',18,N'Ghế'),('VT0301_19','T03_01',19,N'Ghế'),('VT0301_20','T03_01',20,N'Ghế');
GO

-- =============================================
-- 9. GIUONG
-- =============================================
INSERT INTO GIUONG (MaViTri, Tang, Phong) VALUES
('VT0103_01',1,1),('VT0103_02',2,1),('VT0103_03',1,1),('VT0103_04',2,1),
('VT0103_05',1,2),('VT0103_06',2,2),('VT0103_07',1,2),('VT0103_08',2,2),
('VT0103_09',1,3),('VT0103_10',2,3),('VT0103_11',1,3),('VT0103_12',2,3),
('VT0103_13',1,4),('VT0103_14',2,4),('VT0103_15',1,4),('VT0103_16',2,4),
('VT0103_17',1,5),('VT0103_18',2,5),('VT0103_19',1,5),('VT0103_20',2,5),
('VT0103_21',1,6),('VT0103_22',2,6),('VT0103_23',1,6),('VT0103_24',2,6),
('VT0103_25',1,7),('VT0103_26',2,7),('VT0103_27',1,7),('VT0103_28',2,7),
('VT0104_01',1,1),('VT0104_02',2,1),('VT0104_03',1,1),('VT0104_04',2,1),
('VT0104_05',1,2),('VT0104_06',2,2),('VT0104_07',1,2),('VT0104_08',2,2),
('VT0104_09',1,3),('VT0104_10',2,3),('VT0104_11',1,3),('VT0104_12',2,3),
('VT0104_13',1,4),('VT0104_14',2,4),('VT0104_15',1,4),('VT0104_16',2,4),
('VT0104_17',1,5),('VT0104_18',2,5),('VT0104_19',1,5),('VT0104_20',2,5),
('VT0104_21',1,6),('VT0104_22',2,6),('VT0104_23',1,6),('VT0104_24',2,6),
('VT0104_25',1,7),('VT0104_26',2,7),('VT0104_27',1,7),('VT0104_28',2,7),
('VT0203_01',1,1),('VT0203_02',2,1),('VT0203_03',1,1),('VT0203_04',2,1),
('VT0203_05',1,2),('VT0203_06',2,2),('VT0203_07',1,2),('VT0203_08',2,2),
('VT0203_09',1,3),('VT0203_10',2,3),('VT0203_11',1,3),('VT0203_12',2,3),
('VT0203_13',1,4),('VT0203_14',2,4),('VT0203_15',1,4),('VT0203_16',2,4),
('VT0203_17',1,5),('VT0203_18',2,5),('VT0203_19',1,5),('VT0203_20',2,5),
('VT0203_21',1,6),('VT0203_22',2,6),('VT0203_23',1,6),('VT0203_24',2,6),
('VT0203_25',1,7),('VT0203_26',2,7),('VT0203_27',1,7),('VT0203_28',2,7);
GO

-- =============================================
-- 10. NHAN_VIEN
-- =============================================
INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai, LoaiNhanVien, NVQuanLy) VALUES
('NV001', N'Nguyễn Văn An', '001090012345', '1975-05-15', N'Nam', N'Hà Nội', '0901234567', N'Quản lý', NULL),
('NV002', N'Trần Thị Bình', '001095012346', '1990-08-20', N'Nữ', N'Hà Nội', '0902345678', N'Bán vé', 'NV001'),
('NV003', N'Lê Văn Cường', '001092012347', '1988-03-10', N'Nam', N'TP.HCM', '0903456789', N'Bán vé', 'NV001'),
('NV004', N'Phạm Đức Dũng', '001085012348', '1982-11-25', N'Nam', N'Hà Nội', '0904567890', N'Lái tàu', 'NV001'),
('NV005', N'Hoàng Văn Em', '001087012349', '1985-07-08', N'Nam', N'Đà Nẵng', '0905678901', N'Lái tàu', 'NV001'),
('NV006', N'Vũ Minh Phong', '001089012350', '1986-02-14', N'Nam', N'Huế', '0906789012', N'Lái tàu', 'NV001'),
('NV007', N'Ngô Thị Giang', '001093012351', '1992-09-30', N'Nữ', N'Vinh', '0907890123', N'Toa tàu', 'NV001'),
('NV008', N'Đặng Văn Hải', '001091012352', '1989-12-05', N'Nam', N'Nha Trang', '0908901234', N'Toa tàu', 'NV001'),
('NV009', N'Bùi Thị Lan', '001094012353', '1993-04-18', N'Nữ', N'TP.HCM', '0909012345', N'Toa tàu', 'NV001'),
('NV010', N'Đinh Công Minh', '001088012354', '1988-01-01', N'Nam', N'Hà Nội', '0900000001', N'Quản trị', 'NV001'),
('NV011', N'Lý Văn Năm', '001086012355', '1984-06-20', N'Nam', N'Đà Nẵng', '0900000002', N'Toa tàu', 'NV001'),
('NV012', N'Cao Thị Oanh', '001096012356', '1996-10-10', N'Nữ', N'Huế', '0900000003', N'Toa tàu', 'NV001');
GO

-- =============================================
-- 11. KHACH_HANG
-- =============================================
INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai) VALUES
('KH001', N'Nguyễn Thanh Tùng', '001200012345', '1995-06-15', N'Nam', N'Hà Nội', '0912345678'),
('KH002', N'Trần Thị Mai', '001198012346', '1998-02-20', N'Nữ', N'TP.HCM', '0923456789'),
('KH003', N'Lê Hoàng Nam', '001192012347', '1992-09-10', N'Nam', N'Đà Nẵng', '0934567890'),
('KH004', N'Phạm Thị Hương', '001185012348', '1985-12-25', N'Nữ', N'Huế', '0945678901'),
('KH005', N'Hoàng Văn Đức', '001978012349', '1960-04-08', N'Nam', N'Vinh', '0956789012'),
('KH006', N'Vũ Thị Lan Anh', '001200112350', '2001-11-30', N'Nữ', N'Nha Trang', '0967890123'),
('KH007', N'Ngô Quốc Bảo', '001190012351', '1990-07-22', N'Nam', N'Hải Phòng', '0978901234'),
('KH008', N'Đặng Minh Châu', '001188012352', '1988-03-14', N'Nữ', N'Cần Thơ', '0989012345'),
('KH009', N'Bé Nguyễn An', '001220012353', '2018-05-20', N'Nam', N'Hà Nội', '0912345679'),
('KH010', N'Trần Văn Thương', '001175012354', '1970-08-15', N'Nam', N'TP.HCM', '0923456780');
GO

-- =============================================
-- 12. TAI_KHOAN
-- =============================================
INSERT INTO TAI_KHOAN (Email, MaKH, MaNV, TenTaiKhoan, MatKhau, TrangThai, VaiTro) VALUES
('quanly@vnrailway.vn', NULL, 'NV001', 'quanly', 'ql123456', 1, N'Quản lý'),
('banve01@vnrailway.vn', NULL, 'NV002', 'banve01', 'bv123456', 1, N'Bán vé'),
('banve02@vnrailway.vn', NULL, 'NV003', 'banve02', 'bv123456', 1, N'Bán vé'),
('laitau01@vnrailway.vn', NULL, 'NV004', 'laitau01', 'lt123456', 1, N'Nhân viên'),
('laitau02@vnrailway.vn', NULL, 'NV005', 'laitau02', 'lt123456', 1, N'Nhân viên'),
('laitau03@vnrailway.vn', NULL, 'NV006', 'laitau03', 'lt123456', 1, N'Nhân viên'),
('toatau01@vnrailway.vn', NULL, 'NV007', 'toatau01', 'tt123456', 1, N'Nhân viên'),
('toatau02@vnrailway.vn', NULL, 'NV008', 'toatau02', 'tt123456', 1, N'Nhân viên'),
('toatau03@vnrailway.vn', NULL, 'NV009', 'toatau03', 'tt123456', 1, N'Nhân viên'),
('admin@vnrailway.vn', NULL, 'NV010', 'admin', 'admin123', 1, N'Quản lý'),
('toatau04@vnrailway.vn', NULL, 'NV011', 'toatau04', 'tt123456', 1, N'Nhân viên'),
('toatau05@vnrailway.vn', NULL, 'NV012', 'toatau05', 'tt123456', 1, N'Nhân viên'),
('thanhtung95@gmail.com', 'KH001', NULL, 'thanhtung95', 'kh123456', 1, N'Khách hàng'),
('maimai98@gmail.com', 'KH002', NULL, 'maimai98', 'kh123456', 1, N'Khách hàng'),
('hoangnam92@gmail.com', 'KH003', NULL, 'hoangnam92', 'kh123456', 1, N'Khách hàng'),
('huong85@gmail.com', 'KH004', NULL, 'huong85', 'kh123456', 1, N'Khách hàng'),
('ducho60@gmail.com', 'KH005', NULL, 'ducho60', 'kh123456', 1, N'Khách hàng'),
('lananh01@gmail.com', 'KH006', NULL, 'lananh01', 'kh123456', 1, N'Khách hàng');
GO

-- =============================================
-- 13. PHAN_CONG_BAN_VE
-- =============================================
INSERT INTO PHAN_CONG_BAN_VE (MaNV, MaGa, NgayBatDau, NgayKetThuc) VALUES
('NV002', 'GA01', '2026-01-01', '2026-12-31'),
('NV003', 'GA12', '2026-01-01', '2026-12-31');
GO

-- =============================================
-- 14. CHUYEN_TAU
-- =============================================
INSERT INTO CHUYEN_TAU (MaChuyenTau, MaTuyenTau, MaDoanTau, GaXuatPhat, GaKetThuc, TrangThai) VALUES
('CT001', 'TT01', 'DT01', 'GA01', 'GA12', N'Hoàn thành'),
('CT002', 'TT02', 'DT02', 'GA12', 'GA01', N'Hoàn thành'),
('CT003', 'TT01', 'DT01', 'GA01', 'GA12', N'Đang chạy'),
('CT004', 'TT02', 'DT02', 'GA12', 'GA01', N'Chuẩn bị'),
('CT005', 'TT03', 'DT03', 'GA01', 'GA08', N'Chuẩn bị'),
('CT006', 'TT01', 'DT04', 'GA01', 'GA12', N'Chuẩn bị'),
('CT007', 'TT01', 'DT01', 'GA01', 'GA12', N'Hủy');
GO

-- =============================================
-- 15. THOI_GIAN_CHUYEN_TAU
-- =============================================
INSERT INTO THOI_GIAN_CHUYEN_TAU (MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen, ThucTeXuatPhat, ThucTeDen) VALUES
('CT001', 'GA01', '2025-12-01 19:00', '2025-12-01 19:00', '2025-12-01 19:05', '2025-12-01 19:05'),
('CT001', 'GA05', '2025-12-02 01:30', '2025-12-02 01:20', '2025-12-02 01:35', '2025-12-02 01:25'),
('CT001', 'GA08', '2025-12-02 10:00', '2025-12-02 09:50', '2025-12-02 10:10', '2025-12-02 10:00'),
('CT001', 'GA12', '2025-12-02 22:00', '2025-12-02 22:00', '2025-12-02 22:15', '2025-12-02 22:15'),
('CT003', 'GA01', '2025-12-28 19:00', '2025-12-28 19:00', '2025-12-28 19:00', '2025-12-28 19:00'),
('CT003', 'GA05', '2025-12-29 01:30', '2025-12-29 01:20', NULL, NULL),
('CT003', 'GA08', '2025-12-29 10:00', '2025-12-29 09:50', NULL, NULL),
('CT003', 'GA12', '2025-12-29 22:00', '2025-12-29 22:00', NULL, NULL),
('CT004', 'GA12', '2025-12-30 08:00', '2025-12-30 08:00', NULL, NULL),
('CT004', 'GA08', '2025-12-30 20:00', '2025-12-30 19:50', NULL, NULL),
('CT004', 'GA01', '2025-12-31 11:00', '2025-12-31 11:00', NULL, NULL),
('CT005', 'GA01', '2025-12-31 06:00', '2025-12-31 06:00', NULL, NULL),
('CT005', 'GA05', '2025-12-31 12:30', '2025-12-31 12:20', NULL, NULL),
('CT005', 'GA08', '2025-12-31 20:00', '2025-12-31 20:00', NULL, NULL),
('CT006', 'GA01', '2026-01-02 07:00', '2026-01-02 07:00', NULL, NULL),
('CT006', 'GA12', '2026-01-03 06:00', '2026-01-03 06:00', NULL, NULL);
GO

-- =============================================
-- 16. PHAN_CONG_CHUYEN_TAU
-- =============================================
INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, VaiTro, MaChuyenTau, MaToa, TrangThai) VALUES
('PC001', 'NV004', N'Nhân viên phụ trách lái', 'CT001', NULL, N'Xong'),
('PC002', 'NV007', N'Nhân viên trưởng', 'CT001', NULL, N'Xong'),
('PC003', 'NV008', N'Nhân viên phụ trách toa', 'CT001', 'T01_01', N'Xong'),
('PC004', 'NV009', N'Nhân viên phụ trách toa', 'CT001', 'T01_03', N'Xong'),
('PC005', 'NV005', N'Nhân viên phụ trách lái', 'CT003', NULL, N'Đang làm'),
('PC006', 'NV007', N'Nhân viên trưởng', 'CT003', NULL, N'Đang làm'),
('PC007', 'NV011', N'Nhân viên phụ trách toa', 'CT003', 'T01_01', N'Đang làm'),
('PC008', 'NV006', N'Nhân viên phụ trách lái', 'CT004', NULL, N'Nhận việc'),
('PC009', 'NV008', N'Nhân viên trưởng', 'CT004', NULL, N'Nhận việc'),
('PC010', 'NV012', N'Nhân viên phụ trách toa', 'CT004', 'T02_01', N'Nhận việc'),
('PC011', 'NV004', N'Nhân viên phụ trách lái', 'CT005', NULL, N'Nhận việc'),
('PC012', 'NV009', N'Nhân viên trưởng', 'CT005', NULL, N'Nhận việc');
GO

-- =============================================
-- 17. DON_NGHI_PHEP
-- =============================================
INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, LyDo, NVGuiDon, NVDuyetDon, NVThayThe, TrangThai) VALUES
('DNP001', 'PC005', '2025-12-27 08:00', N'Bị ốm đột xuất', 'NV005', 'NV001', 'NV004', N'Chấp nhận'),
('DNP002', 'PC007', '2025-12-27 09:00', N'Việc gia đình', 'NV011', 'NV001', 'NV008', N'Chấp nhận'),
('DNP003', 'PC008', '2025-12-28 10:00', N'Khám sức khỏe định kỳ', 'NV006', NULL, NULL, N'Đang chờ'),
('DNP004', 'PC010', '2025-12-28 14:00', N'Con ốm', 'NV012', 'NV001', NULL, N'Từ chối'),
('DNP005', 'PC006', '2025-12-27 08:00', N'Đau ruột thừa', 'NV007', NULL, NULL, N'Đang chờ');
GO

-- =============================================
-- 18. BANG_LUONG
-- =============================================
INSERT INTO BANG_LUONG (MaBangLuong, NgayNhanLuong, MaNV, LuongChinh, PhuCap, TienPhat, ThuLaoChuyenTau, ThuLaoThayCa, TongLuong) VALUES
('BL001', '2025-12-01 08:00', 'NV001', 25000000, 5000000, 0, 0, 0, 30000000),
('BL002', '2025-12-01 08:00', 'NV002', 12000000, 2000000, 0, 0, 0, 14000000),
('BL003', '2025-12-01 08:00', 'NV003', 12000000, 2000000, 500000, 0, 0, 13500000),
('BL004', '2025-12-01 08:00', 'NV004', 15000000, 3000000, 0, 2000000, 500000, 20500000),
('BL005', '2025-12-01 08:00', 'NV005', 15000000, 3000000, 0, 1500000, 0, 19500000),
('BL006', '2025-12-01 08:00', 'NV006', 15000000, 3000000, 0, 1000000, 0, 19000000),
('BL007', '2025-12-01 08:00', 'NV007', 13000000, 2500000, 0, 1500000, 0, 17000000),
('BL008', '2025-12-01 08:00', 'NV008', 13000000, 2500000, 0, 1000000, 500000, 17000000),
('BL009', '2025-12-01 08:00', 'NV009', 13000000, 2500000, 200000, 800000, 0, 16100000),
('BL010', '2025-12-01 08:00', 'NV010', 20000000, 3000000, 0, 0, 0, 23000000);
GO

-- =============================================
-- 19. GIA_THEO_LOAI_TAU
-- =============================================
INSERT INTO GIA_THEO_LOAI_TAU (MaGiaTau, LoaiTau, GiaTien) VALUES
('GT01', N'Hạng sang', 150000),
('GT02', N'Bình thường', 100000);
GO

-- =============================================
-- 20. GIA_THEO_LOAI_TOA
-- =============================================
INSERT INTO GIA_THEO_LOAI_TOA (MaGiaToa, LoaiToa, GiaTien) VALUES
('GTO01', N'Ghế', 0),
('GTO02', N'Giường', 100000);
GO

-- =============================================
-- 21. GIA_THEO_TANG
-- =============================================
INSERT INTO GIA_THEO_TANG (MaGiaTang, SoTang, GiaTien) VALUES
('GTG01', 1, 50000),
('GTG02', 2, 30000),
('GTG03', 3, 10000);
GO

-- =============================================
-- 22. DAT_VE
-- =============================================
INSERT INTO DAT_VE (MaDatVe, Email, MaChuyenTau, ThoiGianDat, HanThanhToan, TongTienDuKien, KenhDat, TrangThai) VALUES
('DV001', 'thanhtung95@gmail.com', 'CT001', '2025-11-28 10:00', '2025-11-28 10:30', 2587500, N'Online', N'Đã thanh toán'),
('DV002', 'maimai98@gmail.com', 'CT001', '2025-11-29 14:00', '2025-11-29 14:30', 4830000, N'Online', N'Đã thanh toán'),
('DV003', 'hoangnam92@gmail.com', 'CT003', '2025-12-25 09:00', '2025-12-25 09:30', 2587500, N'Online', N'Đã thanh toán'),
('DV004', 'huong85@gmail.com', 'CT003', '2025-12-26 16:00', '2025-12-26 16:30', 4105500, N'Tại quầy', N'Đã thanh toán'),
('DV005', 'ducho60@gmail.com', 'CT004', '2025-12-28 08:00', '2025-12-28 08:30', 2199375, N'Online', N'Đã thanh toán'),
('DV006', 'lananh01@gmail.com', 'CT004', '2025-12-28 11:00', '2025-12-28 11:30', 2328750, N'Online', N'Đã thanh toán'),
('DV007', 'thanhtung95@gmail.com', 'CT004', '2025-12-27 15:00', '2025-12-27 15:30', 2587500, N'Online', N'Hủy'),
('DV008', 'hoangnam92@gmail.com', 'CT005', '2025-12-29 10:00', '2025-12-29 10:30', 791000, N'Online', N'Đang chờ');
GO

-- =============================================
-- 23. VE_TAU
-- =============================================
INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
('VE001', 'KH001', 'CT001', 'DV001', NULL, '2025-11-28 10:15', 'GA01', 'GA12', 0, 2587500, N'Đã dùng', 'VT0101_01'),
('VE002', 'KH002', 'CT001', 'DV002', NULL, '2025-11-29 14:15', 'GA01', 'GA12', 0, 4830000, N'Đã dùng', 'VT0103_01'),
('VE003', 'KH003', 'CT003', 'DV003', NULL, '2025-12-25 09:15', 'GA01', 'GA12', 0, 2587500, N'Đã đặt', 'VT0101_05'),
('VE004', 'KH004', 'CT003', 'DV004', 'UD02', '2025-12-26 16:15', 'GA01', 'GA12', 724500, 4105500, N'Đã đặt', 'VT0103_05'),
('VE005', 'KH005', 'CT004', 'DV005', 'UD02', '2025-12-28 08:15', 'GA12', 'GA01', 388125, 2199375, N'Đã đặt', 'VT0201_01'),
('VE006', 'KH006', 'CT004', 'DV006', 'UD01', '2025-12-28 11:15', 'GA12', 'GA01', 258750, 2328750, N'Đã đặt', 'VT0201_02'),
('VE007', 'KH001', 'CT004', 'DV007', NULL, '2025-12-27 15:15', 'GA12', 'GA01', 0, 2587500, N'Hủy vé', 'VT0201_10'),
('VE008', 'KH003', 'CT005', 'DV008', NULL, NULL, 'GA01', 'GA08', 0, 791000, N'Giữ chỗ', 'VT0301_01'),
('VE009', 'KH009', 'CT003', 'DV004', 'UD03', '2025-12-26 16:15', 'GA01', 'GA12', 1293750, 1293750, N'Đã đặt', 'VT0101_06');
GO

-- =============================================
-- 24. DOI_VE
-- =============================================
INSERT INTO DOI_VE (MaDoiVe, NVThucHien, MaVeCu, MaVeMoi, ThoiGianDoi, PhiPhat, TrangThai) VALUES
('DV_01', 'NV002', 'VE003', 'VE005', '2025-12-28 09:00', 129375, 'Đã đổi');
GO

-- =============================================
-- 25. HOA_DON
-- =============================================
INSERT INTO HOA_DON (MaHoaDon, MaDatVe, MaDoiVe, MaNVLap, ThoiGianThanhToan, HinhThucThanhToan, GiaTien) VALUES
('HD001', 'DV001', NULL, NULL, '2025-11-28 10:20', N'Online', 2587500),
('HD002', 'DV002', NULL, NULL, '2025-11-29 14:20', N'Online', 4830000),
('HD003', 'DV003', NULL, NULL, '2025-12-25 09:20', N'Online', 2587500),
('HD004', 'DV004', NULL, 'NV002', '2025-12-26 16:20', N'Tại quầy', 5399250),
('HD005', 'DV005', NULL, NULL, '2025-12-28 08:20', N'Online', 2199375),
('HD006', 'DV006', NULL, NULL, '2025-12-28 11:20', N'Online', 2328750),
('HD007', NULL, 'DV_01', 'NV002', '2025-12-28 09:10', N'Tại quầy', 129375);
GO

PRINT N'=== NẠP DỮ LIỆU MẪU HOÀN TẤT ===';
PRINT N'Tổng: 25 bảng đã được nạp dữ liệu';
GO