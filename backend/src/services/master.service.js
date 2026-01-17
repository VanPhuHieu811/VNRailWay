import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';

const masterService = {
    // 1. Lấy tất cả Ga (Dùng cho dropdown mặc định hoặc fallback)
    getAllStations: async () => {
        const pool = await getPool();
        const result = await pool.request().query("SELECT MaGaTau, TenGa FROM GA_TAU");
        return result.recordset;
    },

    // 2. Lấy danh sách Tuyến Tàu
    getAllRoutes: async () => {
        const pool = await getPool();
        const result = await pool.request().query("SELECT MaTuyenTau, TenTuyen FROM TUYEN_TAU");
        return result.recordset;
    },

    // 3. Lấy danh sách Đoàn Tàu
    getAllTrains: async () => {
        const pool = await getPool();
        const result = await pool.request().query("SELECT MaDoanTau, TenTau FROM DOAN_TAU WHERE TrangThai = N'Hoạt động'");
        return result.recordset;
    },

    // 4. [QUAN TRỌNG] Lấy danh sách Ga thuộc một Tuyến cụ thể
    // Hàm này sẽ Join bảng DANH_SACH_GA để lấy ga theo thứ tự
    getStationsByRoute: async (maTuyenTau) => {
        const pool = await getPool();
        const request = pool.request();
        
        if (!maTuyenTau) return [];

        request.input('MaTuyenTau', sql.VarChar(20), maTuyenTau);

        const query = `
            SELECT g.MaGaTau, g.TenGa, dsg.ThuTu
            FROM GA_TAU g
            JOIN DANH_SACH_GA dsg ON g.MaGaTau = dsg.MaGaTau
            WHERE dsg.MaTuyenTau = @MaTuyenTau
            ORDER BY dsg.ThuTu ASC
        `;
        
        const result = await request.query(query);
        return result.recordset;
    }
};

export default masterService;