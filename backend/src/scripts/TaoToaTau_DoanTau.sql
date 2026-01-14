USE VNRAILWAY
GO

-- Tạo đoàn tàu
-- Sau khi xử lý việc tạo một đoàn tàu, ở phía front end sẽ tiếp tục gọi API để tạo toa tàu
CREATE OR ALTER PROCEDURE sp_TaoDoanTau
    @MaDoanTau VARCHAR(10),
    @TenTau NVARCHAR(100),
    @HangSanXuat NVARCHAR(100),
    @NgayVanHanh DATE,
    @LoaiTau NVARCHAR(20),
	@TrangThai NVARCHAR(20)
AS
BEGIN
    -- Kiểm tra trùng mã
    IF EXISTS (SELECT 1 FROM DOAN_TAU WHERE MaDoanTau = @MaDoanTau)
    BEGIN
        RAISERROR(N'Mã đoàn tàu đã tồn tại.', 16, 1);
        RETURN;
    END

	-- Kiểm tra loại tàu
	IF @LoaiTau NOT IN (N'Hạng sang', N'Bình thường')
	BEGIN
		RAISERROR(N'Loại tàu không hợp lệ.', 16, 1);
		RETURN;
	END

	IF @TrangThai NOT IN (N'Hoạt động', N'Bảo trì')
	BEGIN
		RAISERROR(N'Trạng thái không hợp lệ.', 16, 1);
		RETURN;
	END

    INSERT INTO DOAN_TAU (MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai)
    VALUES (@MaDoanTau, @TenTau, @HangSanXuat, @NgayVanHanh, @LoaiTau, @TrangThai);
END;
GO

-- Tạo toa tàu
CREATE OR ALTER PROCEDURE sp_TaoToaTau
    @MaToaTau VARCHAR(10),
    @MaDoanTau VARCHAR(10),
    @STT INT,
    @LoaiToa NVARCHAR(10),
    @SLViTri INT
AS
BEGIN
    -- Kiểm tra xem mã đoàn tàu đã tồn tại chưa
    IF NOT EXISTS (SELECT 1 FROM DOAN_TAU WHERE MaDoanTau = @MaDoanTau)
    BEGIN
        RAISERROR(N'Mã đoàn tàu không tồn tại.', 16, 1);
        RETURN;
    END

    -- Kiểm tra trùng mã toa
    IF EXISTS (SELECT 1 FROM TOA_TAU WHERE MaToaTau = @MaToaTau)
    BEGIN
        RAISERROR(N'Mã toa tàu đã tồn tại.', 16, 1);
        RETURN;
    END

	-- Kiểm tra loại toa hợp lệ
	IF @LoaiToa NOT IN (N'Ghế', N'Giường')
	BEGIN
		RAISERROR(N'Loại toa không hợp lệ.', 16, 1);
		RETURN;
	END

    INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri)
    VALUES (@MaToaTau, @MaDoanTau, @STT, @LoaiToa, @SLViTri);
END;
GO