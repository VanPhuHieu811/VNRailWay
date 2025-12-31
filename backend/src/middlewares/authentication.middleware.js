import jwt from 'jsonwebtoken';
import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const authenticationMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Invalid token format'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.VarChar(255), decoded.email)
            .query(`
                SELECT Email, MaKH, MaNV, TenTaiKhoan, TrangThai, VaiTro
                FROM TAI_KHOAN
                WHERE Email = @email AND TrangThai = 1
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account is disabled'
            });
        }

        const user = result.recordset[0];
        req.user = {
            email: user.Email,
            role: user.VaiTro,
            maKH: user.MaKH,
            maNV: user.MaNV,
            tenTaiKhoan: user.TenTaiKhoan,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
};