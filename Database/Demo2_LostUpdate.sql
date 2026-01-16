USE VNRAILWAY;
GO
-- T2: Khách B cũng đặt ghế VT001
EXEC sp_DatVe_LostUpdate 
    @MaKhachHang = 'KH_B',
    @MaChuyenTau = 'CT01',
    @MaViTri = 'VT001',
    @MaDatVe = 'DV01',
    @MaBangGia = 'BG01';

SELECT * FROM VE_TAU WHERE MaViTri = 'VT001';