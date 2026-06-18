// filename: backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const protect = async (req, res, next) => {
    try {
        // 1. Grab token from cookies OR the Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: 'Access denied. Security session token missing.' });
        }

        // 2. Verify incoming token against your specific secret variable name
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // 3. Find user and attach to request
        const user = await User.findById(decoded?._id).select('-password');

        if (!user) {
            return res.status(401).json({ error: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Access Token Verification Failure:', error);
        return res.status(401).json({ error: 'Access token expired or invalid. Requesting session extension.' });
    }
};

export default protect;