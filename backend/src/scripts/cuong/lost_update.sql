-- =============================================
-- DEMO: LOST UPDATE CONCURRENCY ISSUE
-- Hai quản lý (T1, T2) duyệt cùng một đơn nghỉ phép
-- với hai nhân viên thay thế khác nhau
-- =============================================

-- Stored Procedure cho Quản lý 1 (Manager 1)
CREATE OR ALTER PROCEDURE sp_th5_cuong_T1
  @MaDonNghiPhep VARCHAR(10),
  @MaNhanVienGuiDon VARCHAR(10),
  @MaQuanLyDuyetDon VARCHAR(10),
  @MaNhanVienThayThe VARCHAR(10)
AS 
BEGIN 
  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
  
  BEGIN TRANSACTION;
  
  PRINT N'[T1] Đang kiểm tra đơn nghỉ phép: ' + @MaDonNghiPhep;
  
  -- check xem don nghi phep co ton tai va o trang thai dang cho duyet khong
  IF NOT EXISTS (
    SELECT *
    FROM DON_NGHI_PHEP dnp 
    WHERE dnp.MaDon = @MaDonNghiPhep AND dnp.TrangThai = N'Đang chờ'
  )
  BEGIN 
    PRINT N'[T1] Đơn nghỉ phép không tồn tại hoặc không ở trạng thái đang chờ duyệt.';
    ROLLBACK TRANSACTION;
    RETURN;
  END

  PRINT N'[T1] Đơn tồn tại, bắt đầu xử lý...';
  
  -- check xem nhan vien gui don co ton tai va dang hoat dong khong
  IF NOT EXISTS (
    SELECT 1
    FROM TAI_KHOAN tk
    JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV
    WHERE tk.MaNV = @MaNhanVienGuiDon AND tk.TrangThai = 1
  )
  BEGIN 
    PRINT N'[T1] Nhân viên gửi đơn không tồn tại hoặc không hoạt động.';
    ROLLBACK TRANSACTION;
    RETURN;
  END
  
  PRINT N'[T1] Đọc xong dữ liệu, đang chờ 10 giây để T2 cũng đọc dữ liệu...';
  WAITFOR DELAY '00:00:10';
  PRINT N'[T1] Bắt đầu cập nhật với nhân viên thay thế: ' + @MaNhanVienThayThe;

  -- cap nhat don nghi phep
  UPDATE DON_NGHI_PHEP
  SET 
    NVThayThe = @MaNhanVienThayThe,
    NVDuyetDon = @MaQuanLyDuyetDon,
    TrangThai = N'Chấp nhận'
  WHERE MaDon = @MaDonNghiPhep;
  
  PRINT N'[T1] Cập nhật xong, đang chờ 10 giây trước khi commit...';
  WAITFOR DELAY '00:00:10';

  COMMIT TRANSACTION;
  PRINT N'[T1] ✓ COMMIT thành công - Nhân viên thay thế: ' + @MaNhanVienThayThe;
END
GO

-- Stored Procedure cho Quản lý 2 (Manager 2)
CREATE OR ALTER PROCEDURE sp_th5_cuong_T2
  @MaDonNghiPhep VARCHAR(10),
  @MaNhanVienGuiDon VARCHAR(10),
  @MaQuanLyDuyetDon VARCHAR(10),
  @MaNhanVienThayThe VARCHAR(10)
AS 
BEGIN 
  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
  
  BEGIN TRANSACTION;
  
  PRINT N'[T2] Đang kiểm tra đơn nghỉ phép: ' + @MaDonNghiPhep;
  
  -- check xem don nghi phep co ton tai va o trang thai dang cho duyet khong
  IF NOT EXISTS (
    SELECT *
    FROM DON_NGHI_PHEP dnp 
    WHERE dnp.MaDon = @MaDonNghiPhep AND dnp.TrangThai = N'Đang chờ'
  )
  BEGIN 
    PRINT N'[T2] Đơn nghỉ phép không tồn tại hoặc không ở trạng thái đang chờ duyệt.';
    ROLLBACK TRANSACTION;
    RETURN;
  END

  PRINT N'[T2] Đơn tồn tại, bắt đầu xử lý...';
  PRINT N'[T2] (T1 đang chờ 10 giây...)';
  
  -- check xem nhan vien gui don co ton tai va dang hoat dong khong
  IF NOT EXISTS (
    SELECT 1
    FROM TAI_KHOAN tk
    JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV
    WHERE tk.MaNV = @MaNhanVienGuiDon AND tk.TrangThai = 1
  )
  BEGIN 
    PRINT N'[T2] Nhân viên gửi đơn không tồn tại hoặc không hoạt động.';
    ROLLBACK TRANSACTION;
    RETURN;
  END
  
  PRINT N'[T2] Đợi 10 giây để T1 cập nhật trước...';
  WAITFOR DELAY '00:00:10';
  PRINT N'[T2] Bắt đầu cập nhật với nhân viên thay thế: ' + @MaNhanVienThayThe;

  -- cap nhat don nghi phep
  UPDATE DON_NGHI_PHEP
  SET 
    NVThayThe = @MaNhanVienThayThe,
    NVDuyetDon = @MaQuanLyDuyetDon,
    TrangThai = N'Chấp nhận'
  WHERE MaDon = @MaDonNghiPhep;

  COMMIT TRANSACTION;
  PRINT N'[T2] ✓ COMMIT thành công - Nhân viên thay thế: ' + @MaNhanVienThayThe;
  PRINT N'[T2] ⚠️  LƯU Ý: Cập nhật của T1 đã bị ghi đè (LOST UPDATE)!';
