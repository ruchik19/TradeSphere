// filename: backend/routes/authRoutes.js
import express from 'express';
import { 
    signupUser, 
    loginUser, 
    refreshSessionToken, 
    logoutUser,
    getCurrentUser,       // <-- Imported
    updateAccountDetails ,
    changeCurrentPassword // <-- Imported
} from '../controllers/user.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/refresh', refreshSessionToken);

// Protected Routes (Require active session cookies)
router.post('/logout', protect, logoutUser);
router.get('/current-user', protect, getCurrentUser);           // Pinged by React on page load
router.patch('/update-account', protect, updateAccountDetails); // PATCH is standard for partial updates
router.patch('/change-password', protect, changeCurrentPassword);

export default router;