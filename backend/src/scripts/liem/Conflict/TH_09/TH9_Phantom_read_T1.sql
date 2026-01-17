-- T1: Khách hàng xem ưu đãi
CREATE OR ALTER PROCEDURE sp_LayDanhSachUuDai_th9_demo
    @TuKhoa NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    BEGIN TRANSACTION;

    -- LẦN ĐỌC 1
    SELECT MaUuDai, LoaiUuDai, PhanTram, TrangThai, NgayBatDau 
    FROM UU_DAI_GIA 
    WHERE (@TuKhoa IS NULL OR LoaiUuDai LIKE N'%' + @TuKhoa + N'%')
    ORDER BY NgayBatDau DESC;

    WAITFOR DELAY '00:00:05';

    -- LẦN ĐỌC 2
    SELECT MaUuDai, LoaiUuDai, PhanTram, TrangThai, NgayBatDau 
    FROM UU_DAI_GIA 
    WHERE (@TuKhoa IS NULL OR LoaiUuDai LIKE N'%' + @TuKhoa + N'%')
    ORDER BY NgayBatDau DESC;

    COMMIT TRANSACTION;
END;
GO

EXEC sp_LayDanhSachUuDai_th9_demo
