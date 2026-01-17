use VNRAILWAY;
GO 
CREATE OR ALTER PROCEDURE sp_LayLichSuDatVe_DirtyRead
    @Email VARCHAR(100)
AS
BEGIN
    -- [QUAN TRỌNG] Thiết lập mức cô lập để cho phép Dirty Read
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    SELECT 
        dv.MaDatVe,
        dv.ThoiGianDat,
        dv.TongTienDuKien,
        dv.TrangThai AS TrangThaiDatVe,
        dv.Email,
        
        -- Thông tin vé chi tiết
        vt.MaVe,
        vt.MaViTri,
        vt.GiaThuc,
        gxp.TenGa AS GaXuatPhat,
        gd.TenGa AS GaDen,
        vt.ThoiGianXuatVe,
        vt.TrangThai as TrangThaiVe,

        --Thong tin khach hang
        kh.HoTen,
        kh.SoDienThoai,
        
        -- Thông tin chuyến tàu
        ct.MaChuyenTau,
        tgct.DuKienXuatPhat,
        tgcd.DuKienDen,

        -- Thông tin toa tàu
        tt.MaToaTau,
        tt.STT as STTToaTau,
        tt.LoaiToa,
        vttt.STT as STTViTri
    FROM DAT_VE dv
    JOIN VE_TAU vt ON dv.MaDatVe = vt.MaDatVe
    JOIN CHUYEN_TAU ct ON vt.MaChuyenTau = ct.MaChuyenTau
    JOIN GA_TAU gxp on gxp.MaGaTau = vt.GaXuatPhat
    JOIN GA_TAU gd on gd.MaGaTau=vt.GaDen
    JOIN KHACH_HANG kh on kh.MaKhachHang=vt.MaKhachHang
    JOIN TOA_TAU tt on tt.MaDoanTau= ct.MaDoanTau
    JOIN VI_TRI_TREN_TOA vttt on vttt.MaToaTau=tt.MaToaTau and vttt.MaViTri=vt.MaViTri
    JOIN THOI_GIAN_CHUYEN_TAU tgct on tgct.MaChuyenTau=ct.MaChuyenTau and tgct.MaGaTau=vt.GaXuatPhat
    JOIN THOI_GIAN_CHUYEN_TAU tgcd on tgcd.MaChuyenTau=ct.MaChuyenTau and tgcd.MaGaTau=vt.GaDen

    WHERE dv.Email =@Email
    ORDER BY dv.ThoiGianDat DESC;
END;

