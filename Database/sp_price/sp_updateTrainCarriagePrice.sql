create or alter procedure sp_updateTrainCarriagePrice
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

  commit transaction
  print N'Cập nhật giá thành công'
end
go 