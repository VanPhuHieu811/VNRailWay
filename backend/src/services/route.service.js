import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

// 1. Get All Routes
export const getAllRoutesService = async () => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM TUYEN_TAU');
        return result.recordset;
    } catch (error) {
        throw error;
    }
};

// 2. Get Route Detail
export const getRouteDetailService = async (routeId) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('MaTuyenTau', sql.VarChar(10), routeId)
            .execute('sp_LayChiTietTuyenTau');

        if (result.recordset.length === 0) return null;

        const firstRow = result.recordset[0];
        const routeData = {
            maTuyenTau: firstRow.MaTuyenTau,
            tenTuyen: firstRow.TenTuyen,
            tongKhoangCach: firstRow.TongKhoangCach,
            stations: result.recordset.map(row => ({
                maGaTau: row.MaGaTau,
                tenGa: row.TenGa,
                thuTu: row.ThuTu,
                khoangCachTuGaDau: row.KhoangCachTuGaDau
            }))
        };
        return routeData;
    } catch (error) {
        throw error;
    }
};

// 3. Create Route Header ONLY (TUYEN_TAU)
export const createRouteService = async (data) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('MaTuyenTau', sql.VarChar(10), data.maTuyenTau)
            .input('TenTuyen', sql.NVarChar(50), data.tenTuyen)
            .input('KhoangCach', sql.Float, data.khoangCach)
            .execute('sp_TaoTuyenTau');
            
        return { success: true, maTuyenTau: data.maTuyenTau };
    } catch (error) {
        throw error;
    }
};

// 4. Update Route Header
export const updateRouteService = async (id, data) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('MaTuyenTau', sql.VarChar(10), id)
            .input('TenTuyen', sql.NVarChar(50), data.tenTuyen)
            .input('KhoangCach', sql.Float, data.khoangCach)
            .execute('sp_CapNhatTuyenTau');
    } catch (error) {
        throw error;
    }
};

// [NEW] 5. Add Station to Route (DANH_SACH_GA)
export const addStationToRouteService = async (routeId, stationData) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('MaTuyenTau', sql.VarChar(10), routeId)
            .input('MaGaTau', sql.VarChar(10), stationData.maGaTau)
            .input('ThuTu', sql.Int, stationData.thuTu)
            .input('KhoangCach', sql.Float, stationData.khoangCach)
            .execute('sp_ThemGaVaoTuyen');
            
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// [NEW] 6. Remove Station from Route (DANH_SACH_GA)
export const removeStationFromRouteService = async (routeId, stationId) => {
    try {
        const pool = await getPool();
        // Using direct SQL
        await pool.request()
            .input('MaTuyenTau', sql.VarChar(10), routeId)
            .input('MaGaTau', sql.VarChar(10), stationId)
            .query('DELETE FROM DANH_SACH_GA WHERE MaTuyenTau = @MaTuyenTau AND MaGaTau = @MaGaTau');
            
        return { success: true };
    } catch (error) {
        throw error;
    }
};