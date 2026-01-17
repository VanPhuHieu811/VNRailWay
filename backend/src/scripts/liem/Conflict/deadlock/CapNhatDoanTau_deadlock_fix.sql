CREATE OR ALTER PROCEDURE sp_CapNhatDoanTau_DeadlockFix
    @MaDoanTau VARCHAR(10),
    @TenTau NVARCHAR(100) = NULL,
    @HangSanXuat NVARCHAR(100) = NULL,
    @NgayVanHanh DATE = NULL,
    @LoaiTau NVARCHAR(20) = NULL,
    @TrangThai NVARCHAR(20) = NULL
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF NOT EXISTS (
            SELECT 1
            FROM DOAN_TAU
            WHERE MaDoanTau = @MaDoanTau
        )
        BEGIN
            RAISERROR(N'MÃ ĐOÀN TÀU KHÔNG TỒN TẠI', 16, 1)
        END

        -- 2. trap
        IF EXISTS (
            SELECT 1
            FROM CHUYEN_TAU WITH (UPDLOCK, HOLDLOCK)
            WHERE MaDoanTau = @MaDoanTau
              AND TrangThai IN (N'Đang chạy')
        )
        BEGIN
            ;THROW 50001, N'Cảnh báo: tàu đang chạy, không thể thay đổi thông tin', 1;
			RETURN;
        END
		ELSE IF (@TrangThai = N'Bảo trì')
		BEGIN
			DECLARE @Now DATETIME = GETDATE();
			DECLARE @Limit DATETIME = DATEADD(DAY, 10, @Now);
			UPDATE CT
			SET CT.TrangThai = N'Hủy'
			FROM CHUYEN_TAU CT
			WHERE CT.MaDoanTau = @MaDoanTau
			  AND CT.TrangThai IN (N'Chuẩn bị')
			  AND EXISTS (
				  SELECT 1
				  FROM THOI_GIAN_CHUYEN_TAU TG
				  WHERE TG.MaChuyenTau = CT.MaChuyenTau
					AND TG.DuKienXuatPhat >= @Now
					AND TG.DuKienXuatPhat < @Limit
			  );
		END

        WAITFOR DELAY '00:00:05';

        -- 3. update
        UPDATE DOAN_TAU
        SET
            TenTau      = COALESCE(@TenTau, TenTau),
            HangSanXuat = COALESCE(@HangSanXuat, HangSanXuat),
            NgayVanHanh = COALESCE(@NgayVanHanh, NgayVanHanh),
            LoaiTau     = COALESCE(@LoaiTau, LoaiTau),
            TrangThai  = COALESCE(@TrangThai, TrangThai)
        WHERE MaDoanTau = @MaDoanTau;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

EXEC sp_CapNhatDoanTau_DeadlockFix
	@MaDoanTau = 'DT03', 
	@TrangThai = N'Bảo trì',
	@TenTau = 'SE express'