import { poolPromise } from '../config/db.js';
import sql from 'mssql';


//SP01
export const getScheduleFromDB = async (maNV, tuNgay, denNgay) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('MaNV', sql.VarChar, maNV)
    .input('TuNgay', sql.Date, tuNgay || null)
    .input('DenNgay', sql.Date, denNgay || null)
    .execute('sp_LayLichLamViecNhanVien');
  return result.recordset;
};


//SP 02
export const getPayslipsFromDB = async (maNV, thang, nam) => {
  const pool = await poolPromise;
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
  const pool = await poolPromise;
  
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
  const pool = await poolPromise;
  
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
  const { maDon, maNVQuanLy, trangThaiMoi, maNVThayThe } = approveData;
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('MaDon', sql.VarChar, maDon)
    .input('MaNVQuanLy', sql.VarChar, maNVQuanLy)
    .input('TrangThaiMoi', sql.NVarChar, trangThaiMoi)
    // Nếu từ chối thì maNVThayThe có thể để null
    .input('MaNVThayThe', sql.VarChar, maNVThayThe || null) 
    .execute('sp_DuyetDonNghiPhep');
    
  return result;
};

//SP05
// src/services/staffService.js
export const getAvailableStaff = async (params) => {
  const { maChuyenTau, loaiNV } = params;
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('MaChuyenTauCanPhanCong', sql.VarChar, maChuyenTau)
    .input('LoaiNV_CanTim', sql.NVarChar, loaiNV)
    .execute('sp_TimNhanVienTrongLich');
    
  return result.recordset;
};

//SP06
// src/services/staffService.js
export const calculateMonthlySalary = async (month, year) => {
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('Thang', sql.Int, month)
    .input('Nam', sql.Int, year)
    .execute('sp_TinhLuongHangThang'); // Gọi SP vừa cập nhật ngày chốt lương
    
  return result;
};

export const getLeaveHistory = async (maNV) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('MaNV', sql.VarChar, maNV)
    .execute('sp_LayLichSuDonNghiPhep');
  return result.recordset;
};