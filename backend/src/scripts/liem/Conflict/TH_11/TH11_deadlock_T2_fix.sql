CREATE OR ALTER PROCEDURE sp_th11_CapNhatPhanCongChuyenTau_Fix
    @MaPC VARCHAR(10),
    @MaDon VARCHAR(10),
    @MaNV_Moi VARCHAR(10),
    @NguoiSua VARCHAR(10)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; 
    BEGIN TRANSACTION;

    -- [FIX] REORDER: Lock Resource A FIRST (Same as T1)
    PRINT N'--- [T2 Fix] Locking DON_NGHI_PHEP (Resource A) FIRST... ---';
    IF NOT EXISTS (SELECT 1 FROM DON_NGHI_PHEP WITH (UPDLOCK, HOLDLOCK) WHERE MaDon = @MaDon)
    BEGIN
        ROLLBACK TRANSACTION; RETURN;
    END

    WAITFOR DELAY '00:00:10'; -- Even with delay, no deadlock occurs

    -- [FIX] Then Lock Resource B
    PRINT N'--- [T2 Fix] Locking PHAN_CONG_CHUYEN_TAU (Resource B)... ---';
    IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WITH (UPDLOCK, HOLDLOCK) WHERE MaPhanCong = @MaPC)
    BEGIN
        ROLLBACK TRANSACTION; RETURN;
    END

    -- Updates
    UPDATE PHAN_CONG_CHUYEN_TAU SET MaNV = @MaNV_Moi WHERE MaPhanCong = @MaPC;
    UPDATE DON_NGHI_PHEP SET TrangThai = N'Từ chối', NVDuyetDon = @NguoiSua WHERE MaDon = @MaDon;

    COMMIT TRANSACTION;
    PRINT N'--- [T2 Fix] Success! ---';
END;
GO
USE VNRAILWAY;
GO
EXEC sp_th11_CapNhatPhanCongChuyenTau_fix 
    @MaPC = 'PC_DL', 
    @MaDon = 'DNP_DL', 
    @MaNV_Moi = 'NV_NEW', 
    @NguoiSua = 'MGR2';