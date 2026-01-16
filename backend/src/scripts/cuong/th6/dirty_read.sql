-- Transaction 2: Khach hang xem gia (READER - DIRTY READ)
create or alter procedure sp_th6_cuong_reader
  @MaGiaToa VARCHAR(10)
as
begin 
  set transaction isolation level read uncommitted

  select *
  from GIA_THEO_LOAI_TOA
  where MaGiaToa = @MaGiaToa
end
go

exec sp_th6_cuong_reader
@MaGiaToa = 'GTO01';

select * from GIA_THEO_LOAI_TOA
where MaGiaToa = 'GTO01';