import express from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { authorizeAdmin } from '../middlewares/authorize.middleware.js';
import { getPromotions, createPromotion, updatePromotion, getDetailPromotion } from '../controllers/promotion.controller.js';

const router = express.Router();
router.post('/apply-demo', getDetailPromotion);
router.get('/', authenticationMiddleware, getPromotions);
router.post('/', authenticationMiddleware, authorizeAdmin, createPromotion);
router.patch('/:id', authenticationMiddleware, authorizeAdmin, updatePromotion);

export default router;