USE VNRAILWAY
GO
CREATE OR ALTER PROCEDURE sp_ThemMoiChuyen_DeadlockDemo
	@MaChuyenTau NVARCHAR(10),
    @MaDoanTau NVARCHAR(10),
    @MaTuyenTau NVARCHAR(10),
    @GaXuatPhat NVARCHAR(10),
    @GaKetThuc NVARCHAR(10),
    @NgayKhoiHanh DATETIME
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @NewMaChuyenTau VARCHAR(10);

<<<<<<< HEAD
        -- 1. LOCK + ID GENERATION
=======
        /* ===== 1. LOCK + ID GENERATION ===== */
>>>>>>> b27e1a6d35b72cce95bf99268f2d0ef2cac83db3
        SELECT @NewMaChuyenTau =
            'CT' + RIGHT('000' + CAST(ISNULL(MAX(CAST(SUBSTRING(MaChuyenTau, 3, 5) AS INT)), 0) + 1 AS VARCHAR), 3)
        FROM CHUYEN_TAU WITH (UPDLOCK, HOLDLOCK);

        INSERT INTO CHUYEN_TAU
        (MaChuyenTau, MaDoanTau, MaTuyenTau, GaXuatPhat, GaKetThuc, TrangThai)
        VALUES
        (@NewMaChuyenTau, @MaDoanTau, @MaTuyenTau,
         @GaXuatPhat, @GaKetThuc, N'Chuẩn bị');

<<<<<<< HEAD
        -- 2. VALIDATE ROUTE
=======
        /* ===== 2. VALIDATE ROUTE ===== */
>>>>>>> b27e1a6d35b72cce95bf99268f2d0ef2cac83db3
        DECLARE @ThuTuDi INT, @ThuTuDen INT;

        SELECT @ThuTuDi = ThuTu
        FROM DANH_SACH_GA
        WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @GaXuatPhat;

        SELECT @ThuTuDen = ThuTu
        FROM DANH_SACH_GA
        WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @GaKetThuc;

        IF @ThuTuDi IS NULL OR @ThuTuDen IS NULL OR @ThuTuDi = @ThuTuDen
            THROW 50001, N'Ga xuất phát/kết thúc không hợp lệ.', 1;

<<<<<<< HEAD
        -- 3. GENERATE SCHEDULE
=======
        /* ===== 3. GENERATE SCHEDULE ===== */
>>>>>>> b27e1a6d35b72cce95bf99268f2d0ef2cac83db3
        DECLARE
            @CurMaGa NVARCHAR(10),
            @CurThuTu INT,
            @CurKhoangCach FLOAT,
            @KhoangCachTruoc FLOAT = 0,
            @ThoiGianDen DATETIME = @NgayKhoiHanh,
            @ThoiGianDi DATETIME = @NgayKhoiHanh;

        IF @ThuTuDi < @ThuTuDen
            DECLARE cur CURSOR FOR
                SELECT MaGaTau, ThuTu, KhoangCach
                FROM DANH_SACH_GA
                WHERE MaTuyenTau = @MaTuyenTau
                  AND ThuTu BETWEEN @ThuTuDi AND @ThuTuDen
                ORDER BY ThuTu;
        ELSE
            DECLARE cur CURSOR FOR
                SELECT MaGaTau, ThuTu, KhoangCach
                FROM DANH_SACH_GA
                WHERE MaTuyenTau = @MaTuyenTau
                  AND ThuTu BETWEEN @ThuTuDen AND @ThuTuDi
                ORDER BY ThuTu DESC;

        OPEN cur;
        FETCH NEXT FROM cur INTO @CurMaGa, @CurThuTu, @CurKhoangCach;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @CurThuTu = @ThuTuDi
            BEGIN
                SET @ThoiGianDi = @NgayKhoiHanh;
                SET @ThoiGianDen = @NgayKhoiHanh;
            END
            ELSE
            BEGIN
                DECLARE @PhutDiChuyen INT =
                    CAST(ABS(@CurKhoangCach - @KhoangCachTruoc) AS INT);

                SET @ThoiGianDen = DATEADD(MINUTE, @PhutDiChuyen, @ThoiGianDi);

                IF @CurThuTu <> @ThuTuDen
                    SET @ThoiGianDi = DATEADD(MINUTE, 10, @ThoiGianDen);
                ELSE
                    SET @ThoiGianDi = @ThoiGianDen;
            END

            INSERT INTO THOI_GIAN_CHUYEN_TAU
            (MaChuyenTau, MaGaTau, DuKienXuatPhat, DuKienDen)
            VALUES
            (@NewMaChuyenTau, @CurMaGa, @ThoiGianDi, @ThoiGianDen);

            SET @KhoangCachTruoc = @CurKhoangCach;
            FETCH NEXT FROM cur INTO @CurMaGa, @CurThuTu, @CurKhoangCach;
        END

        CLOSE cur;
        DEALLOCATE cur;

<<<<<<< HEAD
        -- 4. DEADLOCK TRIGGER
        WAITFOR DELAY '00:00:05';
=======
        /* ===== 4. DEADLOCK TRIGGER ===== */
        WAITFOR DELAY '00:00:10';
>>>>>>> b27e1a6d35b72cce95bf99268f2d0ef2cac83db3

        UPDATE DOAN_TAU
        SET NgayVanHanh = @NgayKhoiHanh
        WHERE MaDoanTau = @MaDoanTau;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO


-- T1: Admin creates a new schedule for Train DT01
EXEC sp_ThemMoiChuyen_DeadlockDemo
	@MaChuyenTau = '',
    @MaDoanTau = 'DT03', 
    @MaTuyenTau = 'TT01', 
    @GaXuatPhat = 'GA01', 
    @GaKetThuc = 'GA12', 
    @NgayKhoiHanh = '2026-02-05 08:00:00';