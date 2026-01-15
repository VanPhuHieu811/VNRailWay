
CREATE OR ALTER PROCEDURE sp_LayLichLamViecNhanVien
    @MaNV VARCHAR(10),
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
    
    WITH LICH_TRINH_TOM_TAT AS (
        SELECT 
            MaChuyenTau,
            MIN(DuKienXuatPhat) AS GioKhoiHanhDauTien, -- Giờ tại ga xuất phát đầu tiên
            MAX(DuKienDen) AS GioDenCuoiCung         -- Giờ tại ga kết thúc cuối cùng
        FROM THOI_GIAN_CHUYEN_TAU
        GROUP BY MaChuyenTau
    )
    -- Bước 2: Kết hợp với thông tin phân công và chuyến tàu
    SELECT 
        pc.MaPhanCong,
        ct.MaChuyenTau,
        tt.TenTuyen,
       
        -- Định dạng hiển thị khớp với UI của bạn
        CAST(lt.GioKhoiHanhDauTien AS DATE) AS NgayKhoiHanh,
        CONVERT(VARCHAR(5), lt.GioKhoiHanhDauTien, 108) AS GioDi,
        CONVERT(VARCHAR(5), lt.GioDenCuoiCung, 108) AS GioDen,
        
        ct.TrangThai AS TrangThaiChuyenTau, -- "Sắp khởi hành"
        pc.VaiTro,
        pc.MaToa,
        ct.MaDoanTau
    FROM PHAN_CONG_CHUYEN_TAU pc
    JOIN CHUYEN_TAU ct ON pc.MaChuyenTau = ct.MaChuyenTau
    JOIN LICH_TRINH_TOM_TAT lt ON ct.MaChuyenTau = lt.MaChuyenTau
    JOIN TUYEN_TAU tt ON tt.MaTuyenTau = ct.MaTuyenTau
    WHERE pc.MaNV = @MaNV
      AND pc.TrangThai <> N'Nghỉ' -- Loại bỏ các lịch đã xin nghỉ thành công
      AND (@TuNgay IS NULL OR CAST(lt.GioKhoiHanhDauTien AS DATE) >= @TuNgay)
      AND (@DenNgay IS NULL OR CAST(lt.GioKhoiHanhDauTien AS DATE) <= @DenNgay)
    ORDER BY lt.GioKhoiHanhDauTien ASC;
END;
GO

EXEC sp_LayLichLamViecNhanVien 
    @MaNV = 'NV005'