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
                    kh.SoDienThoai as SoDienThoaiKH,

                    nv.MaNV as MaNV_NV,
                    nv.HoTen as HoTenNV,
                    nv.CCCD as CCCD_NV,
                    nv.NgaySinh as NgaySinhNV,
                    nv.GioiTinh as GioiTinhNV,
                    nv.DiaChi as DiaChiNV,
                    nv.SoDienThoai as SoDienThoaiNV,
                    nv.LoaiNhanVien
                FROM TAI_KHOAN tk
                LEFT JOIN KHACH_HANG kh ON tk.MaKH = kh.MaKhachHang
                LEFT JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV
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

        if (data.MaNV_NV) {
            userInfo.nhanVien = {
                maNV: data.MaNV_NV,
                hoTen: data.HoTenNV,
                cccd: data.CCCD_NV,
                ngaySinh: data.NgaySinhNV,
                gioiTinh: data.GioiTinhNV,
                diaChi: data.DiaChiNV,
                soDienThoai: data.SoDienThoaiNV,
                loaiNhanVien: data.LoaiNhanVien,
            };
        }

        return userInfo;
    } catch (error) {
        throw error;
    }
};
