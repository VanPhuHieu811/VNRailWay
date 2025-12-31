import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { getCurrentUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/me', authenticationMiddleware, getCurrentUser);

export default router;
