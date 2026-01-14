import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';
import { createTrain, createCarriage, getTrain, getTrainById, getCarriages, updateTrain, updateCarriage } from '../controllers/train.controller.js';

const router = express.Router();

// Train
router.get('/', authenticationMiddleware, authorizeAdmin, getTrain);
router.get('/:id', authenticationMiddleware, authorizeAdmin, getTrainById);
router.post('/', authenticationMiddleware, authorizeAdmin, createTrain);
router.patch('/:id', authenticationMiddleware, authorizeAdmin, updateTrain);

// Carriage
router.get('/:id/carriages', authenticationMiddleware, authorizeAdmin, getCarriages);
router.post('/carriages', authenticationMiddleware, authorizeAdmin, createCarriage);
router.patch('/carriages/:id', authenticationMiddleware, authorizeAdmin, updateCarriage);

export default router;