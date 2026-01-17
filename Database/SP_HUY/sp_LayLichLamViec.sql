USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_LayLichLamViecNhanVien
    @MaNV VARCHAR(10),
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Bước 1: Thu gọn bảng THOI_GIAN_CHUYEN_TAU thành 1 dòng cho mỗi MaChuyenTau
    WITH LICH_TRINH_TOM_TAT AS (
        SELECT 
            MaChuyenTau,
            MIN(DuKienXuatPhat) AS GioKhoiHanhDauTien, 
            MAX(DuKienDen) AS GioDenCuoiCung        
        FROM THOI_GIAN_CHUYEN_TAU
        GROUP BY MaChuyenTau
    )
    -- Bước 2: Kết hợp với thông tin phân công và chuyến tàu
    SELECT 
        pc.MaPhanCong,
        ct.MaChuyenTau,
        tt.TenTuyen,
       
        CAST(lt.GioKhoiHanhDauTien AS DATE) AS NgayKhoiHanh,
        CONVERT(VARCHAR(5), lt.GioKhoiHanhDauTien, 108) AS GioDi,
        CONVERT(VARCHAR(5), lt.GioDenCuoiCung, 108) AS GioDen,
        
        ct.TrangThai AS TrangThaiChuyenTau, 
        pc.VaiTro,
        pc.MaToa,
        ct.MaDoanTau
    FROM PHAN_CONG_CHUYEN_TAU pc
    JOIN CHUYEN_TAU ct ON pc.MaChuyenTau = ct.MaChuyenTau
    JOIN LICH_TRINH_TOM_TAT lt ON ct.MaChuyenTau = lt.MaChuyenTau
    JOIN TUYEN_TAU tt ON tt.MaTuyenTau = ct.MaTuyenTau
    WHERE pc.MaNV = @MaNV
      AND pc.TrangThai <> N'Nghỉ' 
      AND (@TuNgay IS NULL OR CAST(lt.GioKhoiHanhDauTien AS DATE) >= @TuNgay)
      AND (@DenNgay IS NULL OR CAST(lt.GioKhoiHanhDauTien AS DATE) <= @DenNgay)
    ORDER BY lt.GioKhoiHanhDauTien ASC;
END;
GO