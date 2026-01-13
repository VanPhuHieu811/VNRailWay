import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeManager } from '../middlewares/authorization.middleware.js';
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
router.post('/', authenticationMiddleware, authorizeManager, createRoute);
router.put('/:id', authenticationMiddleware, authorizeManager, updateRoute);

// 2. Manage Stations in Route (DANH_SACH_GA)
router.post('/:id/stations', authenticationMiddleware, authorizeManager , addStationToRoute);
router.delete('/:id/stations/:stationId', authenticationMiddleware, authorizeManager, removeStationFromRoute);

export default router;