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
        await pool.request()
            .input('MaDoanTau', sql.VarChar(10), maDoanTau)
            .input('TenTau', sql.NVarChar(100), updateData.tenTau ?? null)
            .input('HangSanXuat', sql.NVarChar(100), updateData.hangSanXuat ?? null)
            .input('NgayVanHanh', sql.Date, updateData.ngayVanHanh ?? null)
            .input('LoaiTau', sql.NVarChar(20), updateData.loaiTau ?? null)
            .input('TrangThai', sql.NVarChar(20), updateData.trangThai ?? null)
            .execute('sp_CapNhatDoanTau_DeadlockDemo');

        return {
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
            .input('MaDoanTau', sql.VarChar(10), carriageData.maDoanTau)
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

///////////////////////////////////////////////////////////////////////////////////
// 1. Lấy lịch trình tàu (Có filter)
export const getTrainScheduleService = async (status) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('Status', sql.NVarChar(20), status === 'all' ? null : status)
        .execute('sp_QuanLyLayDSChuyen');
    return result.recordset;
};

// 2. Lấy Timeline chi tiết
export const getTripTimelineService = async (tripId) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('MaChuyenTau', sql.VarChar(10), tripId)
        .execute('sp_LoTrinhChuyen');
    return result.recordset;
};

// 3. Cập nhật thời gian thực tế
export const updateTripTimeService = async (tripId, stationId, actArr, actDep) => {
    const pool = await getPool();

    await pool.request()
        .input('MaChuyenTau', sql.VarChar(10), tripId)
        .input('MaGaTau', sql.VarChar(10), stationId)
        .input('ThucTeDen', sql.DateTime, actArr ? new Date(actArr) : null)
        .input('ThucTeXuatPhat', sql.DateTime, actDep ? new Date(actDep) : null)
        .execute('sp_CapNhatTGThucTe');
    
    return { success: true };
};

// 4. Lấy chuyến chưa phân công
export const getUnassignedTripsService = async () => {
    const pool = await getPool();
    const result = await pool.request().execute('sp_DSChuyenChuaPC');
    return result.recordset;
};

// 5. Lấy chi tiết phân công
export const getTripAssignmentsService = async (tripId) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('MaChuyenTau', sql.VarChar(10), tripId)
        .execute('sp_LayChiTietPC');
    
    // Format lại dữ liệu cho dễ dùng ở FE
    const assignments = {
        driver: null,
        manager: null,
        carriages: {}
    };

    result.recordset.forEach(row => {
        if (row.VaiTro === 'Nhân viên phụ trách lái') {
            assignments.driver = row.TenNV;
            assignments.driverId = row.MaNV;
        } else if (row.VaiTro === 'Nhân viên trưởng') {
            assignments.manager = row.TenNV;
            assignments.managerId = row.MaNV;
        } else if (row.VaiTro === 'Nhân viên phụ trách toa') {
            // Mapping theo số thứ tự toa (row.SoToa)
            assignments.carriages[row.SoToa] = {
                staffName: row.TenNV,   
                staffId: row.MaNV,       
                coachId: row.MaToa       
            };
        }
    });

    return assignments;
};
