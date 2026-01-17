USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_TraCuuVe
    @MaVe VARCHAR(50)
AS
BEGIN
    -- Query kết hợp nhiều bảng để lấy thông tin chi tiết
    SELECT 
        v.MaVe,
        v.TrangThai,
        v.ThoiGianXuatVe,
        v.GiaThuc,
        
        -- Thông tin khách hàng
        kh.HoTen AS TenKhachHang,
        kh.CCCD,
        kh.SoDienThoai,

        -- Thông tin chuyến tàu
        dt.TenTau,
        ct.MaChuyenTau,
        tuyen.TenTuyen,

        -- Thông tin vị trí (Toa/Ghế)
        toa.STT AS ToaSo,
        toa.LoaiToa,
        vt.STT AS GheSo,
        vt.LoaiVT,

        -- Thông tin Ga đi - Ga đến
        gaDi.TenGa AS TenGaDi,
        gaDen.TenGa AS TenGaDen

    FROM VE_TAU v
    -- Join Khách hàng
    LEFT JOIN KHACH_HANG kh ON v.MaKhachHang = kh.MaKhachHang
    -- Join Chuyến tàu -> Đoàn tàu -> Tuyến tàu
    LEFT JOIN CHUYEN_TAU ct ON v.MaChuyenTau = ct.MaChuyenTau
    LEFT JOIN DOAN_TAU dt ON ct.MaDoanTau = dt.MaDoanTau
    LEFT JOIN TUYEN_TAU tuyen ON ct.MaTuyenTau = tuyen.MaTuyenTau
    -- Join Vị trí -> Toa tàu
    LEFT JOIN VI_TRI_TREN_TOA vt ON v.MaViTri = vt.MaViTri
    LEFT JOIN TOA_TAU toa ON vt.MaToaTau = toa.MaToaTau
    -- Join Ga đi, Ga đến (Join 2 lần vào bảng GA_TAU)
    LEFT JOIN GA_TAU gaDi ON v.GaXuatPhat = gaDi.MaGaTau
    LEFT JOIN GA_TAU gaDen ON v.GaDen = gaDen.MaGaTau

    WHERE v.MaVe = @MaVe;
END;
GO

select * from VE_TAU
