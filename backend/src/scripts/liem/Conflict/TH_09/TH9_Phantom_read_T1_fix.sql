-- T1_fix: Khách hàng xem ưu đãi
-- Fix sửa isolation level
CREATE OR ALTER PROCEDURE sp_th9_KhachHang_XemUuDai_fix
AS
BEGIN
    -- FIX: Sử dụng SERIALIZABLE để khóa toàn bộ phạm vi (Range Lock)
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; 

    BEGIN TRANSACTION;

    PRINT N'--- B1: Khách hàng xem danh sách (SERIALIZABLE) ---';
    SELECT * FROM UU_DAI_GIA WHERE LoaiUuDai = N'VIP';
    
    WAITFOR DELAY '00:00:15';

    PRINT N'--- B5: Khách hàng xem lại danh sách ---';
    SELECT * FROM UU_DAI_GIA WHERE LoaiUuDai = N'VIP';

    COMMIT TRANSACTION;
END;

GO
EXEC sp_th9_KhachHang_XemUuDai_fix;