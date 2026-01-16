--SP4: API4 DUYET DON NGHI PHEP (TRANH CHAP)
GO
CREATE or alter PROCEDURE sp_DuyetDonNghiPhep
    @MaDon VARCHAR(10),
    @MaNVQuanLy VARCHAR(10),
    @TrangThaiMoi NVARCHAR(20), 
    @MaNVThayThe VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

		IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = @MaNVQuanLy)
		BEGIN
			RAISERROR(N'Lỗi: Mã nhân viên quản lý không tồn tại.', 16, 1);
		END

        -- 1. Chỉ cần check cơ bản: Nếu duyệt thì phải có người thay
        IF @TrangThaiMoi = N'Chấp nhận' AND @MaNVThayThe IS NULL
        BEGIN
            RAISERROR(N'Lỗi: Phải chỉ định nhân viên thay thế khi chấp nhận đơn nghỉ.', 16, 1);
        END

        -- 2. Cập nhật trạng thái đơn nghỉ phép
        /*UPDATE DON_NGHI_PHEP
        SET TrangThai = @TrangThaiMoi,
            NVDuyetDon = @MaNVQuanLy,
            NVThayThe = @MaNVThayThe
        WHERE MaDon = @MaDon;*/

        -- 3. Xử lý nghiệp vụ khi Chấp nhận
        IF @TrangThaiMoi = N'Chấp nhận'
        BEGIN
            DECLARE @MaChuyenTau VARCHAR(10), @VaiTro NVARCHAR(30), @MaToa VARCHAR(10), @MaPC_Cu VARCHAR(10);
            
            -- Lấy thông tin từ phân công cũ
            SELECT 
                @MaPC_Cu = pc.MaPhanCong,
                @MaChuyenTau = pc.MaChuyenTau,
                @VaiTro = pc.VaiTro,
                @MaToa = pc.MaToa
            FROM DON_NGHI_PHEP dnp
            JOIN PHAN_CONG_CHUYEN_TAU pc ON dnp.MaPhanCong = pc.MaPhanCong
            WHERE dnp.MaDon = @MaDon;

            -- A. Đánh dấu người cũ nghỉ
            UPDATE PHAN_CONG_CHUYEN_TAU SET TrangThai = N'Nghỉ' WHERE MaPhanCong = @MaPC_Cu;

            -- B. Ủy thác toàn bộ việc kiểm tra vai trò và lịch trình cho SP 7
            EXEC sp_PhanCongNhanSu 
                @MaNV = @MaNVThayThe, 
                @MaChuyenTau = @MaChuyenTau, 
                @VaiTro = @VaiTro, 
                @MaToa = @MaToa;
        END

        COMMIT TRANSACTION;
        PRINT N'Điều phối nhân sự thành công.';
    END TRY
    BEGIN CATCH
        -- Nếu SP 7 báo lỗi vai trò, nó sẽ nhảy vào đây để Rollback
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
