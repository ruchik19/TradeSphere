// filename: backend/controllers/upstoxController.js
import axios from 'axios';
import User from '../models/user.js';
import jwt from 'jsonwebtoken'; // Add this to decode the token!

export const initiateUpstoxLogin = async (req, res) => {
    // Grab the token that the frontend passed in the URL
    const token = req.query.token || req.cookies?.accessToken;
    
    // Pass the token inside the 'state' parameter so Upstox gives it back to us
    const loginUrl = `https://api.upstox.com/v2/login/authorization/dialog?client_id=${process.env.UPSTOX_API_KEY}&redirect_uri=${encodeURIComponent(process.env.UPSTOX_REDIRECT_URI)}&response_type=code&state=${token}`;
    res.redirect(loginUrl);
};

export const handleUpstoxCallback = async (req, res) => {
    // Extract the Upstox code AND our returning state (the token)
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ error: "Authorization code missing" });

    try {
        // 1. Decode the state parameter to remember who the user is!
        const decodedToken = jwt.verify(state, process.env.ACCESS_TOKEN_SECRET);
        const userId = decodedToken?._id;

        // 2. Exchange code with Upstox for the real access token
        const response = await axios.post('https://api.upstox.com/v2/login/authorization/token', new URLSearchParams({
            code,
            client_id: process.env.UPSTOX_API_KEY,
            client_secret: process.env.UPSTOX_API_SECRET,
            redirect_uri: process.env.UPSTOX_REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
        });

        const { access_token } = response.data;

        // 3. Save the token to the correct user's profile
        await User.findByIdAndUpdate(userId, {
            $pull: { brokerAuths: { broker: 'Upstox' }, linkedBrokers: 'Upstox' }
        });

        await User.findByIdAndUpdate(userId, {
            $push: { 
                brokerAuths: { broker: 'Upstox', accessToken: access_token, lastSync: new Date() }
            },
            $addToSet: { linkedBrokers: 'Upstox' }
        });

        // 4. Send them back to the frontend aggregator page
        res.redirect('https://trade-sphere-46vk.vercel.app/aggregator?connected=upstox');
    } catch (error) {
        // This will print the exact reason Upstox failed in your terminal
        console.error("OAuth Error Detail:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed token negotiation with Upstox server" });
    }
};

export const getUpstoxHoldings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const upstoxCreds = user.brokerAuths.find(auth => auth.broker === 'Upstox');

        if (!upstoxCreds) {
            return res.status(404).json({ connected: false, message: "Upstox account not linked" });
        }

        const response = await axios.get('https://api.upstox.com/v2/portfolio/long-term-holdings', {
            headers: { 
                'Authorization': `Bearer ${upstoxCreds.accessToken}`,
                'Accept': 'application/json'
            }
        });

        const normalizedHoldings = response.data.data.map(stock => ({
            ticker: stock.trading_symbol,
            companyName: stock.company_name || stock.trading_symbol,
            quantity: stock.quantity,
            avgBuyPrice: stock.average_price,
            sector: "Equity", 
            broker: "Upstox"
        }));

        user.holdings = user.holdings.filter(asset => asset.broker !== 'Upstox').concat(normalizedHoldings);
        upstoxCreds.lastSync = new Date();
        
        await user.save();
        res.status(200).json({ success: true, holdings: user.holdings });
    } catch (error) {
        console.error("Portfolio Fetch Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to extract active live portfolio metrics" });
    }
};
