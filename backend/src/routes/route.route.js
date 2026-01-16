import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';
import { 
    getRoutes, 
    getRouteById, 
    createRoute, 
    updateRoute,
    addStationToRoute,
    removeStationFromRoute
} from '../controllers/route.controller.js';

const router = express.Router();
router.get('/', getRoutes);
router.get('/:id', getRouteById);

// 1. Manage Route Header (TUYEN_TAU)
router.post('/', authenticationMiddleware, authorizeAdmin, createRoute);
router.put('/:id', authenticationMiddleware, authorizeAdmin, updateRoute);


// 2. Manage Stations in Route (DANH_SACH_GA)
router.post('/:id/stations', authenticationMiddleware, authorizeAdmin, addStationToRoute);
router.delete('/:id/stations/:stationId', authenticationMiddleware, authorizeAdmin, removeStationFromRoute);

export default router;