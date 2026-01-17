USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_LayChiTietPC
    @MaChuyenTau VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaDoanTau VARCHAR(10);
    SELECT @MaDoanTau = MaDoanTau FROM CHUYEN_TAU WHERE MaChuyenTau = @MaChuyenTau;

    
    -- A. Vị trí LÁI TÀU 
    SELECT 
        pc.MaNV,
        nv.HoTen AS TenNV,
        N'Nhân viên phụ trách lái' AS VaiTro,
        NULL AS SoToa,
        NULL AS MaToa,
        1 AS SapXep 
    FROM (SELECT @MaChuyenTau AS ID) dummy
    LEFT JOIN PHAN_CONG_CHUYEN_TAU pc 
        ON pc.MaChuyenTau = dummy.ID AND pc.VaiTro = N'Nhân viên phụ trách lái'
    LEFT JOIN NHAN_VIEN nv ON pc.MaNV = nv.MaNV

    UNION ALL

    -- B. Vị trí TRƯỞNG TÀU 
    SELECT 
        pc.MaNV,
        nv.HoTen AS TenNV,
        N'Nhân viên trưởng' AS VaiTro,
        NULL AS SoToa,
        NULL AS MaToa,
        2 AS SapXep
    FROM (SELECT @MaChuyenTau AS ID) dummy
    LEFT JOIN PHAN_CONG_CHUYEN_TAU pc 
        ON pc.MaChuyenTau = dummy.ID AND pc.VaiTro = N'Nhân viên trưởng'
    LEFT JOIN NHAN_VIEN nv ON pc.MaNV = nv.MaNV

    UNION ALL

    -- C. Danh sách CÁC TOA 
    SELECT 
        pc.MaNV,
        nv.HoTen AS TenNV,
        N'Nhân viên phụ trách toa' AS VaiTro,
        tt.STT AS SoToa,
        tt.MaToaTau AS MaToa,
        3 AS SapXep
    FROM TOA_TAU tt
    LEFT JOIN PHAN_CONG_CHUYEN_TAU pc 
        ON pc.MaChuyenTau = @MaChuyenTau 
        AND pc.MaToa = tt.MaToaTau 
        AND pc.VaiTro = N'Nhân viên phụ trách toa'
    LEFT JOIN NHAN_VIEN nv ON pc.MaNV = nv.MaNV
    WHERE tt.MaDoanTau = @MaDoanTau

    ORDER BY SapXep ASC, SoToa ASC;
END
GO


