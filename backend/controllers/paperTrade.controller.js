// filename: backend/controllers/paperTradeController.js
import User from '../models/user.js'; // Adjust path if yours is capitalized User.js
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

// ==========================================
// 1. EXECUTE A PAPER TRADE (BUY / SELL)
// ==========================================
export const executeTrade = async (req, res) => {
    try {
        const { ticker, quantity, action } = req.body; 
        
        if (!ticker || !quantity || !action) {
            return res.status(400).json({ error: "Ticker, quantity, and action (BUY/SELL) are required." });
        }

        const formattedTicker = ticker.toUpperCase().trim();
        const qty = Number(quantity);
        const user = await User.findById(req.user._id);

        // 1. Live Price Guardrail
        const quote = await yahooFinance.quote(formattedTicker);
        if (!quote || !quote.regularMarketPrice) {
            return res.status(404).json({ error: "Could not fetch live market price for this ticker." });
        }
        
        const livePrice = quote.regularMarketPrice;
        const totalCost = livePrice * qty;

        // 2. Locate existing holding (if any)
        const holdingIndex = user.paperHoldings.findIndex(h => h.ticker === formattedTicker);

        // --- BUY LOGIC ---
        if (action.toUpperCase() === 'BUY') {
            if (user.virtualBalance < totalCost) {
                return res.status(400).json({ 
                    error: `Insufficient virtual funds. Requires ₹${totalCost.toFixed(2)} but you have ₹${user.virtualBalance.toFixed(2)}` 
                });
            }

            user.virtualBalance -= totalCost;

            if (holdingIndex > -1) {
                // Calculate new average price: (Old Total Value + New Total Value) / New Total Quantity
                const existing = user.paperHoldings[holdingIndex];
                const totalValueBefore = existing.avgBuyPrice * existing.quantity;
                existing.quantity += qty;
                existing.avgBuyPrice = (totalValueBefore + totalCost) / existing.quantity;
            } else {
                // Brand new holding
                user.paperHoldings.push({ 
                    ticker: formattedTicker, 
                    quantity: qty, 
                    avgBuyPrice: livePrice 
                });
            }

        // --- SELL LOGIC ---
        } else if (action.toUpperCase() === 'SELL') {
            if (holdingIndex === -1 || user.paperHoldings[holdingIndex].quantity < qty) {
                return res.status(400).json({ error: "You do not own enough shares to execute this sell." });
            }

            user.virtualBalance += totalCost;
            user.paperHoldings[holdingIndex].quantity -= qty;

            // Clean up if they sold everything
            if (user.paperHoldings[holdingIndex].quantity === 0) {
                user.paperHoldings.splice(holdingIndex, 1);
            }
        } else {
            return res.status(400).json({ error: "Invalid action. Must be exactly 'BUY' or 'SELL'." });
        }

        // 3. Log the transaction receipt
        user.transactionHistory.push({
            type: action.toUpperCase(),
            ticker: formattedTicker,
            quantity: qty,
            executionPrice: livePrice,
            totalAmount: totalCost
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: `${action.toUpperCase()} executed successfully at ₹${livePrice} per share.`,
            virtualBalance: user.virtualBalance,
            paperHoldings: user.paperHoldings
        });

    } catch (error) {
        console.error("Trade Execution Error:", error.message);
        res.status(500).json({ error: "Trade engine encountered an internal error." });
    }
};

// ==========================================
// 2. GET PAPER TRADING DASHBOARD
// ==========================================
export const getPaperPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Calculate total invested in paper trades
        const totalInvested = user.paperHoldings.reduce((acc, asset) => {
            return acc + (asset.quantity * asset.avgBuyPrice);
        }, 0);

        res.status(200).json({
            success: true,
            virtualBalance: user.virtualBalance,
            totalInvested: totalInvested,
            paperHoldings: user.paperHoldings,
            transactionHistory: user.transactionHistory.slice(-10) // Only send the 10 most recent transactions
        });
    } catch (error) {
        console.error("Get Paper Portfolio Error:", error.message);
        res.status(500).json({ error: "Failed to fetch paper trading dashboard." });
    }
};