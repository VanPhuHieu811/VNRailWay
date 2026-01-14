import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const getUserByEmailService = async (email) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('email', sql.VarChar(255), email)
            .query(`
                SELECT 
                    tk.Email,
                    tk.MaKH,
                    tk.MaNV as MaNV_TK,
                    tk.TenTaiKhoan,
                    tk.TrangThai,
                    tk.VaiTro,

                    kh.MaKhachHang,
                    kh.HoTen as HoTenKH,
                    kh.CCCD as CCCD_KH,
                    kh.NgaySinh as NgaySinhKH,
                    kh.GioiTinh as GioiTinhKH,
                    kh.DiaChi as DiaChiKH,
                    kh.SoDienThoai as SoDienThoaiKH
                FROM TAI_KHOAN tk
                LEFT JOIN KHACH_HANG kh ON tk.MaKH = kh.MaKhachHang
                WHERE tk.Email = @email AND tk.TrangThai = 1
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        const data = result.recordset[0];

        // Format response
        const userInfo = {
            account: {
                email: data.Email,
                tenTaiKhoan: data.TenTaiKhoan,
                vaiTro: data.VaiTro,
                trangThai: Boolean(data.TrangThai),
            },
        };

        if (data.MaKhachHang) {
            userInfo.khachHang = {
                maKhachHang: data.MaKhachHang,
                hoTen: data.HoTenKH,
                cccd: data.CCCD_KH,
                ngaySinh: data.NgaySinhKH,
                gioiTinh: data.GioiTinhKH,
                diaChi: data.DiaChiKH,
                soDienThoai: data.SoDienThoaiKH,
            };
        }

        return userInfo;
    } catch (error) {
        throw error;
    }
};

export const updateUserService = async (email, updateData) => {
    try {
        const pool = await getPool();

        // Lấy thông tin tài khoản để biết là khách hàng hay nhân viên
        const accountResult = await pool.request()
            .input('email', sql.VarChar(255), email)
            .query(`
                SELECT MaKH, MaNV
                FROM TAI_KHOAN
                WHERE Email = @email AND TrangThai = 1
            `);

        if (accountResult.recordset.length === 0) {
            return null;
        }

        const account = accountResult.recordset[0];

        // Nếu là khách hàng - cập nhật thông tin khách hàng
        if (account.MaKH) {
            const updateFields = [];
            const request = pool.request().input('email', sql.VarChar(255), email);

            if (updateData.hoTen !== undefined) {
                updateFields.push('HoTen = @hoTen');
                request.input('hoTen', sql.NVarChar(50), updateData.hoTen);
            }
            if (updateData.cccd !== undefined) {
                updateFields.push('CCCD = @cccd');
                request.input('cccd', sql.VarChar(12), updateData.cccd);
            }
            if (updateData.ngaySinh !== undefined) {
                updateFields.push('NgaySinh = @ngaySinh');
                request.input('ngaySinh', sql.Date, updateData.ngaySinh);
            }
            if (updateData.gioiTinh !== undefined) {
                updateFields.push('GioiTinh = @gioiTinh');
                request.input('gioiTinh', sql.NVarChar(10), updateData.gioiTinh);
            }
            if (updateData.diaChi !== undefined) {
                updateFields.push('DiaChi = @diaChi');
                request.input('diaChi', sql.NVarChar(255), updateData.diaChi);
            }
            if (updateData.soDienThoai !== undefined) {
                updateFields.push('SoDienThoai = @soDienThoai');
                request.input('soDienThoai', sql.VarChar(10), updateData.soDienThoai);
            }

            if (updateFields.length === 0) {
                return { updated: false, message: 'No fields to update' };
            }

            request.input('maKH', sql.VarChar(10), account.MaKH);

            const updateQuery = `
                UPDATE KHACH_HANG
                SET ${updateFields.join(', ')}
                WHERE MaKhachHang = @maKH
            `;

            await request.query(updateQuery);
        }

        // Cập nhật thông tin tài khoản nếu có
        if (updateData.tenTaiKhoan !== undefined || updateData.matKhau !== undefined) {
            const accountUpdateFields = [];
            const accountRequest = pool.request().input('email', sql.VarChar(255), email);

            if (updateData.tenTaiKhoan !== undefined) {
                accountUpdateFields.push('TenTaiKhoan = @tenTaiKhoan');
                accountRequest.input('tenTaiKhoan', sql.VarChar(50), updateData.tenTaiKhoan);
            }
            if (updateData.matKhau !== undefined) {
                accountUpdateFields.push('MatKhau = @matKhau');
                accountRequest.input('matKhau', sql.VarChar(50), updateData.matKhau);
            }

            if (accountUpdateFields.length > 0) {
                const accountUpdateQuery = `
                    UPDATE TAI_KHOAN
                    SET ${accountUpdateFields.join(', ')}
                    WHERE Email = @email
                `;
                await accountRequest.query(accountUpdateQuery);
            }
        }

        // Lấy lại thông tin đã cập nhật
        return await getUserByEmailService(email);
    } catch (error) {
        throw error;
    }
};

export const deleteUserService = async (email) => {
    try {
        const pool = await getPool();

        // Soft delete - set TrangThai = 0
        const result = await pool.request()
            .input('email', sql.VarChar(255), email)
            .query(`
                UPDATE TAI_KHOAN
                SET TrangThai = 0
                WHERE Email = @email AND TrangThai = 1
            `);

        if (result.rowsAffected[0] === 0) {
            return null;
        }

        return { deleted: true, message: 'User account deactivated successfully' };
    } catch (error) {
        throw error;
    }
};

export const getAllUsersService = async () => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .query(`
                SELECT 
                    tk.Email,
                    tk.MaKH,
                    tk.MaNV as MaNV_TK,
                    tk.TenTaiKhoan,
                    tk.TrangThai,
                    tk.VaiTro,

                    kh.MaKhachHang,
                    kh.HoTen as HoTenKH,
                    kh.CCCD as CCCD_KH,
                    kh.NgaySinh as NgaySinhKH,
                    kh.GioiTinh as GioiTinhKH,
                    kh.DiaChi as DiaChiKH,
                    kh.SoDienThoai as SoDienThoaiKH
                FROM TAI_KHOAN tk
                LEFT JOIN KHACH_HANG kh ON tk.MaKH = kh.MaKhachHang
                WHERE tk.MaKH IS NOT NULL
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset;
    } catch (error) {
        throw error;
    }
}
