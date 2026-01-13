import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';
import {
    getCurrentStaff,
    updateStaff,
    deleteStaff,
    getAllStaff
} from '../controllers/staff.controller.js';

const router = express.Router();

router.get('/me', authenticationMiddleware, authorizeAdmin, getCurrentStaff);
router.put('/me', authenticationMiddleware, authorizeAdmin, updateStaff);
router.patch('/me', authenticationMiddleware, authorizeAdmin, updateStaff);
router.delete('/me', authenticationMiddleware, authorizeAdmin, deleteStaff);
router.get('/all', authenticationMiddleware, authorizeAdmin, getAllStaff);

export default router;

