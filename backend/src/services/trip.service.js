import { getPool } from '../config/sqlserver.config.js';
import sql from 'mssql';

export const searchTripsService = async (
    gaXuatPhat = null,
    gaKetThuc = null,
    ngayDi = null,
    trangThai = null
) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('GaDi', sql.VarChar(10), gaXuatPhat)
        .input('GaDen', sql.VarChar(10), gaKetThuc)
        .input('NgayDi', sql.Date, ngayDi)
        .input('TrangThai', sql.VarChar(20), trangThai)
        .execute('sp_TimKiemChuyenTau');

    return result.recordset;
};

export const getTripSeatsService = async (tripId) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('MaChuyenTau', sql.VarChar(10), tripId)
        .execute('sp_LaySoDoGhe');

    return result.recordset; // empty array = no seats / invalid trip
};

export const getTripDetailsService = async (tripId) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('MaChuyenTau', sql.VarChar(10), tripId)
        .execute('sp_ChiTietChuyenTau');

    return result.recordset[0] || null;
};
