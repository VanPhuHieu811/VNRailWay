import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  server: process.env.SQLSERVER_HOST,
  database: process.env.SQLSERVER_DB,
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  port: parseInt(process.env.SQLSERVER_PORT, 10) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};
let poolPromise;

export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect().catch((err) => {
      poolPromise = undefined;
      throw err;
    });
  }
  return poolPromise;
};

export const dbMiddleware = async (req, _res, next) => {
  try {
    req.db = await getPool();
    next();
  } catch (err) {
    next(err);
  }
};

export { config };