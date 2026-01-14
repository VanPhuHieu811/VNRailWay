import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeManager } from '../middlewares/authorization.middleware.js';
import { createTrain, createCarriage, getTrain, getTrainById, getCarriages, updateTrain, updateCarriage } from '../controllers/train.controller.js';

const router = express.Router();

// Train
router.get('/', authenticationMiddleware, authorizeManager, getTrain);
router.get('/:id', authenticationMiddleware, authorizeManager, getTrainById);
router.post('/', authenticationMiddleware, authorizeManager, createTrain);
router.patch('/:id', authenticationMiddleware, authorizeManager, updateTrain);

// Carriage
router.get('/:id/carriages', authenticationMiddleware, authorizeManager, getCarriages);
router.post('/carriages', authenticationMiddleware, authorizeManager, createCarriage);
router.patch('/carriages/:id', authenticationMiddleware, authorizeManager, updateCarriage);

export default router;