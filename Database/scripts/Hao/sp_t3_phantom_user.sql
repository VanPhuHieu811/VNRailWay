--Tinh huong 3:  Khách hàng xem danh sách toa tàu trong ngày A cùng lúc đó nhân viên thêm một toa
USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_XemDSChuyenTau
    @NgayDi DATE,         
    @GaDi VARCHAR(20),     
    @GaDen VARCHAR(20),    
    @GioKhoiHanh TIME NULL
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; 
    BEGIN TRANSACTION;

    -- LẦN ĐỌC 1: TÌM KIẾM CHUYẾN TÀU PHÙ HỢP
    SELECT 
        ct.MaChuyenTau, 
        ct.MaDoanTau, 
        dt.TenTau,
        
        gd.TenGa AS GaXuatPhat,
        T_DI.DuKienXuatPhat AS GioKhoiHanh,
        
        gc.TenGa AS GaKetThuc,
        T_DEN.DuKienDen AS GioDen,
        
        (COUNT(vt2.MaViTri) - COUNT(vt.MaVe)) AS SoChoTrong

    FROM CHUYEN_TAU ct
    JOIN DOAN_TAU dt ON dt.MaDoanTau = ct.MaDoanTau
    JOIN THOI_GIAN_CHUYEN_TAU T_DI ON T_DI.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gd ON gd.MaGaTau = T_DI.MaGaTau 
    JOIN THOI_GIAN_CHUYEN_TAU T_DEN ON T_DEN.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gc ON gc.MaGaTau = T_DEN.MaGaTau
    JOIN TOA_TAU ttau ON ttau.MaDoanTau = dt.MaDoanTau
    JOIN VI_TRI_TREN_TOA vt2 ON vt2.MaToaTau = ttau.MaToaTau
    LEFT JOIN VE_TAU vt ON vt.MaChuyenTau = ct.MaChuyenTau 
                        AND vt.MaViTri = vt2.MaViTri
                        AND (vt.TrangThai = N'Đã đặt' OR vt.TrangThai = N'Giữ chỗ')

    WHERE 
        ct.TrangThai = N'Chuẩn bị'
        AND T_DI.MaGaTau = @GaDi 
        AND CAST(T_DI.DuKienXuatPhat AS DATE) = @NgayDi
        AND T_DEN.MaGaTau = @GaDen
        AND T_DEN.DuKienDen > T_DI.DuKienXuatPhat
        AND (@GioKhoiHanh IS NULL OR CAST(T_DI.DuKienXuatPhat AS TIME) >= @GioKhoiHanh)

    GROUP BY 
        ct.MaChuyenTau, ct.MaDoanTau, dt.TenTau,
        gd.TenGa, T_DI.DuKienXuatPhat,
        gc.TenGa, T_DEN.DuKienDen
        
    HAVING (COUNT(vt2.MaViTri) - COUNT(vt.MaVe)) > 0;

    WAITFOR DELAY '00:00:10';

    SELECT 
        ct.MaChuyenTau, ct.MaDoanTau, dt.TenTau,
        gd.TenGa AS GaXuatPhat,
        T_DI.DuKienXuatPhat AS GioKhoiHanh,
        gc.TenGa AS GaKetThuc,
        T_DEN.DuKienDen AS GioDen,
        (COUNT(vt2.MaViTri) - COUNT(vt.MaVe)) AS SoChoTrong
    FROM CHUYEN_TAU ct
    JOIN DOAN_TAU dt ON dt.MaDoanTau = ct.MaDoanTau
    JOIN THOI_GIAN_CHUYEN_TAU T_DI ON T_DI.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gd ON gd.MaGaTau = T_DI.MaGaTau
    JOIN THOI_GIAN_CHUYEN_TAU T_DEN ON T_DEN.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gc ON gc.MaGaTau = T_DEN.MaGaTau
    JOIN TOA_TAU ttau ON ttau.MaDoanTau = dt.MaDoanTau
    JOIN VI_TRI_TREN_TOA vt2 ON vt2.MaToaTau = ttau.MaToaTau
    LEFT JOIN VE_TAU vt ON vt.MaChuyenTau = ct.MaChuyenTau 
                        AND vt.MaViTri = vt2.MaViTri
                        AND (vt.TrangThai = N'Đã đặt' OR vt.TrangThai = N'Giữ chỗ')
    WHERE 
        ct.TrangThai = N'Chuẩn bị'
        AND T_DI.MaGaTau = @GaDi 
        AND CAST(T_DI.DuKienXuatPhat AS DATE) = @NgayDi
        AND T_DEN.MaGaTau = @GaDen
        AND T_DEN.DuKienDen > T_DI.DuKienXuatPhat
        AND (@GioKhoiHanh IS NULL OR CAST(T_DI.DuKienXuatPhat AS TIME) >= @GioKhoiHanh)
    GROUP BY 
        ct.MaChuyenTau, ct.MaDoanTau, dt.TenTau,
        gd.TenGa, T_DI.DuKienXuatPhat,
        gc.TenGa, T_DEN.DuKienDen
    HAVING (COUNT(vt2.MaViTri) - COUNT(vt.MaVe)) > 0;

    COMMIT TRANSACTION;
END;
GO