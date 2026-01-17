create or alter procedure sp_th6_read_dirty_read
as
begin 
  set transaction isolation level read uncommitted -- de cho phep dirty read

  select *
  from GIA_THEO_LOAI_TOA
end
go

exec sp_th6_read_dirty_read;