-- Stored Procedure cho Quản lý 1 (Manager 1)
create or alter PROCEDURE sp_th5_cuong_T1
  @MaDonNghiPhep VARCHAR(10),
  @MaNhanVienGuiDon VARCHAR(10),
  @MaQuanLyDuyetDon VARCHAR(10),
  @MaNhanVienThayThe VARCHAR(10)
as 
begin 
  set transaction isolation level read committed;
  
  begin transaction;
  -- check xem don nghi phep co ton tai va o trang thai dang cho duyet khong
  if not exists (
    select *
    from DON_NGHI_PHEP dnp 
    where dnp.MaDon = @MaDonNghiPhep AND dnp.TrangThai = N'Đang chờ'
  )
  begin 
    print N'[T1] Đơn nghỉ phép không tồn tại hoặc không ở trạng thái đang chờ duyệt.';
    rollback transaction;
    return;
  end
  
  -- check xem nhan vien gui don co ton tai va dang hoat dong khong
  if not exists (
    select 1
    from TAI_KHOAN tk
    join NHAN_VIEN nv on tk.MaNV = nv.MaNV
    where tk.MaNV = @MaNhanVienGuiDon AND tk.TrangThai = 1
  )
  begin 
    print N'[T1] Nhân viên gửi đơn không tồn tại hoặc không hoạt động.';
    rollback transaction;
    return;
  end
  
  waitfor delay '00:00:10';

  -- cap nhat don nghi phep
  update DON_NGHI_PHEP
  set 
    NVThayThe = @MaNhanVienThayThe,
    NVDuyetDon = @MaQuanLyDuyetDon,
    TrangThai = N'Chấp nhận'
  where MaDon = @MaDonNghiPhep;
  
  waitfor delay '00:00:10';

  commit transaction;
  print N'[T1] ✓ COMMIT thành công - Nhân viên thay thế: ' + @MaNhanVienThayThe;
end
go

EXEC sp_th5_cuong_T1
  @MaDonNghiPhep = 'DNP005',
  @MaNhanVienGuiDon = 'NV007',
  @MaQuanLyDuyetDon = 'NV001',
  @MaNhanVienThayThe = 'NV004';