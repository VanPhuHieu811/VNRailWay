import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';

const adminService = {
    createScheduleService: async (data) => {
        try {
            const pool = await getPool();
            const request = pool.request();

            // 1. MaChuyenTau: SQL yêu cầu tham số này đầu tiên dù bên trong tự sinh (Auto-gen). 
            // Ta truyền chuỗi rỗng '' để giữ chỗ cho đúng thứ tự tham số.
            request.input('MaChuyenTau', sql.NVarChar(20), ''); 

            // 2. Các tham số nghiệp vụ
            request.input('MaDoanTau', sql.NVarChar(20), data.maDoanTau);
            request.input('MaTuyenTau', sql.NVarChar(20), data.maTuyenTau);
            
            // 3. Ga Đi / Ga Đến (Mới thêm vào so với bản cũ)
            request.input('GaXuatPhat', sql.NVarChar(50), data.gaXuatPhat);
            request.input('GaKetThuc', sql.NVarChar(50), data.gaKetThuc);
            
            // 4. Ngày giờ
            request.input('NgayKhoiHanh', sql.DateTime, data.ngayKhoiHanh);

            // Execute SP
            const result = await request.execute('sp_ThemMoiChuyen');

            return {
                success: true,
                // Vì SP của bạn không có lệnh SELECT trả về cuối cùng (như bản cũ), 
                // nên ta tự trả về thông báo thành công dựa trên input.
                data: {
                    MaDoanTau: data.maDoanTau,
                    ThongBao: "Đã thêm chuyến và tính lịch trình thành công"
                }
            };

        } catch (error) {
            throw error;
        }
    }
};

export default adminService;