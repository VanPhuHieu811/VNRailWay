/*
   Input: @MaChuyenTau
   Output: Danh sách ghế, Toa, Trạng thái (Trống/Đã đặt)
*/
USE VNRAILWAY
GO
CREATE OR ALTER PROCEDURE sp_LaySoDoGhe
    @MaChuyenTau VARCHAR(10)
AS
BEGIN
    SELECT 
        T.MaToaTau,
        T.LoaiToa,
        VT.MaViTri,
        VT.STT AS SoGhe,
        VT.LoaiVT,
        CASE 
            WHEN VE.MaVe IS NOT NULL THEN N'Đã đặt'
            ELSE N'Trống'
        END AS TrangThai
    FROM CHUYEN_TAU CT
    JOIN DOAN_TAU DT ON CT.MaDoanTau = DT.MaDoanTau
    JOIN TOA_TAU T ON DT.MaDoanTau = T.MaDoanTau
    JOIN VI_TRI_TREN_TOA VT ON T.MaToaTau = VT.MaToaTau
    -- Kiểm tra xem vị trí này đã có vé cho chuyến tàu này chưa
    LEFT JOIN VE_TAU VE ON VE.MaViTri = VT.MaViTri 
                        AND VE.MaChuyenTau = CT.MaChuyenTau
                        AND VE.TrangThai IN (N'Đã đặt', N'Giữ chỗ') -- Vé chưa hủy
    WHERE CT.MaChuyenTau = @MaChuyenTau
    ORDER BY T.STT, VT.STT;
END;
GO

