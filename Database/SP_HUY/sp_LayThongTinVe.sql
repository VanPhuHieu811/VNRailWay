USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_TraCuuVeDoi
    @MaVe VARCHAR(10),
    @CCCD VARCHAR(12)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        -- Thông tin vé & Ghế
        vt.MaVe,
		vt.MaKhachHang,
        vt.ThoiGianXuatVe,
        vt.TrangThai,
        vt.GiaThuc AS GiaVe,
        vt.MaViTri,
        tt.MaToaTau, 
        tt.LoaiToa,
		ct.MaTuyenTau,
        
        -- Thông tin khách hàng
        kh.HoTen AS TenKhach,
        kh.CCCD,
        kh.SoDienThoai,

        -- Thông tin chuyến tàu
        vt.MaChuyenTau,
        dt.TenTau,
        vt.GaXuatPhat AS MaGaDi,
        g1.TenGa AS TenGaDi,
        vt.GaDen AS MaGaDen,
        g2.TenGa AS TenGaDen,
        
		CONVERT(date, tg1.DuKienXuatPhat) AS NgayDi,
		tg1.DuKienXuatPhat AS ThoiGianDi,
		tg2.DuKienDen AS ThoiGianDen
		--CONVERT(varchar(5), tg1.DuKienXuatPhat, 108) AS GioDi,
		--CONVERT(varchar(5), tg2.DuKienDen, 108) AS GioDen

		--CONVERT(VARCHAR(5), tg1.DuKienXuatPhat, 108) AS ThoiGianDi,
        --CONVERT(VARCHAR(5), tg2.DuKienDen, 108) AS ThoiGianDen

    FROM VE_TAU vt
    JOIN KHACH_HANG kh ON vt.MaKhachHang = kh.MaKhachHang
    JOIN CHUYEN_TAU ct ON vt.MaChuyenTau = ct.MaChuyenTau
    JOIN DOAN_TAU dt ON ct.MaDoanTau = dt.MaDoanTau
    
    -- Join lấy tên Ga
    JOIN GA_TAU g1 ON vt.GaXuatPhat = g1.MaGaTau
    JOIN GA_TAU g2 ON vt.GaDen = g2.MaGaTau

    JOIN VI_TRI_TREN_TOA vtt ON vt.MaViTri = vtt.MaViTri
    JOIN TOA_TAU tt ON vtt.MaToaTau = tt.MaToaTau
    
    LEFT JOIN THOI_GIAN_CHUYEN_TAU tg1 ON ct.MaChuyenTau = tg1.MaChuyenTau AND vt.GaXuatPhat = tg1.MaGaTau
    LEFT JOIN THOI_GIAN_CHUYEN_TAU tg2 ON ct.MaChuyenTau = tg2.MaChuyenTau AND vt.GaDen = tg2.MaGaTau

    WHERE vt.MaVe = @MaVe 
      AND kh.CCCD = @CCCD
      AND vt.TrangThai IN (N'Đã thanh toán', N'Đã đặt'); 
END;
GO

