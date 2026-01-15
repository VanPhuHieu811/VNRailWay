--SP5: TIM NHAN VIEN TRONG LICH
GO

CREATE OR ALTER PROCEDURE sp_TimNhanVienTrongLich
    @MaChuyenTauCanPhanCong VARCHAR(10),
    @LoaiNV_CanTim NVARCHAR(20) -- 'Lái tàu', 'Toa tàu', v.v.
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Lấy khung thời gian của chuyến tàu đang cần người
    DECLARE @BatDau DATETIME, @KetThuc DATETIME;
    SELECT @BatDau = MIN(DuKienXuatPhat), @KetThuc = MAX(DuKienDen)
    FROM THOI_GIAN_CHUYEN_TAU WHERE MaChuyenTau = @MaChuyenTauCanPhanCong;

    -- 2. Tìm nhân viên đúng chuyên môn và không bị bận trong khoảng thời gian trên
    SELECT MaNV, HoTen, SoDienThoai, DiaChi
    FROM NHAN_VIEN nv
    WHERE LoaiNhanVien = @LoaiNV_CanTim
    AND NOT EXISTS (
        SELECT 1 
        FROM PHAN_CONG_CHUYEN_TAU pc
        JOIN (
            SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BD, MAX(DuKienDen) as KT
            FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
        ) time_pc ON pc.MaChuyenTau = time_pc.MaChuyenTau
        WHERE pc.MaNV = nv.MaNV
        AND pc.TrangThai IN (N'Nhận việc', N'Đang làm')
        -- Logic giao thoa thời gian (RB-165) 
        AND (@BatDau < time_pc.KT AND time_pc.BD < @KetThuc)
    );
END;
GO
--exec sp_TimNhanVienTrongLich 'CT02', 'Toa tàu'