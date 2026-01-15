create or alter PROCEDURE sp_th5_cuong_T1_fix
  @MaDonNghiPhep VARCHAR(10),
  @MaNhanVienGuiDon VARCHAR(10),
  @MaQuanLyDuyetDon VARCHAR(10),
  @MaNhanVienThayThe VARCHAR(10)
as
begin
  set transaction isolation level read committed;
  begin transaction;

  if not exists (
    select 1
    from DON_NGHI_PHEP with (updlock, holdlock)
    where MaDon = @MaDonNghiPhep
      and TrangThai = N'Đang chờ'
  )
  begin
    print N'[T1] Đơn không tồn tại hoặc đã được xử lý.';
    rollback;
    return;
  end

  waitfor delay '00:00:10';

  update DON_NGHI_PHEP
  set
    NVThayThe = @MaNhanVienThayThe,
    NVDuyetDon = @MaQuanLyDuyetDon,
    TrangThai = N'Chấp nhận'
  where MaDon = @MaDonNghiPhep;

  commit;
  print N'[T1] COMMIT thành công';
end
GO

EXEC sp_th5_cuong_T1_fix
  @MaDonNghiPhep = 'DNP005',
  @MaNhanVienGuiDon = 'NV007',
  @MaQuanLyDuyetDon = 'NV001',
  @MaNhanVienThayThe = 'NV004';

select * from DON_NGHI_PHEP where MaDon = 'DNP005';