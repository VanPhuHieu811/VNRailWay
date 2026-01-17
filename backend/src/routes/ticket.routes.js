import express from 'express';
import { searchTicketForExchange } from '../controllers/ticket.controller.js';

const router = express.Router();

// POST: /api/tickets/search-exchange
router.post('/search-exchange', searchTicketForExchange);

export default router;