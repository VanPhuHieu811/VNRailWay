import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const getRevenueReportService = async (type, month, year) => {
    try {
        const pool = await getPool();
        
        // Gọi Stored Procedure
        const result = await pool.request()
            .input('Type', sql.VarChar(20), type)
            .input('Thang', sql.Int, month || null) 
            .input('Nam', sql.Int, year || null)   
            .execute('sp_BaoCaoDoanhThu');


        const summaryRaw = result.recordsets[0][0] || {};
        
        const data = {
            summary: {
                revenue: summaryRaw.Revenue || 0,
                tickets: summaryRaw.Tickets || 0,
                avgPrice: summaryRaw.AvgPrice || 0,
                growthRevenue: summaryRaw.GrowthRevenue || 0,
                growthTickets: summaryRaw.GrowthTickets || 0
            },
            chartData: result.recordsets[1].map(item => ({
                time: item.Time,
                revenue: item.Revenue, 
                tickets: item.Tickets
            })),
            routes: result.recordsets[2].map(item => ({
                route: item.Route,
                tickets: item.Tickets,
                revenue: item.Revenue,
                growth: item.Growth || 0
            }))
        };

        return data;

    } catch (error) {
        throw error;
    }
};