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

//SP01
export const getScheduleFromDB = async (maNV, tuNgay, denNgay) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MaNV', sql.VarChar, maNV)
    .input('TuNgay', sql.Date, tuNgay || null)
    .input('DenNgay', sql.Date, denNgay || null)
    .execute('sp_LayLichLamViecNhanVien');
  return result.recordset;
};


//SP 02
export const getPayslipsFromDB = async (maNV, thang, nam) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MaNV', sql.VarChar, maNV)
    .input('Thang', sql.Int, thang)
    .input('Nam', sql.Int, nam)
    .execute('sp_LayPhieuLuongNhanVien'); // Gọi SP vừa viết lại
  return result.recordset[0];
};


//SP03
// Thêm/Cập nhật trong src/services/staffService.js
export const createLeaveRequest = async (leaveData) => {
  const { maPhanCong, maNV, lyDo } = leaveData;
  const pool = await getPool();
  
  const result = await pool.request()
    .input('MaPhanCong', sql.VarChar, maPhanCong)
    .input('MaNVGui', sql.VarChar, maNV)
    .input('LyDo', sql.NVarChar, lyDo)
    .execute('sp_GuiDonNghiPhep'); 
    
  return result;
};


//SP07
// Thêm vào src/services/staffService.js
export const assignStaffToTrain = async (assignmentData) => {
  const { maNV, maChuyenTau, vaiTro, maToa } = assignmentData;
  const pool = await getPool();
  
  const result = await pool.request()
    .input('MaNV', sql.VarChar, maNV)
    .input('MaChuyenTau', sql.VarChar, maChuyenTau)
    .input('VaiTro', sql.NVarChar, vaiTro)
    .input('MaToa', sql.VarChar, maToa || null) // Nếu không có toa thì gửi null
    .execute('sp_PhanCongNhanSu');
    
  return result;
};


//SP 04
// Thêm vào src/services/staffService.js
export const approveLeaveRequest = async (approveData) => {
  const { maDon, maNVQuanLy, maNVThayThe } = approveData;
  const pool = await getPool();
  
  const result = await pool.request()
    .input('MaDonNghiPhep', sql.VarChar, maDon)
    .input('MaQuanLyDuyetDon', sql.VarChar, maNVQuanLy)
    .input('MaNhanVienThayThe', sql.VarChar, maNVThayThe || null) 
    .execute('sp_th5_cuong_error_lost_update'); // error lost update
    // .execute('sp_DuyetDonNghiPhep');
    
  return result;
};

//SP05
// src/services/staffService.js
export const getAvailableStaff = async (params) => {
  const { maChuyenTau, loaiNV } = params;
  const pool = await getPool();
  
  const result = await pool.request()
    .input('MaChuyenTauCanPhanCong', sql.VarChar, maChuyenTau)
    .input('LoaiNV_CanTim', sql.NVarChar, loaiNV)
    .execute('sp_TimNhanVienTrongLich');
    
  return result.recordset;
};

//SP06
// src/services/staffService.js
export const calculateMonthlySalary = async (month, year) => {
  const pool = await getPool();
  
  const result = await pool.request()
    .input('Thang', sql.Int, month)
    .input('Nam', sql.Int, year)
    .execute('sp_TinhLuongHangThang'); // Gọi SP vừa cập nhật ngày chốt lương
    
  return result;
};

export const getLeaveHistory = async (maNV) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MaNV', sql.VarChar, maNV)
    .execute('sp_LayLichSuDonNghiPhep');
  return result.recordset;
};

export const getLeaveRequestsService = async (status) => {
    try {
        const pool = await getPool();
        let query = `
          SELECT 
            d.MaDon,
            d.MaPhanCong,
            d.NgayGui,
            d.LyDo,
            d.TrangThai,
            d.NVGuiDon AS MaNV,
            nv.HoTen AS TenNV,
            nv.LoaiNhanVien AS ChucVu,
            pc.MaToa,
            pc.MaChuyenTau,
            pc.VaiTro AS VaiTroTrongCa,
            ct.GaXuatPhat,
            ct.GaKetThuc,
            tc.DuKienXuatPhat,
            rep.HoTen AS NguoiThayThe
          FROM DON_NGHI_PHEP d
          JOIN NHAN_VIEN nv ON d.NVGuiDon = nv.MaNV
          JOIN PHAN_CONG_CHUYEN_TAU pc ON d.MaPhanCong = pc.MaPhanCong
          JOIN CHUYEN_TAU ct ON pc.MaChuyenTau = ct.MaChuyenTau
          LEFT JOIN THOI_GIAN_CHUYEN_TAU tc ON ct.MaChuyenTau = tc.MaChuyenTau AND ct.GaXuatPhat = tc.MaGaTau
          LEFT JOIN NHAN_VIEN rep ON d.NVThayThe = rep.MaNV
        `;

        if (status === 'pending') {
            query += ` WHERE d.TrangThai = N'Đang chờ' `;
        } else if (status === 'history') {
            query += ` WHERE d.TrangThai IN (N'Chấp nhận', N'Từ chối') `;
        }

        query += ` ORDER BY d.NgayGui DESC`;

        const result = await pool.request().query(query);

        return result.recordset.map(item => ({
            id: item.MaDon,
            employeeId: item.MaNV,
            employeeName: item.TenNV,
            role: item.ChucVu,
            tripCode: item.MaChuyenTau,
            carriage: item.MaToa,
            date: item.DuKienXuatPhat,
            shift: item.VaiTroTrongCa,
            reason: item.LyDo,
            sentAt: item.NgayGui,
            status: mapStatus(item.TrangThai),
            originalStatus: item.TrangThai,
            replacement: item.NguoiThayThe
        }));
    } catch (error) {
        throw error;
    }
};

const mapStatus = (status) => {
    switch (status) {
        case 'Đang chờ': return 'pending';
        case 'Chấp nhận': return 'approved';
        case 'Từ chối': return 'rejected';
        default: return 'pending';
    }
};