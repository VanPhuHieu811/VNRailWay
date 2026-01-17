USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_TinhGiaVeChiTiet
    @MaChuyenTau VARCHAR(10), 
    @GaDi VARCHAR(10),        
    @GaDen VARCHAR(10),       
    @MaViTri VARCHAR(10),
    @MaUuDai VARCHAR(10) = NULL 
AS
BEGIN
    SET NOCOUNT ON;

    -- KHAI BÁO BIẾN
    DECLARE @MaTuyenTau VARCHAR(10);
    DECLARE @KmDi FLOAT = 0, @KmDen FLOAT = 0, @KhoangCach FLOAT = 0;
    
    DECLARE @DonGiaKm DECIMAL(18, 0) = 0;
    DECLARE @TienKhoangCach DECIMAL(18, 0) = 0;
    
    DECLARE @GiaLoaiTau DECIMAL(18, 0) = 0;
    DECLARE @GiaLoaiToa DECIMAL(18, 0) = 0;
    DECLARE @GiaTang DECIMAL(18, 0) = 0;
    
    DECLARE @TongTienTamTinh DECIMAL(18, 0) = 0; 
    
    DECLARE @PhanTramGiam INT = 0;
    DECLARE @SoTienGiam DECIMAL(18, 0) = 0;
    DECLARE @GiaCuoiCung DECIMAL(18, 0) = 0;

    -- 1. TÍNH TIỀN KHOẢNG CÁCH
    SELECT @MaTuyenTau = MaTuyenTau FROM CHUYEN_TAU WHERE MaChuyenTau = @MaChuyenTau;
    SELECT @KmDi = KhoangCach FROM DANH_SACH_GA WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @GaDi;
    SELECT @KmDen = KhoangCach FROM DANH_SACH_GA WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @GaDen;
    SET @KhoangCach = ABS(@KmDen - @KmDi);
    
    SELECT @DonGiaKm = CAST(GiaTriSo AS DECIMAL(18,0)) FROM THAM_SO WHERE MaThamSo = 'TS004';
    SET @TienKhoangCach = @KhoangCach * @DonGiaKm;

    -- 2. PHỤ PHÍ TÀU
    SELECT @GiaLoaiTau = g.GiaTien
    FROM CHUYEN_TAU ct
    JOIN DOAN_TAU dt ON ct.MaDoanTau = dt.MaDoanTau
    JOIN GIA_THEO_LOAI_TAU g ON dt.LoaiTau = g.LoaiTau
    WHERE ct.MaChuyenTau = @MaChuyenTau;

    -- 3. PHỤ PHÍ TOA
    SELECT @GiaLoaiToa = g.GiaTien
    FROM VI_TRI_TREN_TOA vt
    JOIN TOA_TAU tt ON vt.MaToaTau = tt.MaToaTau
    JOIN GIA_THEO_LOAI_TOA g ON tt.LoaiToa = g.LoaiToa
    WHERE vt.MaViTri = @MaViTri;

    -- 4. PHỤ PHÍ TẦNG
    IF EXISTS (SELECT 1 FROM GIUONG WHERE MaViTri = @MaViTri)
        SELECT @GiaTang = g.GiaTien
        FROM GIUONG gi JOIN GIA_THEO_TANG g ON gi.Tang = g.SoTang WHERE gi.MaViTri = @MaViTri;
    ELSE
        SET @GiaTang = 0;

    -- 5. TỔNG TIỀN TẠM TÍNH (Chưa giảm)
    SET @TongTienTamTinh = @TienKhoangCach + @GiaLoaiTau + @GiaLoaiToa + @GiaTang;

    -- 6.TÍNH TOÁN ƯU ĐÃI
    IF @MaUuDai IS NOT NULL AND @MaUuDai <> ''
    BEGIN
        -- Kiểm tra mã có tồn tại, đang hoạt động và còn hạn không
        SELECT @PhanTramGiam = ud.PhanTram
        FROM UU_DAI_GIA ud
        WHERE ud.MaUuDai = @MaUuDai
          AND ud.Trangthai = N'Đang áp dụng'
          AND GETDATE() >= ud.NgayBatDau 
          AND (ud.NgayKetThuc IS NULL OR GETDATE() <= ud.NgayKetThuc); 

        -- Nếu tìm thấy mã hợp lệ (PhanTramGiam > 0)
        IF @PhanTramGiam > 0
        BEGIN
            SET @SoTienGiam = @TongTienTamTinh * @PhanTramGiam / 100;
        END
    END
    

    SET @GiaCuoiCung = @TongTienTamTinh - @SoTienGiam;

    -- TRẢ VỀ KẾT QUẢ
    SELECT 
        @MaChuyenTau AS MaChuyenTau,
        @MaViTri AS MaViTri,
        @KhoangCach AS KhoangCachKm,
        @TongTienTamTinh AS GiaGoc,       -- Giá chưa giảm
        @MaUuDai AS MaUuDaiApDung,        -- Mã khách nhập
        @PhanTramGiam AS PhanTramGiam,    -- % được giảm (0 nếu ko có)
        @SoTienGiam AS SoTienGiam,        -- Tiền được giảm (0 nếu ko có)
        @GiaCuoiCung AS GiaThucTe         -- Giá phải trả
END;
GO

select *
from UU_DAI_GIA
