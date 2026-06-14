// filename: backend/controllers/portfolioController.js
import User from '../models/user.js';

// ==========================================
// 1. ADD AN ASSET TO PORTFOLIO
// ==========================================
export const addAsset = async (req, res) => {
    try {
        const { ticker, companyName, quantity, avgBuyPrice, sector, broker } = req.body;

        // Validation (Notice broker is removed from strict check so the fallback works)
        if (!ticker || !companyName || !quantity || !avgBuyPrice || !sector) {
            return res.status(400).json({ error: "Please provide all required asset details." });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }

        // Push the new asset into the holdings array
        user.holdings.push({
            ticker,
            companyName,
            quantity: Number(quantity),
            avgBuyPrice: Number(avgBuyPrice),
            sector,
            broker: broker || 'Manual' // Fallback works perfectly now
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: `Successfully added ${quantity} shares of ${ticker}.`,
            holdings: user.holdings
        });

    } catch (error) {
        console.error("Add Asset Error:", error);
        res.status(500).json({ error: "Internal server error while adding asset." });
    }
};

// ==========================================
// 2. GET USER'S ENTIRE PORTFOLIO
// ==========================================
export const getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }

        // Calculate total invested capital on the fly
        const totalInvested = user.holdings.reduce((acc, asset) => {
            return acc + (asset.quantity * asset.avgBuyPrice);
        }, 0);

        res.status(200).json({
            success: true,
            totalInvested,
            holdings: user.holdings
        });
    } catch (error) {
        console.error("Get Portfolio Error:", error);
        res.status(500).json({ error: "Internal server error while fetching portfolio." });
    }
};

// ==========================================
// 3. REMOVE AN ASSET
// ==========================================
export const removeAsset = async (req, res) => {
    try {
        const { assetId } = req.params;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }

        // Filter out the asset matching the passed ID
        const initialLength = user.holdings.length;
        user.holdings = user.holdings.filter(asset => asset._id.toString() !== assetId);

        // Check if anything was actually removed
        if (user.holdings.length === initialLength) {
            return res.status(404).json({ error: "Asset not found in your portfolio." });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Asset removed successfully.",
            holdings: user.holdings
        });
    } catch (error) {
        console.error("Remove Asset Error:", error);
        res.status(500).json({ error: "Internal server error while removing asset." });
    }
};