import { getPool } from '../config/sqlserver.config.js';
import jwt from 'jsonwebtoken';
import sql from 'mssql';

export const authLoginService = async (username, password) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('username', sql.VarChar(255), username)
            .input('password', sql.VarChar(50), password)
            .query(`
                SELECT Email, MaKH, MaNV, TenTaiKhoan, TrangThai, VaiTro
                FROM TAI_KHOAN
                WHERE TenTaiKhoan = @username AND MatKhau = @password
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        const user = result.recordset[0];
        const token = jwt.sign(
            { username: user.TenTaiKhoan, role: user.VaiTro },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { user, token };
    } catch (error) {
        throw error;
    }
};