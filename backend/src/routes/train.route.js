import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeManager } from '../middlewares/authorization.middleware.js';
import { createTrain, createCarriage } from '../controllers/train.controller.js';

const router = express.Router();

// Route: POST /api/v1/trains
// Func: Create a new Train (Đoàn tàu)
// Auth: Required (Manager)
router.post('/', authenticationMiddleware, authorizeManager, createTrain);

// Route: POST /api/v1/trains/carriages
// Func: Create a new Carriage (Toa tàu)
// Auth: Required (Manager)
// Note: Frontend calls this after creating the train
router.post('/carriages', authenticationMiddleware, authorizeManager, createCarriage);

export default router;