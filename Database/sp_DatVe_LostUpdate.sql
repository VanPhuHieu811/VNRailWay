USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_DatVe_LostUpdate
    @MaKhachHang VARCHAR(10),
    @MaChuyenTau VARCHAR(10),
    @MaViTri VARCHAR(10),
    @MaDatVe VARCHAR(10),     -- Bắt buộc theo Schema
    @MaBangGia VARCHAR(10)    -- Bắt buộc theo Schema
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRANSACTION;
        
        -- B1: Kiểm tra Khách hàng có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKhachHang = @MaKhachHang)
        BEGIN
            PRINT N'Lỗi: Khách hàng không tồn tại';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- B2: Kiểm tra Chuyến tàu có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM CHUYEN_TAU WHERE MaChuyenTau = @MaChuyenTau)
        BEGIN
            PRINT N'Lỗi: Chuyến tàu không tồn tại';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- B3: Kiểm tra Vị trí có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM VI_TRI_TREN_TOA WHERE MaViTri = @MaViTri)
        BEGIN
            PRINT N'Lỗi: Vị trí không tồn tại';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- B4: Kiểm tra xem ghế này đã có ai đặt chưa (Critical Section)
        DECLARE @DaCoNguoi INT = 0;
        
        SELECT @DaCoNguoi = COUNT(*)
        FROM VE_TAU
        WHERE MaChuyenTau = @MaChuyenTau AND MaViTri = @MaViTri;

        -- B5: Nếu chưa có người đặt thì chuẩn bị đặt
        IF (@DaCoNguoi = 0)
        BEGIN
            -- Ghi log bắt đầu chờ (Để bạn theo dõi trong bảng Log tôi đã tạo ở bước trước)
            -- EXEC sp_GhiLog N'DatVe_LostUpdate', N'Thấy chỗ trống, bắt đầu Delay...', N'Waiting';

            -- GIẢ LẬP ĐỘ TRỄ (Để giao dịch T2 kịp chen vào đọc thấy DaCoNguoi = 0)
            WAITFOR DELAY '00:00:10';

            -- B6: Tiến hành INSERT vé
            BEGIN TRY
                -- Tạo mã vé ngẫu nhiên (Cắt 10 ký tự để vừa VARCHAR(10))
                DECLARE @MaVeMoi VARCHAR(10) = LEFT(CAST(NEWID() AS VARCHAR(36)), 10);

                INSERT INTO VE_TAU (
                    MaVe, MaKhachHang, MaChuyenTau, MaViTri, 
                    TrangThai, ThoiGianXuatVe, MaDatVe, MaBangGia
                )
                VALUES (
                    @MaVeMoi, 
                    @MaKhachHang, 
                    @MaChuyenTau, 
                    @MaViTri, 
                    N'Giữ chỗ',  -- Trạng thái
                    GETDATE(),
                    @MaDatVe,     -- FK bắt buộc
                    @MaBangGia    -- FK bắt buộc
                );
                
                PRINT N'Đặt vé thành công cho KH: ' + @MaKhachHang;
                -- EXEC sp_GhiLog N'DatVe_LostUpdate', N'Đã Insert vé thành công', N'Success';
            END TRY
            BEGIN CATCH
                PRINT N'Lỗi Insert: ' + ERROR_MESSAGE();
                ROLLBACK TRANSACTION;
                RETURN;
            END CATCH
        END
        ELSE
        BEGIN
            -- Nếu đã có người đặt rồi
            PRINT N'Lỗi: Ghế đã có người đặt! Giao dịch bị hủy.';
            -- EXEC sp_GhiLog N'DatVe_LostUpdate', N'Phát hiện ghế đã có người đặt -> Rollback', N'Failed';
            ROLLBACK TRANSACTION;
            RETURN;
        END

    COMMIT TRANSACTION;
END;
GO



