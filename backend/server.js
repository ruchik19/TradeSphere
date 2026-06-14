import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import paperTradeRoutes from './routes/paperTradeRoutes.js';

connectDB();

dotenv.config();
const app = express();
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use(express.json()); 
app.use(cookieParser());
app.use('/api/ai',aiRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/paper-trade', paperTradeRoutes);
app.get('/', (req, res) => {
    res.send('Backend is actively running. Go to /api/status to check API health.');
});

app.get('/api/status', (req, res) => {
    res.json({ 
        message: "Smart Finance Aggregator Backend is running smoothly! 🚀",
        status: "Active"
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});