// filename: backend/routes/marketRoutes.js
import express from 'express';
import { getLiveQuote, getFundamentals, getHistoricalData } from '../controllers/market.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all market routes
router.use(protect);

router.get('/quote/:ticker', getLiveQuote);
router.get('/fundamentals/:ticker', getFundamentals);
router.get('/historical/:ticker', getHistoricalData);

export default router;