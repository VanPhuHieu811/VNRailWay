-- tinh huong:
-- nhan vien quan ly cap nhat lai gia ve toa 
-- khach hang xem gia ve ghe trong luc nhan vien quan ly dang cap nhat 
-- Transaction 1: Nhan vien cap nhat gia (WRITER)
create or alter procedure sp_th6_error_dirty_read
  @MaGiaToa VARCHAR(10),
  @GiaMoi DECIMAL(10,2)
as
begin 
  begin transaction

  if not exists (
    select *
    from GIA_THEO_LOAI_TOA gtlt
    where gtlt.MaGiaToa = @MaGiaToa
  )
  begin
    raiserror('MaGiaToa khong ton tai', 16, 1)
    rollback transaction
    return
  end

  -- cap nhat gia moi
  update GIA_THEO_LOAI_TOA
  set GiaTien = @GiaMoi
  where MaGiaToa = @MaGiaToa

  waitfor delay '00:00:10';

  rollback transaction
  print N'Cúp điện nên rollback để test dirty read'
end
go 

exec sp_th6_error_dirty_read
@MaGiaToa = 'GTO01',
@GiaMoi = 150000;