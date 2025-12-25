USE VNRAILWAY;
GO

-- Tắt kiểm tra Trigger tạm thời nếu muốn import nhanh, nhưng ở đây tôi để nó BẬT để chứng minh dữ liệu chuẩn.
-- Nếu bạn gặp lỗi, hãy kiểm tra lại Trigger.

BEGIN TRANSACTION; -- Dùng Transaction để nếu lỗi thì rollback sạch sẽ

BEGIN TRY
    -- =============================================
    -- 1. DỮ LIỆU DANH MỤC & HẠ TẦNG
    -- =============================================
    PRINT N'1. Đang Insert Danh mục & Hạ tầng...'

    -- 1.1 Ga Tàu (10 Ga dọc Bắc Nam)
    INSERT INTO GA_TAU (MaGaTau, TenGa, DiaChi) VALUES
    ('GA01', N'Hà Nội', N'120 Lê Duẩn, Hà Nội'),
    ('GA02', N'Phủ Lý', N'Hai Bà Trưng, Phủ Lý'),
    ('GA03', N'Nam Định', N'Trần Đăng Ninh, Nam Định'),
    ('GA04', N'Thanh Hóa', N'Đông Sơn, Thanh Hóa'),
    ('GA05', N'Vinh', N'Lê Ninh, Nghệ An'),
    ('GA06', N'Đồng Hới', N'Tiểu khu 4, Quảng Bình'),
    ('GA07', N'Huế', N'Bùi Thị Xuân, Huế'),
    ('GA08', N'Đà Nẵng', N'Hải Phòng, Đà Nẵng'),
    ('GA09', N'Nha Trang', N'Thái Nguyên, Khánh Hòa'),
    ('GA10', N'Sài Gòn', N'Nguyễn Thông, TP.HCM');

    -- 1.2 Tuyến Tàu
    INSERT INTO TUYEN_TAU (MaTuyenTau, TenTuyen, KhoangCach) VALUES
    ('T01', N'Tuyến Bắc - Nam (Thống Nhất)', 1726),
    ('T02', N'Tuyến Nam - Bắc (Thống Nhất)', 1726);

    -- 1.3 Danh sách Ga thuộc Tuyến (Mapping)
    -- Tuyến T01: Hà Nội -> Sài Gòn
    INSERT INTO DANH_SACH_GA (MaTuyenTau, MaGaTau, ThuTu, KhoangCach) VALUES
    ('T01', 'GA01', 1, 0),    -- HN
    ('T01', 'GA02', 2, 56),   -- Phu Ly
    ('T01', 'GA03', 3, 87),   -- Nam Dinh
    ('T01', 'GA04', 4, 175),  -- Thanh Hoa
    ('T01', 'GA05', 5, 319),  -- Vinh
    ('T01', 'GA06', 6, 522),  -- Dong Hoi
    ('T01', 'GA07', 7, 688),  -- Hue
    ('T01', 'GA08', 8, 791),  -- Da Nang
    ('T01', 'GA09', 9, 1315), -- Nha Trang
    ('T01', 'GA10', 10, 1726);-- SG

    -- Tuyến T02: Sài Gòn -> Hà Nội (Ngược lại)
    INSERT INTO DANH_SACH_GA (MaTuyenTau, MaGaTau, ThuTu, KhoangCach) VALUES
    ('T02', 'GA10', 1, 0),
    ('T02', 'GA09', 2, 411),
    ('T02', 'GA08', 3, 935),
    ('T02', 'GA07', 4, 1038),
    ('T02', 'GA06', 5, 1204),
    ('T02', 'GA05', 6, 1407),
    ('T02', 'GA04', 7, 1551),
    ('T02', 'GA03', 8, 1639),
    ('T02', 'GA02', 9, 1670),
    ('T02', 'GA01', 10, 1726);

    -- 1.4 Đoàn Tàu
    INSERT INTO DOAN_TAU (MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau) VALUES
    ('DT01', 'SE1', 'Siemens', '2020-01-01', N'Hạng sang'), -- Chạy Bắc Nam
    ('DT02', 'SE2', 'Siemens', '2020-01-01', N'Hạng sang'), -- Chạy Nam Bắc
    ('DT03', 'TN1', 'Dổi Mới', '2015-06-15', N'Bình thường');

    -- 1.5 Toa Tàu & Vị Trí (Insert vòng lặp cho nhanh)
    -- Giả sử mỗi tàu có 1 toa Ghế (20 chỗ) và 1 toa Giường (3 khoang x 4 giường = 12 chỗ)
    DECLARE @MaTau VARCHAR(10), @i INT, @MaToa VARCHAR(10), @j INT, @MaViTri VARCHAR(10)
    DECLARE cursor_tau CURSOR FOR SELECT MaDoanTau FROM DOAN_TAU
    OPEN cursor_tau
    FETCH NEXT FROM cursor_tau INTO @MaTau
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- === Tạo Toa 1: Ghế ngồi ===
        SET @MaToa = @MaTau + '_T1'
        INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES (@MaToa, @MaTau, 1, N'Ghế', 20)
        
        SET @j = 1
        WHILE @j <= 20
        BEGIN
            SET @MaViTri = @MaToa + '_' + CAST(@j AS VARCHAR)
            INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES (@MaViTri, @MaToa, @j, N'Ghế')
            SET @j = @j + 1
        END

        -- === Tạo Toa 2: Giường nằm (2 tầng) ===
        SET @MaToa = @MaTau + '_T2'
        INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri) VALUES (@MaToa, @MaTau, 2, N'Giường', 12)
        
        SET @j = 1
        WHILE @j <= 12
        BEGIN
            SET @MaViTri = @MaToa + '_' + CAST(@j AS VARCHAR)
            INSERT INTO VI_TRI_TREN_TOA (MaViTri, MaToaTau, STT, LoaiVT) VALUES (@MaViTri, @MaToa, @j, N'Giường')
            
            -- Insert chi tiết Giường (Tầng 1 và Tầng 2)
            INSERT INTO GIUONG (MaViTri, Tang, Phong) 
            VALUES (@MaViTri, (@j % 2) + 1, CEILING(@j/4.0)) -- Logic giả định tầng và phòng
            
            SET @j = @j + 1
        END

        FETCH NEXT FROM cursor_tau INTO @MaTau
    END
    CLOSE cursor_tau
    DEALLOCATE cursor_tau

    -- =============================================
    -- 2. DỮ LIỆU CON NGƯỜI (NHÂN VIÊN & KHÁCH)
    -- =============================================
    PRINT N'2. Đang Insert Nhân sự & Khách hàng...'

    -- 2.1 Nhân viên (Insert Quản lý trước)
    INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai, LoaiNhanVien, NVQuanLy) VALUES
    ('NV01', N'Nguyễn Văn Sếp', '001090000001', '1980-01-01', N'Nam', N'Hà Nội', '0901111111', N'Quản lý', NULL);

    -- Update chính mình quản lý mình (hoặc NULL) -> Insert nhân viên cấp dưới
    INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai, LoaiNhanVien, NVQuanLy) VALUES
    ('NV02', N'Trần Thị Vé', '001090000002', '1995-05-05', N'Nữ', N'Hà Nội', '0902222222', N'Bán vé', 'NV01'),
    ('NV03', N'Lê Văn Lái', '001090000003', '1985-03-10', N'Nam', N'Đà Nẵng', '0903333333', N'Lái tàu', 'NV01'),
    ('NV04', N'Phạm Trưởng Tàu', '001090000004', '1982-12-12', N'Nam', N'Sài Gòn', '0904444444', N'Toa tàu', 'NV01'), -- Kiêm trưởng tàu
    ('NV05', N'Hoàng Phụ Toa', '001090000005', '1998-08-08', N'Nữ', N'Vinh', '0905555555', N'Toa tàu', 'NV01');

    -- 2.2 Khách hàng
    INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai) VALUES
    ('KH01', N'Khách Văn A', '001200000001', '2000-01-01', N'Nam', N'Hà Nội', '0911111111'),
    ('KH02', N'Khách Thị B', '001200000002', '1999-09-09', N'Nữ', N'Sài Gòn', '0912222222');

    -- 2.3 Tài khoản
    INSERT INTO TAI_KHOAN (Email, MaKH, MaNV, TenTaiKhoan, MatKhau, TrangThai, VaiTro) VALUES
    ('admin@vnrail.com', NULL, 'NV01', 'admin', '123456', 1, 'Quản trị'),
    ('ve01@vnrail.com', NULL, 'NV02', 'banve01', '123456', 1, 'Bán vé'),
    ('khachA@gmail.com', 'KH01', NULL, 'khacha', '123456', 1, 'Khách hàng');

    -- 2.4 Ưu đãi
    INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram) VALUES
    ('KM_SV', N'Sinh Viên', N'Giảm giá cho thẻ SV', N'Sinh viên', 10),
    ('KM_NG', N'Người cao tuổi', N'Trên 60 tuổi', N'Người già', 15);

    -- =============================================
    -- 3. VẬN HÀNH (LỊCH TRÌNH & PHÂN CÔNG)
    -- =============================================
    PRINT N'3. Đang Insert Lịch chạy tàu...'

    -- Ngày mai tàu chạy
    DECLARE @NgayMai DATE = DATEADD(DAY, 1, GETDATE());
    DECLARE @NgayKia DATE = DATEADD(DAY, 2, GETDATE());

    -- 3.1 Chuyến Tàu
    -- CT01: SE1 chạy Bắc Nam ngày mai
    INSERT INTO CHUYEN_TAU (MaChuyenTau, MaTuyenTau, MaDoanTau, GaXuatPhat, GaKetThuc, TrangThai) VALUES
    ('CT01', 'T01', 'DT01', 'GA01', 'GA10', N'Chuẩn bị');

    -- CT02: TN1 chạy Nam Bắc ngày kia
    INSERT INTO CHUYEN_TAU (MaChuyenTau, MaTuyenTau, MaDoanTau, GaXuatPhat, GaKetThuc, TrangThai) VALUES
    ('CT02', 'T02', 'DT03', 'GA10', 'GA01', N'Chuẩn bị');

    -- 3.2 Thời gian chi tiết (Logic cực quan trọng để qua mặt Trigger RB-149)
    -- CT01: Xuất phát HN 06:00 sáng mai
    DECLARE @Time01 DATETIME = CAST(@NgayMai AS DATETIME) + CAST('06:00:00' AS DATETIME);
    
    INSERT INTO THOI_GIAN_CHUYEN_TAU (MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen) VALUES
    ('CT01', 'GA01', @Time01, @Time01), -- HN: Den = Di
    ('CT01', 'GA05', DATEADD(HOUR, 6, @Time01), DATEADD(HOUR, 5, @Time01)), -- Vinh (Đến sau 5h, Đi sau 6h)
    ('CT01', 'GA08', DATEADD(HOUR, 14, @Time01), DATEADD(HOUR, 13, @Time01)), -- ĐN
    ('CT01', 'GA10', DATEADD(HOUR, 30, @Time01), DATEADD(HOUR, 30, @Time01)); -- SG

    -- CT02: Xuất phát SG 08:00 sáng kia
    DECLARE @Time02 DATETIME = CAST(@NgayKia AS DATETIME) + CAST('08:00:00' AS DATETIME);
    INSERT INTO THOI_GIAN_CHUYEN_TAU (MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen) VALUES
    ('CT02', 'GA10', @Time02, @Time02),
    ('CT02', 'GA08', DATEADD(HOUR, 16, @Time02), DATEADD(HOUR, 15, @Time02)),
    ('CT02', 'GA01', DATEADD(HOUR, 32, @Time02), DATEADD(HOUR, 32, @Time02));

    -- 3.3 Phân công nhân viên (Thỏa mãn RB-145: 1 Lái, 1 Trưởng)
    -- Phân công cho CT01 (SE1)
    INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, VaiTro, MaChuyenTau, MaToa, TrangThai) VALUES
    ('PC01', 'NV03', N'Nhân viên phụ trách lái', 'CT01', NULL, N'Nhận việc'),
    ('PC02', 'NV04', N'Nhân viên trưởng', 'CT01', NULL, N'Nhận việc'),
    ('PC03', 'NV05', N'Nhân viên phụ trách toa', 'CT01', 'DT01_T1', N'Nhận việc'); -- Phụ trách Toa 1 tàu SE1

    -- =============================================
    -- 4. KINH DOANH (GIÁ & VÉ)
    -- =============================================
    PRINT N'4. Đang Insert Giá & Vé...'

    -- 4.1 Chính sách giá (Thỏa mãn RB-152: Tầng 1 đắt hơn Tầng 2)
    -- Giá cho SE1 (Hạng sang)
    INSERT INTO CHINH_SACH_GIA (MaBangGia, NgayApDung, NgayKetThuc, LoaiTau, LoaiVT, Tang, MaDoanTau, SoKm, GiaTien) VALUES
    ('BG01', '2024-01-01', '2025-12-31', N'Hạng sang', N'Ghế', NULL, 'DT01', 1726, 1000000), -- Ghế toàn tuyến
    ('BG02', '2024-01-01', '2025-12-31', N'Hạng sang', N'Giường', 1, 'DT01', 1726, 1500000), -- Giường Tầng 1 (Đắt)
    ('BG03', '2024-01-01', '2025-12-31', N'Hạng sang', N'Giường', 2, 'DT01', 1726, 1300000); -- Giường Tầng 2 (Rẻ hơn)

    -- 4.2 Đặt vé (Booking)
    -- Khách đặt Online chuyến CT01
    INSERT INTO DAT_VE (MaDatVe, Email, MaChuyenTau, ThoiGianDat, HanThanhToan, TongTienDuKien, KenhDat, TrangThai) VALUES
    ('DV01', 'khachA@gmail.com', 'CT01', GETDATE(), DATEADD(MINUTE, 30, GETDATE()), 1000000, N'Online', N'Đã thanh toán');

    -- 4.3 Vé Tàu (Quan trọng: Phải khớp Logic MaDoanTau)
    -- Bán vé Ghế ngồi số 1, Toa 1, Tàu SE1 (DT01) cho Chuyến CT01 (Cũng chạy tàu DT01) -> Hợp lệ
    INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaBangGia, MaUuDai, ThoiGianXuatVe, GaXuatPhat, GaDen, SoTienGiam, GiaThuc, TrangThai, MaViTri) VALUES
    ('VE01', 'KH01', 'CT01', 'DV01', 'BG01', NULL, GETDATE(), 'GA01', 'GA10', 0, 1000000, N'Đã đặt', 'DT01_T1_1');

    PRINT N'=== HOÀN TẤT NHẬP DỮ LIỆU MẪU ==='
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    PRINT N'!!! CÓ LỖI XẢY RA - ROLLBACK !!!'
    PRINT ERROR_MESSAGE();
    ROLLBACK TRANSACTION;
END CATCH;
GO

