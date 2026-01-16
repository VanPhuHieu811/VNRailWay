-- Transaction 2: Khach hang xem gia (READER - DIRTY READ)
create or alter procedure sp_th6_fixed_error_dirty_read
as
begin 
  set transaction isolation level read committed -- nang muc co lap len committed de tranh dirty read

  select *
  from GIA_THEO_LOAI_TOA
end
go

exec sp_th6_fixed_error_dirty_read;