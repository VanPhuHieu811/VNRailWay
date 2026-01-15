import express from 'express';
import { 
    searchTrips, 
    getTripSeats, 
    getTripDetails, 
    // updateTripArrival 
} from '../controllers/trip.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';

// Use for update arrival time route - requires a manager authorization
// import { authorizeManager } from '../middlewares/authorization.middleware.js';

const router = express.Router();
router.get('/search', authenticationMiddleware, searchTrips);
router.get('/:id/seats', authenticationMiddleware, getTripSeats);
router.get('/:id', authenticationMiddleware, getTripDetails);

export default router;