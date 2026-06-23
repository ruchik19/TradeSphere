import express from 'express';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlist.controller.js';
import protect from '../middleware/auth.js'; 

const router = express.Router();

router.use(protect);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);

// Catch Strategy A (Ticker in URL)
router.delete('/:ticker', removeFromWatchlist); 

// Catch Strategy B (Ticker in Body) - ADD THIS LINE!
router.delete('/', removeFromWatchlist); 

export default router;