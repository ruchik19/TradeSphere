import express from 'express';
import { initiateUpstoxLogin, handleUpstoxCallback } from '../controllers/upstoxController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.get('/connect', verifyJWT, initiateUpstoxLogin); // User clicks "Connect"
router.get('/callback', verifyJWT, handleUpstoxCallback); // Upstox bounces back here

export default router;