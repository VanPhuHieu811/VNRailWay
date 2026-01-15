--sp1: API 1 hien thi lich lam viec
USE VNRAILWAY;
GO

USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_LayLichLamViecNhanVien
    @MaNV VARCHAR(10),
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Bước 1: Thu gọn bảng THOI_GIAN_CHUYEN_TAU thành 1 dòng cho mỗi MaChuyenTau
    WITH LICH_TRINH_TOM_TAT AS (
        SELECT 
            MaChuyenTau,
            MIN(DuKienXuatPhat) AS GioKhoiHanhDauTien, -- Giờ tại ga xuất phát đầu tiên
            MAX(DuKienDen) AS GioDenCuoiCung         -- Giờ tại ga kết thúc cuối cùng
        FROM THOI_GIAN_CHUYEN_TAU
        GROUP BY MaChuyenTau
    )
    -- Bước 2: Kết hợp với thông tin phân công và chuyến tàu
    SELECT 
        pc.MaPhanCong,
        ct.MaChuyenTau,
        tt.TenTuyen,
       
        -- Định dạng hiển thị khớp với UI của bạn
        CAST(lt.GioKhoiHanhDauTien AS DATE) AS NgayKhoiHanh,
        CONVERT(VARCHAR(5), lt.GioKhoiHanhDauTien, 108) AS GioDi,
        CONVERT(VARCHAR(5), lt.GioDenCuoiCung, 108) AS GioDen,
        
        ct.TrangThai AS TrangThaiChuyenTau, -- "Sắp khởi hành"
        pc.VaiTro,
        pc.MaToa,
        ct.MaDoanTau
    FROM PHAN_CONG_CHUYEN_TAU pc
    JOIN CHUYEN_TAU ct ON pc.MaChuyenTau = ct.MaChuyenTau
    JOIN LICH_TRINH_TOM_TAT lt ON ct.MaChuyenTau = lt.MaChuyenTau
    JOIN TUYEN_TAU tt ON tt.MaTuyenTau = ct.MaTuyenTau
    WHERE pc.MaNV = @MaNV
      AND pc.TrangThai <> N'Nghỉ' -- Loại bỏ các lịch đã xin nghỉ thành công
      AND (@TuNgay IS NULL OR CAST(lt.GioKhoiHanhDauTien AS DATE) >= @TuNgay)
      AND (@DenNgay IS NULL OR CAST(lt.GioKhoiHanhDauTien AS DATE) <= @DenNgay)
    ORDER BY lt.GioKhoiHanhDauTien ASC;
END;
GO

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
--exec sp_LayPhieuLuongNhanVien 'NV05', 11, 2025




--sp3: API3 gui don nghi phep (TRANH CHAP)
GO
CREATE OR ALTER PROCEDURE sp_GuiDonNghiPhep
    @MaPhanCong VARCHAR(10),
    @MaNVGui VARCHAR(10),
    @LyDo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
	DECLARE @NewID VARCHAR(10),
            @Num INT;

    BEGIN TRY
        BEGIN TRANSACTION;
		SELECT @Num = ISNULL(MAX(CAST(SUBSTRING(MaDon,3,10) AS INT)),0) + 1 FROM DON_NGHI_PHEP;
		SET @NewID = 'MD' + RIGHT('000' + CAST(@Num AS VARCHAR(3)),3);

        -- 1. Kiểm tra mã phân công có tồn tại và thuộc về nhân viên gửi đơn không
        IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WHERE MaPhanCong = @MaPhanCong AND MaNV = @MaNVGui)
        BEGIN
            RAISERROR(N'Lỗi: Mã phân công không hợp lệ hoặc không thuộc về nhân viên này.', 16, 1);

        END
		------Kiểm tra nhân viên có tồn tại không
		IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = @MaNVGui)
		BEGIN
			RAISERROR(N'Lỗi: Mã nhân viên không tồn tại.', 16, 1);
		END

		------Kiểm tra phân công có chạy chưa
		IF NOT EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WHERE MaPhanCong = @MaPhanCong AND TrangThai = N'Nhận việc')
		BEGIN 
			RAISERROR (N'Lỗi: Bạn đã hoàn thành phân công này hoặc đang làm hoặc bạn đã xin nghỉ.', 16, 1);
		END

        -- 2. Thực hiện chèn dữ liệu
        -- Trigger trg_KiemTraDonNghiPhep sẽ tự động kiểm tra quy định gửi trước 1 ngày (RB-140)
        INSERT INTO DON_NGHI_PHEP (MaDon, MaPhanCong, NgayGui, LyDo, NVGuiDon, TrangThai)
        VALUES (@NewID, @MaPhanCong, GETDATE(), @LyDo, @MaNVGui, N'Đang chờ');

        COMMIT TRANSACTION;
        PRINT N'Gửi đơn nghỉ phép thành công.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
