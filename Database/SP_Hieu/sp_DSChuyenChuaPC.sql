
-- 4. SP Lấy danh sách chuyến chưa phân công đủ
use VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_DSChuyenChuaPC
AS
BEGIN
    SELECT 
        ct.MaChuyenTau AS id,
        tt.TenTuyen AS route,
        dt.TenTau AS trainCode,
        FORMAT(tg.DuKienXuatPhat, 'yyyy-MM-dd') AS date,
        FORMAT(tg.DuKienXuatPhat, 'HH:mm') AS time,
        
        -- Kiểm tra Driver
        (SELECT COUNT(*) FROM PHAN_CONG_CHUYEN_TAU WHERE MaChuyenTau = ct.MaChuyenTau AND VaiTro = N'Nhân viên phụ trách lái') AS HasDriver,
        
        -- Kiểm tra Manager
        (SELECT COUNT(*) FROM PHAN_CONG_CHUYEN_TAU WHERE MaChuyenTau = ct.MaChuyenTau AND VaiTro = N'Nhân viên trưởng') AS HasManager,
        
        -- Đếm số toa đã có nhân viên
        (SELECT COUNT(DISTINCT MaToa) FROM PHAN_CONG_CHUYEN_TAU WHERE MaChuyenTau = ct.MaChuyenTau AND VaiTro = N'Nhân viên phụ trách toa') AS AssignedCarriages,
        
        -- Tổng số toa cần nhân viên (Lấy từ bảng TOA_TAU)
        (SELECT COUNT(*) FROM TOA_TAU WHERE MaDoanTau = ct.MaDoanTau) AS TotalCarriages

    FROM CHUYEN_TAU ct
    JOIN TUYEN_TAU tt ON ct.MaTuyenTau = tt.MaTuyenTau
    JOIN DOAN_TAU dt ON ct.MaDoanTau = dt.MaDoanTau
    LEFT JOIN THOI_GIAN_CHUYEN_TAU tg ON ct.MaChuyenTau = tg.MaChuyenTau AND ct.GaXuatPhat = tg.MaGaTau
    WHERE ct.TrangThai IN (N'Chuẩn bị', N'Đang chạy')
    -- Logic lọc: Thiếu Lái OR Thiếu Trưởng OR Thiếu Toa
    AND (
        NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU pc WHERE pc.MaChuyenTau = ct.MaChuyenTau AND pc.VaiTro = N'Nhân viên phụ trách lái')
        OR
        NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU pc WHERE pc.MaChuyenTau = ct.MaChuyenTau AND pc.VaiTro = N'Nhân viên trưởng')
        OR
        (SELECT COUNT(DISTINCT MaToa) FROM PHAN_CONG_CHUYEN_TAU WHERE MaChuyenTau = ct.MaChuyenTau AND VaiTro = N'Nhân viên phụ trách toa') < (SELECT COUNT(*) FROM TOA_TAU WHERE MaDoanTau = ct.MaDoanTau)
    )
    ORDER BY tg.DuKienXuatPhat ASC;
END
GO
