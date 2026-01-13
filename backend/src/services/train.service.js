import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

///////////////////////////////////////////////////////////////////////////////////
// Train 
export const getTrainService = async () => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query(`SELECT dt.*, COUNT(tt.MaToaTau) AS SoLuongToa
                   FROM DOAN_TAU dt
                   LEFT JOIN TOA_TAU tt ON dt.MaDoanTau = tt.MaDoanTau
                   WHERE TrangThai <> N'Ngừng hoạt động'
                   GROUP BY dt.MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai`)
        return result.recordset;
    } catch (error) {
        throw error;
    }
};

export const getTrainIdService = async (trainId) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('TrainId', sql.VarChar(10), trainId)
            .query(`SELECT dt.*, COUNT(tt.MaToaTau) AS SoLuongToa
                   FROM DOAN_TAU dt
                   LEFT JOIN TOA_TAU tt ON dt.MaDoanTau = tt.MaDoanTau
                   WHERE TrangThai <> N'Ngừng hoạt động' AND dt.MaDoanTau = @TrainId
                   GROUP BY dt.MaDoanTau, TenTau, HangSanXuat, NgayVanHanh, LoaiTau, TrangThai`);
        if(result.recordset.length === 0) {
            throw { message: 'Train ID not found' };
        }
        return result.recordset;
    } catch (error) {
        throw error;
    }
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
            .execute('sp_TaoDoanTau');
            
        return {
            maDoanTau: trainData.maDoanTau,
            message: "Train created successfully"
        };
    } catch (error) {
        throw error;
    }
};


///////////////////////////////////////////////////////////////////////////////////
// Carriage
export const getCarriagesService = async (trainId) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('MaDoanTau', sql.VarChar(10), trainId)
            .query(`SELECT MaToaTau, STT, LoaiToa, SLViTri FROM TOA_TAU WHERE MaDoanTau = @MaDoanTau`);
        return result.recordset;       
    }
    catch (error) {
        throw error;
    }
};

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