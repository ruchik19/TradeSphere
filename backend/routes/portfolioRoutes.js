import express from 'express';
import { addAsset, getPortfolio, removeAsset } from '../controllers/portfolio.controller.js';
import protect from '../middleware/auth.js'; 

const router = express.Router();

// Lock down all portfolio routes
router.use(protect);

router.post('/add', addAsset);
router.get('/', getPortfolio);
router.delete('/remove/:assetId', removeAsset);
router.use(protect);

export default router;