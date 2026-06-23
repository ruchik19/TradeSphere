import express from 'express';
import { initiateUpstoxLogin, handleUpstoxCallback, getUpstoxHoldings } from '../controllers/upstoxController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/connect', protect, initiateUpstoxLogin);
router.get('/callback', handleUpstoxCallback);
router.get('/holdings', protect, getUpstoxHoldings);

export default router;