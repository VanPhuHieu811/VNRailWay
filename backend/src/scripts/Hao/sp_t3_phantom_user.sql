--Tinh huong 3:  Khách hàng xem danh sách toa tàu trong ngày A cùng lúc đó nhân viên thêm một toa
USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_XemDSChuyenTau
    @NgayDi DATE,          -- Ngày khách muốn đi (tại Ga Đi)
    @GaDi VARCHAR(20),     -- Mã Ga Đi (VD: GA01, GA08...)
    @GaDen VARCHAR(20),    -- Mã Ga Đến (VD: GA12...)
    @GioKhoiHanh TIME NULL -- (Tùy chọn) Giờ cụ thể
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; -- Hoặc READ COMMITTED tùy bạn
    BEGIN TRANSACTION;

    -- =======================================================
    -- LẦN ĐỌC 1: TÌM KIẾM CHUYẾN TÀU PHÙ HỢP
    -- =======================================================
    SELECT 
        ct.MaChuyenTau, 
        ct.MaDoanTau, 
        dt.TenTau,
        ttau.LoaiToa,
        
        -- Thông tin Ga Đi (Của khách chọn)
        gd.TenGa AS GaXuatPhat,
        T_DI.DuKienXuatPhat AS GioKhoiHanh,
        
        -- Thông tin Ga Đến (Của khách chọn)
        gc.TenGa AS GaKetThuc,
        T_DEN.DuKienDen AS GioDen,
        
        -- Tính số chỗ trống (Tổng chỗ - Vé đã đặt)
        (COUNT(vt2.MaViTri) - COUNT(vt.MaVe)) AS SoChoTrong

    FROM CHUYEN_TAU ct
    JOIN DOAN_TAU dt ON dt.MaDoanTau = ct.MaDoanTau
    
    -- 1. JOIN ĐỂ TÌM GA ĐI (Quan trọng: Lọc ngày tại đúng ga này)
    JOIN THOI_GIAN_CHUYEN_TAU T_DI ON T_DI.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gd ON gd.MaGaTau = T_DI.MaGaTau -- Lấy tên ga đi

    -- 2. JOIN ĐỂ TÌM GA ĐẾN (Quan trọng: Phải cùng chuyến với ga đi)
    JOIN THOI_GIAN_CHUYEN_TAU T_DEN ON T_DEN.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gc ON gc.MaGaTau = T_DEN.MaGaTau -- Lấy tên ga đến

    -- 3. JOIN ĐỂ TÍNH GHẾ TRỐNG (Logic cũ)
    JOIN TOA_TAU ttau ON ttau.MaDoanTau = dt.MaDoanTau
    JOIN VI_TRI_TREN_TOA vt2 ON vt2.MaToaTau = ttau.MaToaTau
    LEFT JOIN VE_TAU vt ON vt.MaChuyenTau = ct.MaChuyenTau 
                        AND vt.MaViTri = vt2.MaViTri
                        AND (vt.TrangThai = N'Đã đặt' OR vt.TrangThai = N'Giữ chỗ')

    -- =======================================================
    -- ĐIỀU KIỆN LỌC (WHERE)
    -- =======================================================
    WHERE 
        ct.TrangThai = N'Chuẩn bị'
        
        -- A. Kiểm tra Ga Đi đúng mã khách chọn
        AND T_DI.MaGaTau = @GaDi 
        
        -- B. Kiểm tra Ngày Đi đúng ngày khách chọn (So sánh Date của Ga Đi)
        AND CAST(T_DI.DuKienXuatPhat AS DATE) = @NgayDi
        
        -- C. Kiểm tra Ga Đến đúng mã khách chọn
        AND T_DEN.MaGaTau = @GaDen
        
        -- D. QUAN TRỌNG: Ga Đến phải nằm SAU Ga Đi (Về mặt thời gian)
        AND T_DEN.DuKienDen > T_DI.DuKienXuatPhat

        -- E. Lọc theo giờ (nếu có)
        AND (@GioKhoiHanh IS NULL OR CAST(T_DI.DuKienXuatPhat AS TIME) >= @GioKhoiHanh)

    GROUP BY 
        ct.MaChuyenTau, ct.MaDoanTau, dt.TenTau,
        gd.TenGa, T_DI.DuKienXuatPhat,
        gc.TenGa, T_DEN.DuKienDen
        
    HAVING (COUNT(vt2.MaViTri) - COUNT(vt.MaVe)) > 0;

    -- =======================================================
    -- GIẢ LẬP ĐỘ TRỄ ĐỂ TEST PHANTOM READ
    -- =======================================================
    WAITFOR DELAY '00:00:10';

    -- =======================================================
    -- LẦN ĐỌC 2 (COPY Y HỆT LẦN 1)
    -- =======================================================
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
exec sp_XemDSChuyenTau 
    @NgayDi = '2026-01-16', 
    @GaDi = 'GA01', 
    @GaDen = 'GA12', 
    @GioKhoiHanh = NULL;


select *
from THOI_GIAN_CHUYEN_TAU

select *
from  DAT_VE

select *
from TAI_KHOAN

select *
FROM VI_TRI_TREN_TOA

SELECT*
FROM THAM_SO

SELECT *
FROM GIA_THEO_LOAI_TAU
