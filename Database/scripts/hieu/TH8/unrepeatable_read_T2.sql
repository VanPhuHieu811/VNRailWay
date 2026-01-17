USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_CapNhatUuDai
    @MaUuDai VARCHAR(10),
    @LoaiUuDai NVARCHAR(50) = NULL,
    @MoTa NVARCHAR(255) = NULL,
    @DoiTuong NVARCHAR(50) = NULL,
    @PhanTram INT = NULL,
    @NgayBatDau DATETIME = NULL,
    @NgayKetThuc DATETIME = NULL,
    @TrangThai NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra ưu đãi có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM UU_DAI_GIA WHERE MaUuDai = @MaUuDai)
    BEGIN
        RAISERROR(N'Mã ưu đãi không tồn tại.', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra tính hợp lệ của các tham số đầu vào
    IF @PhanTram IS NOT NULL AND (@PhanTram < 0 OR @PhanTram > 100)
    BEGIN
        RAISERROR(N'Phần trăm giảm giá phải từ 0 đến 100.', 16, 1);
        RETURN;
    END

    IF @TrangThai IS NOT NULL AND @TrangThai NOT IN (N'Đang áp dụng', N'Hết hạn', N'Tạm ngưng')
    BEGIN
         RAISERROR(N'Trạng thái không hợp lệ.', 16, 1);
         RETURN;
    END

    -- 3. Kiểm tra Logic Ngày tháng 
    DECLARE @CheckStart DATETIME, @CheckEnd DATETIME;

    SELECT @CheckStart = NgayBatDau, @CheckEnd = NgayKetThuc 
    FROM UU_DAI_GIA WHERE MaUuDai = @MaUuDai;

    SET @CheckStart = ISNULL(@NgayBatDau, @CheckStart);
    SET @CheckEnd = ISNULL(@NgayKetThuc, @CheckEnd);

    IF @CheckEnd IS NOT NULL AND @CheckStart > @CheckEnd
    BEGIN
        RAISERROR(N'Ngày bắt đầu không được lớn hơn ngày kết thúc.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        UPDATE UU_DAI_GIA
        SET 
            LoaiUuDai = ISNULL(@LoaiUuDai, LoaiUuDai),
            MoTa = ISNULL(@MoTa, MoTa),
            DoiTuong = ISNULL(@DoiTuong, DoiTuong),
            PhanTram = ISNULL(@PhanTram, PhanTram),
            NgayBatDau = ISNULL(@NgayBatDau, NgayBatDau),
            NgayKetThuc = ISNULL(@NgayKetThuc, NgayKetThuc),
            TrangThai = ISNULL(@TrangThai, TrangThai)
        WHERE MaUuDai = @MaUuDai;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;
GO