// filename: backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const protect = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Security session token missing.' });
    }

    try {
        // Verify incoming token against your specific secret variable name
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded._id).select('-password');
        next();
    } catch (error) {
        console.error('Access Token Verification Failure:', error);
        return res.status(401).json({ error: 'Access token expired. Requesting session extension.' });
    }
};

export default protect;