--exec sp_GuiDonNghiPhep 'PC08', 'NV05', N'Nghỉ việc gia đình'




--SP4: API4 DUYET DON NGHI PHEP (TRANH CHAP)
GO
CREATE OR ALTER PROCEDURE sp_DuyetDonNghiPhep
    @MaDon VARCHAR(10),
    @MaNVQuanLy VARCHAR(10),
    @TrangThaiMoi NVARCHAR(20), 
    @MaNVThayThe VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

		IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNV = @MaNVQuanLy)
		BEGIN
			RAISERROR(N'Lỗi: Mã nhân viên quản lý không tồn tại.', 16, 1);
		END

        -- 1. Chỉ cần check cơ bản: Nếu duyệt thì phải có người thay
        IF @TrangThaiMoi = N'Chấp nhận' AND @MaNVThayThe IS NULL
        BEGIN
            RAISERROR(N'Lỗi: Phải chỉ định nhân viên thay thế khi chấp nhận đơn nghỉ.', 16, 1);
        END

        -- 2. Cập nhật trạng thái đơn nghỉ phép
        UPDATE DON_NGHI_PHEP
        SET TrangThai = @TrangThaiMoi,
            NVQuanLy = @MaNVQuanLy,
            NVThayThe = @MaNVThayThe
        WHERE MaDon = @MaDon;

        -- 3. Xử lý nghiệp vụ khi Chấp nhận
        IF @TrangThaiMoi = N'Chấp nhận'
        BEGIN
            DECLARE @MaChuyenTau VARCHAR(10), @VaiTro NVARCHAR(30), @MaToa VARCHAR(10), @MaPC_Cu VARCHAR(10);
            
            -- Lấy thông tin từ phân công cũ
            SELECT 
                @MaPC_Cu = pc.MaPhanCong,
                @MaChuyenTau = pc.MaChuyenTau,
                @VaiTro = pc.VaiTro,
                @MaToa = pc.MaToa
            FROM DON_NGHI_PHEP dnp
            JOIN PHAN_CONG_CHUYEN_TAU pc ON dnp.MaPhanCong = pc.MaPhanCong
            WHERE dnp.MaDon = @MaDon;

            -- A. Đánh dấu người cũ nghỉ
            UPDATE PHAN_CONG_CHUYEN_TAU SET TrangThai = N'Nghỉ' WHERE MaPhanCong = @MaPC_Cu;

            -- B. Ủy thác toàn bộ việc kiểm tra vai trò và lịch trình cho SP 7
            EXEC sp_PhanCongNhanSu 
                @MaNV = @MaNVThayThe, 
                @MaChuyenTau = @MaChuyenTau, 
                @VaiTro = @VaiTro, 
                @MaToa = @MaToa;
        END

        COMMIT TRANSACTION;
        PRINT N'Duyệt đơn và điều phối nhân sự thành công.';
    END TRY
    BEGIN CATCH
        -- Nếu SP 7 báo lỗi vai trò, nó sẽ nhảy vào đây để Rollback
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

--SP5: TIM NHAN VIEN TRONG LICH
GO

CREATE OR ALTER PROCEDURE sp_TimNhanVienTrongLich
    @MaChuyenTauCanPhanCong VARCHAR(10),
    @LoaiNV_CanTim NVARCHAR(20) -- 'Lái tàu', 'Toa tàu', v.v.
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Lấy khung thời gian của chuyến tàu đang cần người
    DECLARE @BatDau DATETIME, @KetThuc DATETIME;
    SELECT @BatDau = MIN(DuKienXuatPhat), @KetThuc = MAX(DuKienDen)
    FROM THOI_GIAN_CHUYEN_TAU WHERE MaChuyenTau = @MaChuyenTauCanPhanCong;

    -- 2. Tìm nhân viên đúng chuyên môn và không bị bận trong khoảng thời gian trên
    SELECT MaNV, HoTen, SoDienThoai, DiaChi
    FROM NHAN_VIEN nv
    WHERE LoaiNhanVien = @LoaiNV_CanTim
    AND NOT EXISTS (
        SELECT 1 
        FROM PHAN_CONG_CHUYEN_TAU pc
        JOIN (
            SELECT MaChuyenTau, MIN(DuKienXuatPhat) as BD, MAX(DuKienDen) as KT
            FROM THOI_GIAN_CHUYEN_TAU GROUP BY MaChuyenTau
        ) time_pc ON pc.MaChuyenTau = time_pc.MaChuyenTau
        WHERE pc.MaNV = nv.MaNV
        AND pc.TrangThai IN (N'Nhận việc', N'Đang làm')
        -- Logic giao thoa thời gian (RB-165) 
        AND (@BatDau < time_pc.KT AND time_pc.BD < @KetThuc)
    );
