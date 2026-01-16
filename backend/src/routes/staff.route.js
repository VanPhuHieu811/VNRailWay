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
    getMyLeaveHistory,
    getAllLeaveRequests,
    fixLostUpdateApprove
} from '../controllers/staff.controller.js';

const router = express.Router();

router.get('/me', authenticationMiddleware, authorizeAdmin, getCurrentStaff);
router.put('/me', authenticationMiddleware, authorizeAdmin, updateStaff);
router.delete('/me', authenticationMiddleware, authorizeAdmin, deleteStaff);
router.get('/all', authenticationMiddleware, authorizeAdmin, getAllStaff);
router.get('/me/schedule', authenticationMiddleware, getMySchedule); //SP01
router.get('/me/payslips', authenticationMiddleware, getMyPayslips); //SP02
router.post('/me/leave-requests', authenticationMiddleware, postLeaveRequest);  //SP03
router.post('/assignments', authenticationMiddleware, postAssignment); //SP07
router.patch('/leave-requests/approve', authenticationMiddleware, patchApproveLeave); //SP04
router.post('/available-crew', authenticationMiddleware, getAvailableStaffList); //SP05
router.post('/calculate-salary', authenticationMiddleware, postCalculateSalary);
router.get('/me/leave-history', authenticationMiddleware, getMyLeaveHistory);

router.get('/leave-requests', authenticationMiddleware, getAllLeaveRequests);
router.patch('/leave-requests/approve/fix-lost-update', authenticationMiddleware, fixLostUpdateApprove); // SP04

export default router;

