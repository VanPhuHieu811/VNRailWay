USE VNRAILWAY
GO
CREATE OR ALTER PROCEDURE sp_XoaToaTau
    @MaToaTau VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM TOA_TAU WHERE MaToaTau = @MaToaTau)
    BEGIN
        RAISERROR(N'Mã toa tàu không tồn tại.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM PHAN_CONG_CHUYEN_TAU WHERE MaToa = @MaToaTau)
    BEGIN
        RAISERROR(N'Không thể xóa: Toa tàu này đang nằm trong kế hoạch phân công nhân viên.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1 
        FROM VE_TAU V
        JOIN VI_TRI_TREN_TOA VT ON V.MaViTri = VT.MaViTri
        WHERE VT.MaToaTau = @MaToaTau
    )
    BEGIN
        RAISERROR(N'Không thể xóa: Toa tàu này đã có vé được bán/đặt.', 16, 1);
        RETURN;
    END

    -- 4. Execute Deletion with Transaction
    BEGIN TRANSACTION;
    BEGIN TRY
        -- A. Delete Beds (GIUONG) associated with Seats in this Carriage
        DELETE FROM GIUONG 
        WHERE MaViTri IN (SELECT MaViTri FROM VI_TRI_TREN_TOA WHERE MaToaTau = @MaToaTau);

        -- B. Delete Seats (VI_TRI_TREN_TOA) in this Carriage
        DELETE FROM VI_TRI_TREN_TOA 
        WHERE MaToaTau = @MaToaTau;

        -- C. Delete the Carriage (TOA_TAU) itself
        DELETE FROM TOA_TAU 
        WHERE MaToaTau = @MaToaTau;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO