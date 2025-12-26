USE VNRAILWAY;
GO

-- =============================================
-- PHẦN 1: SỬA LỖI CẤU TRÚC & DỌN DẸP (AUTO FIX)
-- =============================================

-- 1. Sửa cột VaiTro bảng TAI_KHOAN để nhận Tiếng Việt (Tránh lỗi Check Constraint)
BEGIN TRY
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_NAME = 'CK_VaiTro')
        ALTER TABLE TAI_KHOAN DROP CONSTRAINT CK_VaiTro;
    
    ALTER TABLE TAI_KHOAN ALTER COLUMN VaiTro NVARCHAR(20);
    ALTER TABLE TAI_KHOAN ADD CONSTRAINT CK_VaiTro CHECK (VaiTro IN (N'Khách hàng', N'Nhân viên', N'Quản trị', N'Quản lý'));
    PRINT N'-> Đã sửa cấu trúc bảng TAI_KHOAN.';
END TRY
BEGIN CATCH
    PRINT N'-> Cấu trúc bảng TAI_KHOAN đã chuẩn hoặc có lỗi bỏ qua.';
END CATCH
GO

-- 2. Xử lý Cursor bị treo (nếu có)
IF CURSOR_STATUS('global', 'cur_tau') >= -1
BEGIN
    IF CURSOR_STATUS('global', 'cur_tau') > -1 CLOSE cur_tau;
    DEALLOCATE cur_tau;
END

-- 3. Xóa sạch dữ liệu cũ theo thứ tự ràng buộc
DELETE FROM HOA_DON;
DELETE FROM DOI_VE;
DELETE FROM VE_TAU;
DELETE FROM DAT_VE;
DELETE FROM CHINH_SACH_GIA;
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
DELETE FROM THAM_SO;
DELETE FROM NHAN_VIEN;
GO

