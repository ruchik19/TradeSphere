// filename: backend/routes/watchlistRoutes.js
import express from 'express';
import { toggleWatchlist, getWatchlist } from '../controllers/watchlist.controller.js';
import protect from '../middleware/auth.js'; // Adjust path if yours is auth.js

const router = express.Router();

// The user must be logged in to have a watchlist
router.use(protect);

// GET /api/watchlist -> Fetch the array
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, watchlist: user.watchlist || [] });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch watchlist" });
    }
})
// POST /api/watchlist/toggle -> Add or remove a ticker
router.post('/toggle', toggleWatchlist);

export default router;