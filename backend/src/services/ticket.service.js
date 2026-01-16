import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const findTicketForExchangeService = async (ticketCode, cccd) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('MaVe', sql.VarChar(10), ticketCode)
            .input('CCCD', sql.VarChar(12), cccd)
            .execute('sp_TraCuuVeDoi');

        if (result.recordset.length === 0) {
            return null;
        }

        // Map dữ liệu từ SQL sang format Frontend cần
        const row = result.recordset[0];
        
        return {
            ticket: {
                maVe: row.MaVe,
                //ngayDat: row.NgayMua,
                customerInfo: {
                    sdt: row.SoDienThoai
                },
                tripInfo: {
                    tenTau: row.TenTau,
                    gaDi: row.TenGaDi,
                    gaDen: row.TenGaDen,
                    // Format ngày giờ đẹp đẽ
                    ngayDi: new Date(row.NgayDi).toISOString().split('T')[0],
                    gioDi: row.GioDi,//new Date(row.ThoiGianDi).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
                    gioDen: row.GioDen//new Date(row.ThoiGianDen).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
                    //thoiGianChay: "---" // Có thể tính diff giữa Den và Di
                }
            },
            seat: {
                id: row.MaViTri,
                tenToa: `Toa ${row.MaToaTau}`, // Giả sử mã toa
                seatNum: row.MaViTri, // Hoặc tách số ghế từ mã
                loaiToa: row.LoaiToa || "Ghế ngồi",
                price: row.GiaVe,
                passengerName: row.TenKhach,
                passengerID: row.CCCD
            }
        };
    } catch (error) {
        throw error;
    }
};