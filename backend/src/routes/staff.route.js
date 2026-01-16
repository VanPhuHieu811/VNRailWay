import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';
import {
    getCurrentStaff,
    updateStaff,
    deleteStaff,
    getAllStaff,
    getMySchedule,
    getMyPayslips,
    postLeaveRequest,
    postAssignment,
    patchApproveLeave,
    getAvailableStaffList,
    postCalculateSalary,
    getMyLeaveHistory
} from '../controllers/staff.controller.js';

const router = express.Router();

router.get('/me', authenticationMiddleware, authorizeAdmin, getCurrentStaff);
router.put('/me', authenticationMiddleware, authorizeAdmin, updateStaff);
router.delete('/me', authenticationMiddleware, authorizeAdmin, deleteStaff);
router.get('/all', authenticationMiddleware, authorizeAdmin, getAllStaff);
router.get('/me/schedule', getMySchedule); //SP01
router.get('/me/payslips', getMyPayslips); //SP02
router.post('/me/leave-requests', postLeaveRequest);  //SP03
router.post('/assignments', postAssignment); //SP07
router.patch('/leave-requests/approve', patchApproveLeave); //SP04
router.get('/available-crew', getAvailableStaffList);
router.post('/calculate-salary', postCalculateSalary);
router.get('/me/leave-history', getMyLeaveHistory);

export default router;

