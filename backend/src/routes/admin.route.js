import express from 'express';
import adminController from '../controllers/admin.controller.js';

// Import Middleware có sẵn của nhóm
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';

const router = express.Router();

// --- ĐỊNH NGHĨA ROUTE ---

// API: Thêm chuyến tàu mới
// URL: POST /api/v1/admin/schedules
// Flow: Check Token -> Check Quyền Admin -> Controller xử lý
router.post('/schedules', 
    authenticationMiddleware, 
    authorizeAdmin, 
    adminController.createSchedule
);

export default router;