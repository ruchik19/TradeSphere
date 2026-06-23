import axios from 'axios';
import User from '../models/user.js';

// This points to Tabish's Python server
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8001';

// ==========================================
// 1. CHATBOT BRIDGE
// ==========================================
export const askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "A message is required." });
        }

        const response = await axios.post(`${AI_SERVER_URL}/api/chat`, {
            user_message: message
        });

        res.status(200).json({ success: true, reply: response.data.reply });
    } catch (error) {
        console.error("AI Chatbot Connection Error:", error.message);
        res.status(503).json({ error: "The AI Assistant is currently offline or unreachable." });
    }
};

// ==========================================
// 2. PORTFOLIO HEALTH ANALYZER
// ==========================================
export const analyzePortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.paperHoldings || user.paperHoldings.length === 0) {
            return res.status(400).json({ error: "Portfolio is empty. Add assets before analyzing." });
        }

        // A quick dictionary to map tickers to their real-world sectors
        const getSector = (ticker) => {
            const sectors = {
                'RELIANCE.NS': 'Energy',
                'TCS.NS': 'Technology',
                'INFY.NS': 'Technology',
                'HDFCBANK.NS': 'Financial Services',
                'ITC.NS': 'Consumer Defensive',
                'BAJFINANCE.NS': 'Financial Services'
            };
            return sectors[ticker] || 'General';
        };

        // Format the data and inject the real sector
        const formattedHoldings = user.paperHoldings.map(asset => ({
            ticker: asset.ticker,
            sector: getSector(asset.ticker),
            value: asset.quantity * asset.avgBuyPrice
        }));

        const response = await axios.post(`${AI_SERVER_URL}/api/portfolio/analyze`, {
            holdings: formattedHoldings
        });

        res.status(200).json({ success: true, analysis: response.data });
    } catch (error) {
        console.error("AI Analyzer Error:", error.message);
        res.status(503).json({ error: "Could not generate portfolio analysis at this time." });
    }
};

// ==========================================
// 3. FINANCE JARGON SIMPLIFIER
// ==========================================
export const simplifyJargon = async (req, res) => {
    try {
        const { term } = req.body;
        
        if (!term) {
            return res.status(400).json({ error: "A financial term or text snippet is required." });
        }

        const response = await axios.post(`${AI_SERVER_URL}/api/ai/simplify`, {
            term_or_text: term
        });

        res.status(200).json({ success: true, explanation: response.data });
    } catch (error) {
        console.error("AI Simplifier Error:", error.message);
        res.status(503).json({ error: "Could not simplify the term at this time." });
    }
};