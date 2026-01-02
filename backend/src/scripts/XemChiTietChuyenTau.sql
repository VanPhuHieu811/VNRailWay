USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_ChiTietChuyenTau
    @MaChuyenTau VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CT.MaChuyenTau,
        CT.TrangThai,
        
        -- Route Info
        TT.TenTuyen,
        TT.KhoangCach AS TongKhoangCachKm,
        
        -- Train Info
        DT.TenTau,
        DT.LoaiTau,
        
        -- Time Info
        FORMAT(TG_Di.DuKienXuatPhat, 'HH:mm dd/MM/yyyy') AS ThoiGianDi,
        FORMAT(TG_Den.DuKienDen, 'HH:mm dd/MM/yyyy') AS ThoiGianDen,
        DATEDIFF(MINUTE, TG_Di.DuKienXuatPhat, TG_Den.DuKienDen) AS TongPhutDiChuyen

    FROM CHUYEN_TAU CT
    LEFT JOIN TUYEN_TAU TT ON CT.MaTuyenTau = TT.MaTuyenTau
    LEFT JOIN DOAN_TAU DT ON CT.MaDoanTau = DT.MaDoanTau
    
    -- Getting Start Time (Min) and End Time (Max) logic
    OUTER APPLY (
        SELECT DuKienXuatPhat 
        FROM THOI_GIAN_CHUYEN_TAU 
        WHERE MaChuyenTau = CT.MaChuyenTau AND MaGaTau = CT.GaXuatPhat
    ) TG_Di
    OUTER APPLY (
        SELECT DuKienDen 
        FROM THOI_GIAN_CHUYEN_TAU 
        WHERE MaChuyenTau = CT.MaChuyenTau AND MaGaTau = CT.GaKetThuc
    ) TG_Den

    WHERE CT.MaChuyenTau = @MaChuyenTau;
END;
GO

EXEC sp_ChiTietChuyenTau
    @MaChuyenTau = 'CT004'
