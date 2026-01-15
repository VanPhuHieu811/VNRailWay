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