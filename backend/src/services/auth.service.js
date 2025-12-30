import { getPool } from '../config/sqlserver.config.js';
import jwt from 'jsonwebtoken';
import sql from 'mssql';

export const authLoginService = async (email, password) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('email', sql.VarChar(255), email)
            .input('password', sql.VarChar(50), password)
            .query(`
                SELECT Email, MaKH, MaNV, TenTaiKhoan, TrangThai, VaiTro
                FROM TAI_KHOAN
                WHERE Email = @email AND MatKhau = @password
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        const user = result.recordset[0];
        const token = jwt.sign(
            { email: user.Email, role: user.VaiTro },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: '1h' }
        );

        return { user, token };
    } catch (error) {
        throw error;
    }
}