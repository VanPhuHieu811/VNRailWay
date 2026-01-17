import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';
import { createTrain, createCarriage, getTrain, getTrainById, getCarriages, updateTrain, updateCarriage, updateTrainDeadlock } from '../controllers/train.controller.js';
import * as trainController from '../controllers/train.controller.js';
const router = express.Router();


router.get('/schedule', authenticationMiddleware, trainController.getTrainSchedule);
router.get('/schedule/:id/timeline', authenticationMiddleware, trainController.getTripTimeline);
router.put('/schedule/:id/timeline', authenticationMiddleware, trainController.updateTripTime);

router.get('/assignments/unassigned', authenticationMiddleware, trainController.getUnassignedTrips);
router.get('/assignments/:id', authenticationMiddleware, trainController.getTripAssignments);

router.post('/carriages', authenticationMiddleware, authorizeAdmin, createCarriage);
router.patch('/carriages/:id', authenticationMiddleware, authorizeAdmin, updateCarriage);
router.get('/:id/carriages', authenticationMiddleware, getCarriages); 

router.get('/', authenticationMiddleware, getTrain);
router.post('/', authenticationMiddleware, authorizeAdmin, createTrain);

router.get('/:id', authenticationMiddleware, getTrainById);
router.patch('/:id', authenticationMiddleware, authorizeAdmin, updateTrain);
router.patch('/:id/deadlock', authenticationMiddleware, authorizeAdmin, updateTrainDeadlock);

export default router;