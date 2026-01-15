--Tinh huong 3:  Khách hàng xem danh sách toa tàu trong ngày A cùng lúc đó nhân viên thêm một toa
use VNRAILWAY
go
select *
from CHUYEN_TAU
go
create or alter procedure sp_XemDSChuyenTau
    @NgayDi DATE,
    @GaDen NVarchar(50),
    @GaDi NVarchar(50),
    @GioKhoiHanh time null
AS
BEGIN
    set transaction isolation level repeatable READ
    begin transaction
    select ct.MaChuyenTau,ct.MaDoanTau, dt.TenTau,
        g_di.TenGa as GaXuatPhat,
        g_den.TenGa as GaKetThuc,
        tgct.DuKienXuatPhat as GioKhoiHanh,
        tgct.DuKienDen as GioDen,
        COUNT(vt2.MaViTri) - COUNT(vt.MaVe) AS SoChoTrong
    from Chuyen_tau ct
    join TUYEN_TAU tt on tt.MaTuyenTau = ct.MaTuyenTau
    join DOAN_TAU dt on dt.MaDoanTau= ct.MaDoanTau
    join THOI_GIAN_CHUYEN_TAU tgct on tgct.MaChuyenTau=ct.MaChuyenTau
    join GA_TAU g_di on g_di.MaGaTau= ct.GaXuatPhat
    join GA_TAU g_den on g_den.MaGaTau =ct.GaKetThuc
    -- Tính tổng số chỗ của toa tàu trong đoàn tàu
    join toa_tau ttau on ttau.MaDoanTau= dt.MaDoanTau
    join VI_TRI_TREN_TOA vt2 on vt2.MaToaTau= ttau.MaToaTau

    left join VE_TAU vt on vt.MaChuyenTau= ct.MaChuyenTau and vt.MaViTri= vt2.MaViTri
    and (vt.TrangThai =N'Đã đặt' or vt.TrangThai=N'Giữ chỗ')
    where convert(date, tgct.DuKienXuatPhat)= @NgayDi
    and g_di.TenGa =  @GaDi 
    and g_den.TenGa =  @GaDen 
    and ct.trangthai = N'Chuẩn bị'
    and (@GioKhoiHanh is null or convert(time, tgct.DuKienXuatPhat) = @GioKhoiHanh)
    group by ct.MaChuyenTau,ct.MaDoanTau, dt.TenTau,
        g_di.TenGa,
        g_den.TenGa,
        tgct.DuKienXuatPhat,
        tgct.DuKienDen
    having count (vt2.MaViTri) - count(vt.MaVe) >0
    WAITFOR DELAY '00:00:10'
-- Lần đọc thứ 2
    select ct.MaChuyenTau,ct.MaDoanTau, dt.TenTau,
           g_di.TenGa as GaXuatPhat,
           g_den.TenGa as GaKetThuc,
           tgct.DuKienXuatPhat as GioKhoiHanh,
           tgct.DuKienDen as GioDen,
           COUNT(vt2.MaViTri) - COUNT(vt.MaVe) AS SoChoTrong
    from Chuyen_tau ct
    join TUYEN_TAU tt on tt.MaTuyenTau = ct.MaTuyenTau
    join DOAN_TAU dt on dt.MaDoanTau= ct.MaDoanTau
    join THOI_GIAN_CHUYEN_TAU tgct on tgct.MaChuyenTau=ct.MaChuyenTau
    join GA_TAU g_di on g_di.MaGaTau= ct.GaXuatPhat
    join GA_TAU g_den on g_den.MaGaTau =ct.GaKetThuc
    -- Tính tổng số chỗ của toa tàu trong đoàn tàu
    join toa_tau ttau on ttau.MaDoanTau= dt.MaDoanTau
    join VI_TRI_TREN_TOA vt2 on vt2.MaToaTau= ttau.MaToaTau

    left join VE_TAU vt on vt.MaChuyenTau= ct.MaChuyenTau and vt.MaViTri= vt2.MaViTri
    and (vt.TrangThai =N'Đã đặt' or vt.TrangThai=N'Giữ chỗ')
    where convert(date, tgct.DuKienXuatPhat)= @NgayDi
      and g_di.TenGa =  @GaDi 
      and g_den.TenGa =  @GaDen 
      and ct.trangthai = N'Chuẩn bị'
      and (@GioKhoiHanh is null or convert(time, tgct.DuKienXuatPhat) = @GioKhoiHanh)
    group by ct.MaChuyenTau,ct.MaDoanTau, dt.TenTau,
           g_di.TenGa,
           g_den.TenGa,
           tgct.DuKienXuatPhat,
           tgct.DuKienDen
    having count (vt2.MaViTri) - count(vt.MaVe) >0

    commit transaction
END 


