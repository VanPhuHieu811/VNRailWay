GO
CREATE OR ALTER PROCEDURE sp_TimNhanVienTrongLich
    @MaChuyenTauCanPhanCong VARCHAR(10),
    @LoaiNV_CanTim NVARCHAR(50) 
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BatDau DATETIME, @KetThuc DATETIME;
    SELECT @BatDau = MIN(DuKienXuatPhat), @KetThuc = MAX(DuKienDen)
    FROM THOI_GIAN_CHUYEN_TAU 
    WHERE MaChuyenTau = @MaChuyenTauCanPhanCong;

    SELECT MaNV, HoTen, SoDienThoai, DiaChi, LoaiNhanVien
    FROM NHAN_VIEN nv
    WHERE 
    (
        (
            @LoaiNV_CanTim = N'Nhân viên trưởng'
            AND (nv.LoaiNhanVien = N'Lái tàu' OR nv.LoaiNhanVien = N'Toa tàu')
        )
        OR
        (
            @LoaiNV_CanTim = N'Nhân viên phụ trách lái'
            AND nv.LoaiNhanVien = N'Lái tàu'
        )
        OR
        (
            @LoaiNV_CanTim = N'Nhân viên phụ trách toa'
            AND nv.LoaiNhanVien = N'Toa tàu'
        )
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM PHAN_CONG_CHUYEN_TAU pc
        JOIN (
            SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BD, MAX(DuKienDen) as KT
            FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
        ) time_pc ON pc.MaChuyenTau = time_pc.MaChuyenTau
        WHERE pc.MaNV = nv.MaNV
        AND pc.TrangThai IN (N'Nhận việc', N'Đang làm') 
        AND (@BatDau < time_pc.KT AND time_pc.BD < @KetThuc) 
    );
END;
GO