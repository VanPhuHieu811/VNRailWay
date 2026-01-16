import { getPool } from "../config/sqlserver.config.js"

export const getAllTrainCarriagePrices = async () => {
  const pool = await getPool();
  const query = `
    select * 
    from GIA_THEO_LOAI_TOA
  `
  const result = await pool.request().query(query);
  return result.recordset;
}

export const getTrainCarriagePriceById = async (id) => {
  const pool = await getPool();
  const query = `
    select * 
    from GIA_THEO_LOAI_TOA
    where MaGiaToa = @id
  `
  const result = await pool.request()
    .input('id', id)
    .query(query);
  return result.recordset[0];
}

export const updateTrainCarriagePriceById = async (id, price) => {
  const pool = await getPool();
  const request = pool.request()
    .input('MaGiaToa', id)
    .input('GiaMoi', price);
  const result = await request.execute('sp_updateTrainCarriagePrice');
  return result.rowsAffected[0] > 0 ? { MaGiaToa: id, GiaTien: price } : null;
}

export const getAllTrainFloorPrices = async () => {
  const pool = await getPool();
  const query = `
    select * 
    from GIA_THEO_TANG
  `
  const result = await pool.request().query(query);
  return result.recordset;
}

export const getTrainFloorPriceById = async (id) => {
  const pool = await getPool();
  const query = `
    select * 
    from GIA_THEO_TANG
    where MaGiaTang = @id
  `
  const result = await pool.request()
    .input('id', id)
    .query(query);
  return result.recordset[0];
}

export const updateTrainFloorPriceById = async (id, price) => {
  const pool = await getPool();
  const query = `
    update GIA_THEO_TANG
    set GiaTien = @GiaMoi
    where MaGiaTang = @MaGiaTang
  `
  const result = await pool.request()
    .input('MaGiaTang', id)
    .input('GiaMoi', price)
    .query(query);
  return result.rowsAffected[0] > 0 ? { MaGiaTang: id, GiaTien: price } : null;
}

// loai tau
export const getAllTrainTypePrices = async () => {
  const pool = await getPool();
  const query = `
    select * 
    from GIA_THEO_LOAI_TAU
  `
  const result = await pool.request().query(query);
  return result.recordset;
}

export const getTrainTypePriceById = async (id) => {
  const pool = await getPool();
  const query = `
    select * 
    from GIA_THEO_LOAI_TAU
    where MaGiaTau = @id
  `
  const result = await pool.request()
    .input('id', id)
    .query(query);
  return result.recordset[0];
}

export const updateTrainTypePriceById = async (id, price) => {
  const pool = await getPool();
  const query = `
    update GIA_THEO_LOAI_TAU
    set GiaTien = @GiaMoi
    where MaGiaTau = @MaGiaTau
  `
  const result = await pool.request()
    .input('MaGiaTau', id)
    .input('GiaMoi', price)
    .query(query);
  return result.rowsAffected[0] > 0 ? { MaGiaTau: id, GiaTien: price } : null;
}

export const getAllPriceByKilometer = async () => {
  const pool = await getPool();
  const idThamSo = 'TS004'
  const query = `
    select * 
    from THAM_SO ts
    where ts.MaThamSo = @idThamSo
  `
  const result = await pool.request()
    .input('idThamSo', idThamSo)
    .query(query);
  return result.recordset;
}

export const getPriceByKilometerById = async (id) => {
  const pool = await getPool();
  const query = `
    select * 
    from THAM_SO
    where MaThamSo = @id
  `
  const result = await pool.request()
    .input('id', id)
    .query(query);
  return result.recordset[0];
}

export const updatePriceByKilometerById = async (id, price) => {
  const pool = await getPool();
  const query = `
    update THAM_SO
    set GiaTriSo = @GiaMoi
    where MaThamSo = @MaThamSo
  `
  const result = await pool.request()
    .input('MaThamSo', id)
    .input('GiaMoi', price)
    .query(query);
  return result.rowsAffected[0] > 0 ? { MaThamSo: id, GiaTien: price } : null;
}