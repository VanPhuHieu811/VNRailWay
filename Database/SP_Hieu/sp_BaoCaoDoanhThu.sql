USE VNRAILWAY
GO

CREATE OR ALTER PROCEDURE sp_BaoCaoDoanhThu
    @Type VARCHAR(20),   
    @Thang INT = NULL,  
    @Nam INT = NULL     
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayBD DATETIME, @NgayKT DATETIME;
    DECLARE @NgayBDTruocDo DATETIME, @NgayKTTruocDo DATETIME;
    DECLARE @BayGio DATETIME = GETDATE();

    IF @Type = 'today'
    BEGIN
        SET @NgayBD = CAST(CAST(@BayGio AS DATE) AS DATETIME);
        SET @NgayKT = DATEADD(DAY, 1, @NgayBD);
        SET @NgayBDTruocDo = DATEADD(DAY, -1, @NgayBD);
        SET @NgayKTTruocDo = @NgayBD;
    END
    ELSE IF @Type = 'week'
    BEGIN
        SET @NgayBD = DATEADD(wk, DATEDIFF(wk, 0, @BayGio), 0);
        SET @NgayKT = DATEADD(DAY, 7, @NgayBD);
        SET @NgayBDTruocDo = DATEADD(wk, -1, @NgayBD);
        SET @NgayKTTruocDo = @NgayBD;
    END
    ELSE IF @Type = 'month'
    BEGIN
        DECLARE @M INT = ISNULL(@Thang, MONTH(@BayGio));
        DECLARE @Y INT = ISNULL(@Nam, YEAR(@BayGio));

        SET @NgayBD = DATEFROMPARTS(@Y, @M, 1);
        SET @NgayKT = DATEADD(MONTH, 1, @NgayBD);
        SET @NgayBDTruocDo = DATEADD(MONTH, -1, @NgayBD);
        SET @NgayKTTruocDo = @NgayBD;
    END
    ELSE IF @Type = 'year'
    BEGIN
        DECLARE @YOnly INT = ISNULL(@Nam, YEAR(@BayGio));

        SET @NgayBD = DATEFROMPARTS(@YOnly, 1, 1);
        SET @NgayKT = DATEFROMPARTS(@YOnly + 1, 1, 1);
        SET @NgayBDTruocDo = DATEADD(YEAR, -1, @NgayBD);
        SET @NgayKTTruocDo = @NgayBD;
    END

    SELECT 
        hd.MaHoaDon,
        hd.ThoiGianThanhToan,
        hd.GiaTien AS Revenue,
        tt.TenTuyen AS RouteName,
        COUNT(vt.MaVe) AS TicketCount
    INTO #CurrentStats
    FROM HOA_DON hd
    JOIN DAT_VE dv ON hd.MaDatVe = dv.MaDatVe 
    JOIN CHUYEN_TAU ct ON dv.MaChuyenTau = ct.MaChuyenTau
    JOIN TUYEN_TAU tt ON ct.MaTuyenTau = tt.MaTuyenTau
    LEFT JOIN VE_TAU vt ON dv.MaDatVe = vt.MaDatVe 
    WHERE hd.ThoiGianThanhToan >= @NgayBD AND hd.ThoiGianThanhToan < @NgayKT
    GROUP BY hd.MaHoaDon, hd.ThoiGianThanhToan, hd.GiaTien, tt.TenTuyen;

    DECLARE @PrevRevenue DECIMAL(18,0) = 0;
    DECLARE @PrevTickets INT = 0;

    SELECT 
        @PrevRevenue = ISNULL(SUM(hd.GiaTien), 0),
        @PrevTickets = ISNULL(COUNT(vt.MaVe), 0)
    FROM HOA_DON hd
    JOIN DAT_VE dv ON hd.MaDatVe = dv.MaDatVe
    LEFT JOIN VE_TAU vt ON dv.MaDatVe = vt.MaDatVe
    WHERE hd.ThoiGianThanhToan >= @NgayBDTruocDo AND hd.ThoiGianThanhToan < @NgayKTTruocDo;

    DECLARE @CurrRevenue DECIMAL(18,0), @CurrTickets INT;
    SELECT @CurrRevenue = ISNULL(SUM(Revenue), 0), @CurrTickets = ISNULL(SUM(TicketCount), 0) FROM #CurrentStats;

    SELECT 
        @CurrRevenue AS Revenue,
        @CurrTickets AS Tickets,
        ISNULL(@CurrRevenue / NULLIF(@CurrTickets, 0), 0) AS AvgPrice,
        CAST(IIF(@PrevRevenue = 0, 100, (@CurrRevenue - @PrevRevenue) * 100.0 / @PrevRevenue) AS DECIMAL(10,1)) AS GrowthRevenue,
        CAST(IIF(@PrevTickets = 0, 100, (@CurrTickets - @PrevTickets) * 100.0 / @PrevTickets) AS DECIMAL(10,1)) AS GrowthTickets;


    IF @Type = 'today'
    BEGIN
        SELECT 
            FORMAT(ThoiGianThanhToan, 'HH:00') AS Time,
            SUM(Revenue) AS Revenue,
            SUM(TicketCount) AS Tickets
        FROM #CurrentStats
        GROUP BY FORMAT(ThoiGianThanhToan, 'HH:00')
        ORDER BY Time;
    END
    ELSE IF @Type = 'year'
    BEGIN
        SELECT 
            'Tháng ' + FORMAT(ThoiGianThanhToan, 'MM') AS Time,
            SUM(Revenue) AS Revenue,
            SUM(TicketCount) AS Tickets
        FROM #CurrentStats
        GROUP BY MONTH(ThoiGianThanhToan), FORMAT(ThoiGianThanhToan, 'MM')
        ORDER BY MONTH(ThoiGianThanhToan);
    END
    ELSE
    BEGIN
        SELECT 
            FORMAT(ThoiGianThanhToan, 'dd/MM') AS Time,
            SUM(Revenue) AS Revenue,
            SUM(TicketCount) AS Tickets
        FROM #CurrentStats
        GROUP BY CAST(ThoiGianThanhToan AS DATE), FORMAT(ThoiGianThanhToan, 'dd/MM')
        ORDER BY CAST(ThoiGianThanhToan AS DATE);
    END


    SELECT TOP 5
        RouteName AS Route,
        SUM(TicketCount) AS Tickets,
        SUM(Revenue) AS Revenue,
        0 AS Growth 
    FROM #CurrentStats
    GROUP BY RouteName
    ORDER BY Revenue DESC;

    DROP TABLE #CurrentStats;
END;
GO
