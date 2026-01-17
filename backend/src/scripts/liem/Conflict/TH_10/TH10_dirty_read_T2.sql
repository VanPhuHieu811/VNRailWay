-- T2: khách hàng xem danh sách vé
CREATE OR ALTER PROCEDURE sp_th10_KH_XemVe
    @MaKH VARCHAR(10)
AS
BEGIN
    -- ERROR 10: DIRTY READ
    -- Allows reading data that has been updated by T1 but NOT YET COMMITTED
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; 

    BEGIN TRANSACTION;

    PRINT N'--- [T2] Reading Ticket Status... ---';
    
    SELECT MaVe, TrangThai 
    FROM VE_TAU
    WHERE MaKhachHang = @MaKH;

    PRINT N'--- [T2] Finished Reading. ---';

    COMMIT TRANSACTION;
END;
GO
EXEC sp_th10_KH_XemVe @MaKH = 'KH_DR';