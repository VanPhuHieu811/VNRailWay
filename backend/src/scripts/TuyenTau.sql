USE VNRAILWAY
GO
-- Tạo tuyển tàu mới
CREATE OR ALTER PROCEDURE sp_TaoTuyenTau
    @MaTuyenTau VARCHAR(10),
    @TenTuyen NVARCHAR(50),
    @KhoangCach FLOAT
AS
BEGIN
    -- Kiểm tra trùng lặp
    IF EXISTS (SELECT 1 FROM TUYEN_TAU WHERE MaTuyenTau = @MaTuyenTau)
    BEGIN
        RAISERROR(N'Mã tuyến tàu đã tồn tại.', 16, 1);
        RETURN;
    END

    INSERT INTO TUYEN_TAU (MaTuyenTau, TenTuyen, KhoangCach)
    VALUES (@MaTuyenTau, @TenTuyen, @KhoangCach);
END;
GO

-- Thêm các ga tàu vào tuyến tàu
CREATE OR ALTER PROCEDURE sp_ThemGaVaoTuyen
    @MaTuyenTau VARCHAR(10),
    @MaGaTau VARCHAR(10),
    @ThuTu INT,
    @KhoangCach FLOAT -- Khoảng cách từ ga đầu tiên
AS
BEGIN
    -- 1. Kiểm tra tuyến tàu
    IF NOT EXISTS (SELECT 1 FROM TUYEN_TAU WHERE MaTuyenTau = @MaTuyenTau)
    BEGIN
        RAISERROR(N'Tuyến tàu không tồn tại.', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra ga tàu
    IF NOT EXISTS (SELECT 1 FROM GA_TAU WHERE MaGaTau = @MaGaTau)
    BEGIN
        RAISERROR(N'Mã ga tàu không tồn tại.', 16, 1);
        RETURN;
    END

    -- 3. Kiểm tra xem ga có trong tuyến chưa
    IF EXISTS (SELECT 1 FROM DANH_SACH_GA WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @MaGaTau)
    BEGIN
        RAISERROR(N'Ga này đã tồn tại trong tuyến.', 16, 1);
        RETURN;
    END

    INSERT INTO DANH_SACH_GA (MaTuyenTau, MaGaTau, ThuTu, KhoangCach)
    VALUES (@MaTuyenTau, @MaGaTau, @ThuTu, @KhoangCach);
END;
GO

-- Cập nhật thông tin tuyến tàu
CREATE OR ALTER PROCEDURE sp_CapNhatTuyenTau
    @MaTuyenTau VARCHAR(10),
    @TenTuyen NVARCHAR(50),
    @KhoangCach FLOAT
AS
BEGIN
    -- Kiểm tra tồn tại
    IF NOT EXISTS (SELECT 1 FROM TUYEN_TAU WHERE MaTuyenTau = @MaTuyenTau)
    BEGIN
        RAISERROR(N'Không tìm thấy tuyến tàu để cập nhật.', 16, 1);
        RETURN;
    END

    UPDATE TUYEN_TAU 
    SET TenTuyen = @TenTuyen, 
        KhoangCach = @KhoangCach 
    WHERE MaTuyenTau = @MaTuyenTau;
END;
GO