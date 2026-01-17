USE VNRAILWAY
GO
USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_TimKiemChuyenTau
    @GaDi       VARCHAR(10) = NULL,
    @GaDen      VARCHAR(10) = NULL,
    @NgayDi     DATE        = NULL,
    @TrangThai  VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON; -- Good practice for APIs to reduce network traffic

    SELECT 
        -- 1. Identity Info
        CT.MaChuyenTau,
        DT.TenTau,
        DT.LoaiTau, -- Important for UI (Luxury vs Normal)

        -- 2. Route & Station Names (Human Readable)
        TT.TenTuyen,
        G_Di.TenGa AS TenGaDi,
        G_Den.TenGa AS TenGaDen,

        -- 3. Schedule & Duration
        TG_Di.DuKienXuatPhat AS ThoiGianDi,
        TG_Den.DuKienDen AS ThoiGianDen,
        
        -- Calculate Duration in Minutes
        DATEDIFF(MINUTE, TG_Di.DuKienXuatPhat, TG_Den.DuKienDen) AS TongThoiGianPhut,
        
        -- Format Duration (e.g., '3h 15m') for display
        CAST(DATEDIFF(MINUTE, TG_Di.DuKienXuatPhat, TG_Den.DuKienDen) / 60 AS VARCHAR) + 'h ' + 
        CAST(DATEDIFF(MINUTE, TG_Di.DuKienXuatPhat, TG_Den.DuKienDen) % 60 AS VARCHAR) + 'm' AS ThoiGianHienThi,

        -- 4. Capacity Info (Aggregated Data)
        ISNULL(ThongKe.TongSoToa, 0) AS TongSoToa,
        ISNULL(ThongKe.TongSoGhe, 0) AS TongSoGhe,
        
        CT.TrangThai

    FROM CHUYEN_TAU CT
    -- Core Joins
    JOIN DOAN_TAU DT ON CT.MaDoanTau = DT.MaDoanTau
    JOIN TUYEN_TAU TT ON CT.MaTuyenTau = TT.MaTuyenTau
    
    -- Schedule Joins
    JOIN THOI_GIAN_CHUYEN_TAU TG_Di ON CT.MaChuyenTau = TG_Di.MaChuyenTau
    JOIN THOI_GIAN_CHUYEN_TAU TG_Den ON CT.MaChuyenTau = TG_Den.MaChuyenTau

    -- Station Info Joins (To get names)
    JOIN GA_TAU G_Di ON TG_Di.MaGaTau = G_Di.MaGaTau
    JOIN GA_TAU G_Den ON TG_Den.MaGaTau = G_Den.MaGaTau

    -- Subquery / CTE Calculation for Train Capacity using OUTER APPLY
    OUTER APPLY (
        SELECT 
            COUNT(TT.MaToaTau) AS TongSoToa,
            SUM(TT.SLViTri) AS TongSoGhe
        FROM TOA_TAU TT
        WHERE TT.MaDoanTau = DT.MaDoanTau
    ) AS ThongKe

    WHERE 
        (@GaDi IS NULL OR TG_Di.MaGaTau = @GaDi)
        AND (@GaDen IS NULL OR TG_Den.MaGaTau = @GaDen)
        AND (@NgayDi IS NULL OR CAST(TG_Di.DuKienXuatPhat AS DATE) = @NgayDi)
        
        -- Logic: Departure must be before Arrival
        AND TG_Di.DuKienXuatPhat < TG_Den.DuKienDen
        
        AND (@TrangThai IS NULL OR CT.TrangThai = @TrangThai);
END;
GO

EXEC sp_TimKiemChuyenTau
	@GaDi = 'GA05'