END;
GO
--exec sp_TimNhanVienTrongLich 'CT02', 'Toa tàu'



--SP6: TINH LUONG
GO

CREATE OR ALTER PROCEDURE sp_TinhLuongHangThang
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Xác định ngày tính lương (Mặc định ngày 28 hàng tháng để kiểm tra hiệu lực tham số)
        DECLARE @NgayChotLuong DATE = DATEFROMPARTS(@Nam, @Thang, 28);

        -- 2. Xóa dữ liệu lương cũ của tháng/năm này để tính lại
        DELETE FROM BANG_LUONG 
        WHERE MONTH(NgayNhanLuong) = @Thang AND YEAR(NgayNhanLuong) = @Nam;

        -- 3. Lấy các đơn giá thù lao và tiền phạt CÒN HIỆU LỰC
        DECLARE @DonGiaChuyen FLOAT, @DonGiaThayCa FLOAT, @DonGiaPhat FLOAT;
        
        SELECT @DonGiaChuyen = GiaTriSo FROM THAM_SO 
        WHERE MaThamSo = 'TS001' AND @NgayChotLuong BETWEEN NgayHieuLuc AND ISNULL(NgayHetHieuLuc, '9999-12-31');
        
        SELECT @DonGiaThayCa = GiaTriSo FROM THAM_SO 
        WHERE MaThamSo = 'TS002' AND @NgayChotLuong BETWEEN NgayHieuLuc AND ISNULL(NgayHetHieuLuc, '9999-12-31');

        SELECT @DonGiaPhat = GiaTriSo FROM THAM_SO 
        WHERE MaThamSo = 'TS010' AND @NgayChotLuong BETWEEN NgayHieuLuc AND ISNULL(NgayHetHieuLuc, '9999-12-31');

        -- 4. Tính toán và chèn dữ liệu vào bảng lương
        INSERT INTO BANG_LUONG (
            MaBangLuong, MaNV, LuongChinh, PhuCap, 
            ThuLaoChuyenTau, ThuLaoThayCa, TienPhat, 
            TongLuong, NgayNhanLuong
        )
        SELECT 
            -- Tạo mã bảng lương: L + Số NV + Tháng + Năm (VD: L021125)
            LEFT('L' + REPLACE(nv.MaNV, 'NV', '') + RIGHT('0' + CAST(@Thang AS VARCHAR), 2) + RIGHT(CAST(@Nam AS VARCHAR), 2), 10),
            nv.MaNV,
            -- Lấy Lương chính từ bảng THAM_SO theo LoaiNhanVien và hiệu lực
            ISNULL((SELECT GiaTriSo FROM THAM_SO WHERE @NgayChotLuong BETWEEN NgayHieuLuc AND ISNULL(NgayHetHieuLuc, '9999-12-31') AND MaThamSo = 
                CASE 
                    WHEN nv.LoaiNhanVien = N'Quản lý' THEN 'TS003'
                    WHEN nv.LoaiNhanVien = N'Lái tàu' THEN 'TS004'
                    WHEN nv.LoaiNhanVien = N'Bán vé'  THEN 'TS005'
                    ELSE 'TS006' -- Toa tàu
                END), 0),
            -- Lấy Phụ cấp từ bảng THAM_SO
            ISNULL((SELECT GiaTriSo FROM THAM_SO WHERE @NgayChotLuong BETWEEN NgayHieuLuc AND ISNULL(NgayHetHieuLuc, '9999-12-31') AND MaThamSo = 
                CASE 
                    WHEN nv.LoaiNhanVien = N'Quản lý' THEN 'TS007'
                    WHEN nv.LoaiNhanVien = N'Lái tàu' THEN 'TS008'
                    ELSE 'TS009' -- Phụ cấp khác
                END), 0),
            -- Tính thù lao chuyến tàu (Chuyến đã Xong trong tháng)
            ISNULL((SELECT COUNT(distinct pc.MaPhanCong) * @DonGiaChuyen 
                    FROM PHAN_CONG_CHUYEN_TAU pc
                    JOIN THOI_GIAN_CHUYEN_TAU tg ON pc.MaChuyenTau = tg.MaChuyenTau
                    WHERE pc.MaNV = nv.MaNV AND pc.TrangThai = N'Xong'
                    AND MONTH(tg.ThucTeDen) = @Thang AND YEAR(tg.ThucTeDen) = @Nam), 0),
            -- Tính thù lao thay ca (Đơn nghỉ phép Chấp nhận và mình là người thay)
            ISNULL((SELECT COUNT(*) * @DonGiaThayCa
                    FROM DON_NGHI_PHEP dnp
                    WHERE dnp.NVThayThe = nv.MaNV AND dnp.TrangThai = N'Chấp nhận'
                    AND MONTH(dnp.NgayGui) = @Thang AND YEAR(dnp.NgayGui) = @Nam), 0),
            -- Tiền phạt: Mặc định lấy đơn giá phạt (Bạn có thể nhân với số lần vi phạm nếu có bảng kỷ luật)
            0, -- Tạm để 0, sẽ cập nhật nếu có dữ liệu vi phạm
            0, -- Tổng lương (sẽ update ở bước sau)
            @NgayChotLuong
        FROM NHAN_VIEN nv;

        -- 5. Cập nhật Tổng lương thực nhận
        UPDATE BANG_LUONG
        SET TongLuong = LuongChinh + PhuCap + ThuLaoChuyenTau + ThuLaoThayCa - TienPhat
        WHERE MONTH(NgayNhanLuong) = @Thang AND YEAR(NgayNhanLuong) = @Nam;

        COMMIT TRANSACTION;
        PRINT N'Đã tính xong lương tháng ' + CAST(@Thang AS VARCHAR) + '/' + CAST(@Nam AS VARCHAR);
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END;
GO
--exec sp_TinhLuongHangThang 11, 2025





