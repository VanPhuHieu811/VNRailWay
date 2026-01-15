--sp3: API3 gui don nghi phep (TRANH CHAP)
GO
CREATE OR ALTER PROCEDURE sp_GuiDonNghiPhep
    @MaPhanCong VARCHAR(10),
    @MaNVGui VARCHAR(10),
    @LyDo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
	DECLARE @NewID VARCHAR(10),
            @Num INT;

    BEGIN TRY
        BEGIN TRANSACTION;
		SELECT @Num = ISNULL(MAX(CAST(SUBSTRING(MaDon,3,10) AS INT)),0) + 1 FROM DON_NGHI_PHEP;
		SET @NewID = 'MD' + RIGHT('000' + CAST(@Num AS VARCHAR(3)),3);

        -- 1. Kiểm tra mã phân công có tồn tại và thuộc về nhân viên gửi đơn không
        IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WHERE MaPhanCong = @MaPhanCong AND MaNV = @MaNVGui)
        BEGIN
            RAISERROR(N'Lỗi: Mã phân công không hợp lệ hoặc không thuộc về nhân viên này.', 16, 1);

        END
		------Kiểm tra nhân viên có tồn tại không
		IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = @MaNVGui)
		BEGIN
			RAISERROR(N'Lỗi: Mã nhân viên không tồn tại.', 16, 1);
		END

		------Kiểm tra phân công có chạy chưa
		IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WHERE MaPhanCong = @MaPhanCong AND TrangThai = N'Nhận việc')
		BEGIN 
			RAISERROR (N'Lỗi: Bạn đã hoàn thành phân công này hoặc đang làm hoặc bạn đã xin nghỉ.', 16, 1);
		END

        -- 2. Thực hiện chèn dữ liệu
        -- Trigger trg_KiemTraDonNghiPhep sẽ tự động kiểm tra quy định gửi trước 1 ngày (RB-140)
        INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, LyDo, NVGuiDon, TrangThai)
        VALUES (@NewID, @MaPhanCong, GETDATE(), @LyDo, @MaNVGui, N'Đang chờ');

        COMMIT TRANSACTION;
        PRINT N'Gửi đơn nghỉ phép thành công.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
--exec sp_GuiDonNghiPhep 'PC08', 'NV05', N'Nghỉ việc gia đình'