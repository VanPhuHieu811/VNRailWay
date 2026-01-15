--sp1: API 1 hien thi lich lam viec
USE VNRAILWAY;
go

CREATE OR ALTER PROCEDURE sp_LayLichSuDonNghiPhep
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        dnp.MaDon,
        pc.MaPhanCong,-- Hiển thị nhãn xanh (SE1, SE4)
		ct.MaChuyenTau,
        tt.TenTuyen,
		CAST(tg.DuKienXuatPhat AS DATE) AS NgayKhoiHanh,
        CONVERT(VARCHAR(5), tg.DuKienXuatPhat, 108) AS GioDi,-- Để hiển thị giờ đi và ngày

        CONVERT(VARCHAR(5), tg.DuKienDen, 108) AS GioDen,   -- Để hiển thị giờ đến
               
        dnp.LyDo,            -- Nội dung lý do nghỉ
        dnp.NgayGui AS NgayTao, -- Ngày tạo đơn ở góc dưới
        dnp.TrangThai        -- Để map màu: Chờ duyệt (Cam), Đã duyệt (Xanh)
    FROM DON_NGHI_PHEP dnp
    JOIN PHAN_CONG_CHUYEN_TAU pc ON dnp.MaPhanCong = pc.MaPhanCong
    JOIN CHUYEN_TAU ct ON pc.MaChuyenTau = ct.MaChuyenTau
	JOIN TUYEN_TAU tt ON tt.MaTuyenTau = CT.MaTuyenTau
    -- Lấy thời gian xuất phát đầu tiên và kết thúc cuối cùng của chuyến
    JOIN (
        SELECT MaChuyenTau, MIN(DuKienXuatPhat) AS DuKienXuatPhat, MAX(DuKienDen) AS DuKienDen
        FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
    ) tg ON ct.MaChuyenTau = tg.MaChuyenTau
    WHERE dnp.NVGuiDon = @MaNV
    ORDER BY dnp.NgayGui DESC; -- Đơn mới nhất hiện lên đầu
END;
GO

