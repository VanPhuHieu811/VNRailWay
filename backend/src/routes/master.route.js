import express from 'express';
import masterController from '../controllers/master.controller.js';

const router = express.Router();

// Các route cơ bản
router.get('/stations', masterController.getStations);
router.get('/routes', masterController.getRoutes);
router.get('/trains', masterController.getTrains);

// Route lấy ga theo tuyến (Có tham số :routeId)
router.get('/stations/:routeId', masterController.getStationsByRoute);

export default router;