-- T1 FIX: Sử dụng SERIALIZABLE
CREATE OR ALTER PROCEDURE sp_LayDanhSachUuDai_th9_fix
    @TuKhoa NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    BEGIN TRANSACTION;
    
    -- Read 1
    SELECT MaUuDai, LoaiUuDai FROM UU_DAI_GIA 
    WHERE (@TuKhoa IS NULL OR LoaiUuDai LIKE N'%' + @TuKhoa + N'%');

    WAITFOR DELAY '00:00:15';

    -- Read 2
    SELECT MaUuDai, LoaiUuDai FROM UU_DAI_GIA 
    WHERE (@TuKhoa IS NULL OR LoaiUuDai LIKE N'%' + @TuKhoa + N'%');

    COMMIT TRANSACTION;
END;
GO
EXEC sp_LayDanhSachUuDai_th9_fix
