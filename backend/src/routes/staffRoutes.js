import express from 'express';
import * as staffController from '../controllers/staffController.js';

const router = express.Router();

router.get('/me/schedule', staffController.getMySchedule); //SP01
router.get('/me/payslips', staffController.getMyPayslips); //SP02
router.post('/me/leave-requests', staffController.postLeaveRequest);  //SP03
router.post('/assignments', staffController.postAssignment); //SP07
router.patch('/leave-requests/approve', staffController.patchApproveLeave); //SP04
// src/routes/staffRoutes.js
// API 5: Tìm nhân viên rảnh lịch theo chuyên môn
// Endpoint: GET /api/v1/staff/available-crew
router.get('/available-crew', staffController.getAvailableStaffList);
// API 6: Tính lương định kỳ (Quản lý)
// Endpoint: POST /api/v1/staff/calculate-salary
router.post('/calculate-salary', staffController.postCalculateSalary);
// Endpoint: GET /api/v1/staff/me/leave-history
router.get('/me/leave-history', staffController.getMyLeaveHistory);
export default router; 