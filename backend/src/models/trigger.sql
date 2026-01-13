USE VNRAILWAY;
GO

-- =============================================
-- 1. TRIGGER: KIỂM TRA TÍNH HỢP LỆ KHI BÁN VÉ (QUAN TRỌNG NHẤT)
-- Ràng buộc: RB-163 (Đúng tàu) & RB-166 (Không trùng ghế)
-- =============================================
CREATE TRIGGER trg_KiemTraVeHopLe
ON VE_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- A. Kiểm tra Vé đã bị hủy thì không cần check tiếp
    IF EXISTS (SELECT 1 FROM Inserted WHERE TrangThai = N'Hủy vé') RETURN;

    -- B. RB-163: Kiểm tra Nhất quán dữ liệu (Đoàn tàu của chuyến == Đoàn tàu của ghế)
    IF EXISTS (
        SELECT 1 
        FROM Inserted i
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

    -- C. RB-166: Kiểm tra "Trùng ghế" trên cùng phân đoạn đường (Complex Logic)
    -- Logic: Hai vé trùng nhau nếu cùng Chuyến, cùng Vị trí và khoảng Ga đi-Ga đến giao nhau.
    
    -- Bước 1: Lấy Thứ tự (Index) của Ga đi và Ga đến cho các vé vừa thêm vào
    -- Sử dụng bảng tạm để lưu thông tin vé kèm thứ tự ga
    SELECT 
        i.MaVe, i.MaChuyenTau, i.MaViTri, 
        ds1.ThuTu AS ThuTuDi, 
        ds2.ThuTu AS ThuTuDen
    INTO #VeMoi
    FROM Inserted i
    JOIN CHUYEN_TAU ct ON i.MaChuyenTau = ct.MaChuyenTau
    JOIN DANH_SACH_GA ds1 ON ct.MaTuyenTau = ds1.MaTuyenTau AND i.GaXuatPhat = ds1.MaGaTau
    JOIN DANH_SACH_GA ds2 ON ct.MaTuyenTau = ds2.MaTuyenTau AND i.GaDen = ds2.MaGaTau;

    -- Bước 2: Kiểm tra RB-168 (Ga đi phải trước Ga đến)
    IF EXISTS (SELECT 1 FROM #VeMoi WHERE ThuTuDi >= ThuTuDen)
    BEGIN
        RAISERROR(N'Lỗi RB-168: Ga xuất phát phải có thứ tự trước Ga đến trong lộ trình.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Bước 3: Kiểm tra xung đột với các vé ĐANG HOẠT ĐỘNG trong database
    IF EXISTS (
        SELECT 1
        FROM VE_TAU v                                   -- Vé cũ trong DB
        JOIN #VeMoi vm ON v.MaChuyenTau = vm.MaChuyenTau AND v.MaViTri = vm.MaViTri -- Cùng chuyến, cùng ghế
        JOIN CHUYEN_TAU ct ON v.MaChuyenTau = ct.MaChuyenTau
        JOIN DANH_SACH_GA ds_cu_di ON ct.MaTuyenTau = ds_cu_di.MaTuyenTau AND v.GaXuatPhat = ds_cu_di.MaGaTau
        JOIN DANH_SACH_GA ds_cu_den ON ct.MaTuyenTau = ds_cu_den.MaTuyenTau AND v.GaDen = ds_cu_den.MaGaTau
        WHERE v.MaVe <> vm.MaVe                 -- Không so sánh với chính nó
          AND v.TrangThai NOT IN (N'Hủy vé', N'Đổi vé') -- Chỉ so với vé còn hiệu lực
          -- Logic giao nhau: (StartA < EndB) AND (StartB < EndA)
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
-- Ràng buộc: RB-149 (Sửa đổi cho đúng thực tế)
-- =============================================
CREATE TRIGGER trg_KiemTraLichTrinhChiTiet
ON THOI_GIAN_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tại cùng 1 ga: Thời gian Đến <= Thời gian Đi (Dừng tàu)
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

    -- 2. Kiểm tra giữa các ga liên tiếp: Xuất phát (Ga trước) < Đến (Ga sau)
    -- Logic này cần join bảng DANH_SACH_GA để biết ga nào liền sau ga nào, khá phức tạp để viết trong trigger đơn.
    -- Tạm thời chỉ kiểm tra logic tại từng ga để đảm bảo hiệu năng.
END;
GO

-- =============================================
-- 3. TRIGGER: KIỂM TRA PHÂN CÔNG NHÂN VIÊN
-- Ràng buộc: RB-165 (Nhân viên không thể phân thân)
-- =============================================
CREATE TRIGGER trg_KiemTraPhanCongNhanVien
ON PHAN_CONG_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy thông tin thời gian của chuyến tàu MỚI được phân công
    -- Lưu ý: Phải lấy Min(DuKienXuatPhat) và Max(DuKienDen) của chuyến đó từ bảng THOI_GIAN_CHUYEN_TAU
    -- Để đơn giản hóa, ta giả sử bảng CHUYEN_TAU có ngày khởi hành, hoặc ta phải join phức tạp.
    -- Ở đây tôi dùng cách join vào bảng lịch trình chi tiết.

    IF EXISTS (
        SELECT 1
        FROM Inserted i
        -- Lấy thời gian của chuyến tàu mới (Mới)
        JOIN (
            SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BatDau, MAX(DuKienDen) as KetThuc
            FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
        ) TimeMoi ON i.MaChuyenTau = TimeMoi.MaChuyenTau
        -- So sánh với các phân công CŨ của nhân viên đó
        JOIN PHAN_CONG_CHUYEN_TAU pc_cu ON i.MaNV = pc_cu.MaNV
        JOIN (
            SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BatDau, MAX(DuKienDen) as KetThuc
            FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
        ) TimeCu ON pc_cu.MaChuyenTau = TimeCu.MaChuyenTau
        WHERE i.MaPhanCong <> pc_cu.MaPhanCong -- Khác chính nó
          AND pc_cu.TrangThai IN (N'Nhận việc', N'Đang làm') -- Đang bận
          -- Logic giao nhau thời gian
          AND (TimeMoi.BatDau < TimeCu.KetThuc)
          AND (TimeCu.BatDau < TimeMoi.KetThuc)
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
-- Ràng buộc: RB-140 (Nộp trước khi tàu chạy 1 ngày)
-- =============================================
CREATE TRIGGER trg_KiemTraDonNghiPhep
ON DON_NGHI_PHEP
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra: Ngày gửi đơn < (Thời gian xuất phát chuyến tàu được phân công - 1 ngày)
    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN PHAN_CONG_CHUYEN_TAU pc ON i.MaPhanCong = pc.MaPhanCong
        -- Lấy thời gian xuất phát đầu tiên của chuyến tàu đó
        JOIN (
            SELECT MaChuyenTau, MIN(DuKienXuatPhat) as NgayKhoiHanh
            FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
        ) t ON pc.MaChuyenTau = t.MaChuyenTau
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
-- 5. TRIGGER: KIỂM TRA CHÍNH SÁCH GIÁ (RB-152)
-- Logic: Cùng 1 loại tàu, cùng đoàn tàu, cùng chặng đường -> Tầng 1 (thấp) giá phải cao hơn Tầng 2, 3...
-- =============================================
CREATE TRIGGER trg_KiemTraGiaGiuong
ON CHINH_SACH_GIA
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Chỉ kiểm tra nếu là Giường và có thông tin Tầng
    IF EXISTS (
        SELECT 1 
        FROM Inserted i
        JOIN CHINH_SACH_GIA csg ON i.MaDoanTau = csg.MaDoanTau 
            AND i.LoaiTau = csg.LoaiTau 
            AND i.SoKm = csg.SoKm -- Cùng chặng
        WHERE i.LoaiVT = N'Giường' AND csg.LoaiVT = N'Giường'
          AND i.NgayApDung = csg.NgayApDung -- Cùng đợt áp dụng
          -- Logic: Tầng thấp (i.Tang < csg.Tang) thì Giá phải cao hơn (i.GiaTien <= csg.GiaTien) => Lỗi
          AND (
              (i.Tang < csg.Tang AND i.GiaTien <= csg.GiaTien)
              OR 
              (i.Tang > csg.Tang AND i.GiaTien >= csg.GiaTien)
          )
    )
    BEGIN
        RAISERROR(N'Lỗi RB-152: Giá vé giường tầng thấp phải cao hơn giường tầng cao cùng loại.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 6. TRIGGER: KIỂM TRA TÀI NGUYÊN ĐOÀN TÀU (RB-164)
-- Logic: Một đoàn tàu không thể chạy chuyến B nếu chưa chạy xong chuyến A (thời gian chồng lấn).
-- =============================================
CREATE TRIGGER trg_KiemTraDoanTauBan
ON CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cần join với bảng THOI_GIAN để lấy giờ chạy
    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_moi 
            ON i.MaChuyenTau = time_moi.MaChuyenTau
        JOIN CHUYEN_TAU ct_cu ON i.MaDoanTau = ct_cu.MaDoanTau -- Cùng đoàn tàu
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_cu 
            ON ct_cu.MaChuyenTau = time_cu.MaChuyenTau
        WHERE i.MaChuyenTau <> ct_cu.MaChuyenTau
          AND ct_cu.TrangThai NOT IN (N'Hủy', N'Hoàn thành')
          -- Kiểm tra giao nhau: (StartA < EndB) AND (StartB < EndA)
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
-- 7. TRIGGER: KIỂM TRA VAI TRÒ & LOGIC PHÂN CÔNG (RB-145, Note 2)
-- Logic: 
-- 1. Mỗi chuyến Max 1 Lái tàu, Max 1 Trưởng tàu.
-- 2. Nếu không phải "Phụ trách toa" thì MaToa phải NULL.
-- =============================================
CREATE TRIGGER trg_KiemTraVaiTroPhanCong
ON PHAN_CONG_CHUYEN_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check 1: Kiểm tra MaToa is NULL (Note 2)
    IF EXISTS (SELECT 1 FROM Inserted WHERE VaiTro <> N'Nhân viên phụ trách toa' AND MaToa IS NOT NULL)
    BEGIN
        RAISERROR(N'Lỗi Logic: Chỉ nhân viên phụ trách toa mới được gán Mã Toa.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Check 2: Kiểm tra số lượng Lái tàu & Trưởng tàu (RB-145)
    -- Đếm số lượng trong bảng (bao gồm cả dòng vừa insert)
    IF EXISTS (
        SELECT MaChuyenTau
        FROM PHAN_CONG_CHUYEN_TAU
        WHERE VaiTro = N'Nhân viên phụ trách lái'
          AND MaChuyenTau IN (SELECT MaChuyenTau FROM Inserted)
          AND TrangThai IN (N'Nhận việc', N'Đang làm')
        GROUP BY MaChuyenTau
        HAVING COUNT(*) > 1
    )
    BEGIN
        RAISERROR(N'Lỗi RB-145: Mỗi chuyến tàu chỉ được có 01 Nhân viên lái tàu.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    IF EXISTS (
        SELECT MaChuyenTau
        FROM PHAN_CONG_CHUYEN_TAU
        WHERE VaiTro = N'Nhân viên trưởng'
          AND MaChuyenTau IN (SELECT MaChuyenTau FROM Inserted)
          AND TrangThai IN (N'Nhận việc', N'Đang làm')
        GROUP BY MaChuyenTau
        HAVING COUNT(*) > 1
    )
    BEGIN
        RAISERROR(N'Lỗi RB-145: Mỗi chuyến tàu chỉ được có 01 Nhân viên trưởng tàu.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- =============================================
-- 8. TRIGGER: KIỂM TRA THỜI GIAN ĐẶT VÉ (RB-157)
-- Logic: Không đặt trước 5 phút tàu chạy
-- =============================================
CREATE TRIGGER trg_KiemTraThoiGianDatVe
ON DAT_VE
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1
        FROM Inserted i
        -- Lấy thời gian xuất phát sớm nhất của chuyến
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as XP FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t 
            ON i.MaChuyenTau = t.MaChuyenTau
        -- Thời gian đặt > Thời gian xuất phát - 5 phút
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
-- 9. TRIGGER: KIỂM TRA THỜI GIAN XUẤT VÉ (RB-146)
-- Logic: Ngày xuất vé < Thời gian tàu chạy
-- =============================================
CREATE TRIGGER trg_KiemTraThoiGianXuatVe
ON VE_TAU
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as XP FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t 
            ON i.MaChuyenTau = t.MaChuyenTau
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
-- 10. TRIGGER: KIỂM TRA ĐỔI VÉ (RB-158)
-- Logic: Chỉ đổi trước giờ chạy 3 tiếng
-- =============================================
CREATE TRIGGER trg_KiemTraDoiVe
ON DOI_VE
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN VE_TAU v ON i.MaVeCu = v.MaVe
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) as XP FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) t 
            ON v.MaChuyenTau = t.MaChuyenTau
        -- Thời gian đổi >= Giờ chạy - 3 tiếng (tức là đã sát giờ quá rồi)
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
-- 11. TRIGGER: KIỂM TRA NHÂN VIÊN THAY THẾ (RB-141)
-- Logic: Người thay thế không được bận việc khác trong ngày đó
-- =============================================
CREATE TRIGGER trg_KiemTraNVThayThe
ON DON_NGHI_PHEP
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Nếu không có người thay thế thì bỏ qua
    IF NOT EXISTS (SELECT 1 FROM Inserted WHERE NVThayThe IS NOT NULL) RETURN;

    -- Lấy thời gian của chuyến tàu mà người làm đơn đang làm (để biết ngày cần thay)
    -- Logic: Người thay thế KHÔNG ĐƯỢC có lịch phân công nào giao với lịch chạy của chuyến cần thay
    IF EXISTS (
        SELECT 1
        FROM Inserted i
        JOIN PHAN_CONG_CHUYEN_TAU pc_nghi ON i.MaPhanCong = pc_nghi.MaPhanCong -- Lấy chuyến cần thay
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_can_thay 
            ON pc_nghi.MaChuyenTau = time_can_thay.MaChuyenTau
        
        -- Tìm xem ông thay thế (NVThayThe) có lịch nào khác không
        JOIN PHAN_CONG_CHUYEN_TAU pc_thaythe ON i.NVThayThe = pc_thaythe.MaNV 
        JOIN (SELECT MaChuyenTau, MIN(DuKienXuatPhat) BD, MAX(DuKienDen) KT FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau) time_ban 
            ON pc_thaythe.MaChuyenTau = time_ban.MaChuyenTau
            
        WHERE pc_thaythe.TrangThai IN (N'Nhận việc', N'Đang làm')
          -- Kiểm tra trùng giờ
          AND (time_can_thay.BD < time_ban.KT) AND (time_ban.BD < time_can_thay.KT)
    )
    BEGIN
        RAISERROR(N'Lỗi RB-141: Nhân viên thay thế đã có lịch làm việc khác trùng với thời gian này.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO