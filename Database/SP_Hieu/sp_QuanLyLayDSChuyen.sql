USE VNRAILWAY
GO

-- 1. SP Lấy danh sách chuyến tàu lọc trạng thái & Sắp xếp thời gian
CREATE OR ALTER PROCEDURE sp_QuanLyLayDSChuyen
    @Status NVARCHAR(20) = NULL 
AS
BEGIN
    SELECT 
        ct.MaChuyenTau AS id,
        tt.TenTuyen AS route,
        gt_di.TenGa AS departureStation,
        gt_den.TenGa AS arrivalStation,
        dt.MaDoanTau AS trainId,
        dt.TenTau + ' (' + dt.LoaiTau + ')' AS trainCode,
        ct.TrangThai AS status,
        
        FORMAT(tg_di.DuKienXuatPhat, 'yyyy-MM-dd') AS date,
        FORMAT(tg_di.DuKienXuatPhat, 'HH:mm') + ' - ' + ISNULL(FORMAT(tg_den.DuKienDen, 'HH:mm'), 'N/A') AS time,
        tg_di.DuKienXuatPhat AS SortTime, 

        -- Lấy tên Lái tàu (Nếu có)
        (SELECT TOP 1 nv.HoTen 
         FROM PHAN_CONG_CHUYEN_TAU pc 
         JOIN NHAN_VIEN nv ON pc.MaNV = nv.MaNV 
         WHERE pc.MaChuyenTau = ct.MaChuyenTau AND pc.VaiTro = N'Nhân viên phụ trách lái') AS driver,

        -- Lấy tên Trưởng tàu (Nếu có)
        (SELECT TOP 1 nv.HoTen 
         FROM PHAN_CONG_CHUYEN_TAU pc 
         JOIN NHAN_VIEN nv ON pc.MaNV = nv.MaNV 
         WHERE pc.MaChuyenTau = ct.MaChuyenTau AND pc.VaiTro = N'Nhân viên trưởng') AS manager

    FROM CHUYEN_TAU ct
    JOIN TUYEN_TAU tt ON ct.MaTuyenTau = tt.MaTuyenTau
    JOIN DOAN_TAU dt ON ct.MaDoanTau = dt.MaDoanTau
    -- Join để lấy giờ đi tại ga xuất phát
    LEFT JOIN THOI_GIAN_CHUYEN_TAU tg_di ON ct.MaChuyenTau = tg_di.MaChuyenTau AND ct.GaXuatPhat = tg_di.MaGaTau
    LEFT JOIN GA_TAU gt_di ON tg_di.MaGaTau = gt_di.MaGaTau
    -- Join để lấy giờ đến tại ga kết thúc
    LEFT JOIN THOI_GIAN_CHUYEN_TAU tg_den ON ct.MaChuyenTau = tg_den.MaChuyenTau AND ct.GaKetThuc = tg_den.MaGaTau
    LEFT JOIN GA_TAU gt_den ON ct.GaKetThuc = gt_den.MaGaTau
    WHERE (@Status IS NULL OR @Status = 'all' OR ct.TrangThai = @Status)
    ORDER BY tg_di.DuKienXuatPhat DESC;
END
GO

exec sp_QuanLyLayDSChuyen 