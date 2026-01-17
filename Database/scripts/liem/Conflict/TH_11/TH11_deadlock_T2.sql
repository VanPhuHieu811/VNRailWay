-- T2: Quản lý sửa phân công chuyến
CREATE OR ALTER PROCEDURE sp_th11_CapNhatPhanCongChuyenTau
    @MaPC VARCHAR(10),
    @MaDon VARCHAR(10),
    @MaNV_Moi VARCHAR(10),
    @NguoiSua VARCHAR(10)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; 
    BEGIN TRANSACTION;

    -- [B] Lock Assignment Table FIRST
    PRINT N'--- [T2] Locking PHAN_CONG_CHUYEN_TAU (Resource B)... ---';
    IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WITH (UPDLOCK, HOLDLOCK) WHERE MaPhanCong = @MaPC)
    BEGIN
        PRINT N'Không tồn tại phân công';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Wait to allow T1 to lock the other table
    PRINT N'--- [T2] Acquired Lock B. Waiting 10s... ---';
    WAITFOR DELAY '00:00:10';

    -- [A] Try to Lock Leave Request Table
    PRINT N'--- [T2] Trying to lock DON_NGHI_PHEP (Resource A)... ---';
    IF NOT EXISTS (SELECT 1 FROM DON_NGHI_PHEP WITH (UPDLOCK, HOLDLOCK) WHERE MaDon = @MaDon)
    BEGIN
        PRINT N'Không tồn tại đơn nghỉ phép';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Perform Updates
    UPDATE PHAN_CONG_CHUYEN_TAU 
    SET MaNV = @MaNV_Moi 
    WHERE MaPhanCong = @MaPC;

    -- Reject leave request because employee is no longer assigned
    UPDATE DON_NGHI_PHEP 
    SET TrangThai = N'Từ chối', NVDuyetDon = @NguoiSua 
    WHERE MaDon = @MaDon;

    PRINT N'--- [T2] Transaction Committed Success! ---';
    COMMIT TRANSACTION;
END;
GO
