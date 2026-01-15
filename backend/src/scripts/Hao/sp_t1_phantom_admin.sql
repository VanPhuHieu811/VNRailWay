use VNRAILWAY
select *
from NHAN_VIEN nv
join TAI_KHOAN tk on tk.MaNV=nv.MaNV
where nv.LoaiNhanVien= N'Quản trị'
GO
create or alter procedure sp_ThemMoiChuyen
    @MaChuyenTau NVARCHAR(20),
    @MaDoanTau NVARCHAR(20),
    @MaTuyenTau NVARCHAR(20),
    @GaXuatPhat NVARCHAR(50),
    @GaKetThuc NVARCHAR(50),
    @NgayKhoiHanh Datetime
AS
BEGIN
set transaction isolation level read committed
begin transaction
    DECLARE @MaxID INT;
    DECLARE @NewMaChuyenTau VARCHAR(10);
    SELECT @MaxID = MAX(CAST(SUBSTRING(MaChuyenTau, 3, LEN(MaChuyenTau)) AS INT))
    FROM CHUYEN_TAU
    WHERE MaChuyenTau LIKE 'CT%';
    IF @MaxID IS NULL SET @MaxID = 0;
    SET @MaxID = @MaxID + 1;
    SET @NewMaChuyenTau = 'CT' + RIGHT('000' + CAST(@MaxID AS VARCHAR(5)), 3);
    INSERT INTO CHUYEN_TAU (MaChuyenTau, MaDoanTau, MaTuyenTau, GaXuatPhat, GaKetThuc, TrangThai)
    values (@NewMaChuyenTau, @MaDoanTau, @MaTuyenTau, @GaXuatPhat, @GaKetThuc, N'Chuẩn bị');
    -- Tinh thoi gian du kien xuat phat va den
    declare @curMaGa Nvarchar(20);
    declare @curThuTu int;
    declare @curKhoangCach int;

    declare @ThoiGianDen datetime=@NgayKhoiHanh;
    declare @ThoiGianDi datetime=@ngaykhoihanh;

    declare cur_lichtrinh cursor FOR
    select MaGaTau, ThuTu, KhoangCach
    From DANH_SACH_GA
    where MaTuyenTau=@MaTuyenTau
    order by ThuTu asc;

    open cur_lichtrinh;
    fetch next from cur_lichtrinh into @CurMaGa, @CurThuTu, @CurKhoangCach;

    while @@FETCH_STATUS=0
    BEGIN
        if @CurThuTu=1
        BEGIN 
            SET @ThoiGianDi= @NgayKhoiHanh;
            set @ThoiGianDen=@NgayKhoiHanh;
        END
        ELSE
        begin 
            declare @PhutDiChuyen int = (@CurKhoangCach*60)/60; --Gia su tau chay 60km/h
            SET @ThoiGianDen= DATEADD(MINUTE, @PhutDiChuyen, @ThoiGianDi);
            SET @ThoiGianDi= DATEADD(MINUTE, 10, @ThoiGianDen); --Dung 10 phut o ga
        END
        insert into THOI_GIAN_CHUYEN_TAU(MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen)
        values (@NewMaChuyenTau, @CurMaGa, @ThoiGianDi, @ThoiGianDen);
        fetch NEXT from cur_LichTrinh into @CurMaGa, @CurThuTu, @CurKhoangCach;
    END
    close cur_lichtrinh;
    deallocate cur_lichtrinh;
commit transaction;
END
