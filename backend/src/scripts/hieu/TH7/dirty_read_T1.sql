-- Tình huống 7: nhân viên quản lý phân công cho các nhân viên khác trên đoàn tàu 

-- PHAN CONG NHAN SU 
CREATE OR ALTER PROCEDURE sp_PhanCongNhanSu
    @MaNV VARCHAR(10),
    @MaChuyenTau VARCHAR(10),
    @VaiTro NVARCHAR(30),
    @MaToa VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY

        BEGIN TRANSACTION;
        IF NOT EXISTS (
            SELECT *
            FROM NHAN_VIEN NV
            WHERE NV.MaNV = @MaNV)
        BEGIN
            RAISERROR(N'Lỗi: Nhân viên không tồn tại trong hệ thống!', 16, 1);
        END

        DECLARE @LoaiNV NVARCHAR(20);
        SELECT @LoaiNV = LoaiNhanVien FROM NHAN_VIEN WHERE MaNV = @MaNV;

        IF (@VaiTro LIKE N'%lái%' AND @LoaiNV <> N'Lái tàu')
           OR (@VaiTro LIKE N'%trưởng%' AND @LoaiNV NOT IN (N'Toa tàu', N'Quản lý'))                               ---- CÓ THỂ BỎ
           OR (@VaiTro LIKE N'%toa%' AND @LoaiNV <> N'Toa tàu')
        BEGIN
            RAISERROR(N'Lỗi: Loại nhân viên không phù hợp với vai trò được phân công.', 16, 1);
        END

        -- 3. Thực hiện phân công
        DECLARE @Num INT;
        SELECT @Num = ISNULL(MAX(CAST(SUBSTRING(MaPhanCong,3,10) AS INT)),0) + 1 
        FROM PHAN_CONG_CHUYEN_TAU;
        DECLARE @MaPC VARCHAR(10) = 'PC' + RIGHT('0' + CAST(@Num AS VARCHAR(2)), 2);
        
        INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, MaChuyenTau, VaiTro, MaToa, TrangThai)
        VALUES (@MaPC, @MaNV, @MaChuyenTau, @VaiTro, @MaToa, N'Nhận việc');

        WAITFOR DELAY '00:00:10' 

        RAISERROR(N'Lỗi hệ thống bất ngờ (Mất điện/Crash)! Transaction bị hủy.', 16, 1);

        COMMIT TRANSACTION;
        PRINT N'Phân công nhân sự thành công.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

EXEC sp_PhanCongNhanSu
    @MaNV = 'NV005', 
    @MaChuyenTau = 'CT006', 
    @VaiTro = N'Nhân viên phụ trách lái';

DELETE FROM PHAN_CONG_CHUYEN_TAU 
    WHERE MaNV = 'NV005' AND MaChuyenTau = 'CT006'