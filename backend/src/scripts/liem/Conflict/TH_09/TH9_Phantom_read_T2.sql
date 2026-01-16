-- T2: Quản lý thêm ưu đãi
CREATE OR ALTER PROCEDURE sp_th9_QuanLyThemUuDai
    @MaUuDai VARCHAR(10),
    @LoaiUuDai NVARCHAR(50),
    @MoTa NVARCHAR(255),
    @DoiTuong NVARCHAR(50),
    @PhanTram INT
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRANSACTION;

    -- Kiểm tra mã ưu đãi trùng
    IF EXISTS (SELECT 1 FROM UU_DAI_GIA WHERE MaUuDai = @MaUuDai)
    BEGIN
        PRINT N'Lỗi: Mã ưu đãi đã tồn tại.';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Kiểm tra thông tin trùng lặp
    IF EXISTS (SELECT 1 FROM UU_DAI_GIA WHERE DoiTuong = @DoiTuong AND PhanTram = @PhanTram AND LoaiUuDai = @LoaiUuDai)    
    BEGIN
        PRINT N'Lỗi: Ưu đãi tương tự đã tồn tại.';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Thêm ưu đãi mới
    PRINT N'--- Quản lý đang thêm ưu đãi mới... ---';
    INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram) 
    VALUES (@MaUuDai, @LoaiUuDai, @MoTa, @DoiTuong, @PhanTram);
    
    PRINT N'--- Thêm mới thành công! ---';

    COMMIT TRANSACTION;
END;
GO

EXEC sp_th9_QuanLyThemUuDai 
    @MaUuDai = 'UD999', 
    @LoaiUuDai = N'VIP', 
    @MoTa = N'Ưu đãi Bóng Ma', 
    @DoiTuong = N'VIP PRO', 
    @PhanTram = 50;
GO

-- Xóa dữ liệu cho lần test tiếp theo
-- DELETE FROM UU_DAI_GIA WHERE MaUuDai = 'UD999';