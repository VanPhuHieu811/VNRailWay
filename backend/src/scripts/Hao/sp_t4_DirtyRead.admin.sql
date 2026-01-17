USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_NhanVienDoiVe_InsertMoi_Demo
    @MaVeCu VARCHAR(20),       
    @MaViTriMoi VARCHAR(20)    
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED
    BEGIN TRANSACTION;

    BEGIN TRY
        PRINT N'--- [NHÂN VIÊN]: Bắt đầu giao dịch ĐỔI VÉ (Hủy cũ - Thêm mới)...';

        -- 1. Lấy thông tin từ vé cũ để tạo vé mới (Giữ nguyên Mã Đặt Vé, Chuyến Tàu, Khách Hàng...)
        DECLARE @MaDatVe VARCHAR(20), @MaChuyenTau VARCHAR(20), @MaKhachHang VARCHAR(20);
        DECLARE @GiaVe DECIMAL(18,0), @MaUuDai Varchar(10);
        DECLARE @ThoiGianXuatVe DATETIME, @GaXuatPhat VARCHAR(100), @GaDen VARCHAR(100);

        SELECT 
            @MaDatVe = MaDatVe,
            @MaChuyenTau = MaChuyenTau,
            @MaKhachHang = MaKhachHang,
            @GaXuatPhat = GaXuatPhat,
            @GaDen = GaDen,
            @GiaVe = GiaThuc ,
            @ThoiGianXuatVe = ThoiGianXuatVe,
            @MaUuDai = MaUuDai
        FROM VE_TAU 
        WHERE MaVe = @MaVeCu;

        IF @MaDatVe IS NULL
        BEGIN
            PRINT N'Lỗi: Không tìm thấy vé cũ.';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 2. Cập nhật vé cũ thành "Đã hủy"
        UPDATE VE_TAU
        SET TrangThai = N'Hủy vé'
        WHERE MaVe = @MaVeCu;
        
        PRINT N'--- [BƯỚC 1]: Đã cập nhật vé cũ ' + @MaVeCu + N' thành ĐÃ HỦY.';

        DECLARE @MaVeMoi VARCHAR(20);
        DECLARE @MaxNum INT;
        SELECT @MaxNum = ISNULL(MAX(CAST(SUBSTRING(MaVe, 3, LEN(MaVe)) AS INT)), 0)
        FROM VE_TAU
        WHERE MaVe LIKE 'VE%'; 
        SET @MaVeMoi = 'VE' + RIGHT('000' + CAST(@MaxNum + 1 AS VARCHAR(10)), 3);

        -- 4. INSERT vé mới với vị trí mới nhưng CÙNG Mã Đặt Vé
        INSERT INTO VE_TAU (
            MaVe, MaDatVe, MaChuyenTau, MaViTri, MaKhachHang, MaUuDai,
            GaXuatPhat, GaDen, ThoiGianXuatVe, GiaThuc, TrangThai
        )
        VALUES (
            @MaVeMoi, @MaDatVe, @MaChuyenTau, @MaViTriMoi, @MaKhachHang, @MaUuDai,
            @GaXuatPhat, @GaDen, GETDATE(), @GiaVe, N'Đã đặt'
        );

        PRINT N'--- [BƯỚC 2]: Đã thêm vé mới ' + @MaVeMoi + N' tại ghế ' + @MaViTriMoi;

        -- 5. GIẢ LẬP ĐỘ TRỄ (Điểm mấu chốt gây Dirty Read)
        PRINT N'--- [HỆ THỐNG]: Đang chờ xác nhận thanh toán chênh lệch (Delay 15s)...';
        PRINT N'--- [ACTION]: Khách hàng hãy xem lịch sử đặt vé NGAY LÚC NÀY!';
        
        WAITFOR DELAY '00:00:15';

        -- 6. ROLLBACK - Giả sử khách không chịu đóng thêm tiền hoặc lỗi hệ thống
        ROLLBACK TRANSACTION;
        
        PRINT N'--- [KẾT THÚC]: Giao dịch bị HỦY (Rollback). Dữ liệu trở về như cũ.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        PRINT N'Lỗi: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- Example execution:
EXEC sp_NhanVienDoiVe_InsertMoi_Demo @MaVeCu = 'VE013', @MaViTriMoi = 'VT0104_12';

select * from VE_TAU

select * from VI_TRI_TREN_TOA

select * from KHACH_HANG  where MaKhachHang='KH014'