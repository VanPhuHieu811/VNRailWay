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
    rollback transaction;
    throw 50001, N'Đơn nghỉ phép không tồn tại hoặc đã được xử lý bởi người khác.', 1;
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

    -- p2: cap nhat phan cong chuyen tau
  declare @MaPhanCongCu varchar(10);
  declare @MaPhanCongMoi varchar(10);
  declare @VaiTro nvarchar(50);
  declare @MaChuyenTau varchar(10);
  declare @MaToa varchar(10);

  -- Lay thong tin phan cong cu
  select 
    @MaPhanCongCu = dnp.MaPhanCong,
    @VaiTro = pcct.VaiTro,
    @MaChuyenTau = pcct.MaChuyenTau,
    @MaToa = pcct.MaToa
  from DON_NGHI_PHEP dnp
  inner join PHAN_CONG_CHUYEN_TAU pcct on dnp.MaPhanCong = pcct.MaPhanCong
  where dnp.MaDon = @MaDonNghiPhep;

  -- cap nhat vao bang PHAN_CONG_CHUYEN_TAU cho nhan vien cu nghi phep
  update PHAN_CONG_CHUYEN_TAU
  set TrangThai = N'Nghỉ'
  where MaPhanCong = @MaPhanCongCu;

  -- -- Tao ma phan cong moi
  -- declare @MaxNumber int;
  -- select @MaxNumber = ISNULL(MAX(CAST(SUBSTRING(MaPhanCong, 3, LEN(MaPhanCong)-2) AS INT)), 0)
  -- from PHAN_CONG_CHUYEN_TAU;
  
  -- set @MaPhanCongMoi = 'PC' + RIGHT('000' + CAST(@MaxNumber + 1 AS VARCHAR(3)), 3);
  set @MaPhanCongMoi = 'PC' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS VARCHAR(10));

  -- tao phan cong moi cho nhan vien thay the
  insert into PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, VaiTro, MaChuyenTau, MaToa, TrangThai)
  values (@MaPhanCongMoi, @MaNhanVienThayThe, @VaiTro, @MaChuyenTau, @MaToa, N'Nhận việc');

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

-- xem ket qua
select * from DON_NGHI_PHEP
where MaDon = 'DNP005';

select * from PHAN_CONG_CHUYEN_TAU

-- reset du lieu
update DON_NGHI_PHEP 
set NVDuyetDon = null, NVThayThe = null, TrangThai = N'Đang chờ'
where MaDon = 'DNP005';

delete from PHAN_CONG_CHUYEN_TAU
where MaPhanCong = 'PC6795' or MaPhanCong = 'PC9655'