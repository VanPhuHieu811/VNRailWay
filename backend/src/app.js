import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import staffRoutes from './routes/staffRoutes.js'; // Thêm dòng này

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký các Route của bạn
app.use('/api/v1/staff', staffRoutes);

export default app;