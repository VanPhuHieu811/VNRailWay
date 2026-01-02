import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

// Service to create a Train (Đoàn tàu)
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
            .execute('sp_TaoDoanTau');
            
        return {
            maDoanTau: trainData.maDoanTau,
            message: "Train created successfully"
        };
    } catch (error) {
        throw error;
    }
};

// Create a Carriage (Toa tàu)
export const createCarriageService = async (carriageData) => {
    try {
        const pool = await getPool();

        // Execute sp_TaoToaTau
        await pool.request()
            .input('MaToaTau', sql.VarChar(10), carriageData.maToaTau)
            .input('MaDoanTau', sql.VarChar(10), carriageData.maDoanTau)
            .input('STT', sql.Int, carriageData.stt)
            .input('LoaiToa', sql.NVarChar(10), carriageData.loaiToa)
            .input('SLViTri', sql.Int, carriageData.slViTri)
            .execute('sp_TaoToaTau');
        return {
            maToaTau: carriageData.maToaTau,
            message: "Carriage created successfully"
        };
    } catch (error) {
        throw error;
    }
};