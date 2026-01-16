import express from 'express';
import ticketController from '../controllers/ticket.controller.js';

const router = express.Router();

// Định nghĩa route theo chuẩn RESTful
// GET /:code (Ví dụ: /api/v1/tickets/VE123456)
router.get('/:code', ticketController.getTicketDetail);

export default router;