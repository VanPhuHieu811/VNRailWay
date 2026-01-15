import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import {
    getCurrentUser,
    updateUser,
    deleteUser,
    getAllUsers,
} from '../controllers/user.controller.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.get('/me', authenticationMiddleware, getCurrentUser);
router.put('/me', authenticationMiddleware, updateUser);
router.patch('/me', authenticationMiddleware, updateUser);
router.delete('/me', authenticationMiddleware, deleteUser);
router.get('/all', authenticationMiddleware, authorizeAdmin, getAllUsers);

export default router;
