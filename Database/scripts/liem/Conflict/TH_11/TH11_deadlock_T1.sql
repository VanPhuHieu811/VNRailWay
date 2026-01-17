-- T1: Quản lý duyệt đơn nghỉ phép
CREATE OR ALTER PROCEDURE sp_th11_DuyetDonNghiPhep
    @MaDon VARCHAR(10),
    @MaPC VARCHAR(10),
    @NguoiDuyet VARCHAR(10)
AS
BEGIN
    -- Use Repeatable Read or higher to hold locks until commit
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; 
    BEGIN TRANSACTION;

    -- [A] Lock Leave Request Table
    PRINT N'--- [T1] Locking DON_NGHI_PHEP (Resource A)... ---';
    IF NOT EXISTS (SELECT 1 FROM DON_NGHI_PHEP WITH (UPDLOCK, HOLDLOCK) WHERE MaDon = @MaDon)
    BEGIN
        PRINT N'Không tồn tại đơn nghỉ phép';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Wait to allow T2 to lock the other table
    PRINT N'--- [T1] Acquired Lock A. Waiting 10s... ---';
    WAITFOR DELAY '00:00:10';

    -- [B] Try to Lock Assignment Table
    PRINT N'--- [T1] Trying to lock PHAN_CONG_CHUYEN_TAU (Resource B)... ---';
    IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WITH (UPDLOCK, HOLDLOCK) WHERE MaPhanCong = @MaPC)
    BEGIN
        PRINT N'Không tồn tại phân công';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Perform Updates
    UPDATE DON_NGHI_PHEP 
    SET TrangThai = N'Chấp nhận', NVDuyetDon = @NguoiDuyet 
    WHERE MaDon = @MaDon;

    UPDATE PHAN_CONG_CHUYEN_TAU 
    SET TrangThai = N'Nghỉ' 
    WHERE MaPhanCong = @MaPC;

    PRINT N'--- [T1] Transaction Committed Success! ---';
    COMMIT TRANSACTION;
END;
GO
EXEC sp_th11_DuyetDonNghiPhep 
    @MaDon = 'DNP_DL', 
    @MaPC = 'PC_DL', 
    @NguoiDuyet = 'MGR1';