-- T2: Quản lý thêm ưu đãi
CREATE OR ALTER PROCEDURE sp_TaoUuDai_th9_demo
    @LoaiUuDai NVARCHAR(50),
    @MoTa NVARCHAR(255),
    @DoiTuong NVARCHAR(50),
    @PhanTram INT,
    @NgayBatDau DATETIME,
    @NgayKetThuc DATETIME,
    @TrangThai NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaUuDaiGenerate VARCHAR(10);

    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRANSACTION;
        SELECT @MaUuDaiGenerate = 
            'UD' + RIGHT('00' + CAST(ISNULL(MAX(CAST(SUBSTRING(MaUuDai, 3, LEN(MaUuDai)) AS INT)), 0) + 1 AS VARCHAR), 2)
        FROM UU_DAI_GIA WITH (UPDLOCK, HOLDLOCK);

        INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram, NgayBatDau, NgayKetThuc, TrangThai)
        VALUES (@MaUuDaiGenerate, @LoaiUuDai, @MoTa, @DoiTuong, @PhanTram, @NgayBatDau, @NgayKetThuc, @TrangThai);

    COMMIT TRANSACTION;
    SELECT @MaUuDaiGenerate AS MaUuDai;
END;
GO

EXEC sp_TaoUuDai_th9_demo
    @LoaiUuDai   = N'Giảm giá vé',
    @MoTa        = N'Giảm 20% cho khách hàng thân thiết',
    @DoiTuong    = N'Thân thiết',
    @PhanTram    = 20,
    @NgayBatDau  = '2026-01-20 00:00:00',
    @NgayKetThuc = '2026-02-20 23:59:59',
    @TrangThai   = N'Đang áp dụng';

GO
-- Delete để demo lại
/*
DELETE UU_DAI_GIA
WHERE LoaiUuDai = N'Giảm giá vé' AND DoiTuong = N'Thân thiết';
*/
