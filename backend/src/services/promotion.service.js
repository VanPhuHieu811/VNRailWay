import { getPool } from '../config/sqlserver.config.js';
import { AppError } from '../utils/AppError.js';
import sql from 'mssql';

// Get list of promotions (with optional search)
export const getPromotionsService = async (keyword) => {
    const pool = await getPool();
    const request = pool.request();

    if (keyword) {
        request.input('TuKhoa', sql.NVarChar(100), keyword);
    }

    // const result = await request.execute('sp_LayDanhSachUuDai_th9_demo');   
    const result = await request.execute('sp_LayDanhSachUuDai');
    return result.recordsets;
};

// Create new promotion
export const createPromotionService = async (promoData) => {
    try {
        const pool = await getPool();
        
        const result = await pool.request()
            .input('LoaiUuDai', sql.NVarChar(50), promoData.loaiUuDai)
            .input('MoTa', sql.NVarChar(255), promoData.moTa)
            .input('DoiTuong', sql.NVarChar(50), promoData.doiTuong)
            .input('PhanTram', sql.Int, promoData.phanTram)
            .input('NgayBatDau', sql.DateTime, promoData.ngayBatDau)
            .input('NgayKetThuc', sql.DateTime, promoData.ngayKetThuc) // Can be null
            .input('TrangThai', sql.NVarChar(20), promoData.trangThai)
            //.execute('sp_TaoUuDai_th9_demo');
            .execute('sp_TaoUuDai');

        // The SP returns the generated ID
        const newId = result.recordset[0]?.MaUuDai;

        return {
            maUuDai: newId,
            message: "Promotion created successfully"
        };
    } catch (error) {
        if (error.originalError?.info) {
            throw new AppError(error.originalError.info.message, 400);
        }
        throw error;
    }
};

export const updatePromotionService = async (maUuDai, updateData) => {
    try {
        const pool = await getPool();
        
        await pool.request()
            .input('MaUuDai', sql.VarChar(10), maUuDai)
            // Use logical checks to pass NULL if undefined, allowing the SP to handle "keep existing"
            .input('LoaiUuDai', sql.NVarChar(50), updateData.loaiUuDai ?? null)
            .input('MoTa', sql.NVarChar(255), updateData.moTa ?? null)
            .input('DoiTuong', sql.NVarChar(50), updateData.doiTuong ?? null)
            .input('PhanTram', sql.Int, updateData.phanTram ?? null)
            .input('NgayBatDau', sql.DateTime, updateData.ngayBatDau ?? null)
            .input('NgayKetThuc', sql.DateTime, updateData.ngayKetThuc ?? null)
            .input('TrangThai', sql.NVarChar(20), updateData.trangThai ?? null)
            .execute('sp_CapNhatUuDai');

        return {
            maUuDai,
            message: "Promotion updated successfully"
        };
    } catch (error) {
        if (error.originalError?.info) {
            throw new AppError(error.originalError.info.message, 400);
        }
        throw error;
    }
};