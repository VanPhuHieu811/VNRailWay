USE VNRAILWAY;
GO
-- T1: Khách A đặt ghế VT001
EXEC sp_DatVe_LostUpdate 
    @MaKhachHang = 'KH_A',
    @MaChuyenTau = 'CT01',
    @MaViTri = 'VT001',
    @MaDatVe = 'DV01',
    @MaBangGia = 'BG01';