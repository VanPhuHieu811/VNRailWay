import express from 'express'
const router = express.Router()

import * as priceController from '../controllers/price.controller.js'

// toa tau
router.get('/train-carriage', priceController.getAllTrainCarriagePrices)     // api/v1/prices/train-carriage
router.get('/train-carriage/:id', priceController.getTrainCarriagePriceById) // api/v1/prices/train-carriage/:id
router.put('/train-carriage/:id', priceController.updateTrainCarriagePriceById) // api/v1/prices/train-carriage/:id

// floor
router.get('/floor', priceController.getAllTrainFloorPrices)
router.get('/floor/:id', priceController.getTrainFloorPriceById)
router.put('/floor/:id', priceController.updateTrainFloorPriceById)

// type-train
router.get('/type-train', priceController.getAllTrainTypePrices)
router.get('/type-train/:id', priceController.getTrainTypePriceById)
router.put('/type-train/:id', priceController.updateTrainTypePriceById)

// byKm
router.get('/kilometer', priceController.getAllPriceByKilometer)
router.get('/kilometer/:id', priceController.getPriceByKilometerById)
router.put('/kilometer/:id', priceController.updatePriceByKilometerById)

// calculate price
router.post('/calculate', priceController.calculatePrice);
export default router