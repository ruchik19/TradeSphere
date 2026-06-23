// filename: backend/routes/paperTradeRoutes.js
import express from 'express';
import { executeTrade, getPaperPortfolio,savePortfolioSnapshot } from '../controllers/paperTrade.controller.js';
import protect from '../middleware/auth.js'; // Adjust if yours is named auth.js

const router = express.Router();

// User must be logged in to access paper trading
router.use(protect);

// GET /api/paper-trade -> Fetch balance, holdings, and recent history
router.get('/', getPaperPortfolio);

// POST /api/paper-trade/execute -> Process a buy or sell order
router.post('/execute', executeTrade);

router.post('/history', protect, savePortfolioSnapshot);

export default router;