--SP7: PHAN CONG NHAN SU 
USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_PhanCongNhanSu
    @MaNV VARCHAR(10),
    @MaChuyenTau VARCHAR(10),
    @VaiTro NVARCHAR(30),
    @MaToa VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Kiểm tra LoaiNhanVien có khớp với VaiTro phân công không (Giống góp ý của bạn ở SP4)
        DECLARE @LoaiNV NVARCHAR(20);
        SELECT @LoaiNV = LoaiNhanVien FROM NHAN_VIEN WHERE MaNV = @MaNV;

        IF (@VaiTro LIKE N'%lái%' AND @LoaiNV <> N'Lái tàu')
           OR (@VaiTro LIKE N'%trưởng%' AND @LoaiNV NOT IN (N'Toa tàu', N'Quản lý'))                               ---- CÓ THỂ BỎ
           OR (@VaiTro LIKE N'%toa%' AND @LoaiNV <> N'Toa tàu')
        BEGIN
            RAISERROR(N'Lỗi: Loại nhân viên không phù hợp với vai trò được phân công.', 16, 1);
        END

        -- 2. Kiểm tra nếu không phải nhân viên toa thì MaToa phải NULL (Note 2 trong Trigger)
        IF @VaiTro <> N'Nhân viên phụ trách toa' AND @MaToa IS NOT NULL                                            ----SỬA VAI TRO
        BEGIN
            RAISERROR(N'Lỗi: Chỉ nhân viên phụ trách toa mới được gán mã toa.', 16, 1);
        END

        -- 3. Thực hiện phân công
        -- Lưu ý: Các Trigger (trg_KiemTraVaiTroPhanCong, trg_KiemTraPhanCongNhanVien) 
        -- sẽ tự động chặn nếu trùng lái tàu/trưởng tàu hoặc trùng lịch[cite: 1, 18].
        DECLARE @Num INT;
        SELECT @Num = ISNULL(MAX(CAST(SUBSTRING(MaPhanCong,3,10) AS INT)),0) + 1 
        FROM PHAN_CONG_CHUYEN_TAU;
        DECLARE @MaPC VARCHAR(10) = 'PC' + RIGHT('0' + CAST(@Num AS VARCHAR(2)), 2);
        
        INSERT INTO PHAN_CONG_CHUYEN_TAU (MaPhanCong, MaNV, MaChuyenTau, VaiTro, MaToa, TrangThai)
        VALUES (@MaPC, @MaNV, @MaChuyenTau, @VaiTro, @MaToa, N'Nhận việc');

        COMMIT TRANSACTION;
        PRINT N'Phân công nhân sự thành công.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

--exec sp_PhanCongNhanSu 'NV02', 'CT01', N'Nhân viên phụ trách lái'

GO

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

