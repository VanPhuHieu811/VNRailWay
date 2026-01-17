USE VNRAILWAY;
GO

-- =============================================
-- 1. TRIGGER: KIỂM TRA TÍNH HỢP LỆ KHI BÁN VÉ
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraVeHopLe
ON VE_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Inserted WHERE TrangThai = N'Hủy vé') RETURN;

    -- RB-163: Kiểm tra Nhất quán dữ liệu (Đoàn tàu của chuyến == Đoàn tàu của ghế)
    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN CHUYEN_TAU ct ON i.MaChuyenTau = ct.MaChuyenTau
        JOIN VI_TRI_TREN_TOA vt ON i.MaViTri = vt.MaViTri
        JOIN TOA_TAU tt ON vt.MaToaTau = tt.MaToaTau
        WHERE ct.MaDoanTau <> tt.MaDoanTau
    )
    BEGIN
        RAISERROR(N'Lỗi RB-163: Ghế ngồi trên vé không thuộc Đoàn tàu được phân công cho Chuyến tàu này.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- RB-166: Kiểm tra "Trùng ghế" & RB-168: Thứ tự Ga
    SELECT 
        i.MaVe, i.MaChuyenTau, i.MaViTri, 
        ds1.ThuTu AS ThuTuDi, ds2.ThuTu AS ThuTuDen
    INTO #VeMoi
    FROM Inserted i
    JOIN CHUYEN_TAU ct ON i.MaChuyenTau = ct.MaChuyenTau
    JOIN DANH_SACH_GA ds1 ON ct.MaTuyenTau = ds1.MaTuyenTau AND i.GaXuatPhat = ds1.MaGaTau
    JOIN DANH_SACH_GA ds2 ON ct.MaTuyenTau = ds2.MaTuyenTau AND i.GaDen = ds2.MaGaTau;

    -- Kiểm tra RB-168
    IF EXISTS (SELECT 1 FROM #VeMoi WHERE ThuTuDi >= ThuTuDen)
    BEGIN
        RAISERROR(N'Lỗi RB-168: Ga xuất phát phải có thứ tự trước Ga đến trong lộ trình.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Kiểm tra xung đột vé cũ
    IF EXISTS (
        SELECT 1 FROM VE_TAU v
        JOIN #VeMoi vm ON v.MaChuyenTau = vm.MaChuyenTau AND v.MaViTri = vm.MaViTri
        JOIN CHUYEN_TAU ct ON v.MaChuyenTau = ct.MaChuyenTau
        JOIN DANH_SACH_GA ds_cu_di ON ct.MaTuyenTau = ds_cu_di.MaTuyenTau AND v.GaXuatPhat = ds_cu_di.MaGaTau
        JOIN DANH_SACH_GA ds_cu_den ON ct.MaTuyenTau = ds_cu_den.MaTuyenTau AND v.GaDen = ds_cu_den.MaGaTau
        WHERE v.MaVe <> vm.MaVe
          AND v.TrangThai NOT IN (N'Hủy vé', N'Đổi vé')
          AND (vm.ThuTuDi < ds_cu_den.ThuTu) 
          AND (ds_cu_di.ThuTu < vm.ThuTuDen)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-166: Ghế này đã có người đặt trong khoảng ga bạn chọn.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    DROP TABLE #VeMoi;
END;
GO

-- =============================================
-- 2. TRIGGER: KIỂM TRA LOGIC THỜI GIAN LỊCH TRÌNH
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraLichTrinhChiTiet
ON THOI_GIAN_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM Inserted 
        WHERE DuKienDen > DuKienXuatPhat 
           OR (ThucTeDen IS NOT NULL AND ThucTeXuatPhat IS NOT NULL AND ThucTeDen > ThucTeXuatPhat)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-149: Thời gian Đến phải trước hoặc bằng Thời gian Xuất phát tại cùng một ga.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 3. TRIGGER: KIỂM TRA PHÂN CÔNG NHÂN VIÊN
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraPhanCongNhanVien
ON PHAN_CONG_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BatDau, MAX(DuKienDen) as KetThuc FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) TimeMoi ON i.MaChuyenTau = TimeMoi.MaChuyenTau
        JOIN PHAN_CONG_CHUYEN_TAU pc_cu ON i.MaNV = pc_cu.MaNV
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BatDau, MAX(DuKienDen) as KetThuc FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) TimeCu ON pc_cu.MaChuyenTau = TimeCu.MaChuyenTau
        WHERE i.MaPhanCong <> pc_cu.MaPhanCong
          AND pc_cu.TrangThai IN (N'Nhận việc', N'Đang làm')
          AND (TimeMoi.BatDau < TimeCu.KetThuc) AND (TimeCu.BatDau < TimeMoi.KetThuc)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-165: Nhân viên này đang bận chạy một chuyến tàu khác trong khung giờ này.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 4. TRIGGER: KIỂM TRA ĐƠN NGHỈ PHÉP
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraDonNghiPhep
ON DON_NGHI_PHEP
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN PHAN_CONG_CHUYEN_TAU pc ON i.MaPhanCong = pc.MaPhanCong
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as NgayKhoiHanh FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t ON pc.MaChuyenTau = t.MaChuyenTau
        WHERE i.NgayGui >= DATEADD(day, -1, t.NgayKhoiHanh)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-140: Đơn nghỉ phép phải gửi trước thời gian tàu chạy ít nhất 1 ngày.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 5. TRIGGER: KIỂM TRA CHÍNH SÁCH GIÁ TẦNG (ĐÃ SỬA)
-- Ràng buộc: RB-152 (Giường tầng thấp đắt hơn tầng cao)
-- Target Table: GIA_THEO_TANG
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraGiaTang
ON GIA_THEO_TANG
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra logic: Số tầng càng nhỏ (tầng 1) thì giá càng cao (hoặc bằng)
    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN GIA_THEO_TANG g ON 1=1 -- Cross check với các dòng khác
        WHERE (i.SoTang < g.SoTang AND i.GiaTien < g.GiaTien) -- Lỗi: Tầng thấp hơn mà giá lại rẻ hơn
           OR (i.SoTang > g.SoTang AND i.GiaTien > g.GiaTien) -- Lỗi: Tầng cao hơn mà giá lại đắt hơn
    )
    BEGIN
        RAISERROR(N'Lỗi RB-152: Giá vé giường tầng thấp (số nhỏ) phải cao hơn hoặc bằng giường tầng cao.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 6. TRIGGER: KIỂM TRA TÀI NGUYÊN ĐOÀN TÀU
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraDoanTauBan
ON CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_moi ON i.MaChuyenTau = time_moi.MaChuyenTau
        JOIN CHUYEN_TAU ct_cu ON i.MaDoanTau = ct_cu.MaDoanTau
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_cu ON ct_cu.MaChuyenTau = time_cu.MaChuyenTau
        WHERE i.MaChuyenTau <> ct_cu.MaChuyenTau
          AND ct_cu.TrangThai NOT IN (N'Hủy', N'Hoàn thành')
          AND (time_moi.BD < time_cu.KT) AND (time_cu.BD < time_moi.KT)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-164: Đoàn tàu này đang phục vụ một chuyến khác trong khung giờ này.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 7. TRIGGER: KIỂM TRA VAI TRÒ & LOGIC PHÂN CÔNG
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraVaiTroPhanCong
ON PHAN_CONG_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Inserted WHERE VaiTro <> N'Nhân viên phụ trách toa' AND MaToa IS NOT NULL)
    BEGIN
        RAISERROR(N'Lỗi Logic: Chỉ nhân viên phụ trách toa mới được gán Mã Toa.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- IF EXISTS (
    --     SELECT MaChuyenTau FROM PHAN_CONG_CHUYEN_TAU
    --     WHERE VaiTro = N'Nhân viên phụ trách lái'
    --       AND MaChuyenTau IN (SELECT MaChuyenTau FROM Inserted)
    --       AND TrangThai IN (N'Nhận việc', N'Đang làm')
    --     GROUP BY MaChuyenTau HAVING COUNT(*) > 1
    -- )
    -- BEGIN
    --     RAISERROR(N'Lỗi RB-145: Mỗi chuyến tàu chỉ được có 01 Nhân viên lái tàu.', 16, 1);
    --     ROLLBACK TRANSACTION;
    --     RETURN;
    -- END

    -- IF EXISTS (
    --     SELECT MaChuyenTau FROM PHAN_CONG_CHUYEN_TAU
    --     WHERE VaiTro = N'Nhân viên trưởng'
    --       AND MaChuyenTau IN (SELECT MaChuyenTau FROM Inserted)
    --       AND TrangThai IN (N'Nhận việc', N'Đang làm')
    --     GROUP BY MaChuyenTau HAVING COUNT(*) > 1
    -- )
    -- BEGIN
    --     RAISERROR(N'Lỗi RB-145: Mỗi chuyến tàu chỉ được có 01 Nhân viên trưởng tàu.', 16, 1);
    --     ROLLBACK TRANSACTION;
    --     RETURN;
    -- END

    IF EXISTS (
        SELECT 1 
        FROM Inserted i
        JOIN NHAN_VIEN nv ON i.MaNV = nv.MaNV
        WHERE 
            (i.VaiTro = N'Nhân viên phụ trách lái' AND nv.LoaiNhanVien <> N'Lái tàu')
            OR
            (i.VaiTro = N'Nhân viên phụ trách toa' AND nv.LoaiNhanVien <> N'Toa tàu')
            OR
            (i.VaiTro = N'Nhân viên trưởng' AND nv.LoaiNhanVien NOT IN (N'Toa tàu', N'Lái tàu'))
    )
    BEGIN
        RAISERROR(N'Lỗi Nghiệp vụ: Loại nhân viên không phù hợp với Vai trò được phân công .', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 8. TRIGGER: KIỂM TRA THỜI GIAN ĐẶT VÉ
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraThoiGianDatVe
ON DAT_VE
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as XP FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t ON i.MaChuyenTau = t.MaChuyenTau
        WHERE i.ThoiGianDat >= DATEADD(MINUTE, -5, t.XP)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-157: Đã hết thời gian đặt vé (phải đặt trước giờ tàu chạy 5 phút).', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 9. TRIGGER: KIỂM TRA THỜI GIAN XUẤT VÉ
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraThoiGianXuatVe
ON VE_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as XP FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t ON i.MaChuyenTau = t.MaChuyenTau
        WHERE i.ThoiGianXuatVe >= t.XP
    )
    BEGIN
        RAISERROR(N'Lỗi RB-146: Không thể xuất vé khi tàu đã chạy.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 10. TRIGGER: KIỂM TRA ĐỔI VÉ
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraDoiVe
ON DOI_VE
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN VE_TAU v ON i.MaVeCu = v.MaVe
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as XP FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t ON v.MaChuyenTau = t.MaChuyenTau
        WHERE i.ThoiGianDoi >= DATEADD(HOUR, -3, t.XP)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-158: Chỉ được đổi vé trước giờ tàu chạy ít nhất 3 tiếng.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 11. TRIGGER: KIỂM TRA NHÂN VIÊN THAY THẾ
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraNVThayThe
ON DON_NGHI_PHEP
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Inserted WHERE NVThayThe IS NOT NULL) RETURN;

    IF EXISTS (
        SELECT 1 FROM Inserted i
        JOIN PHAN_CONG_CHUYEN_TAU pc_nghi ON i.MaPhanCong = pc_nghi.MaPhanCong
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_can_thay ON pc_nghi.MaChuyenTau = time_can_thay.MaChuyenTau
        JOIN PHAN_CONG_CHUYEN_TAU pc_thaythe ON i.NVThayThe = pc_thaythe.MaNV 
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_ban ON pc_thaythe.MaChuyenTau = time_ban.MaChuyenTau
        WHERE pc_thaythe.TrangThai IN (N'Nhận việc', N'Đang làm')
          AND (time_can_thay.BD < time_ban.KT) AND (time_ban.BD < time_can_thay.KT)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-141: Nhân viên thay thế đã có lịch làm việc khác trùng với thời gian này.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO


-- =============================================
-- 12. TRIGGER: KIỂM TRA TỔNG GIỜ LÀM VIỆC LÁI TÀU
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraGioLamLaiTau
ON PHAN_CONG_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Inserted WHERE VaiTro = N'Nhân viên phụ trách lái') RETURN;

    DECLARE @MaNV VARCHAR(10);
    DECLARE @TongGio INT;
    SELECT @MaNV = MaNV FROM Inserted;

    SELECT @TongGio = SUM(DATEDIFF(HOUR, time.DuKienXuatPhat, time.DuKienDen))
    FROM PHAN_CONG_CHUYEN_TAU pc
    JOIN THOI_GIAN_CHUYEN_TAU time ON pc.MaChuyenTau = time.MaChuyenTau
    WHERE pc.MaNV = @MaNV
      AND pc.VaiTro = N'Nhân viên phụ trách lái'
      AND pc.TrangThai IN (N'Đang làm', N'Nhận việc', N'Xong')
      AND DATEPART(week, time.DuKienXuatPhat) = (
          SELECT TOP 1 DATEPART(week, t.DuKienXuatPhat)
          FROM THOI_GIAN_CHUYEN_TAU t JOIN Inserted i ON t.MaChuyenTau = i.MaChuyenTau
      );

    IF @TongGio > 80
    BEGIN
        RAISERROR(N'Lỗi RB-302: Nhân viên lái tàu vượt quá 80 giờ làm việc/tuần.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- =============================================
-- 13. TRIGGER: KIỂM TRA TỔNG QUÃNG ĐƯỜNG TÀU CHẠY
-- =============================================
CREATE OR ALTER TRIGGER trg_KiemTraKmDoanTau
ON CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaDoanTau VARCHAR(10);
    DECLARE @TongKm FLOAT;
    SELECT @MaDoanTau = MaDoanTau FROM Inserted;

    SELECT @TongKm = SUM(tt.KhoangCach)
    FROM CHUYEN_TAU ct
    JOIN TUYEN_TAU tt ON ct.MaTuyenTau = tt.MaTuyenTau
    JOIN THOI_GIAN_CHUYEN_TAU time ON ct.MaChuyenTau = time.MaChuyenTau
    WHERE ct.MaDoanTau = @MaDoanTau
      AND ct.TrangThai <> N'Hủy'
      AND DATEPART(week, time.DuKienXuatPhat) = (
          SELECT TOP 1 DATEPART(week, t.DuKienXuatPhat)
          FROM THOI_GIAN_CHUYEN_TAU t JOIN Inserted i ON t.MaChuyenTau = i.MaChuyenTau
      )
    GROUP BY ct.MaDoanTau;

    IF @TongKm > 5000
    BEGIN
        RAISERROR(N'Lỗi RB-301: Đoàn tàu đã chạy quá 5000km trong tuần này.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO