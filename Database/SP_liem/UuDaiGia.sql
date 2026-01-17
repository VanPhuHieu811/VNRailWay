USE VNRAILWAY
GO


CREATE OR ALTER PROCEDURE sp_LayDanhSachUuDai
    @TuKhoa NVARCHAR(100) = NULL 
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MaUuDai,
        LoaiUuDai,
        MoTa,
        DoiTuong,
        PhanTram,
        NgayBatDau,
        NgayKetThuc,
        TrangThai
    FROM UU_DAI_GIA
    WHERE 
        (@TuKhoa IS NULL OR @TuKhoa = '') 
        OR (LoaiUuDai LIKE N'%' + @TuKhoa + N'%')
        OR (MaUuDai LIKE N'%' + @TuKhoa + N'%')
    ORDER BY NgayBatDau DESC; 
END;
GO

CREATE OR ALTER PROCEDURE sp_TaoUuDai
    @LoaiUuDai NVARCHAR(50),
    @MoTa NVARCHAR(255),
    @DoiTuong NVARCHAR(50),
    @PhanTram INT,
    @NgayBatDau DATETIME,
    @NgayKetThuc DATETIME,
    @TrangThai NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaUuDaiGenerate VARCHAR(10);

    -- Validation cơ bản
    IF @PhanTram < 0 OR @PhanTram > 100
    BEGIN
        RAISERROR(N'Phần trăm giảm giá phải từ 0 đến 100.', 16, 1);
        RETURN;
    END

    IF @NgayKetThuc IS NOT NULL AND @NgayBatDau > @NgayKetThuc
    BEGIN
        RAISERROR(N'Ngày bắt đầu không được lớn hơn ngày kết thúc.', 16, 1);
        RETURN;
    END
    
    -- Kiểm tra trạng thái hợp lệ 
    IF @TrangThai NOT IN (N'Đang áp dụng', N'Hết hạn', N'Tạm ngưng')
    BEGIN
         RAISERROR(N'Trạng thái không hợp lệ.', 16, 1);
         RETURN;
    END	

    BEGIN TRY
        BEGIN TRAN;

        SELECT @MaUuDaiGenerate = 
            'UD' + RIGHT('00' + CAST(ISNULL(MAX(CAST(SUBSTRING(MaUuDai, 3, LEN(MaUuDai)) AS INT)), 0) + 1 AS VARCHAR), 2)
        FROM UU_DAI_GIA WITH (UPDLOCK, HOLDLOCK);

        INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram, NgayBatDau, NgayKetThuc, TrangThai)
        VALUES (@MaUuDaiGenerate, @LoaiUuDai, @MoTa, @DoiTuong, @PhanTram, @NgayBatDau, @NgayKetThuc, @TrangThai);

        COMMIT;
        
        SELECT @MaUuDaiGenerate AS MaUuDai;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;
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

    -- 2. Validate dữ liệu đầu vào (nếu có truyền vào)
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

    -- 3. Kiểm tra Logic Ngày tháng (Kết hợp dữ liệu cũ và mới)
    DECLARE @CheckStart DATETIME, @CheckEnd DATETIME;

    -- Lấy giá trị hiện tại trong DB
    SELECT @CheckStart = NgayBatDau, @CheckEnd = NgayKetThuc 
    FROM UU_DAI_GIA WHERE MaUuDai = @MaUuDai;

    -- Nếu có truyền giá trị mới thì dùng, không thì dùng giá trị cũ
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