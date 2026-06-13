// filename: backend/controllers/marketController.js
import yahooFinance from 'yahoo-finance2';

// Helper function: Indian stocks require an exchange suffix for Yahoo Finance
// e.g., "RELIANCE" becomes "RELIANCE.NS" for the National Stock Exchange
const formatTicker = (ticker) => {
    const cleanTicker = ticker.toUpperCase().trim();
    // If it already has a dot (like .NS or .BO) or is a US stock index like ^GSPC, return it.
    // Otherwise, default to appending .NS for the Indian market.
    if (cleanTicker.includes('.') || cleanTicker.startsWith('^')) {
        return cleanTicker;
    }
    return `${cleanTicker}.NS`;
};

// ==========================================
// 1. GET LIVE STOCK PRICE & BASIC QUOTE
// ==========================================
export const getLiveQuote = async (req, res) => {
    try {
        const ticker = formatTicker(req.params.ticker);
        
        // Fetch the quote from Yahoo Finance
        const quote = await yahooFinance.quote(ticker);
        
        if (!quote) {
            return res.status(404).json({ error: "Stock data not found. Check the ticker symbol." });
        }

        res.status(200).json({
            success: true,
            data: {
                symbol: quote.symbol,
                companyName: quote.longName || quote.shortName,
                currentPrice: quote.regularMarketPrice,
                currency: quote.currency,
                dayChange: quote.regularMarketChange,
                dayChangePercent: quote.regularMarketChangePercent,
                fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: quote.fiftyTwoWeekLow
            }
        });

    } catch (error) {
        console.error("Live Quote Error:", error.message);
        res.status(500).json({ error: "Failed to fetch live market data." });
    }
};

// ==========================================
// 2. GET COMPANY FUNDAMENTALS (For the AI Analyzer)
// ==========================================
export const getFundamentals = async (req, res) => {
    try {
        const ticker = formatTicker(req.params.ticker);
        
        // Pull specific financial modules: Key Statistics and Financial Data
        const summary = await yahooFinance.quoteSummary(ticker, { 
            modules: ['defaultKeyStatistics', 'financialData'] 
        });

        const stats = summary.defaultKeyStatistics || {};
        const financials = summary.financialData || {};

        res.status(200).json({
            success: true,
            data: {
                symbol: ticker,
                profitMargin: financials.profitMargins,
                operatingMargin: financials.operatingMargins,
                returnOnEquity: financials.returnOnEquity,
                revenueGrowth: financials.revenueGrowth,
                debtToEquity: financials.debtToEquity,
                peRatio: stats.trailingPE || stats.forwardPE,
                beta: stats.beta // Measures volatility against the market
            }
        });

    } catch (error) {
        console.error("Fundamentals Error:", error.message);
        res.status(500).json({ error: "Failed to fetch company fundamentals." });
    }
};

// ==========================================
// 3. GET HISTORICAL CHART DATA
// ==========================================
export const getHistoricalData = async (req, res) => {
    try {
        const ticker = formatTicker(req.params.ticker);
        const { period } = req.query; // e.g., ?period=1mo, 6mo, 1y

        // Calculate the start date based on the requested period (default to 1 month)
        const queryOptions = { interval: '1d' };
        const endDate = new Date();
        const startDate = new Date();

        if (period === '1y') startDate.setFullYear(endDate.getFullYear() - 1);
        else if (period === '6mo') startDate.setMonth(endDate.getMonth() - 6);
        else startDate.setMonth(endDate.getMonth() - 1); // Default 1 month

        queryOptions.period1 = startDate.toISOString().split('T')[0];
        queryOptions.period2 = endDate.toISOString().split('T')[0];

        const history = await yahooFinance.historical(ticker, queryOptions);

        res.status(200).json({
            success: true,
            data: history.map(day => ({
                date: day.date,
                close: day.close,
                volume: day.volume
            }))
        });

    } catch (error) {
        console.error("Historical Data Error:", error.message);
        res.status(500).json({ error: "Failed to fetch historical chart data." });
    }
};