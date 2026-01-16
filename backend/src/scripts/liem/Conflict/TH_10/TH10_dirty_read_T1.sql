-- T1: nhân viên đổi vé tàu
CREATE OR ALTER PROCEDURE sp_th10_NV_DoiVe
    @MaVeCu VARCHAR(10)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    BEGIN TRANSACTION;

    -- B1: Check if ticket exists
    IF NOT EXISTS (SELECT 1 FROM VE_TAU WHERE MaVe = @MaVeCu)
    BEGIN
        PRINT N'Vé không tồn tại';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    PRINT N'--- [T1] B2: Updating status to "Đổi vé" (Uncommitted)... ---';
    UPDATE VE_TAU 
    SET TrangThai = N'Đổi vé' 
    WHERE MaVe = @MaVeCu;

    PRINT N'--- [T1] Processing new ticket details (Waiting 15s)... ---';
    WAITFOR DELAY '00:00:15';

    PRINT N'--- [T1] B4: Error encountered (e.g., New seat unavailable) ---';
    PRINT N'--- [T1] B5: ROLLBACK! Reverting status to "Đã đặt" ---';
    
    ROLLBACK TRANSACTION;
    
    PRINT N'--- [T1] Transaction Rolled Back. ---';
END;
GO
EXEC sp_th10_NV_DoiVe @MaVeCu = 'VE_DR';