-- =============================================
-- PHẦN 2: BẮT ĐẦU NẠP DỮ LIỆU
-- =============================================
BEGIN TRANSACTION;
BEGIN TRY
    PRINT N'=== BẮT ĐẦU NẠP DỮ LIỆU MẪU ===';

    -- 1. THAM SỐ & HẠ TẦNG
    INSERT INTO THAM_SO VALUES ('TS01', N'Thời gian giữ vé', 30, NULL, '2020-01-01', NULL, NULL);

    INSERT INTO GA_TAU VALUES 
    ('GA01', N'Hà Nội', N'HN'), ('GA02', N'Phủ Lý', N'HNam'), ('GA03', N'Nam Định', N'NĐ'),
    ('GA04', N'Thanh Hóa', N'TH'), ('GA05', N'Vinh', N'NA'), ('GA06', N'Đồng Hới', N'QB'),
    ('GA07', N'Huế', N'TTH'), ('GA08', N'Đà Nẵng', N'ĐN'), ('GA09', N'Diêu Trì', N'BĐ'),
    ('GA10', N'Nha Trang', N'KH'), ('GA11', N'Bình Thuận', N'BT'), ('GA12', N'Sài Gòn', N'HCM');

    INSERT INTO TUYEN_TAU VALUES ('T01', N'Bắc - Nam', 1726), ('T02', N'Nam - Bắc', 1726);

    INSERT INTO DANH_SACH_GA VALUES 
    ('T01', 'GA01', 1, 0), ('T01', 'GA05', 2, 319), ('T01', 'GA08', 3, 791), ('T01', 'GA12', 4, 1726),
    ('T02', 'GA12', 1, 0), ('T02', 'GA08', 2, 935), ('T02', 'GA05', 3, 1407), ('T02', 'GA01', 4, 1726);

    INSERT INTO DOAN_TAU VALUES 
    ('DT01', 'SE1', 'Siemens', '2019-01-01', N'Hạng sang'),
    ('DT02', 'SE2', 'Siemens', '2019-01-01', N'Hạng sang'),
    ('DT03', 'TN1', 'DongFeng', '2010-01-01', N'Bình thường');

    -- TẠO GHẾ & TOA (Vòng lặp)
    DECLARE @MaDoanTau VARCHAR(10), @MaToa VARCHAR(10), @MaVT VARCHAR(10), @i INT, @j INT
    DECLARE cur_tau CURSOR FOR SELECT MaDoanTau FROM DOAN_TAU
    OPEN cur_tau
    FETCH NEXT FROM cur_tau INTO @MaDoanTau
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @i = 1
        WHILE @i <= 3
        BEGIN
            SET @MaToa = @MaDoanTau + '_T' + CAST(@i AS VARCHAR) -- Rút gọn tên để tránh lỗi độ dài
            IF @i = 2 -- Toa Giường
            BEGIN
                INSERT INTO TOA_TAU VALUES (@MaToa, @MaDoanTau, @i, N'Giường', 12);
                SET @j = 1
                WHILE @j <= 12 BEGIN
                    SET @MaVT = @MaToa + '_' + CAST(@j AS VARCHAR)
                    INSERT INTO VI_TRI_TREN_TOA VALUES (@MaVT, @MaToa, @j, N'Giường');
                    INSERT INTO GIUONG VALUES (@MaVT, (@j % 2) + 1, CEILING(@j/4.0));
                    SET @j = @j + 1
                END
            END
            ELSE -- Toa Ghế
            BEGIN
                INSERT INTO TOA_TAU VALUES (@MaToa, @MaDoanTau, @i, N'Ghế', 20);
                SET @j = 1
                WHILE @j <= 20 BEGIN
                    SET @MaVT = @MaToa + '_' + CAST(@j AS VARCHAR)
                    INSERT INTO VI_TRI_TREN_TOA VALUES (@MaVT, @MaToa, @j, N'Ghế');
                    SET @j = @j + 1
                END
            END
            SET @i = @i + 1
        END
        FETCH NEXT FROM cur_tau INTO @MaDoanTau
    END
    CLOSE cur_tau; DEALLOCATE cur_tau;

    -- 2. NHÂN VIÊN & TÀI KHOẢN (FULL)
    PRINT N'--- Tạo Nhân viên & Tài khoản ---';
    -- NV01: Quản lý (NVQuanLy = NULL)
    INSERT INTO NHAN_VIEN VALUES ('NV01', N'Nguyễn Sếp Tổng', '001080000001', '1980-01-01', N'Nam', N'Hà Nội', '0901000001', N'Quản lý', NULL);
    INSERT INTO TAI_KHOAN VALUES ('sep@vnrail.com', NULL, 'NV01', 'admin_sep', '123456', 1, N'Quản lý');

    -- Đội Lái tàu
    INSERT INTO NHAN_VIEN VALUES ('NV02', N'Trần Lái Một', '001080000002', '1985-02-02', N'Nam', N'HN', '0901000002', N'Lái tàu', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('lai1@vnrail.com', NULL, 'NV02', 'lai1', '123456', 1, N'Nhân viên');
    INSERT INTO NHAN_VIEN VALUES ('NV03', N'Lê Lái Hai', '001080000003', '1986-03-03', N'Nam', N'ĐN', '0901000003', N'Lái tàu', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('lai2@vnrail.com', NULL, 'NV03', 'lai2', '123456', 1, N'Nhân viên');
    INSERT INTO NHAN_VIEN VALUES ('NV04', N'Phạm Lái Ba', '001080000004', '1987-04-04', N'Nam', N'SG', '0901000004', N'Lái tàu', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('lai3@vnrail.com', NULL, 'NV04', 'lai3', '123456', 1, N'Nhân viên');

    -- Đội Toa & Trưởng tàu
    INSERT INTO NHAN_VIEN VALUES ('NV05', N'Hoàng Trưởng Tàu', '001080000005', '1982-05-05', N'Nam', N'HN', '0901000005', N'Toa tàu', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('truongtau@vnrail.com', NULL, 'NV05', 'truongtau', '123456', 1, N'Nhân viên');
    INSERT INTO NHAN_VIEN VALUES ('NV06', N'Võ Phụ Toa A', '001080000006', '1995-06-06', N'Nữ', N'Vinh', '0901000006', N'Toa tàu', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('phutoa1@vnrail.com', NULL, 'NV06', 'phutoa1', '123456', 1, N'Nhân viên');
    INSERT INTO NHAN_VIEN VALUES ('NV07', N'Đinh Phụ Toa B', '001080000007', '1996-07-07', N'Nữ', N'Huế', '0901000007', N'Toa tàu', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('phutoa2@vnrail.com', NULL, 'NV07', 'phutoa2', '123456', 1, N'Nhân viên');

    -- Bán vé & Admin
    INSERT INTO NHAN_VIEN VALUES ('NV08', N'Lý Bán Vé', '001080000008', '1992-08-08', N'Nữ', N'HN', '0901000008', N'Bán vé', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('banve@vnrail.com', NULL, 'NV08', 'banve', '123456', 1, N'Nhân viên');
    INSERT INTO PHAN_CONG_BAN_VE VALUES ('NV08', 'GA01', '2024-01-01', '2025-12-31');
    INSERT INTO NHAN_VIEN VALUES ('NV09', N'Admin System', '001080000009', '1990-09-09', N'Nam', N'Cloud', '0901000009', N'Quản trị', 'NV01');
    INSERT INTO TAI_KHOAN VALUES ('admin@vnrail.com', NULL, 'NV09', 'admin', '123456', 1, N'Quản trị');

    -- 3. KHÁCH HÀNG & TÀI KHOẢN
    INSERT INTO KHACH_HANG VALUES ('KH01', N'Phan Văn Khách', '001200000001', '1990-01-01', N'Nam', N'HN', '0912000001');
    INSERT INTO TAI_KHOAN VALUES ('khach1@gmail.com', 'KH01', NULL, 'khach1', '123456', 1, N'Khách hàng');
    INSERT INTO KHACH_HANG VALUES ('KH02', N'Lê Thị Mua', '001200000002', '1995-02-02', N'Nữ', N'SG', '0912000002');
    INSERT INTO TAI_KHOAN VALUES ('khach2@gmail.com', 'KH02', NULL, 'khach2', '123456', 1, N'Khách hàng');
    INSERT INTO KHACH_HANG VALUES ('KH03', N'Trần Sinh Viên', '001200000003', '2004-03-03', N'Nam', N'ĐN', '0912000003');
    INSERT INTO TAI_KHOAN VALUES ('khach3@gmail.com', 'KH03', NULL, 'khach3', '123456', 1, N'Khách hàng');
    INSERT INTO KHACH_HANG VALUES ('KH04', N'Nguyễn Vãng Lai', '001200000004', '1980-01-01', N'Nam', N'Vinh', '0912000004');
    INSERT INTO KHACH_HANG VALUES ('KH05', N'Trần Người Nhà', '001200000005', '1985-05-05', N'Nữ', N'Huế', '0912000005');

    -- 4. VẬN HÀNH (LỊCH TRÌNH & PHÂN CÔNG)
    PRINT N'--- Tạo Chuyến tàu & Phân công ---';
    DECLARE @Past DATE = DATEADD(MONTH, -1, GETDATE());
    DECLARE @Future DATE = DATEADD(DAY, 2, GETDATE());
    DECLARE @Now DATE = GETDATE();

    -- CT01: ĐÃ HOÀN THÀNH (Tháng trước)
    INSERT INTO CHUYEN_TAU VALUES ('CT01', 'T01', 'DT01', 'GA01', 'GA12', N'Hoàn thành');
    DECLARE @T1 DATETIME = CAST(@Past AS DATETIME) + '06:00';
    INSERT INTO THOI_GIAN_CHUYEN_TAU VALUES ('CT01', 'GA01', @T1, @T1, @T1, @T1), ('CT01', 'GA12', DATEADD(HH, 30, @T1), DATEADD(HH, 30, @T1), DATEADD(HH, 30, @T1), DATEADD(HH, 30, @T1));
    -- Phân công CT01
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC01', 'NV02', N'Nhân viên phụ trách lái', 'CT01', NULL, N'Xong');
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC02', 'NV05', N'Nhân viên trưởng', 'CT01', NULL, N'Xong');
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC03', 'NV06', N'Nhân viên phụ trách toa', 'CT01', 'DT01_T1', N'Xong');

    -- CT02: CHUẨN BỊ CHẠY (Tương lai)
    INSERT INTO CHUYEN_TAU VALUES ('CT02', 'T02', 'DT02', 'GA12', 'GA01', N'Chuẩn bị');
    DECLARE @T2 DATETIME = CAST(@Future AS DATETIME) + '08:00';
    INSERT INTO THOI_GIAN_CHUYEN_TAU VALUES ('CT02', 'GA12', @T2, @T2, NULL, NULL), ('CT02', 'GA01', DATEADD(HH, 32, @T2), DATEADD(HH, 32, @T2), NULL, NULL);
    -- Phân công CT02
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC04', 'NV03', N'Nhân viên phụ trách lái', 'CT02', NULL, N'Nhận việc');
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC05', 'NV07', N'Nhân viên trưởng', 'CT02', NULL, N'Nhận việc');
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC06', 'NV06', N'Nhân viên phụ trách toa', 'CT02', 'DT02_T2', N'Nhận việc'); -- NV06 đã xong CT01, giờ làm CT02

    -- CT03: ĐANG CHẠY (Hôm nay)
    INSERT INTO CHUYEN_TAU VALUES ('CT03', 'T01', 'DT03', 'GA01', 'GA12', N'Đang chạy');
    DECLARE @T3 DATETIME = CAST(@Now AS DATETIME) + '07:00';
    INSERT INTO THOI_GIAN_CHUYEN_TAU VALUES ('CT03', 'GA01', @T3, @T3, @T3, @T3), ('CT03', 'GA12', DATEADD(HH, 34, @T3), DATEADD(HH, 34, @T3), NULL, NULL);
    -- Phân công CT03
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC07', 'NV04', N'Nhân viên phụ trách lái', 'CT03', NULL, N'Đang làm');
    INSERT INTO PHAN_CONG_CHUYEN_TAU VALUES ('PC08', 'NV05', N'Nhân viên trưởng', 'CT03', NULL, N'Đang làm'); -- NV05 đã xong CT01, làm tiếp CT03

    -- 5. KINH DOANH (GIÁ & VÉ)
    PRINT N'--- Tạo Vé & Đơn hàng ---';
    -- Chính sách giá
    INSERT INTO CHINH_SACH_GIA VALUES ('BG01', '2023-01-01', '2025-12-31', N'Hạng sang', N'Ghế', NULL, 'DT01', 1726, 1000000);
    INSERT INTO CHINH_SACH_GIA VALUES ('BG02', '2023-01-01', '2025-12-31', N'Hạng sang', N'Ghế', NULL, 'DT02', 1726, 1000000);
    INSERT INTO CHINH_SACH_GIA VALUES ('BG03', '2023-01-01', '2025-12-31', N'Bình thường', N'Ghế', NULL, 'DT03', 1726, 800000);

    -- KỊCH BẢN 1: VÉ QUÁ KHỨ (CT01 - Đã dùng)
    -- KH01 mua cho cả nhà
    DECLARE @TimeMua1 DATETIME = DATEADD(DAY, -2, @Past);
    INSERT INTO DAT_VE VALUES ('DV01', 'khach1@gmail.com', 'CT01', @TimeMua1, DATEADD(HOUR, 1, @TimeMua1), 3000000, N'Online', N'Đã thanh toán');
    INSERT INTO HOA_DON VALUES ('HD01', 'DV01', NULL, NULL, @TimeMua1, N'Online', 3000000);
    
    INSERT INTO VE_TAU VALUES ('VE01', 'KH01', 'CT01', 'DV01', 'BG01', NULL, @TimeMua1, 'GA01', 'GA12', 0, 1000000, N'Đã dùng', 'DT01_T1_1');
    INSERT INTO VE_TAU VALUES ('VE02', 'KH04', 'CT01', 'DV01', 'BG01', NULL, @TimeMua1, 'GA01', 'GA12', 0, 1000000, N'Đã dùng', 'DT01_T1_2');
    INSERT INTO VE_TAU VALUES ('VE03', 'KH05', 'CT01', 'DV01', 'BG01', NULL, @TimeMua1, 'GA01', 'GA12', 0, 1000000, N'Đã dùng', 'DT01_T1_3');

    -- KỊCH BẢN 2: VÉ TƯƠNG LAI (CT02 - Đã đặt)
    -- KH02 đặt vé
    INSERT INTO DAT_VE VALUES ('DV02', 'khach2@gmail.com', 'CT02', GETDATE(), DATEADD(HH, 24, GETDATE()), 1000000, N'Online', N'Đã thanh toán');
    INSERT INTO HOA_DON VALUES ('HD02', 'DV02', NULL, NULL, GETDATE(), N'Online', 1000000);
    INSERT INTO VE_TAU VALUES ('VE04', 'KH02', 'CT02', 'DV02', 'BG02', NULL, GETDATE(), 'GA12', 'GA01', 0, 1000000, N'Đã đặt', 'DT02_T1_1');
    -- KH03 (Sinh viên)
    INSERT INTO UU_DAI_GIA VALUES ('UD01', N'Sinh Viên', N'Giảm 10%', N'Sinh viên', 10);
    INSERT INTO DAT_VE VALUES ('DV03', 'khach3@gmail.com', 'CT02', GETDATE(), DATEADD(HH, 24, GETDATE()), 900000, N'Online', N'Đã thanh toán');
    INSERT INTO HOA_DON VALUES ('HD03', 'DV03', NULL, NULL, GETDATE(), N'Online', 900000);
    INSERT INTO VE_TAU VALUES ('VE05', 'KH03', 'CT02', 'DV03', 'BG02', 'UD01', GETDATE(), 'GA12', 'GA01', 100000, 900000, N'Đã đặt', 'DT02_T1_2');

    -- KỊCH BẢN 3: VÉ HIỆN TẠI (CT03 - Đang chạy)
    -- KH04 mua tại quầy. QUAN TRỌNG: Phải set giờ mua TRƯỚC giờ tàu chạy (07:00) để không lỗi Trigger
    DECLARE @TimeMua3 DATETIME = DATEADD(HOUR, -2, @T3); -- Mua trước 2 tiếng so với giờ tàu chạy
    
    INSERT INTO DAT_VE VALUES ('DV04', 'banve@vnrail.com', 'CT03', @TimeMua3, @TimeMua3, 800000, N'Tại quầy', N'Đã thanh toán');
    INSERT INTO HOA_DON VALUES ('HD04', 'DV04', NULL, 'NV08', @TimeMua3, N'Tại quầy', 800000);
    INSERT INTO VE_TAU VALUES ('VE06', 'KH04', 'CT03', 'DV04', 'BG03', NULL, @TimeMua3, 'GA01', 'GA12', 0, 800000, N'Đã dùng', 'DT03_T1_1');

    -- KỊCH BẢN 4: VÉ HỦY & ĐỔI
    -- KH01 hủy vé chuyến CT02
    INSERT INTO DAT_VE VALUES ('DV05', 'khach1@gmail.com', 'CT02', GETDATE(), GETDATE(), 0, N'Online', N'Hủy');
    INSERT INTO VE_TAU VALUES ('VE07', 'KH01', 'CT02', 'DV05', 'BG02', NULL, GETDATE(), 'GA12', 'GA01', 0, 1000000, N'Hủy vé', 'DT02_T1_10');

    PRINT N'=== NẠP DỮ LIỆU THÀNH CÔNG ===';
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF CURSOR_STATUS('global', 'cur_tau') >= -1 BEGIN IF CURSOR_STATUS('global', 'cur_tau') > -1 CLOSE cur_tau; DEALLOCATE cur_tau; END
    PRINT N'!!! CÓ LỖI - ROLLBACK !!!';
    PRINT N'Lỗi chi tiết: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION;
END CATCH;
GO
