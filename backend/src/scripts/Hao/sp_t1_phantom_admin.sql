USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_ThemMoiChuyen
    @MaChuyenTau NVARCHAR(10),
    @MaDoanTau NVARCHAR(10),
    @MaTuyenTau NVARCHAR(10),
    @GaXuatPhat NVARCHAR(10),
    @GaKetThuc NVARCHAR(10),
    @NgayKhoiHanh DATETIME
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED
    BEGIN TRANSACTION
        
        -- 1. Sinh mã tự động
        DECLARE @MaxID INT;
        DECLARE @NewMaChuyenTau VARCHAR(10);
        SELECT @MaxID = MAX(CAST(SUBSTRING(MaChuyenTau, 3, LEN(MaChuyenTau)) AS INT))
        FROM CHUYEN_TAU WHERE MaChuyenTau LIKE 'CT%';
        IF @MaxID IS NULL SET @MaxID = 0;
        SET @MaxID = @MaxID + 1;
        SET @NewMaChuyenTau = 'CT' + RIGHT('000' + CAST(@MaxID AS VARCHAR(5)), 3);

        -- 2. Insert chuyến tàu
        INSERT INTO CHUYEN_TAU (MaChuyenTau, MaDoanTau, MaTuyenTau, GaXuatPhat, GaKetThuc, TrangThai)
        VALUES (@NewMaChuyenTau, @MaDoanTau, @MaTuyenTau, @GaXuatPhat, @GaKetThuc, N'Chuẩn bị');

        -- 3. TÍNH TOÁN LỊCH TRÌNH
        DECLARE @ThuTuDi INT, @ThuTuDen INT;
        SELECT @ThuTuDi = ThuTu FROM DANH_SACH_GA WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @GaXuatPhat;
        SELECT @ThuTuDen = ThuTu FROM DANH_SACH_GA WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @GaKetThuc;

        IF @ThuTuDi IS NULL OR @ThuTuDen IS NULL OR @ThuTuDi = @ThuTuDen
        BEGIN
            RAISERROR(N'Ga xuất phát/kết thúc không hợp lệ.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        DECLARE @CurMaGa NVARCHAR(10);
        DECLARE @CurThuTu INT;
        DECLARE @CurKhoangCach FLOAT; 
        DECLARE @KhoangCachTruoc FLOAT = 0;
        DECLARE @ThoiGianDen DATETIME = @NgayKhoiHanh;
        DECLARE @ThoiGianDi DATETIME = @NgayKhoiHanh;

        -- Xác định chiều chạy để mở Cursor
        IF @ThuTuDi < @ThuTuDen
        BEGIN
            DECLARE cur_lichtrinh CURSOR FOR
            SELECT MaGaTau, ThuTu, KhoangCach
            FROM DANH_SACH_GA
            WHERE MaTuyenTau = @MaTuyenTau AND ThuTu >= @ThuTuDi AND ThuTu <= @ThuTuDen
            ORDER BY ThuTu ASC; 
        END
        ELSE
        BEGIN
            DECLARE cur_lichtrinh CURSOR FOR
            SELECT MaGaTau, ThuTu, KhoangCach
            FROM DANH_SACH_GA
            WHERE MaTuyenTau = @MaTuyenTau AND ThuTu >= @ThuTuDen AND ThuTu <= @ThuTuDi
            ORDER BY ThuTu DESC; 
        END

        OPEN cur_lichtrinh;
        FETCH NEXT FROM cur_lichtrinh INTO @CurMaGa, @CurThuTu, @CurKhoangCach;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @CurThuTu = @ThuTuDi 
            BEGIN 
                -- GA ĐẦU TIÊN
                SET @ThoiGianDi = @NgayKhoiHanh;
                SET @ThoiGianDen = @NgayKhoiHanh;
                SET @KhoangCachTruoc = @CurKhoangCach;
            END
            ELSE
            BEGIN 
                -- CÁC GA TIẾP THEO
                DECLARE @QuangDuongDi FLOAT = ABS(@CurKhoangCach - @KhoangCachTruoc);
                DECLARE @PhutDiChuyen INT = CAST(@QuangDuongDi AS INT); 
                
                SET @ThoiGianDen = DATEADD(MINUTE, @PhutDiChuyen, @ThoiGianDi);
                
                -- === [SỬA LỖI TẠI ĐÂY] ===
                IF @CurThuTu <> @ThuTuDen
                    -- Nếu chưa phải ga cuối: Nghỉ 10 phút rồi đi
                    SET @ThoiGianDi = DATEADD(MINUTE, 10, @ThoiGianDen);
                ELSE
                    -- Nếu là ga cuối: Giờ Đi = Giờ Đến (Để không bị NULL)
                    SET @ThoiGianDi = @ThoiGianDen;

                SET @KhoangCachTruoc = @CurKhoangCach;
            END

            INSERT INTO THOI_GIAN_CHUYEN_TAU(MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen)
            VALUES (@NewMaChuyenTau, @CurMaGa, @ThoiGianDi, @ThoiGianDen);

            FETCH NEXT FROM cur_lichtrinh INTO @CurMaGa, @CurThuTu, @CurKhoangCach;
        END

        CLOSE cur_lichtrinh;
        DEALLOCATE cur_lichtrinh;

    COMMIT TRANSACTION;
END
GO