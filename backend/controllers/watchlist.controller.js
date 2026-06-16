import User from '../models/user.js'; // Double check if your file is named User.js or user.js!

// ==========================================
// 1. GET USER'S WATCHLIST
// ==========================================
export const getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }

        // The '|| []' protects against older accounts that don't have a watchlist yet
        res.status(200).json({ success: true, watchlist: user.watchlist || [] });
    } catch (error) {
        console.error("GET Watchlist Error:", error);
        res.status(500).json({ error: "Failed to fetch watchlist" });
    }
};

// ==========================================
// 2. ADD A TICKER TO WATCHLIST
// ==========================================
export const addToWatchlist = async (req, res) => {
    try {
        const { ticker } = req.body;
        if (!ticker) return res.status(400).json({ error: "Ticker is required" });

        const user = await User.findById(req.user._id);
        
        // Initialize array if it doesn't exist yet
        if (!user.watchlist) user.watchlist = [];
        
        // Prevent duplicates
        if (user.watchlist.includes(ticker.toUpperCase())) {
            return res.status(400).json({ error: "Ticker is already in your watchlist" });
        }

        user.watchlist.push(ticker.toUpperCase());
        await user.save();

        res.status(200).json({ success: true, watchlist: user.watchlist });
    } catch (error) {
        console.error("ADD Watchlist Error:", error);
        res.status(500).json({ error: "Failed to add to watchlist" });
    }
};

// ==========================================
// 3. REMOVE A TICKER
// ==========================================
export const removeFromWatchlist = async (req, res) => {
    try {
        const { ticker } = req.params;
        const user = await User.findById(req.user._id);
        
        if (!user.watchlist) user.watchlist = [];

        user.watchlist = user.watchlist.filter(t => t !== ticker.toUpperCase());
        await user.save();

        res.status(200).json({ success: true, watchlist: user.watchlist });
    } catch (error) {
        console.error("REMOVE Watchlist Error:", error);
        res.status(500).json({ error: "Failed to remove from watchlist" });
    }
};