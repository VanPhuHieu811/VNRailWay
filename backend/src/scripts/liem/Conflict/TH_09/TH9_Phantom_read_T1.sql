-- T1: Khách hàng xem ưu đãi
CREATE OR ALTER PROCEDURE sp_th9_KhachHang_XemUuDai
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    BEGIN TRANSACTION;

    PRINT N'--- B1: Khách hàng xem danh sách ưu đãi (Lần 1) ---';
    -- Đọc dữ liệu lần 1
    SELECT * FROM UU_DAI_GIA WHERE LoaiUuDai = N'VIP';
    
    -- Giả lập thời gian khách hàng đang xem (để T2 kịp chen vào)
    PRINT N'--- Đang đợi 15 giây... (Lúc này Quản lý thêm dữ liệu ở T2) ---';
    WAITFOR DELAY '00:00:15';

    PRINT N'--- B5: Khách hàng xem lại danh sách (Lần 2) ---';
    -- Đọc dữ liệu lần 2
    SELECT * FROM UU_DAI_GIA WHERE LoaiUuDai = N'VIP';

    COMMIT TRANSACTION;
END;

GO
EXEC sp_th9_KhachHang_XemUuDai;