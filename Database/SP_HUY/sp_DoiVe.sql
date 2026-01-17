USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_XuLyDoiVe
    -- Thông tin vé cũ & mới
    @MaVeCu VARCHAR(20),
    @MaChuyenTauMoi VARCHAR(20),
    @MaViTriMoi VARCHAR(20),
    @GiaVeMoi DECIMAL(18,0),
    @GaDi VARCHAR(20),
    @GaDen VARCHAR(20),
    
    -- Thông tin khách hàng (Form nhập)
    @HoTenMoi NVARCHAR(100),
    @CCCDMoi VARCHAR(20),
    @SDTMoi VARCHAR(20),
    @NgaySinhMoi DATE,          -- [MỚI]
    @DiaChiMoi NVARCHAR(200),   -- [MỚI]
    @DoiTuongMoi NVARCHAR(50), 
    
    -- Người thực hiện
    @NguoiThucHien VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- =============================================
        -- 1. LẤY THAM SỐ PHÍ & DỮ LIỆU CŨ
        -- =============================================
        DECLARE @PhiDoiVe DECIMAL(18,0);
        SELECT @PhiDoiVe = CAST(GiaTriSo AS DECIMAL(18,0)) FROM THAM_SO WHERE MaThamSo = 'TS003';
        SET @PhiDoiVe = ISNULL(@PhiDoiVe, 20000); 

        DECLARE @MaKhachHangCu VARCHAR(20);
        DECLARE @GiaVeCu DECIMAL(18,0);
        
        SELECT @MaKhachHangCu = MaKhachHang, @GiaVeCu = GiaThuc 
        FROM VE_TAU WHERE MaVe = @MaVeCu;

        -- =============================================
        -- 2. XỬ LÝ KHÁCH HÀNG (CÓ NGÀY SINH & ĐỊA CHỈ)
        -- =============================================
        DECLARE @MaKhachHangChinhThuc VARCHAR(20);
        DECLARE @CCCDCu VARCHAR(20);
        
        SELECT @CCCDCu = CCCD FROM KHACH_HANG WHERE MaKhachHang = @MaKhachHangCu;

        IF @CCCDMoi = @CCCDCu
        BEGIN
            -- TRƯỜNG HỢP 1: Khách cũ -> Update thông tin bổ sung
            SET @MaKhachHangChinhThuc = @MaKhachHangCu;
            UPDATE KHACH_HANG 
            SET HoTen = @HoTenMoi, 
                SoDienThoai = @SDTMoi,
                NgaySinh = @NgaySinhMoi, -- [MỚI]
                DiaChi = @DiaChiMoi      -- [MỚI]
            WHERE MaKhachHang = @MaKhachHangCu;
        END
        ELSE
        BEGIN
            -- TRƯỜNG HỢP 2: Đổi người -> Check CCCD mới
            SELECT @MaKhachHangChinhThuc = MaKhachHang FROM KHACH_HANG WHERE CCCD = @CCCDMoi;

            IF @MaKhachHangChinhThuc IS NULL
            BEGIN
                -- Tạo Khách Hàng Mới (Sinh mã KH tự động)
                -- Ví dụ: KH + yymmdd + 4 số random (KH2401159999)
                SET @MaKhachHangChinhThuc = 'KH' + CONVERT(VARCHAR(10), GETDATE(), 12) + LEFT(ABS(CHECKSUM(NEWID())) % 10000 + 10000, 4);
                
                INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, SoDienThoai, NgaySinh, DiaChi)
                VALUES (@MaKhachHangChinhThuc, @HoTenMoi, @CCCDMoi, @SDTMoi, @NgaySinhMoi, @DiaChiMoi);
            END
        END

        -- =============================================
        -- 3. TẠO VÉ MỚI
        -- =============================================
        -- Sinh mã Vé: VE + yymmdd + 4 số random
        DECLARE @MaVeMoi VARCHAR(20) = 'VE' + CONVERT(VARCHAR(10), GETDATE(), 12) + LEFT(ABS(CHECKSUM(NEWID())) % 10000 + 10000, 4);
        
        INSERT INTO VE_TAU (MaVe, MaKhachHang, MaChuyenTau, MaViTri, GaXuatPhat, GaDen, GiaThuc, ThoiGianXuatVe, TrangThai)
        VALUES (@MaVeMoi, @MaKhachHangChinhThuc, @MaChuyenTauMoi, @MaViTriMoi, @GaDi, @GaDen, @GiaVeMoi, GETDATE(), N'Đã thanh toán');

        -- =============================================
        -- 4. UPDATE VÉ CŨ
        -- =============================================
        UPDATE VE_TAU SET TrangThai = N'Đã đổi' WHERE MaVe = @MaVeCu;

        -- =============================================
        -- 5. GHI BẢNG ĐỔI VÉ (SINH MÃ TỰ ĐỘNG)
        -- =============================================
        -- Sinh mã Đổi Vé: DV + yymmdd + 4 số random
        DECLARE @MaDoiVe VARCHAR(20) = 'DV' + CONVERT(VARCHAR(10), GETDATE(), 12) + LEFT(ABS(CHECKSUM(NEWID())) % 10000 + 10000, 4);

        INSERT INTO DOI_VE (MaDoiVe, MaVeCu, MaVeMoi, ThoiGianDoi, PhiPhat, NVThucHien)
        VALUES (@MaDoiVe, @MaVeCu, @MaVeMoi, GETDATE(), @PhiDoiVe, @NguoiThucHien);

        -- =============================================
        -- 6. TẠO HÓA ĐƠN
        -- =============================================
        DECLARE @TienChenhLech DECIMAL(18,0) = @GiaVeMoi - @GiaVeCu;
        DECLARE @TongTienThu DECIMAL(18,0) = @TienChenhLech + @PhiDoiVe;
        
        -- Sinh mã Hóa Đơn: HD + yymmdd + 4 số random
        DECLARE @MaHoaDon VARCHAR(20) = 'HD' + CONVERT(VARCHAR(10), GETDATE(), 12) + LEFT(ABS(CHECKSUM(NEWID())) % 10000 + 10000, 4);

        -- Insert Hóa đơn (Lưu ý: Cột liên kết là MaDoiVe thay vì MaVe nếu hóa đơn này cho việc đổi)
        INSERT INTO HOA_DON (MaHoaDon, MaDoiVe, ThoiGianThanhToan, GiaTien, HinhThucThanhToan, MaNVLap)
        VALUES (
            @MaHoaDon, 
            @MaDoiVe,  -- Liên kết với bảng Đổi Vé
            GETDATE(), 
            @TongTienThu, 
            N'Tại quầy', -- Hoặc tham số hóa
            @NguoiThucHien
        );

        COMMIT TRANSACTION;

        -- 7. TRẢ VỀ KẾT QUẢ
        SELECT 
            @MaVeMoi AS MaVeMoi,
            @MaDoiVe AS MaDoiVe, -- Trả về mã đổi vé để in biên lai
            @TongTienThu AS TongTienThanhToan,
            @PhiDoiVe AS PhiDoi,
            @TienChenhLech AS TienChenhLech,
            @MaKhachHangChinhThuc AS MaKhachHang
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO