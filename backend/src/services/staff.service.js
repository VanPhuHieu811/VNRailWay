import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const getStaffByEmailService = async (email) => {
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
                    -- Thông tin nhân viên
                    nv.MaNV as MaNV_NV,
                    nv.HoTen as HoTenNV,
                    nv.CCCD as CCCD_NV,
                    nv.NgaySinh as NgaySinhNV,
                    nv.GioiTinh as GioiTinhNV,
                    nv.DiaChi as DiaChiNV,
                    nv.SoDienThoai as SoDienThoaiNV,
                    nv.LoaiNhanVien,
                    nv.NVQuanLy
                FROM TAI_KHOAN tk
                LEFT JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV
                WHERE tk.Email = @email AND tk.TrangThai = 1
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        const data = result.recordset[0];

        // Format response
        const staffInfo = {
            account: {
                email: data.Email,
                tenTaiKhoan: data.TenTaiKhoan,
                vaiTro: data.VaiTro,
                trangThai: Boolean(data.TrangThai),
            },
        };

        if (data.MaNV_NV) {
            staffInfo.nhanVien = {
                maNV: data.MaNV_NV,
                hoTen: data.HoTenNV,
                cccd: data.CCCD_NV,
                ngaySinh: data.NgaySinhNV,
                gioiTinh: data.GioiTinhNV,
                diaChi: data.DiaChiNV,
                soDienThoai: data.SoDienThoaiNV,
                loaiNhanVien: data.LoaiNhanVien,
                nvQuanLy: data.NVQuanLy,
            };
        }

        return staffInfo;
    } catch (error) {
        throw error;
    }
};

export const updateStaffService = async (email, updateData) => {
    try {
        const pool = await getPool();

        // Lấy thông tin tài khoản để biết là nhân viên
        const accountResult = await pool.request()
            .input('email', sql.VarChar(255), email)
            .query(`
                SELECT MaNV
                FROM TAI_KHOAN
                WHERE Email = @email AND TrangThai = 1
            `);

        if (accountResult.recordset.length === 0) {
            return null;
        }

        const account = accountResult.recordset[0];

        // Nếu là nhân viên - cập nhật thông tin nhân viên
        if (account.MaNV) {
            const updateFields = [];
            const request = pool.request().input('email', sql.VarChar(255), email);

            if (updateData.hoTen !== undefined) {
                updateFields.push('HoTen = @hoTen');
                request.input('hoTen', sql.NVarChar(100), updateData.hoTen);
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
            if (updateData.loaiNhanVien !== undefined) {
                updateFields.push('LoaiNhanVien = @loaiNhanVien');
                request.input('loaiNhanVien', sql.NVarChar(20), updateData.loaiNhanVien);
            }
            if (updateData.nvQuanLy !== undefined) {
                updateFields.push('NVQuanLy = @nvQuanLy');
                request.input('nvQuanLy', sql.VarChar(10), updateData.nvQuanLy);
            }

            if (updateFields.length === 0) {
                return { updated: false, message: 'No fields to update' };
            }

            request.input('maNV', sql.VarChar(10), account.MaNV);

            const updateQuery = `
                UPDATE NHAN_VIEN
                SET ${updateFields.join(', ')}
                WHERE MaNV = @maNV
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
        return await getStaffByEmailService(email);
    } catch (error) {
        throw error;
    }
};

export const deleteStaffService = async (email) => {
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

        return { deleted: true, message: 'Staff account deactivated successfully' };
    } catch (error) {
        throw error;
    }
};

export const getAllStaffService = async () => {
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
                    -- Thông tin nhân viên
                    nv.MaNV as MaNV_NV,
                    nv.HoTen as HoTenNV,
                    nv.CCCD as CCCD_NV,
                    nv.NgaySinh as NgaySinhNV,
                    nv.GioiTinh as GioiTinhNV,
                    nv.DiaChi as DiaChiNV,
                    nv.SoDienThoai as SoDienThoaiNV,
                    nv.LoaiNhanVien,
                    nv.NVQuanLy
                FROM TAI_KHOAN tk
                LEFT JOIN NHAN_VIEN nv ON tk.MaNV = nv.MaNV
                WHERE tk.MaNV IS NOT NULL
            `);

        return result.recordset;
    } catch (error) {
        throw error;
    }
};