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



export const confirmExchangeTicket = async (data) => {
    try {
        const pool = await getPool();
        const request = pool.request();

        // 1. Thông tin vé & Chuyến đi
        request.input('MaVeCu', sql.VarChar(20), data.oldTicketCode);
        request.input('MaChuyenTauMoi', sql.VarChar(20), data.newTripId);
        request.input('MaViTriMoi', sql.VarChar(20), data.newSeatId);
        request.input('GiaVeMoi', sql.Decimal(18, 0), data.newPrice);
        request.input('GaDi', sql.VarChar(20), data.fromStation);
        request.input('GaDen', sql.VarChar(20), data.toStation);

        // 2. Thông tin khách hàng (Cập nhật mới)
        request.input('HoTenMoi', sql.NVarChar(100), data.passengerName);
        request.input('CCCDMoi', sql.VarChar(20), data.passengerID);
        request.input('SDTMoi', sql.VarChar(20), data.passengerPhone || '');

        // [MỚI] Xử lý ngày sinh (Nếu rỗng thì gửi null để tránh lỗi SQL)
        request.input('NgaySinhMoi', sql.Date, data.passengerDob ? new Date(data.passengerDob) : null);
        // [MỚI] Xử lý địa chỉ
        request.input('DiaChiMoi', sql.NVarChar(200), data.passengerAddress || '');

        request.input('DoiTuongMoi', sql.NVarChar(50), data.passengerType);

        // 3. Người thực hiện (Lấy từ token hoặc gửi lên)
        request.input('NguoiThucHien', sql.VarChar(20), data.staffId || 'NV_SYSTEM');

        // Gọi Stored Procedure
        const result = await request.execute('sp_XuLyDoiVe');

        // Trả về kết quả từ SELECT cuối cùng trong SP
        return result.recordset[0];

    } catch (error) {
        // Ném lỗi ra controller xử lý
        throw error;
    }
};