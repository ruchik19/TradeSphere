import axios from 'axios';
import User from '../models/user.js';

// Redirect user to Upstox Login
export const initiateUpstoxLogin = async (req, res) => {
    const redirectUrl = `https://api.upstox.com/index/dialog/authorize?apiKey=${process.env.UPSTOX_API_KEY}&redirect_uri=${process.env.UPSTOX_REDIRECT_URI}&response_type=code`;
    res.redirect(redirectUrl);
};

// Handle the bounce-back from Upstox
export const handleUpstoxCallback = async (req, res) => {
    const { code } = req.query; // The temporary VIP pass

    try {
        // Exchange 'code' for 'access_token'
        const tokenResponse = await axios.post('https://api.upstox.com/index/oauth/token', {
            code,
            client_id: process.env.UPSTOX_API_KEY,
            client_secret: process.env.UPSTOX_API_SECRET,
            redirect_uri: process.env.UPSTOX_REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Save to your database using the sub-schema we just built
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                brokerAuths: {
                    broker: 'Upstox',
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    lastSync: new Date()
                }
            }
        });

        res.status(200).json({ message: "Upstox connected successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Token exchange failed" });
    }
};