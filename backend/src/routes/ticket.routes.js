import express from 'express';
import { searchTicketForExchange } from '../controllers/ticket.controller.js';
import { processExchange } from '../controllers/ticket.controller.js';

const router = express.Router();

// POST: /api/tickets/search-exchange
router.post('/search-exchange', searchTicketForExchange);
router.post('/confirm-exchange', processExchange);

export default router;