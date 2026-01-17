import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const findTicketForExchangeService = async (ticketCode, cccd) => {
    try {
        const pool = await getPool();
        // Gọi SP cũ sp_TraCuuVeDoi (đã viết ở câu trả lời trước)
        const result = await pool.request()
            .input('MaVe', sql.VarChar(10), ticketCode)
            .input('CCCD', sql.VarChar(12), cccd)
            .execute('sp_TraCuuVeDoi');

        if (result.recordset.length === 0) {
            return null;
        }

        const row = result.recordset[0];

        // --- MAP DATA CHO KHỚP VỚI FRONTEND MỚI ---
        return {
            // Thông tin vé
            MaVe: row.MaVe,
            MaKhachHang: row.MaKhachHang, // Giả sử SP trả về cột này
            MaChuyenTau: row.MaChuyenTau,
            MaViTri: row.MaViTri,
            ThoiGianXuatVe: row.ThoiGianXuatVe, // Map từ NgayMua sang ThoiGianXuatVe
            GaXuatPhat: row.TenGaDi,     // Map TenGaDi -> GaXuatPhat
            GaDen: row.TenGaDen,         // Map TenGaDen -> GaDen
            GiaThuc: row.GiaVe,          // Map GiaVe -> GiaThuc
            TrangThai: row.TrangThai,

            // Thông tin khách hàng
            TenKhachHang: row.TenKhach,
            CCCD: row.CCCD,
            SDT: row.SoDienThoai,

            // Thông tin chuyến tàu
            TenTau: row.TenTau,
            ThoiGianDi: row.ThoiGianDi,
            ThoiGianDen: row.ThoiGianDen,
            MaTuyenTau: row.MaTuyenTau,

            // Thông tin ghế
            TenToa: `Toa ${row.MaToaTau}`,
            LoaiToa: row.LoaiToa,
            SoGhe: row.MaViTri.split('-').pop() // Hoặc logic tách số ghế nếu cần
        };
    } catch (error) {
        throw error;
    }
};