USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_LoTrinhChuyen
    @MaChuyenTau VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Lấy thứ tự của Ga Xuất Phát và Ga Kết Thúc
    DECLARE @ThuTuDi INT, @ThuTuDen INT;

    SELECT 
        @ThuTuDi = dsg1.ThuTu,
        @ThuTuDen = dsg2.ThuTu
    FROM CHUYEN_TAU ct
    LEFT JOIN DANH_SACH_GA dsg1 ON ct.MaTuyenTau = dsg1.MaTuyenTau AND ct.GaXuatPhat = dsg1.MaGaTau
    LEFT JOIN DANH_SACH_GA dsg2 ON ct.MaTuyenTau = dsg2.MaTuyenTau AND ct.GaKetThuc = dsg2.MaGaTau
    WHERE ct.MaChuyenTau = @MaChuyenTau;

    -- 2. Kiểm tra chiều chạy để sắp xếp
    IF @ThuTuDi > @ThuTuDen
    BEGIN
        -- CHIỀU NGƯỢC (Sắp xếp GIẢM DẦN)
        SELECT 
            gt.TenGa AS station,
            gt.MaGaTau AS stationId,
            dsg.ThuTu,
            
            -- Lấy nguyên gốc DATETIME từ DB
            tg.DuKienXuatPhat AS expDep,
            tg.DuKienDen AS expArr,
            
            -- Lấy nguyên gốc DATETIME (có thể là NULL)
            tg.ThucTeXuatPhat AS actDep,
            tg.ThucTeDen AS actArr,

            CASE 
                WHEN tg.ThucTeXuatPhat IS NOT NULL THEN 'passed'
                WHEN tg.ThucTeDen IS NOT NULL AND tg.ThucTeXuatPhat IS NULL THEN 'current'
                ELSE 'waiting'
            END AS status

        FROM THOI_GIAN_CHUYEN_TAU tg
        JOIN CHUYEN_TAU ct ON tg.MaChuyenTau = ct.MaChuyenTau
        JOIN DANH_SACH_GA dsg ON ct.MaTuyenTau = dsg.MaTuyenTau AND tg.MaGaTau = dsg.MaGaTau
        JOIN GA_TAU gt ON tg.MaGaTau = gt.MaGaTau
        WHERE tg.MaChuyenTau = @MaChuyenTau
        ORDER BY dsg.ThuTu DESC; 
    END
    ELSE
    BEGIN
        -- CHIỀU XUÔI (Sắp xếp TĂNG DẦN)
        SELECT 
            gt.TenGa AS station,
            gt.MaGaTau AS stationId,
            dsg.ThuTu,
            
            tg.DuKienXuatPhat AS expDep,
            tg.DuKienDen AS expArr,
            
            tg.ThucTeXuatPhat AS actDep,
            tg.ThucTeDen AS actArr,

            CASE 
                WHEN tg.ThucTeXuatPhat IS NOT NULL THEN 'passed'
                WHEN tg.ThucTeDen IS NOT NULL AND tg.ThucTeXuatPhat IS NULL THEN 'current'
                ELSE 'waiting'
            END AS status

        FROM THOI_GIAN_CHUYEN_TAU tg
        JOIN CHUYEN_TAU ct ON tg.MaChuyenTau = ct.MaChuyenTau
        JOIN DANH_SACH_GA dsg ON ct.MaTuyenTau = dsg.MaTuyenTau AND tg.MaGaTau = dsg.MaGaTau
        JOIN GA_TAU gt ON tg.MaGaTau = gt.MaGaTau
        WHERE tg.MaChuyenTau = @MaChuyenTau
        ORDER BY dsg.ThuTu ASC; 
    END
END
GO

