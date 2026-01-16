create or alter PROCEDURE sp_th5_cuong_fix_lost_update
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
    rollback transaction;
    return;
  end

  waitfor delay '00:00:10';

  update DON_NGHI_PHEP
  set
    NVThayThe = @MaNhanVienThayThe,
    NVDuyetDon = @MaQuanLyDuyetDon,
    TrangThai = N'Chấp nhận'
  where MaDon = @MaDonNghiPhep;

  waitfor delay '00:00:05';

  commit;
  print N'[T1] Duyệt đơn thành công - Nhân viên thay thế: ' + @MaNhanVienThayThe;
end
GO

-- trans 1:
exec sp_th5_cuong_fix_lost_update
@MaDonNghiPhep = 'DNP005',
@MaNhanVienGuiDon = 'NV007',
@MaQuanLyDuyetDon = 'NV001',
@MaNhanVienThayThe = 'NV004';

-- trans 2:
exec sp_th5_cuong_fix_lost_update
@MaDonNghiPhep = 'DNP005',
@MaNhanVienGuiDon = 'NV007',
@MaQuanLyDuyetDon = 'NV001',
@MaNhanVienThayThe = 'NV008';

-- reset du lieu
update DON_NGHI_PHEP 
set NVDuyetDon = null, NVThayThe = null, TrangThai = N'Đang chờ'
where MaDon = 'DNP005';

-- xem ket qua
select * from DON_NGHI_PHEP
where MaDon = 'DNP005';