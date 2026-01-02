import express from 'express';
import { 
    searchTrips, 
    getTripSeats, 
    getTripDetails, 
    // updateTripArrival 
} from '../controllers/trip.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';

// Use for update arrival time route - requires a manager authorization
// import { authorizeManager } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// GET /api/v1/trips/search
router.get('/search', authenticationMiddleware, searchTrips);

// GET /api/v1/trips/{id}/seats
router.get('/:id/seats', authenticationMiddleware, getTripSeats);

// GET /api/v1/trips/{TripId}
router.get('/:id', authenticationMiddleware, getTripDetails);

// PUT /api/v1/trips/{id}/stations/{stationId}/arrival
// Requires Login AND Manager Role
// router.put('/:id/stations/:stationId/arrival', authenticationMiddleware, authorizeManager, updateTripArrival);

export default router;