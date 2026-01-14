import { getPool } from '../config/sqlserver.config.js';
import { AppError } from '../utils/AppError.js';
import sql from 'mssql';

///////////////////////////////////////////////////////////////////////////////////
// Train 
export const getTrainService = async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT dt.*, COUNT(tt.MaToaTau) AS SoLuongToa
        FROM DOAN_TAU dt
        LEFT JOIN TOA_TAU tt ON dt.MaDoanTau = tt.MaDoanTau
        WHERE TrangThai <> N'Ngừng hoạt động'
        GROUP BY dt.MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai
    `);
    return result.recordset;
};

export const getTrainIdService = async (trainId) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('TrainId', sql.VarChar(10), trainId)
        .query(`
            SELECT dt.*, COUNT(tt.MaToaTau) AS SoLuongToa
            FROM DOAN_TAU dt
            LEFT JOIN TOA_TAU tt ON dt.MaDoanTau = tt.MaDoanTau
            WHERE TrangThai <> N'Ngừng hoạt động'
                AND dt.MaDoanTau = @TrainId
            GROUP BY dt.MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai
        `);

    if (result.recordset.length === 0) {
        throw new AppError('Train not found', 404);
    }

    return result.recordset[0];
};

export const createTrainService = async (trainData) => {
    try {
        const pool = await getPool();
        
        // Execute sp_TaoDoanTau
        await pool.request()
            .input('MaDoanTau', sql.VarChar(10), trainData.maDoanTau)
            .input('TenTau', sql.NVarChar(100), trainData.tenTau)
            .input('HangSanXuat', sql.NVarChar(100), trainData.hangSanXuat)
            .input('NgayVanHanh', sql.Date, trainData.ngayVanHanh)
            .input('LoaiTau', sql.NVarChar(20), trainData.loaiTau)
            .input('TrangThai', sql.NVarChar(20), trainData.trangThai)
            .execute('sp_TaoDoanTau');
        return {
            maDoanTau: trainData.maDoanTau,
            message: "Train created successfully"
        };
    } catch (error) {
        if (error.originalError?.info) {
            throw new AppError(error.originalError.info.message, 400);
        }
        throw error;
    }
};

export const updateTrainService = async (maDoanTau, updateData) => {
    try {
        const pool = await getPool();

        // Check if train exists
        const trainResult = await pool.request()
            .input('maDoanTau', sql.VarChar(10), maDoanTau)
            .query(`
                SELECT MaDoanTau
                FROM DOAN_TAU
                WHERE MaDoanTau = @maDoanTau
            `);

        if (trainResult.recordset.length === 0) {
            throw new AppError('Train not found', 404);
        }

        const updateFields = [];
        const request = pool.request()
            .input('maDoanTau', sql.VarChar(10), maDoanTau);

        if (updateData.tenTau !== undefined) {
            updateFields.push('TenTau = @tenTau');
            request.input('tenTau', sql.NVarChar(100), updateData.tenTau);
        }

        if (updateData.hangSanXuat !== undefined) {
            updateFields.push('HangSanXuat = @hangSanXuat');
            request.input('hangSanXuat', sql.NVarChar(100), updateData.hangSanXuat);
        }

        if (updateData.ngayVanHanh !== undefined) {
            updateFields.push('NgayVanHanh = @ngayVanHanh');
            request.input('ngayVanHanh', sql.Date, updateData.ngayVanHanh);
        }

        if (updateData.loaiTau !== undefined) {
            updateFields.push('LoaiTau = @loaiTau');
            request.input('loaiTau', sql.NVarChar(20), updateData.loaiTau);
        }

        if (updateData.trangThai !== undefined) {
            updateFields.push('TrangThai = @trangThai');
            request.input('trangThai', sql.NVarChar(20), updateData.trangThai);
        }

        if (updateFields.length === 0) {
            throw new AppError('No fields to update', 400);
        }

        const updateQuery = `
            UPDATE DOAN_TAU
            SET ${updateFields.join(', ')}
            WHERE MaDoanTau = @maDoanTau
        `;

        await request.query(updateQuery);

        return {
            updated: true,
            maDoanTau,
            message: 'Train updated successfully'
        };
    } catch (error) {
        throw error;
    }
};

///////////////////////////////////////////////////////////////////////////////////
// Carriage
export const getCarriagesService = async (trainId) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('MaDoanTau', sql.VarChar(10), trainId)
        .query(`SELECT MaToaTau, STT, LoaiToa, SLViTri FROM TOA_TAU WHERE MaDoanTau = @MaDoanTau`);
    return result.recordset;       
};

export const createCarriageService = async (carriageData) => {
    try {
        const pool = await getPool();

        await pool.request()
            .input('MaToaTau', sql.VarChar(10), carriageData.maToaTau)
            .input('MaDoanTau', sql.VarChar(10), carriageData.maDoanTau)
            .input('STT', sql.Int, carriageData.stt)
            .input('LoaiToa', sql.NVarChar(10), carriageData.loaiToa)
            .input('SLViTri', sql.Int, carriageData.slViTri)
            .execute('sp_TaoToaTau');

        return { maToaTau: carriageData.maToaTau };
    } catch (error) {
        if (error.originalError?.info) {
            throw new AppError(error.originalError.info.message, 400);
        }
        throw error;
    }
};

export const updateCarriageService = async (maToaTau, updateData) => {
    try {
        const pool = await getPool();

        // Check if carriage exists
        const carriageResult = await pool.request()
            .input('maToaTau', sql.VarChar(10), maToaTau)
            .query(`SELECT MaToaTau FROM TOA_TAU WHERE MaToaTau = @maToaTau`);

        if (carriageResult.recordset.length === 0) {
            throw new AppError('Carriage not found', 404);
        }

        const updateFields = [];
        const request = pool.request()
            .input('maToaTau', sql.VarChar(10), maToaTau);

        if (updateData.loaiToa !== undefined) {
            updateFields.push('LoaiToa = @loaiToa');
            request.input('loaiToa', sql.NVarChar(10), updateData.loaiToa);
        }

        if (updateData.slViTri !== undefined) {
            updateFields.push('SLViTri = @slViTri');
            request.input('slViTri', sql.Int, updateData.slViTri);
        }

        if (updateFields.length === 0) {
            return { updated: false, message: 'No fields to update' };
        }

        const updateQuery = `
            UPDATE TOA_TAU
            SET ${updateFields.join(', ')}
            WHERE MaToaTau = @maToaTau
        `;

        await request.query(updateQuery);

        return {
            updated: true,
            maToaTau,
            message: 'Carriage updated successfully'
        };
    } catch (error) {
        if (error.originalError?.info) {
            throw new AppError(error.originalError.info.message, 400);
        }
        throw error;
    }
};