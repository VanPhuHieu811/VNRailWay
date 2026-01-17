CREATE OR ALTER PROCEDURE sp_th10_KH_XemVe_Fix
    @MaKH VARCHAR(10)
AS
BEGIN
    -- FIX: READ COMMITTED
    -- This will force T2 to WAIT until T1 is done (Commit or Rollback)
    -- It will NOT read the temporary "Đổi vé" status.
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED; 

    BEGIN TRANSACTION;

    PRINT N'--- [T2 Fix] Reading Ticket Status (Waiting for lock)... ---';
    
    SELECT MaVe, TrangThai 
    FROM VE_TAU
    WHERE MaKhachHang = @MaKH;

    COMMIT TRANSACTION;
END;
GO
EXEC sp_th10_KH_XemVe_fix @MaKH = 'KH_DR';