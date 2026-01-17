import { getPool } from '../config/sqlserver.config.js';

export const generateId = async (tableName, idColumn, prefix, length = 3) => {
    const pool = await getPool();
    // Lấy mã lớn nhất hiện tại (Ví dụ: KH005)
    const query = `SELECT TOP 1 ${idColumn} FROM ${tableName} ORDER BY ${idColumn} DESC`;
    const result = await pool.request().query(query);

    let nextNum = 1;
    if (result.recordset.length > 0) {
        const lastId = result.recordset[0][idColumn];
        // Cắt bỏ prefix (KH) và lấy phần số
        const currentNum = parseInt(lastId.substring(prefix.length));
        nextNum = currentNum + 1;
    }

    // Pad số 0 vào đầu (Ví dụ: 1 -> 001)
    const nextId = prefix + nextNum.toString().padStart(length, '0');
    return nextId;
};