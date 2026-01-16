import express from 'express';
import bookingController from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/dat-ve', bookingController.datVeLostUpdate);

export default router;