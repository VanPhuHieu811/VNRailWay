USE VNRAILWAY;
GO

-- 1. Create Employees involved (Manager 1, Manager 2, Staff, New Staff)
IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = 'NV_DL')
    INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, LoaiNhanVien) VALUES ('NV_DL', N'Nhan Vien Deadlock', '9990001', N'Lái tàu');

IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = 'NV_NEW')
    INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, LoaiNhanVien) VALUES ('NV_NEW', N'Nhan Vien Moi', '9990002', N'Lái tàu');

IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = 'MGR1')
    INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, LoaiNhanVien) VALUES ('MGR1', N'Quan Ly 1', '9990003', N'Quản lý');

IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = 'MGR2')
    INSERT INTO NHAN_VIEN (MaNV, HoTen, CCCD, LoaiNhanVien) VALUES ('MGR2', N'Quan Ly 2', '9990004', N'Quản lý');

-- 2. Create Assignment (Resource B)
IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WHERE MaPhanCong = 'PC_DL')
BEGIN
    INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, VaiTro, MaChuyenTau, TrangThai)
    VALUES ('PC_DL', 'NV_DL', N'Nhân viên phụ trách lái', 'CT01', N'Nhận việc');
END

-- 3. Create Leave Request (Resource A) linked to Assignment
IF NOT EXISTS (SELECT 1 FROM DON_NGHI_PHEP WHERE MaDon = 'DNP_DL')
BEGIN
    INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, NVGuiDon, TrangThai)
    VALUES ('DNP_DL', 'PC_DL', GETDATE(), 'NV_DL', N'Đang chờ');
END
GO