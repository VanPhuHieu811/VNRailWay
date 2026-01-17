import express from 'express';
import customerController from '../controllers/customer.controller.js';

const router = express.Router();

// API Tìm kiếm chuyến tàu
// URL: GET /api/v1/schedules/search?from=...&to=...&date=...
router.get('/search', customerController.searchSchedules);
router.get('/seats/:tripId', customerController.getSeats);
router.post('/payment', customerController.submitPayment);
router.get('/my-tickets', customerController.getMyTickets);
export default router;  