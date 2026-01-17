GO
CREATE OR ALTER PROCEDURE sp_LayPhieuLuongNhanVien
    @MaNV VARCHAR(10),
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy thông tin phiếu lương chi tiết khớp với UI
    SELECT 
        bl.MaBangLuong AS MaPhieu,
        nv.HoTen AS TenNhanVien,
																					--nv.LoaiNhanVien,
        month(bl.NgayNhanLuong) as Thang,
        year(bl.NgayNhanLuong) as Nam,
		bl.NgayNhanLuong AS NgayThanhToan,
        
																					--N'ĐÃ THANH TOÁN' AS TrangThai, -- Nhãn trạng thái trên UI
        -- Cột THU NHẬP
        bl.LuongChinh AS LuongCoBan,
        bl.PhuCap AS PhuCapTrachNhiem,
        bl.ThuLaoChuyenTau AS PhuCapDiLai, -- Map thù lao chuyến vào phần đi lại
        bl.ThuLaoThayCa AS ThuLaoTangCa,
																					--bl.TongLuong + bl.TienPhat AS TongThuNhap,

        -- Cột KHẤU TRỪ (Tương đối theo yêu cầu của bạn)
        bl.TienPhat AS KhoanKhauTruKhac,
																					--(bl.LuongChinh * 0.1) AS BaoHiem, -- Giả định 10%
        
        -- TỔNG CỘNG
        bl.TongLuong AS TongLuongThucNhan,

        -- PHẦN THỐNG KÊ CÔNG VIỆC (Góc dưới bên phải UI)
        -- 1. Số chuyến làm việc
        ISNULL((SELECT COUNT(distinct pc.MaPhanCong) 
                FROM PHAN_CONG_CHUYEN_TAU pc
                JOIN THOI_GIAN_CHUYEN_TAU tg ON pc.MaChuyenTau = tg.MaChuyenTau
                WHERE pc.MaNV = bl.MaNV AND pc.TrangThai = N'Xong'
                AND MONTH(tg.ThucTeDen) = @Thang AND YEAR(tg.ThucTeDen) = @Nam), 0) AS SoChuyenLamViec,
        
        -- 2. Số ca thay thế
        ISNULL((SELECT COUNT(*) 
                FROM DON_NGHI_PHEP dnp
                WHERE dnp.NVThayThe = bl.MaNV AND dnp.TrangThai = N'Chấp nhận'
                AND MONTH(dnp.NgayGui) = @Thang AND YEAR(dnp.NgayGui) = @Nam), 0) AS SoCaThayThe,

        -- 3. Số ngày nghỉ
        ISNULL((SELECT COUNT(*) 
                FROM DON_NGHI_PHEP dnp
                WHERE dnp.NVGuiDon = bl.MaNV AND dnp.TrangThai = N'Chấp nhận'
                AND MONTH(dnp.NgayGui) = @Thang AND YEAR(dnp.NgayGui) = @Nam), 0) AS SoNgayNghi

    FROM BANG_LUONG bl
    JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV
    WHERE bl.MaNV = @MaNV 
      AND MONTH(bl.NgayNhanLuong) = @Thang 
      AND YEAR(bl.NgayNhanLuong) = @Nam;
END;
GO
--exec sp_LayPhieuLuongNhanVien 'NV04', 12, 2025