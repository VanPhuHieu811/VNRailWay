USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_PhanCongNhanSu
    @MaNV VARCHAR(10),
    @MaChuyenTau VARCHAR(10),
    @VaiTro NVARCHAR(30),
    @MaToa VARCHAR(10) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT * FROM NHAN_VIEN WHERE MaNV = @MaNV)
        BEGIN
            RAISERROR(N'Lỗi: Nhân viên không tồn tại trong hệ thống!', 16, 1);
        END

        DECLARE @LoaiNV NVARCHAR(20);
        SELECT @LoaiNV = LoaiNhanVien FROM NHAN_VIEN WHERE MaNV = @MaNV;

        IF (@VaiTro LIKE N'%lái%' AND @LoaiNV <> N'Lái tàu')
           OR (@VaiTro LIKE N'%trưởng%' AND @LoaiNV NOT IN (N'Toa tàu', N'Lái tàu'))
           OR (@VaiTro LIKE N'%toa%' AND @LoaiNV <> N'Toa tàu')
        BEGIN   
            RAISERROR(N'Lỗi: Loại nhân viên không phù hợp với vai trò được phân công.', 16, 1);
        END

        DECLARE @Num INT;
        SELECT @Num = ISNULL(MAX(CAST(SUBSTRING(MaPhanCong,3,10) AS INT)),0) + 1 
        FROM PHAN_CONG_CHUYEN_TAU;
        DECLARE @MaPC VARCHAR(10) = 'PC' + RIGHT('00' + CAST(@Num AS VARCHAR(3)), 3);
        

        INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, MaChuyenTau, VaiTro, MaToa, TrangThai)
        VALUES (@MaPC, @MaNV, @MaChuyenTau, @VaiTro, NULL, N'Nhận việc');

        --  DELAY 
        WAITFOR DELAY '00:00:10'; 

        IF @MaToa IS NOT NULL
        BEGIN
            PRINT N'Transaction T1: Đang cập nhật Toa tàu...';
            
            UPDATE PHAN_CONG_CHUYEN_TAU
            SET MaToa = @MaToa
            WHERE MaPhanCong = @MaPC;
        END

        COMMIT TRANSACTION;
        PRINT N'Phân công nhân sự thành công.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        BEGIN
            ROLLBACK TRANSACTION;
            PRINT N'Transaction T1: Đã ROLLBACK do vi phạm.';
        END
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
