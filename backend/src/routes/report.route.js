import express from 'express';
import { getRevenueReport, exportRevenueReport } from '../controllers/report.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';

const router = express.Router();

// Chỉ Admin/Manager mới được xem báo cáo
router.get('/revenue', authenticationMiddleware, authorizeAdmin, getRevenueReport);
router.get('/revenue/export', authenticationMiddleware, authorizeAdmin, exportRevenueReport);

export default router;