import User from '../models/user.js';

export const toggleWatchlist = async (req, res) => {
    try {
        const { ticker } = req.body;
        if (!ticker) return res.status(400).json({ error: "Ticker symbol required." });

        const user = await User.findById(req.user._id);
        const formattedTicker = ticker.toUpperCase();

        // If it's already in the watchlist, remove it. If not, add it.
        if (user.watchlist.includes(formattedTicker)) {
            user.watchlist = user.watchlist.filter(t => t !== formattedTicker);
        } else {
            user.watchlist.push(formattedTicker);
        }

        await user.save();
        res.status(200).json({ success: true, watchlist: user.watchlist });
    } catch (error) {
        res.status(500).json({ error: "Failed to update watchlist." });
    }
};

export const getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, watchlist: user.watchlist });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch watchlist." });
    }
};