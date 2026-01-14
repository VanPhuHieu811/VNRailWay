USE VNRAILWAY
GO

-- Tạo đoàn tàu
-- Sau khi xử lý việc tạo một đoàn tàu, ở phía front end sẽ tiếp tục gọi API để tạo toa tàu
CREATE OR ALTER PROCEDURE sp_TaoDoanTau
    @TenTau NVARCHAR(100),
    @HangSanXuat NVARCHAR(100),
    @NgayVanHanh DATE,
    @LoaiTau NVARCHAR(20),
    @TrangThai NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaDoanTauGenerate NVARCHAR(10);

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

    BEGIN TRY
        BEGIN TRAN;

        -- Ngăn chặn race condition
        SELECT @MaDoanTauGenerate = 
            'SE' + RIGHT('00' + CAST(ISNULL(MAX(CAST(SUBSTRING(MaDoanTau, 3, LEN(MaDoanTau)) AS INT)), 0) + 1 AS VARCHAR), 2)
        FROM DOAN_TAU WITH (UPDLOCK, HOLDLOCK);

        INSERT INTO DOAN_TAU (MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai)
        VALUES (@MaDoanTauGenerate, @TenTau, @HangSanXuat, @NgayVanHanh, @LoaiTau, @TrangThai);

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;
GO


-- Tạo toa tàu
CREATE OR ALTER PROCEDURE sp_TaoToaTau
    @MaDoanTau NVARCHAR(10),
    @LoaiToa NVARCHAR(10),
    @SLViTri INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @STT INT,
        @MaToaTau NVARCHAR(20),
        @DoanTauNumber NVARCHAR(5);

    -- Kiểm tra mã đoàn tàu tồn tại
    IF NOT EXISTS (SELECT 1 FROM DOAN_TAU WHERE MaDoanTau = @MaDoanTau)
    BEGIN
        RAISERROR(N'Mã đoàn tàu không tồn tại.', 16, 1);
        RETURN;
    END

    -- Kiểm tra loại toa hợp lệ
    IF @LoaiToa NOT IN (N'Ghế', N'Giường')
    BEGIN
        RAISERROR(N'Loại toa không hợp lệ.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;
        -- Tạo STT an toàn theo từng MaDoanTau
        SELECT @STT = ISNULL(MAX(STT), 0) + 1
        FROM TOA_TAU WITH (UPDLOCK, HOLDLOCK)
        WHERE MaDoanTau = @MaDoanTau;

        -- MaDoanTau (T01 → 01)
        SET @DoanTauNumber = RIGHT(@MaDoanTau, 2);

        -- MaToaTau: T01_01, T01_02, ...
        SET @MaToaTau = 'T' + @DoanTauNumber + '_' + RIGHT('00' + CAST(@STT AS VARCHAR), 2);

        INSERT INTO TOA_TAU (MaToaTau, MaDoanTau, STT, LoaiToa, SLViTri)
        VALUES (@MaToaTau, @MaDoanTau, @STT, @LoaiToa, @SLViTri);
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;
GO
