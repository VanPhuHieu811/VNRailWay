USE VNRAILWAY
GO
-- SP Cập nhật thời gian thực tế
CREATE OR ALTER PROCEDURE sp_CapNhatTGThucTe
    @MaChuyenTau VARCHAR(10),
    @MaGaTau VARCHAR(10),
    @ThucTeDen DATETIME = NULL,
    @ThucTeXuatPhat DATETIME = NULL
AS
BEGIN
    UPDATE THOI_GIAN_CHUYEN_TAU
    SET 
        ThucTeDen = ISNULL(@ThucTeDen, ThucTeDen),
        ThucTeXuatPhat = ISNULL(@ThucTeXuatPhat, ThucTeXuatPhat)
    WHERE MaChuyenTau = @MaChuyenTau AND MaGaTau = @MaGaTau;
END
GO
