create or alter PROCEDURE sp_th2_huy_dirtyRead
  @MaDonNghiPhep VARCHAR(10),
  @MaQuanLyDuyetDon VARCHAR(10),
  @MaNhanVienThayThe VARCHAR(10)
as
begin
  begin transaction;

  if not exists (
    select 1
    from DON_NGHI_PHEP WITH (NOLOCK)
    where MaDon = @MaDonNghiPhep
      and TrangThai = N'Đang chờ'
  )
  begin
    rollback transaction;
    throw 50001, N'Đơn nghỉ phép không tồn tại hoặc đã được xử lý bởi người khác.', 1;
    return;
  end


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
  from DON_NGHI_PHEP dnp WITH (NOLOCK)
  inner join PHAN_CONG_CHUYEN_TAU pcct on dnp.MaPhanCong = pcct.MaPhanCong
  where dnp.MaDon = @MaDonNghiPhep;

  -- cap nhat vao bang PHAN_CONG_CHUYEN_TAU cho nhan vien cu nghi phep
  update PHAN_CONG_CHUYEN_TAU
  set TrangThai = N'Nghỉ'
  where MaPhanCong = @MaPhanCongCu;

  -- Tao ma phan cong moi
  declare @MaxNumber int;
  select @MaxNumber = ISNULL(MAX(CAST(SUBSTRING(MaPhanCong, 3, LEN(MaPhanCong)-2) AS INT)), 0)
  from PHAN_CONG_CHUYEN_TAU;
  
  set @MaPhanCongMoi = 'PC' + RIGHT('000' + CAST(@MaxNumber + 1 AS VARCHAR(3)), 3);

  -- tao phan cong moi cho nhan vien thay the
  insert into PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, VaiTro, MaChuyenTau, MaToa, TrangThai)
  values (@MaPhanCongMoi, @MaNhanVienThayThe, @VaiTro, @MaChuyenTau, @MaToa, N'Nhận việc');

  commit;
  print N'[T1] Duyệt đơn thành công - Nhân viên thay thế: ' + @MaNhanVienThayThe;
  print N'[T1] Mã phân công mới: ' + @MaPhanCongMoi;
end
GO