import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';

const customerService = {
    /**
     * Tìm kiếm chuyến tàu (Demo Phantom Read)
     * @param {string} ngayDi - Ngày đi (YYYY-MM-DD)
     * @param {string} gaDi - Tên ga đi (VD: Hà Nội)
     * @param {string} gaDen - Tên ga đến (VD: Sài Gòn)
     * @param {string|null} gioKhoiHanh - Giờ (HH:mm) hoặc null
     */
    searchSchedulesService: async (ngayDi, gaDi, gaDen, gioKhoiHanh) => {
        try {
            const pool = await getPool();
            const request = pool.request();

            // Map tham số
            request.input('NgayDi', sql.Date, ngayDi);
            request.input('GaDi', sql.VarChar(50), gaDi);
            request.input('GaDen', sql.VarChar(50), gaDen);
            
            // Xử lý giờ khởi hành (có thể null)
            if (gioKhoiHanh) {
                request.input('GioKhoiHanh', sql.Time, gioKhoiHanh);
            } else {
                request.input('GioKhoiHanh', sql.Time, null);
            }

            // Gọi SP
            const result = await request.execute('sp_XemDSChuyenTau');

            // SP trả về 2 bảng kết quả (recordsets) do select 2 lần
            return {
                lan1: result.recordsets[0], // Kết quả lần đọc đầu tiên
                lan2: result.recordsets[1]  // Kết quả lần đọc thứ 2 (sau 10s)
            };

        } catch (error) {
            throw error;
        }
    }
};

export default customerService;