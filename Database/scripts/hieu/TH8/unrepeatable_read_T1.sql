USE VNRAILWAY;
GO

CREATE OR ALTER PROCEDURE sp_ApDungUuDai
    @MaUuDai VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRANSACTION;

    -- Lần đọc 1: Lấy phần trăm ưu đãi
    SELECT PhanTram 
    FROM UU_DAI_GIA 
    WHERE MaUuDai = @MaUuDai;

    -- Delay 10s
    WAITFOR DELAY '00:00:10'; 

    -- Lần đọc 2: Lấy lại thông tin ưu đãi
    SELECT PhanTram 
    FROM UU_DAI_GIA 
    WHERE MaUuDai = @MaUuDai;

    COMMIT TRANSACTION;

END;
GO