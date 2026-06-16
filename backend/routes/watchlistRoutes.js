import express from 'express';
// Fixed the import to grab the correct functions and match your filename
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlist.controller.js';
import protect from '../middleware/auth.js'; 

const router = express.Router();

router.use(protect); // Lock all routes

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:ticker', removeFromWatchlist);

export default router;