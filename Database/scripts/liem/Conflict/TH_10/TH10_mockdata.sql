USE VNRAILWAY;
GO

-- 1. Create a specific Customer for this demo
IF NOT EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKhachHang = 'KH_DR')
BEGIN
    INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, NgaySinh, GioiTinh, DiaChi, SoDienThoai) 
    VALUES ('KH_DR', N'Nguyen Van Dirty Read', '099000999', '1995-01-01', N'Nam', N'Ha Noi', '0999999999');
END

-- 2. Create Account
IF NOT EXISTS (SELECT 1 FROM TAI_KHOAN WHERE Email = 'dirtyread@demo.com')
BEGIN
    INSERT INTO TAI_KHOAN (Email, MaKH, TenTaiKhoan, MatKhau, TrangThai, VaiTro) 
    VALUES ('dirtyread@demo.com', 'KH_DR', 'user_dr', '123', 1, N'Khách hàng');
END

-- 3. Create Booking (DAT_VE can be 'Đã thanh toán')
IF NOT EXISTS (SELECT 1 FROM DAT_VE WHERE MaDatVe = 'DV_DR')
BEGIN
    INSERT INTO DAT_VE (MaDatVe, Email, MaChuyenTau, ThoiGianDat, HanThanhToan, TongTienDuKien, KenhDat, TrangThai)
    VALUES ('DV_DR', 'dirtyread@demo.com', 'CT01', GETDATE(), GETDATE(), 500000, N'Online', N'Đã thanh toán');
END

-- 4. Create Ticket
IF NOT EXISTS (SELECT 1 FROM VE_TAU WHERE MaVe = 'VE_DR')
BEGIN
    INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaDatVe, MaViTri, TrangThai, GiaThuc)
    VALUES ('VE_DR', 'KH_DR', 'CT01', 'DV_DR', 'VT010106', N'Đã đặt', 500000);
END
-- Reset status
ELSE
BEGIN
    UPDATE VE_TAU SET TrangThai = N'Đã đặt' WHERE MaVe = 'VE_DR';
END
GO