END
GO

-- =============================================
-- HƯỚNG DẪN CHẠY DEMO LOST UPDATE
-- =============================================
/*
CÁCH CHẠY:
1. Chuẩn bị: Đảm bảo DNP005 đang ở trạng thái "Đang chờ"
2. Mở 2 tab Query khác nhau
3. Tab 1 chạy T1 (chọn nhân viên thay thế là NV004)
4. Ngay sau đó (trong vòng 1-2 giây), Tab 2 chạy T2 (chọn nhân viên thay thế là NV008)

KẾT QUẢ LOST UPDATE:
- T1 cập nhật: NVThayThe = NV004
- T2 cập nhật: NVThayThe = NV008 (ghi đè lên NV004)
- Cuối cùng NVThayThe = NV008 (Cập nhật của T1 bị mất!)

DÒNG THỜI GIAN:
Time 0s:  T1 bắt đầu, đọc dữ liệu
Time 1s:  T2 bắt đầu, đọc dữ liệu
Time 5s:  T1 cập nhật và commit (NVThayThe = NV004)
Time 6s:  T2 cập nhật và commit (NVThayThe = NV008) ← Ghi đè lên T1!
Time 7s:  Kết quả cuối: NVThayThe = NV008
*/

-- RESET dữ liệu trước khi chạy demo
UPDATE DON_NGHI_PHEP 
SET NVDuyetDon = NULL, NVThayThe = NULL, TrangThai = N'Đang chờ'
WHERE MaDon = 'DNP005';

PRINT N'✓ Dữ liệu DNP005 đã được reset về trạng thái "Đang chờ"';
PRINT N'';
PRINT N'=== CHẠY DEMO LOST UPDATE ===';
PRINT N'Tab 1: Chạy dòng sau (Quản lý 1 - NV001 chọn NV004 thay thế)';
PRINT N'EXEC sp_th5_cuong_T1 @MaDonNghiPhep=''DNP005'', @MaNhanVienGuiDon=''NV007'', @MaQuanLyDuyetDon=''NV001'', @MaNhanVienThayThe=''NV004'';';
PRINT N'';
PRINT N'Tab 2: Chạy dòng sau (Quản lý 2 - NV001 chọn NV008 thay thế) ngay sau đó';
PRINT N'EXEC sp_th5_cuong_T2 @MaDonNghiPhep=''DNP005'', @MaNhanVienGuiDon=''NV007'', @MaQuanLyDuyetDon=''NV001'', @MaNhanVienThayThe=''NV008'';';
PRINT N'';
PRINT N'Sau đó chạy lệnh này để xem kết quả (nhân viên thay thế cuối cùng sẽ là NV008 - cập nhật của T1 bị mất):';
PRINT N'SELECT MaDon, NVGuiDon, NVDuyetDon, NVThayThe, TrangThai FROM DON_NGHI_PHEP WHERE MaDon = ''DNP005'';';
GO

-- INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, LyDo, NVGuiDon, NVDuyetDon, NVThayThe, TrangThai) 
-- VALUES
-- ('DNP005', 'PC006', '2026-01-12 11:30', N'Đau nước ngoài', 'NV007', NULL, NULL, N'Đang chờ');
-- go

EXEC sp_th5_cuong_T1
  @MaDonNghiPhep = 'DNP005',
  @MaNhanVienGuiDon = 'NV007',
  @MaQuanLyDuyetDon = 'NV001',
  @MaNhanVienThayThe = 'NV004';

EXEC sp_th5_cuong_T2
@MaDonNghiPhep = 'DNP005',
@MaNhanVienGuiDon = 'NV007',
@MaQuanLyDuyetDon = 'NV001',
@MaNhanVienThayThe = 'NV008';

select * from DON_NGHI_PHEP where MaDon = 'DNP005';