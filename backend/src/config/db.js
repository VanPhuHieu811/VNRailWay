import 'dotenv/config';
import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { 
    encrypt: true, 
    trustServerCertificate: true 
  }
};

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Failed: ', err.message);
    throw err; // QUAN TRỌNG: Phải ném lỗi để server.js biết
  });