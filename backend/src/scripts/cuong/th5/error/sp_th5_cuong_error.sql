create or alter procedure sp_th5_cuong_error_lost_update
  @MaDonNghiPhep varchar(10),
  @MaQuanLyDuyetDon varchar(10),
  @MaNhanVienThayThe varchar(10)
as 
begin 
  set transaction isolation level read committed;
  begin transaction;

  -- check xem don nghi phep co ton tai va o trang thai dang cho duyet khong
  if not exists (
    select *
    from DON_NGHI_PHEP dnp 
    where dnp.MaDon = @MaDonNghiPhep and dnp.TrangThai = N'Đang chờ'
  )
  begin 
    print N'Đơn nghỉ phép không tồn tại hoặc không ở trạng thái đang chờ duyệt.';
    rollback transaction
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

  commit;
  print N'Đơn nghỉ phép đã được duyệt thành công. Nhân viên thay thế: ' + @MaNhanVienThayThe;
end
go

-- trans 1:
exec sp_th5_cuong_error_lost_update
@MaDonNghiPhep = 'DNP005',
@MaQuanLyDuyetDon = 'NV001',
@MaNhanVienThayThe = 'NV004';

-- trans 2:
exec sp_th5_cuong_error_lost_update
@MaDonNghiPhep = 'DNP005',
@MaQuanLyDuyetDon = 'NV001',
@MaNhanVienThayThe = 'NV008';

-- reset du lieu
update DON_NGHI_PHEP 
set NVDuyetDon = null, NVThayThe = null, TrangThai = N'Đang chờ'
where MaDon = 'DNP005';

-- xem ket qua
select * from DON_NGHI_PHEP
where MaDon = 'DNP005';