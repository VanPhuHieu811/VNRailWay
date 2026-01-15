--SP7: PHAN CONG NHAN SU 
USE VNRAILWAY;
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
        BEGIN TRANSACTION;

        -- 1. Kiểm tra LoaiNhanVien có khớp với VaiTro phân công không (Giống góp ý của bạn ở SP4)
        DECLARE @LoaiNV NVARCHAR(20);
        SELECT @LoaiNV = LoaiNhanVien FROM NHAN_VIEN WHERE MaNV = @MaNV;

        IF (@VaiTro LIKE N'%lái%' AND @LoaiNV <> N'Lái tàu')
           OR (@VaiTro LIKE N'%trưởng%' AND @LoaiNV NOT IN (N'Toa tàu', N'Quản lý'))                               ---- CÓ THỂ BỎ
           OR (@VaiTro LIKE N'%toa%' AND @LoaiNV <> N'Toa tàu')
        BEGIN
            RAISERROR(N'Lỗi: Loại nhân viên không phù hợp với vai trò được phân công.', 16, 1);
        END

        -- 2. Kiểm tra nếu không phải nhân viên toa thì MaToa phải NULL (Note 2 trong Trigger)
        IF @VaiTro <> N'Nhân viên phụ trách toa' AND @MaToa IS NOT NULL                                            ----SỬA VAI TRO
        BEGIN
            RAISERROR(N'Lỗi: Chỉ nhân viên phụ trách toa mới được gán mã toa.', 16, 1);
        END

        -- 3. Thực hiện phân công
        -- Lưu ý: Các Trigger (trg_KiemTraVaiTroPhanCong, trg_KiemTraPhanCongNhanVien) 
        -- sẽ tự động chặn nếu trùng lái tàu/trưởng tàu hoặc trùng lịch[cite: 1, 18].
        DECLARE @Num INT;
        SELECT @Num = ISNULL(MAX(CAST(SUBSTRING(MaPhanCong,3,10) AS INT)),0) + 1 
        FROM PHAN_CONG_CHUYEN_TAU;
        DECLARE @MaPC VARCHAR(10) = 'PC' + RIGHT('0' + CAST(@Num AS VARCHAR(2)), 2);
        
        INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, MaChuyenTau, VaiTro, MaToa, TrangThai)
        VALUES (@MaPC, @MaNV, @MaChuyenTau, @VaiTro, @MaToa, N'Nhận việc');

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

--exec sp_PhanCongNhanSu 'NV02', 'CT01', N'Nhân viên phụ trách lái'