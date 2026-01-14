USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_LayChiTietTuyenTau
    @MaTuyenTau VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        TT.MaTuyenTau,
        TT.TenTuyen,
        TT.KhoangCach AS TongKhoangCach,
        G.MaGaTau,
        G.TenGa,
        DS.ThuTu,
        DS.KhoangCach AS KhoangCachTuGaDau
    FROM TUYEN_TAU TT
    JOIN DANH_SACH_GA DS ON TT.MaTuyenTau = DS.MaTuyenTau
    JOIN GA_TAU G ON DS.MaGaTau = G.MaGaTau
    WHERE 
        TT.MaTuyenTau = @MaTuyenTau
    ORDER BY 
        TT.MaTuyenTau, DS.ThuTu;
END;
GO

EXEC sp_LayChiTietTuyenTau
	@MaTuyenTau = 'TT01'