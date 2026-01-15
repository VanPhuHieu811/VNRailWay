create or alter procedure sp_th5_cuong
  @MaDonNghiPhep varchar(10),
  @MaNhanVienGuiDon varchar(10),
  @MaQuanLyDuyetDon varchar(10),
  @MaNhanVienThayThe varchar(10)
as 
begin 
  -- check xem don nghi phep co ton tai va o trang thai dang cho duyet khong
  if not exists (
    select *
    from DON_NGHI_PHEP dnp 
    where dnp.MaDon = @MaDonNghiPhep and dnp.TrangThai = N'Đang chờ'
  )
  begin 
    print N'Đơn nghỉ phép không tồn tại hoặc không ở trạng thái đang chờ duyệt.';
    return;
  end

  -- check xem nhan vien gui don co ton tai va dang hoat dong khong
  if not exists (
    select 1
    from TAI_KHOAN tk
    join NHAN_VIEN nv on tk.MaNV = nv.MaNV
    where tk.MaNV = @MaNhanVienGuiDon and tk.TrangThai = 1
  )
  begin 
    print N'Nhân viên gửi đơn không tồn tại hoặc không hoạt động.';
    return;
  end

  -- cap nhat don nghi phep
  update DON_NGHI_PHEP
  set 
    NVThayThe = @MaNhanVienThayThe,
    NVDuyetDon = @MaQuanLyDuyetDon,
    TrangThai = N'Chấp nhận'
  where MaDon = @MaDonNghiPhep;

  print N'Đơn nghỉ phép đã được duyệt thành công.';
end
go

-- INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, LyDo, NVGuiDon, NVDuyetDon, NVThayThe, TrangThai) 
-- VALUES
-- ('DNP005', 'PC006', '2026-01-12 11:30', N'Đau nước ngoài', 'NV007', NULL, NULL, N'Đang chờ');
-- go

EXEC sp_th5_cuong 
  @MaDonNghiPhep = 'DNP005',
  @MaNhanVienGuiDon = 'NV007',
  @MaQuanLyDuyetDon = 'NV001',
  @MaNhanVienThayThe = 'NV004';

select * from DON_NGHI_PHEP where MaDon = 'DNP005';